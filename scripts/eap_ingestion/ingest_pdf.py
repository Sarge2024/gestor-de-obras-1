import re
import pandas as pd
import pdfplumber
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import os

# ==============================================================================
# 🚀 SCRIPT DE INGESTÃO DE DADOS: PLANILHA EAP E MEDIÇÃO (PDF -> POSTGRESQL)
# ==============================================================================
# Dependências necessárias:
# pip install pdfplumber pandas psycopg2-binary
# ==============================================================================

# Configurações do Banco de Dados
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "postgres")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "postgres")
DB_PORT = os.getenv("DB_PORT", "54342")

# Arquivo PDF de Entrada
PDF_PATH = os.path.join(os.path.dirname(__file__), "planilha base.pdf")

# Função utilitária para converter números no formato PT-BR (R$ 1.234,56 -> 1234.56)
def parse_ptbr_number(value_str):
    if pd.isna(value_str) or str(value_str).strip() == '' or str(value_str).strip() == '-':
        return 0.0
    # Remove R$, espaços, e converte formato de milhar e decimal
    clean_str = str(value_str).replace('R$', '').replace(' ', '').strip()
    clean_str = clean_str.replace('.', '').replace(',', '.')
    try:
        return float(clean_str)
    except ValueError:
        return 0.0

# Função para inferir o código pai a partir do código atual (ex: 2.2.1 -> 2.2)
def get_parent_code(eap_code):
    parts = str(eap_code).split('.')
    if len(parts) > 1:
        return '.'.join(parts[:-1])
    return None # É um nó raiz (ex: "1" ou "2")

def extrair_dados_pdf(caminho_pdf):
    print(f"📄 Iniciando extração do PDF: {caminho_pdf}")
    linhas_extraidas = []
    
    with pdfplumber.open(caminho_pdf) as pdf:
        for page_num, pagina in enumerate(pdf.pages):
            # A extração de tabelas do pdfplumber pode precisar de ajustes nos parâmetros
            # (table_settings) dependendo das bordas reais do PDF.
            tabela = pagina.extract_table()
            
            if tabela:
                # Ignorar cabeçalhos (geralmente as primeiras linhas)
                # Assumindo que a linha de dados começa quando a primeira coluna tem número
                for linha in tabela:
                    codigo = str(linha[0]).strip() if linha[0] else ""
                    # Verifica se o código começa com número (ex: 1, 2.1, 1.1.1)
                    if re.match(r'^\d+(\.\d+)*$', codigo):
                        linhas_extraidas.append({
                            'codigo': codigo,
                            'descricao': str(linha[1]).strip() if linha[1] else "",
                            'unidade': str(linha[2]).strip() if linha[2] else None,
                            'preco_unitario': linha[3],
                            'qtd_contratada': linha[4],
                            'qtd_medida_mes': linha[5],
                            'qtd_acumulada': linha[6],
                            'valor_total_contratado': linha[7],
                            'valor_medido_mes': linha[8],
                            'valor_acumulado': linha[9]
                            # O % não precisamos extrair pois calcularemos na view/banco
                        })
    return pd.DataFrame(linhas_extraidas)

def rebuild_hierarchy(df):
    print("🌳 Reconstruindo hierarquia EAP e resolvendo códigos duplicados...")
    last_seen_at_depth = {}
    new_codes = []
    new_parents = []
    
    for _, row in df.iterrows():
        raw_code = str(row['codigo']).strip()
        parts = raw_code.split('.')
        depth = len(parts)
        
        # O pai será o último código gerado no nível imediatamente superior
        parent_code = last_seen_at_depth.get(depth - 1) if depth > 1 else None
            
        # Garante que o código seja único
        new_code = raw_code
        counter = 1
        while new_code in new_codes:
            new_code = f"{raw_code} (Dup {counter})"
            counter += 1
            
        new_codes.append(new_code)
        new_parents.append(parent_code)
        
        # Atualiza o último visto nesta profundidade
        last_seen_at_depth[depth] = new_code
        
    df['codigo'] = new_codes
    df['eap_pai_codigo'] = new_parents
    return df

def limpar_e_transformar_dados(df):
    print("🧹 Limpando e transformando dados...")
    
    # Tratamento de números PT-BR
    colunas_numericas = ['preco_unitario', 'qtd_contratada', 'qtd_medida_mes', 
                         'qtd_acumulada', 'valor_total_contratado', 'valor_medido_mes', 'valor_acumulado']
    
    for col in colunas_numericas:
        if col in df.columns:
            df[col] = df[col].apply(parse_ptbr_number)
            
    # Tratamento de Unidade (Nulo para agrupadores)
    df['unidade'] = df['unidade'].replace(['', 'None', 'nan'], None)
    
    # Determinar se é Analítico (Folha) ou Sintético (Agrupador)
    df['e_analitico'] = df['unidade'].notnull() & (df['unidade'] != '')
    
    # Determinar Código Pai de forma robusta
    df = rebuild_hierarchy(df)
    
    return df

def inserir_no_banco(df):
    print("🗄️ Inserindo dados no banco de dados PostgreSQL...")
    conn = None
    try:
        conn = psycopg2.connect(
            host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASS, port=DB_PORT
        )
        cur = conn.cursor()
        
        # 1. Criar um Projeto Fictício para a Carga
        cur.execute("""
            INSERT INTO projetos (codigo_contrato, nome_projeto, data_inicio)
            VALUES (%s, %s, %s) RETURNING id;
        """, ('CT-001/2026', 'PROJETO DE ENGENHARIA IMPORTADO', datetime.now().date()))
        projeto_id = cur.fetchone()[0]
        
        # 2. Preparar e Inserir Itens EAP
        itens_eap_data = []
        ordem = 1
        for _, row in df.iterrows():
            itens_eap_data.append((
                projeto_id, row['codigo'], row['eap_pai_codigo'], row['descricao'], 
                row['unidade'], row['preco_unitario'], row['qtd_contratada'], 
                row['valor_total_contratado'], row['e_analitico'], ordem
            ))
            ordem += 1
            
        insert_eap_query = """
            INSERT INTO itens_eap (
                projeto_id, eap_codigo, eap_pai_codigo, descricao_servico, 
                unidade_medida, preco_unitario, quantidade_contratada, 
                valor_total_contratado, e_analitico, ordem
            ) VALUES %s RETURNING id, eap_codigo;
        """
        # Execute values é mais rápido para bulk inserts
        eap_ids = execute_values(cur, insert_eap_query, itens_eap_data, fetch=True)
        # Mapeia codigo EAP para seu UUID no banco
        mapa_eap_id = {row[1]: row[0] for row in eap_ids}
        
        # 3. Criar Medição (Cabeçalho)
        cur.execute("""
            INSERT INTO medicoes (projeto_id, numero_medicao, data_medicao, periodo_inicio, periodo_fim, status)
            VALUES (%s, 1, CURRENT_DATE, '2026-07-01', '2026-07-31', 'APROVADO') RETURNING id;
        """, (projeto_id,))
        medicao_id = cur.fetchone()[0]
        
        # 4. Inserir Detalhes da Medição (Somente itens analíticos)
        itens_medicao_data = []
        df_analiticos = df[df['e_analitico'] == True]
        
        for _, row in df_analiticos.iterrows():
            item_id = mapa_eap_id.get(row['codigo'])
            if item_id:
                # Calcula % executado para armazenar
                perc_exec = 0.0
                if row['qtd_contratada'] > 0:
                    perc_exec = (row['qtd_acumulada'] / row['qtd_contratada']) * 100
                    
                itens_medicao_data.append((
                    medicao_id, item_id, row['qtd_medida_mes'], row['valor_medido_mes'],
                    row['qtd_acumulada'], row['valor_acumulado'], perc_exec
                ))
                
        insert_medicao_detalhe_query = """
            INSERT INTO itens_medicao_detalhe (
                medicao_id, item_eap_id, quantidade_periodo, valor_periodo,
                quantidade_acumulada, valor_acumulado, percentual_executado_acumulado
            ) VALUES %s;
        """
        execute_values(cur, insert_medicao_detalhe_query, itens_medicao_data)
        
        # Commit da transação
        conn.commit()
        print("✅ Dados importados com sucesso!")
        print(f"📊 Projeto ID: {projeto_id} | Itens EAP: {len(itens_eap_data)} | Itens de Medição: {len(itens_medicao_data)}")
        
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"❌ Erro ao inserir no banco de dados: {e}")
    finally:
        if conn:
            cur.close()
            conn.close()

if __name__ == "__main__":
    if not os.path.exists(PDF_PATH):
        print(f"⚠️ Arquivo {PDF_PATH} não encontrado. Por favor, coloque o PDF na mesma pasta do script.")
    else:
        df_bruto = extrair_dados_pdf(PDF_PATH)
        if not df_bruto.empty:
            df_limpo = limpar_e_transformar_dados(df_bruto)
            inserir_no_banco(df_limpo)
        else:
            print("⚠️ Nenhuma tabela reconhecida no PDF.")
