-- ==============================================================================
-- 🧪 QUERIES DE VALIDAÇÃO: INTEGRIDADE DA EAP E MEDIÇÕES
-- ==============================================================================
-- Estas consultas servem para homologar os dados ingeridos e garantir que
-- os cálculos de rollup (soma de filhos) batem com os valores esperados.

-- 1. Validação de Soma dos Filhos vs Valor Contratado do Pai
-- Esta query compara o valor total contratado armazenado em um item Sintético (Pai)
-- com a soma real de todos os seus subitens Analíticos (Filhos folha).
WITH RECURSIVE hierarquia_eap AS (
    SELECT id, projeto_id, eap_codigo, eap_pai_codigo, e_analitico, valor_total_contratado, id AS id_raiz, eap_codigo as codigo_raiz
    FROM itens_eap
    UNION ALL
    SELECT e.id, e.projeto_id, e.eap_codigo, e.eap_pai_codigo, e.e_analitico, e.valor_total_contratado, h.id_raiz, h.codigo_raiz
    FROM itens_eap e
    INNER JOIN hierarquia_eap h ON e.eap_codigo = h.eap_pai_codigo AND e.projeto_id = h.projeto_id
),
soma_filhos AS (
    SELECT 
        codigo_raiz as eap_codigo_pai, 
        projeto_id,
        SUM(valor_total_contratado) as soma_total_filhos
    FROM hierarquia_eap
    WHERE e_analitico = TRUE
    GROUP BY codigo_raiz, projeto_id
)
SELECT 
    p.nome_projeto,
    e.eap_codigo AS item_sintetico,
    e.descricao_servico,
    e.valor_total_contratado AS valor_cadastrado_no_pai,
    COALESCE(sf.soma_total_filhos, 0) AS soma_calculada_dos_filhos,
    (e.valor_total_contratado - COALESCE(sf.soma_total_filhos, 0)) AS diferenca,
    CASE 
        WHEN ABS(e.valor_total_contratado - COALESCE(sf.soma_total_filhos, 0)) < 0.05 THEN 'OK'
        ELSE 'ERRO DE DIVERGÊNCIA'
    END AS status_validacao
FROM itens_eap e
JOIN projetos p ON e.projeto_id = p.id
LEFT JOIN soma_filhos sf ON e.eap_codigo = sf.eap_codigo_pai AND e.projeto_id = sf.projeto_id
WHERE e.e_analitico = FALSE
ORDER BY p.nome_projeto, string_to_array(e.eap_codigo, '.')::int[];


-- 2. Validação de % Executado (Avanço Físico)
-- Verifica se o percentual executado acumulado calculado pela view
-- bate com a divisão (quantidade_acumulada / quantidade_contratada)
SELECT 
    e.eap_codigo,
    e.descricao_servico,
    e.quantidade_contratada,
    imd.quantidade_acumulada,
    imd.percentual_executado_acumulado AS percentual_tabela,
    ROUND((imd.quantidade_acumulada / NULLIF(e.quantidade_contratada, 0)) * 100, 4) AS percentual_calculado_agora,
    CASE
        WHEN ABS(imd.percentual_executado_acumulado - ROUND((imd.quantidade_acumulada / NULLIF(e.quantidade_contratada, 0)) * 100, 4)) < 0.01 THEN 'OK'
        ELSE 'ERRO DE ARREDONDAMENTO'
    END AS status_percentual
FROM itens_medicao_detalhe imd
JOIN itens_eap e ON imd.item_eap_id = e.id
WHERE e.e_analitico = TRUE;

-- 3. Identificar Itens Órfãos (Pais inexistentes)
SELECT 
    e.eap_codigo, 
    e.eap_pai_codigo, 
    e.descricao_servico
FROM itens_eap e
LEFT JOIN itens_eap pai ON e.eap_pai_codigo = pai.eap_codigo AND e.projeto_id = pai.projeto_id
WHERE e.eap_pai_codigo IS NOT NULL AND pai.id IS NULL;
