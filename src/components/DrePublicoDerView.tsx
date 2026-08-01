import React, { useState, useEffect } from 'react';
import { AuthSession, ContractItem } from '../types';

interface DrePublicoDerViewProps {
  authSession?: AuthSession | null;
  contracts?: ContractItem[];
}

export const DrePublicoDerView: React.FC<DrePublicoDerViewProps> = ({ authSession, contracts = [] }) => {
  const contratoId = authSession?.customClaims?.contrato_id || 'CTR-2026-SYS';

  // Calculate sum of business contracts from the business module
  const somaContratosNegocio = contracts.length > 0
    ? contracts.reduce((acc, c) => acc + c.totalValue, 0)
    : 2450000.00;

  // Sub-navigation inside Aba 3
  const [activeSubView, setActiveSubView] = useState<'dre' | 'pipeline' | 'arquitetura'>('dre');

  // State for values to allow live simulation & auditing
  const [periodo, setPeriodo] = useState<'2026-Q2' | '2026-Q1' | '2025-ANUAL'>('2026-Q2');
  const [caucaoPercent, setCaucaoPercent] = useState<number>(5.0); // 5% de caução mantida no Passivo
  const [showSimulador, setShowSimulador] = useState(false);
  const [showContractsBreakdown, setShowContractsBreakdown] = useState(false);

  // Initial State based on Period
  const initialDataByPeriod = {
    '2026-Q2': {
      subvencoesMedicoes: somaContratosNegocio,
      deducoesImpostos: 0.00,
      custoEmpreiteirasBruto: 1120000.00,
      custoMateriaisInsumos: 280000.00,
      custoMaoDeObraFiscalizacao: 195000.00,
      despPessoalAdmin: 310000.00,
      despAdminInfra: 125000.00,
      despDepreciacao: 45000.00,
      receitasFinanceiras: 38200.00,
      despesasFinanceiras: 12400.00,
      repassesEfetivamenteRecebidos: 2200000.00
    },
    '2026-Q1': {
      subvencoesMedicoes: Math.round(somaContratosNegocio * 0.85),
      deducoesImpostos: 0.00,
      custoEmpreiteirasBruto: 980000.00,
      custoMateriaisInsumos: 240000.00,
      custoMaoDeObraFiscalizacao: 180000.00,
      despPessoalAdmin: 295000.00,
      despAdminInfra: 115000.00,
      despDepreciacao: 42000.00,
      receitasFinanceiras: 29000.00,
      despesasFinanceiras: 8500.00,
      repassesEfetivamenteRecebidos: 2100000.00
    },
    '2025-ANUAL': {
      subvencoesMedicoes: Math.round(somaContratosNegocio * 3.6),
      deducoesImpostos: 0.00,
      custoEmpreiteirasBruto: 4100000.00,
      custoMateriaisInsumos: 1150000.00,
      custoMaoDeObraFiscalizacao: 720000.00,
      despPessoalAdmin: 1180000.00,
      despAdminInfra: 480000.00,
      despDepreciacao: 170000.00,
      receitasFinanceiras: 142000.00,
      despesasFinanceiras: 39000.00,
      repassesEfetivamenteRecebidos: 8500000.00
    }
  };

  const [dreState, setDreState] = useState(initialDataByPeriod['2026-Q2']);

  // Update dreState when contracts list changes
  useEffect(() => {
    if (periodo === '2026-Q2') {
      setDreState(prev => ({ ...prev, subvencoesMedicoes: somaContratosNegocio }));
    }
  }, [contracts, somaContratosNegocio, periodo]);

  // INDICADORES ORÇAMENTÁRIOS PÚBLICOS
  const [orcamentoProjetado, setOrcamentoProjetado] = useState<number>(1240500.00); // 1) Dotação Teto
  const [emExecucao, setEmExecucao] = useState<number>(682310.45);                    // 2) Empenhado / Comprometido
  const [montanteExecutado, setMontanteExecutado] = useState<number>(412500.00);      // 3) Liquidado e Pago

  // 4) Saldo à Desembolsar = (Em Execução) - (Montante Executado)
  const saldoADesembolsar = Math.max(0, emExecucao - montanteExecutado);

  // Sub-indicador: Saldo Orçamentário Livre = Orçamento Projetado - Em Execução
  const saldoOrcamentarioLivre = Math.max(0, orcamentoProjetado - emExecucao);

  // SIMULADOR DE PIPELINE DE DESPESA
  const [simVal, setSimVal] = useState<number>(50000.00);
  const [simDesc, setSimDesc] = useState<string>('Obra de Sinalização Viária Lote 4B');
  const [pipelineLogs, setPipelineLogs] = useState<Array<{ stage: string; msg: string; time: string }>>([
    { stage: 'Ateste', msg: 'Medição #04 Aprovada no valor de R$ 412.500,00', time: '10:15' },
    { stage: 'Empenho', msg: 'Reserva Orçamentária CTR-2026-SYS alocada (R$ 682.310,45)', time: '09:30' }
  ]);

  // Handle Period Change
  const handlePeriodChange = (newPeriod: '2026-Q2' | '2026-Q1' | '2025-ANUAL') => {
    setPeriodo(newPeriod);
    setDreState(initialDataByPeriod[newPeriod]);
  };

  // MATHEMATICAL EQUATIONS (DER COMPLIANCE)
  // 1. Receita Operacional Líquida (ROL) = ROB - DED
  const rob = dreState.subvencoesMedicoes;
  const ded = dreState.deducoesImpostos;
  const rol = rob - ded;

  // 2. Custos dos Serviços e Obras Executadas (CSO) = C_FORN + C_MAT + C_MO
  const cForn = dreState.custoEmpreiteirasBruto;
  const cMat = dreState.custoMateriaisInsumos;
  const cMo = dreState.custoMaoDeObraFiscalizacao;
  const cso = cForn + cMat + cMo;

  // 3. Resultado Bruto Operacional (RBO) = ROL - CSO
  const rbo = rol - cso;

  // 4. Despesas Operacionais Administrativas (DOA) = D_PES + D_MAN + D_DEP
  const dPes = dreState.despPessoalAdmin;
  const dMan = dreState.despAdminInfra;
  const dDep = dreState.despDepreciacao;
  const doa = dPes + dMan + dDep;

  // 5. Resultado Antes dos Efeitos Financeiros (EBIT) = RBO - DOA
  const ebit = rbo - doa;

  // 6. Resultado Financeiro Líquido (RFL) = R_FIN - D_FIN
  const rFin = dreState.receitasFinanceiras;
  const dFin = dreState.despesasFinanceiras;
  const rfl = rFin - dFin;

  // 7. Resultado Líquido do Exercício (RLE) = EBIT + RFL (Superávit / Déficit)
  const rle = ebit + rfl;

  // AUDIT & VALIDATIONS
  const valorCaucaoRetida = (cForn * caucaoPercent) / 100;
  const valorPagoEfetivoEmpreiteira = cForn - valorCaucaoRetida;
  const creditoSubvencaoAtivo = Math.max(0, rob - dreState.repassesEfetivamenteRecebidos);

  const fmt = (num: number) =>
    num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handlePrintDRE = () => {
    window.print();
  };

  // Pipeline simulation handler functions
  const runPipelineAction = (action: 'planejamento' | 'empenho' | 'ateste' | 'pagamento') => {
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    if (action === 'planejamento') {
      setOrcamentoProjetado(prev => prev + simVal);
      setPipelineLogs(prev => [
        { stage: 'Planejamento', msg: `Suplementação/Acréscimo de Dotação: +R$ ${fmt(simVal)} (${simDesc})`, time: timeStr },
        ...prev
      ]);
    } else if (action === 'empenho') {
      if (simVal > saldoOrcamentarioLivre) {
        alert(`Saldo Orçamentário Livre insuficiente (R$ ${fmt(saldoOrcamentarioLivre)}) para empenhar R$ ${fmt(simVal)}!`);
        return;
      }
      setEmExecucao(prev => prev + simVal);
      setPipelineLogs(prev => [
        { stage: 'Reserva (Empenho)', msg: `Nota de Empenho emitida e vinculada no teto: R$ ${fmt(simVal)} (${simDesc})`, time: timeStr },
        ...prev
      ]);
    } else if (action === 'ateste') {
      setPipelineLogs(prev => [
        { stage: 'Ateste (Liquidação)', msg: `Atestada medição de serviços de R$ ${fmt(simVal)} (${simDesc}). Pronta para desembolso.`, time: timeStr },
        ...prev
      ]);
    } else if (action === 'pagamento') {
      if (simVal > saldoADesembolsar) {
        alert(`Valor a pagar R$ ${fmt(simVal)} é superior ao Saldo à Desembolsar (R$ ${fmt(saldoADesembolsar)})!`);
        return;
      }
      setMontanteExecutado(prev => prev + simVal);
      setPipelineLogs(prev => [
        { stage: 'Pagamento', msg: `Ordem bancária executada de R$ ${fmt(simVal)} (${simDesc}). Transferido para Montante Executado.`, time: timeStr },
        ...prev
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-md border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005daa] text-2xl">account_balance</span>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Módulo de Controle Orçamentário e DRE DER (Empresa Pública / Autarquias)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dotações Orçamentárias, Workflow de Execução e Reconhecimento por Medições Homologadas • Tenant:{' '}
            <strong className="text-slate-800 font-mono font-bold">{contratoId}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
            <button
              onClick={() => handlePeriodChange('2026-Q2')}
              className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                periodo === '2026-Q2'
                  ? 'bg-white text-[#005daa] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2026 - 2º Trim
            </button>
            <button
              onClick={() => handlePeriodChange('2026-Q1')}
              className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                periodo === '2026-Q1'
                  ? 'bg-white text-[#005daa] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2026 - 1º Trim
            </button>
            <button
              onClick={() => handlePeriodChange('2025-ANUAL')}
              className={`px-3 py-1.5 rounded font-bold transition-all cursor-pointer ${
                periodo === '2025-ANUAL'
                  ? 'bg-white text-[#005daa] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2025 - Exercício Completo
            </button>
          </div>

          <button
            onClick={() => setShowSimulador(!showSimulador)}
            className={`px-3 py-2 text-xs font-bold rounded-md border transition-all flex items-center gap-1.5 cursor-pointer ${
              showSimulador
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-base">tune</span>
            <span>Ajustar Parâmetros</span>
          </button>

          <button
            onClick={handlePrintDRE}
            className="px-3 py-2 bg-[#005daa] text-white font-bold text-xs rounded-md hover:bg-[#004882] transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span>Imprimir DRE DER</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs inside Aba 3 */}
      <div className="flex border-b border-slate-200 bg-white px-4 pt-2 rounded-md shadow-2xs gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveSubView('dre')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubView === 'dre'
              ? 'border-[#005daa] text-[#005daa]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">analytics</span>
          <span>1. Visão de Execução & DRE DER</span>
        </button>

        <button
          onClick={() => setActiveSubView('pipeline')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubView === 'pipeline'
              ? 'border-[#005daa] text-[#005daa]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">alt_route</span>
          <span>2. Pipeline & Workflow da Despesa</span>
        </button>

        <button
          onClick={() => setActiveSubView('arquitetura')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubView === 'arquitetura'
              ? 'border-[#005daa] text-[#005daa]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">developer_board</span>
          <span>3. Engenharia, Schema & Queries SQL</span>
        </button>
      </div>

      {/* Interactive Simulation Form */}
      {showSimulador && (
        <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-md text-xs space-y-4">
          <div className="flex justify-between items-center border-b border-amber-200 pb-2">
            <h3 className="font-bold text-amber-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-700">edit_note</span>
              Simulador de Parâmetros Contábeis e Orçamentários DER
            </h3>
            <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-mono">
              Atualização em Tempo Real das Equações
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-bold text-amber-900 mb-1">Medições Homologadas (ROB)</label>
              <input
                type="number"
                value={dreState.subvencoesMedicoes}
                onChange={(e) =>
                  setDreState({ ...dreState, subvencoesMedicoes: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2 bg-white border border-amber-300 rounded font-mono font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-900 mb-1">Custo Empreiteiras Bruto (C_FORN)</label>
              <input
                type="number"
                value={dreState.custoEmpreiteirasBruto}
                onChange={(e) =>
                  setDreState({ ...dreState, custoEmpreiteirasBruto: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2 bg-white border border-amber-300 rounded font-mono font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-900 mb-1">Materiais e Insumos (C_MAT)</label>
              <input
                type="number"
                value={dreState.custoMateriaisInsumos}
                onChange={(e) =>
                  setDreState({ ...dreState, custoMateriaisInsumos: parseFloat(e.target.value) || 0 })
                }
                className="w-full p-2 bg-white border border-amber-300 rounded font-mono font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-900 mb-1">% Retenção Caução de Garantia</label>
              <input
                type="number"
                step="0.5"
                value={caucaoPercent}
                onChange={(e) => setCaucaoPercent(parseFloat(e.target.value) || 0)}
                className="w-full p-2 bg-white border border-amber-300 rounded font-mono font-bold text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area Layout with Right Sidebar for KPI Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Area (Main Sub-Views: DRE, Pipeline, Architecture) */}
        <div className="lg:col-span-9 xl:col-span-9 space-y-6">
          {activeSubView === 'pipeline' && (
            <div className="bg-white p-6 rounded-md border border-slate-200 shadow-2xs space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005daa]">alt_route</span>
                  Lógica de Transições de Estado (Workflow da Despesa)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Garanta a regra de negócio do setor público: Planejamento → Reserva (Empenho) → Ateste (Liquidação) → Pagamento.
                </p>
              </div>

          {/* Workflow Stepper Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-md space-y-2">
              <div className="flex items-center justify-between text-blue-900 font-bold text-xs">
                <span>1. Planejamento</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-mono">Consome Dotação</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Consome o <strong>Orçamento Projetado</strong>. Verifica se há teto autorizado disponível.
              </p>
              <button
                onClick={() => runPipelineAction('planejamento')}
                className="w-full py-1.5 bg-[#005daa] text-white font-bold text-xs rounded hover:bg-[#004882] transition-all cursor-pointer"
              >
                + Suplementar Dotação
              </button>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-md space-y-2">
              <div className="flex items-center justify-between text-amber-900 font-bold text-xs">
                <span>2. Reserva (Empenho)</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-mono">Em Execução</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Transfere valor livre para <strong>Em Execução</strong>. Bloqueia o recurso para uso exclusivo do contrato.
              </p>
              <button
                onClick={() => runPipelineAction('empenho')}
                className="w-full py-1.5 bg-amber-600 text-white font-bold text-xs rounded hover:bg-amber-700 transition-all cursor-pointer"
              >
                + Empenhar Contrato
              </button>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-md space-y-2">
              <div className="flex items-center justify-between text-indigo-900 font-bold text-xs">
                <span>3. Ateste (Liquidação)</span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-mono">Obra Medida</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Engenheiro e fiscal homologam a medição física da obra. Gera nota de ateste pronta para desembolso.
              </p>
              <button
                onClick={() => runPipelineAction('ateste')}
                className="w-full py-1.5 bg-indigo-600 text-white font-bold text-xs rounded hover:bg-indigo-700 transition-all cursor-pointer"
              >
                + Homologar Medição
              </button>
            </div>

            {/* Step 4 */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-md space-y-2">
              <div className="flex items-center justify-between text-emerald-900 font-bold text-xs">
                <span>4. Pagamento</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-mono">Montante Executado</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Efetua ordem bancária ao fornecedor, alimentando <strong>Montante Executado</strong> e baixando <strong>Saldo à Desembolsar</strong>.
              </p>
              <button
                onClick={() => runPipelineAction('pagamento')}
                className="w-full py-1.5 bg-emerald-600 text-white font-bold text-xs rounded hover:bg-emerald-700 transition-all cursor-pointer"
              >
                + Executar Ordem Bancária
              </button>
            </div>
          </div>

          {/* Interactive Amount Configurator */}
          <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="font-bold text-slate-700">Valor do Lançamento Simulado (R$):</label>
              <input
                type="number"
                step="5000"
                value={simVal}
                onChange={(e) => setSimVal(parseFloat(e.target.value) || 0)}
                className="p-1.5 bg-white border border-slate-300 rounded font-mono font-bold w-36 text-slate-800"
              />
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <label className="font-bold text-slate-700">Descrição / Objeto:</label>
              <input
                type="text"
                value={simDesc}
                onChange={(e) => setSimDesc(e.target.value)}
                className="p-1.5 bg-white border border-slate-300 rounded font-sans w-full text-slate-800"
              />
            </div>
          </div>

          {/* Audit Logs */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">history</span>
              Trilha de Auditoria em Tempo Real do Pipeline
            </h4>
            <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-[11px] space-y-1.5 max-h-48 overflow-y-auto">
              {pipelineLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 border-b border-slate-800 pb-1">
                  <span className="text-slate-400">[{log.time}]</span>
                  <span className="text-amber-400 font-bold">[{log.stage}]</span>
                  <span className="text-slate-200">{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'arquitetura' && (
        <div className="bg-white p-6 rounded-md border border-slate-200 shadow-2xs space-y-6 font-sans">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005daa]">database</span>
              Arquitetura de Dados, DDL SQL e Endpoints REST
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Esquema de banco de dados relacional (Cloud SQL/PostgreSQL) desacoplando o <strong>Módulo de Negócio</strong> (Cadastro de Contratos Operacionais) do <strong>Container Tenant</strong> (<code className="font-mono">{contratoId}</code>).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database Tables DDL */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#005daa]">table_chart</span>
                1. DDL do Banco de Dados (Módulo de Negócio vs Container)
              </h4>
              <pre className="bg-slate-900 text-slate-200 p-4 rounded font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`-- Tabela 0: Contratos do Módulo de Negócio (NÃO É O CONTAINER!)
CREATE TABLE Contratos_Negocio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(50) NOT NULL, -- Ref. ao Container (ex: CTR-2026-SYS)
  codigo_contrato VARCHAR(50) NOT NULL UNIQUE, -- ex: CTR-2024-001
  objeto TEXT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  data_vencimento DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('ATIVO', 'RENOVAÇÃO', 'ENCERRADO')),
  valor_total NUMERIC(15,2) NOT NULL, -- Origem da Subvenção/ROB no DRE
  valor_mensal NUMERIC(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela 1: Dotações e Teto Autorizado
CREATE TABLE Projetos_Orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(50) NOT NULL,
  ano_exercicio INT NOT NULL,
  valor_dotacao_inicial NUMERIC(15,2) NOT NULL,
  aditivos_suplementacoes NUMERIC(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela 2: Reservas e Empenhos (Em Execução)
CREATE TABLE Despesas_Comprometidas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_orcamento_id UUID REFERENCES Projetos_Orcamentos(id),
  numero_empenho VARCHAR(50) NOT NULL,
  fornecedor_cnpj VARCHAR(18) NOT NULL,
  valor_reservado NUMERIC(15,2) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('PLANEJADO', 'EMPENHADO', 'CANCELADO')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela 3: Medições e Liquidações (Montante Executado)
CREATE TABLE Medicoes_Pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despesa_comprometida_id UUID REFERENCES Despesas_Comprometidas(id),
  numero_medicao INT NOT NULL,
  valor_liquidado NUMERIC(15,2) NOT NULL,
  valor_pago NUMERIC(15,2) NOT NULL,
  status_pagamento VARCHAR(20) CHECK (status_pagamento IN ('PENDENTE', 'PAGO')),
  data_pagamento DATE
);`}
              </pre>
            </div>

            {/* SQL Queries for KPIs */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#005daa]">terminal</span>
                2. SQL Queries para Agregação DRE & KPIs
              </h4>
              <pre className="bg-slate-900 text-emerald-400 p-4 rounded font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
{`-- A) Agregação da ROB / Subvenções Governamentais (Contratos de Negócio)
SELECT 
  tenant_id,
  COUNT(id) AS total_contratos_ativos,
  SUM(valor_total) AS subvencoes_medicoes_rob
FROM Contratos_Negocio
WHERE tenant_id = 'CTR-2026-SYS' AND status IN ('ATIVO', 'RENOVAÇÃO')
GROUP BY tenant_id;

-- B) Agregação dos 4 Indicadores Orçamentários
SELECT 
  -- 1) Orçamento Projetado
  COALESCE(po.valor_dotacao_inicial + po.aditivos_suplementacoes, 0) AS orcamento_projetado,
  
  -- 2) Em Execução (Empenhado)
  COALESCE(SUM(dc.valor_reservado), 0) AS em_execucao,
  
  -- 3) Montante Executado (Pago)
  COALESCE(SUM(mp.valor_pago), 0) AS montante_executado,
  
  -- 4) Saldo à Desembolsar = Em Execução - Montante Executado
  (COALESCE(SUM(dc.valor_reservado), 0) - COALESCE(SUM(mp.valor_pago), 0)) AS saldo_a_desembolsar

FROM Projetos_Orcamentos po
LEFT JOIN Despesas_Comprometidas dc ON dc.projeto_orcamento_id = po.id AND dc.status = 'EMPENHADO'
LEFT JOIN Medicoes_Pagamentos mp ON mp.despesa_comprometida_id = dc.id AND mp.status_pagamento = 'PAGO'
WHERE po.tenant_id = 'CTR-2026-SYS'
GROUP BY po.id;`}
              </pre>
            </div>
          </div>

          {/* Endpoints Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#005daa]">api</span>
              3. Estrutura de Endpoints REST (API)
            </h4>
            <div className="border border-slate-200 rounded overflow-hidden text-xs font-mono">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-2.5">Método</th>
                    <th className="p-2.5">Endpoint</th>
                    <th className="p-2.5">Descrição</th>
                    <th className="p-2.5">Indicador Afetado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  <tr>
                    <td className="p-2.5 font-bold text-emerald-700">GET</td>
                    <td className="p-2.5 font-bold">/api/v1/orcamento/kpis?contrato_id=CTR-2026-SYS</td>
                    <td className="p-2.5">Retorna os 4 indicadores em tempo real</td>
                    <td className="p-2.5 font-bold text-blue-700">Todos os 4 KPIs</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-blue-700">POST</td>
                    <td className="p-2.5 font-bold">/api/v1/orcamento/suplementar</td>
                    <td className="p-2.5">Registra aditivo ao teto dotação</td>
                    <td className="p-2.5 text-[#005daa]">1) Orçamento Projetado</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-blue-700">POST</td>
                    <td className="p-2.5 font-bold">/api/v1/despesas/empenhar</td>
                    <td className="p-2.5">Reserva orçamentária e emite contrato</td>
                    <td className="p-2.5 text-amber-700">2) Em Execução</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-blue-700">POST</td>
                    <td className="p-2.5 font-bold">/api/v1/medicoes/homologar-pagar</td>
                    <td className="p-2.5">Atesta medição física e liquida ordem bancária</td>
                    <td className="p-2.5 text-emerald-700">3) Montante Executado & 4) Saldo à Desembolsar</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'dre' && (
        <>
          {/* Equations Summary Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3 flex flex-wrap justify-between items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">ROL (ROB - DED):</span>
              <span className="font-bold text-[#005daa]">R$ {fmt(rol)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">CSO:</span>
              <span className="font-bold text-slate-800">R$ {fmt(cso)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">RBO (ROL - CSO):</span>
              <span className="font-bold text-emerald-700">R$ {fmt(rbo)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">RLE (EBIT + RFL):</span>
              <span className={`font-bold ${rle >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                R$ {fmt(rle)} ({rle >= 0 ? 'SUPERÁVIT' : 'DÉFICIT'})
              </span>
            </div>
          </div>

          {/* Main DRE Template Vertical Table */}
          <div className="bg-white rounded-md border border-slate-200 shadow-2xs overflow-hidden">
            <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm tracking-wide">
                  DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO - DER (MÓDULO AUTARQUIA / ESTAÇÃO DE INFRAESTRUTURA)
                </h3>
                <p className="text-[11px] text-slate-300">
                  Período de Apuração: <strong className="text-white font-mono">{periodo}</strong> • Valores em Reais (R$)
                </p>
              </div>
              <span className="text-[10px] font-mono bg-slate-700 px-2.5 py-1 rounded text-emerald-400 font-bold border border-slate-600">
                VALIDADO VIA NBC TSP / DER
              </span>
            </div>

            <div className="divide-y divide-slate-200 text-xs font-mono">
              {/* (+) RECEITA OPERACIONAL BRUTA */}
              <div className="p-3 bg-slate-50/80 flex justify-between items-center font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold text-sm">(+)</span>
                  <span>RECEITA OPERACIONAL BRUTA (ROB)</span>
                </span>
                <span className="text-emerald-700">R$ {fmt(rob)}</span>
              </div>
              <div className="pl-8 pr-3 py-2 flex flex-wrap justify-between items-center text-slate-600 bg-white gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-slate-400">subdirectory_arrow_right</span>
                    <span>(+) Subvenções Governamentais (Medições Homologadas)</span>
                  </span>
                  <span className="text-[10px] bg-blue-100 text-[#005daa] px-2 py-0.5 rounded font-sans font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">business_center</span>
                    Origem: Módulo de Negócio ({contracts.length || 5} Contratos)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowContractsBreakdown(!showContractsBreakdown)}
                    className="text-[11px] text-[#005daa] underline font-bold hover:text-blue-800 cursor-pointer flex items-center gap-1 font-sans"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {showContractsBreakdown ? 'expand_less' : 'expand_more'}
                    </span>
                    <span>{showContractsBreakdown ? 'Ocultar Contratos' : 'Ver Detalhes dos Contratos'}</span>
                  </button>
                  <span className="font-bold font-mono">R$ {fmt(dreState.subvencoesMedicoes)}</span>
                </div>
              </div>

              {/* Business Contracts Breakdown Panel */}
              {showContractsBreakdown && (
                <div className="mx-6 my-2 p-3.5 bg-blue-50/70 border border-blue-200 rounded-md text-xs space-y-2 font-sans">
                  <div className="flex justify-between items-center border-b border-blue-200/80 pb-2">
                    <span className="font-bold text-[#005daa] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">receipt_long</span>
                      Carteira de Contratos do Módulo de Negócio (Base do Orçamento / ROB)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Tenant: {contratoId}
                    </span>
                  </div>
                  <div className="divide-y divide-blue-200/60 font-sans">
                    {(contracts.length > 0 ? contracts : [
                      { id: '1', code: 'CTR-2024-001', object: 'Armazenagem Climatizada - Setor A', status: 'ATIVO', totalValue: 450000.00, category: 'Armazenamento' },
                      { id: '2', code: 'CTR-2024-042', object: 'Manutenção de Racks Industriais', status: 'RENOVAÇÃO', totalValue: 82500.00, category: 'Manutenção' },
                      { id: '3', code: 'CTR-2023-118', object: 'Sistemas de Monitoramento IoT', status: 'ATIVO', totalValue: 1240000.00, category: 'Tecnologia' },
                      { id: '4', code: 'CTR-2024-08', object: 'Transporte de Carga Pesada', status: 'RENOVAÇÃO', totalValue: 320000.00, category: 'Logística' },
                      { id: '5', code: 'CTR-2023-15', object: 'Locação de Paletes Automatizados', status: 'ATIVO', totalValue: 357500.00, category: 'Locação' }
                    ]).map((contract) => (
                      <div key={contract.id} className="py-2 flex justify-between items-center text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-200 text-[#005daa]">
                            {contract.code}
                          </span>
                          <span className="text-slate-800 font-medium">{contract.object}</span>
                          <span className="text-[10px] bg-white text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                            {contract.category || 'Geral'}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            contract.status === 'ATIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {contract.status}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          R$ {fmt(contract.totalValue)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-blue-200/80 flex justify-between font-bold text-[#005daa] text-xs">
                    <span>SOMA TOTAL DOS CONTRATOS DE NEGÓCIO:</span>
                    <span className="font-mono text-sm">R$ {fmt(somaContratosNegocio)}</span>
                  </div>
                </div>
              )}

              {/* (-) DEDUÇÕES DA RECEITA BRUTA */}
              <div className="p-3 bg-slate-50/80 flex justify-between items-center font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold text-sm">(-)</span>
                  <span>DEDUÇÕES DA RECEITA BRUTA (DED)</span>
                </span>
                <span>R$ {fmt(ded)}</span>
              </div>
              <div className="pl-8 pr-3 py-2 flex justify-between items-center text-slate-600 bg-white">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-slate-400">subdirectory_arrow_right</span>
                  <span>(-) Impostos e Devoluções (Neutralidade Tributária = 0)</span>
                </span>
                <span>R$ {fmt(dreState.deducoesImpostos)}</span>
              </div>

              {/* (=) RECEITA OPERACIONAL LÍQUIDA */}
              <div className="p-3 bg-blue-50 text-[#005daa] flex justify-between items-center font-bold text-sm border-y border-blue-200">
                <span>(=) RECEITA OPERACIONAL LÍQUIDA (ROL)</span>
                <span>R$ {fmt(rol)}</span>
              </div>

              {/* (-) CUSTOS DOS SERVIÇOS E OBRAS EXECUTADAS */}
              <div className="p-3 bg-slate-50/80 flex justify-between items-center font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold text-sm">(-)</span>
                  <span>CUSTOS DOS SERVIÇOS E OBRAS EXECUTADAS (CSO)</span>
                </span>
                <span className="text-rose-700">- R$ {fmt(cso)}</span>
              </div>
              <div className="pl-8 pr-3 py-2 flex justify-between items-center text-slate-600 bg-white">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-slate-400">subdirectory_arrow_right</span>
                  <span>(-) Prestadores de Serviços / Empreiteiras (Valor Bruto com Caução)</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-sans font-bold">
                    Auditoria C_FORN
                  </span>
                </span>
                <span>- R$ {fmt(cForn)}</span>
              </div>
              <div className="pl-8 pr-3 py-2 flex justify-between items-center text-slate-600 bg-white">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-slate-400">subdirectory_arrow_right</span>
                  <span>(-) Materiais e Insumos Aplicados Diretos</span>
                </span>
                <span>- R$ {fmt(cMat)}</span>
              </div>
              <div className="pl-8 pr-3 py-2 flex justify-between items-center text-slate-600 bg-white">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-slate-400">subdirectory_arrow_right</span>
                  <span>(-) Mão de Obra Técnica e Fiscalização de Campo</span>
                </span>
                <span>- R$ {fmt(cMo)}</span>
              </div>

              {/* (=) RESULTADO BRUTO OPERACIONAL */}
              <div className="p-3 bg-slate-100 text-slate-900 flex justify-between items-center font-bold text-sm border-y border-slate-300">
                <span>(=) RESULTADO BRUTO OPERACIONAL (RBO = ROL - CSO)</span>
                <span className={rbo >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  R$ {fmt(rbo)}
                </span>
              </div>

              {/* (-) DESPESAS OPERACIONAIS */}
              <div className="p-3 bg-slate-50/80 flex justify-between items-center font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <span className="text-rose-600 font-bold text-sm">(-)</span>
                  <span>DESPESAS OPERACIONAIS ADMINISTRATIVAS (DOA)</span>
                </span>
                <span className="text-rose-700">- R$ {fmt(doa)}</span>
              </div>
              <div className="pl-8 pr-3 py-2 flex justify-between items-center text-slate-600 bg-white">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-slate-400">subdirectory_arrow_right</span>
                  <span>(-) Pessoal Administrativo, Diretoria e Encargos (D_PES)</span>
                </span>
                <span>- R$ {fmt(dPes)}</span>
              </div>
              <div className="pl-8 pr-3 py-2 flex justify-between items-center text-slate-600 bg-white">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-slate-400">subdirectory_arrow_right</span>
                  <span>(-) Despesas Administrativas e de Infraestrutura (D_MAN)</span>
                </span>
                <span>- R$ {fmt(dMan)}</span>
              </div>
              <div className="pl-8 pr-3 py-2 flex justify-between items-center text-slate-600 bg-white">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-slate-400">subdirectory_arrow_right</span>
                  <span>(-) Depreciação e Amortização de Ativos Operacionais (D_DEP)</span>
                </span>
                <span>- R$ {fmt(dDep)}</span>
              </div>

              {/* (=) RESULTADO ANTES DOS EFEITOS FINANCEIROS */}
              <div className="p-3 bg-indigo-50 text-indigo-900 flex justify-between items-center font-bold text-sm border-y border-indigo-200">
                <span>(=) RESULTADO ANTES DOS EFEITOS FINANCEIROS (EBIT = RBO - DOA)</span>
                <span className={ebit >= 0 ? 'text-indigo-900' : 'text-rose-700'}>
                  R$ {fmt(ebit)}
                </span>
              </div>

              {/* (+/-) RESULTADO FINANCEIRO LÍQUIDO */}
              <div className="p-3 bg-slate-50/80 flex justify-between items-center font-bold text-slate-900">
                <span className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold text-sm">(+/-)</span>
                  <span>RESULTADO FINANCEIRO LÍQUIDO (RFL)</span>
                </span>
                <span className={rfl >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  {rfl >= 0 ? '+' : ''} R$ {fmt(rfl)}
                </span>
              </div>
              <div className="pl-8 pr-3 py-2 flex justify-between items-center text-slate-600 bg-white">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-emerald-600">add</span>
                  <span>(+) Receitas Financeiras (Rendimentos de Convênios/Aplicações)</span>
                </span>
                <span className="text-emerald-700">+ R$ {fmt(rFin)}</span>
              </div>
              <div className="pl-8 pr-3 py-2 flex justify-between items-center text-slate-600 bg-white">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs text-rose-600">remove</span>
                  <span>(-) Despesas Financeiras (Juros de Mora e Tarifas)</span>
                </span>
                <span className="text-rose-700">- R$ {fmt(dFin)}</span>
              </div>

              {/* (=) RESULTADO LÍQUIDO DO EXERCÍCIO */}
              <div
                className={`p-4 flex justify-between items-center font-bold text-base border-t-2 ${
                  rle >= 0
                    ? 'bg-emerald-100/80 text-emerald-950 border-emerald-500'
                    : 'bg-rose-100/80 text-rose-950 border-rose-500'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined">
                    {rle >= 0 ? 'verified' : 'warning'}
                  </span>
                  <span>
                    (=) RESULTADO LÍQUIDO DO EXERCÍCIO ({rle >= 0 ? 'SUPERÁVIT' : 'DÉFICIT'})
                  </span>
                </span>
                <span className="text-lg">R$ {fmt(rle)}</span>
              </div>
            </div>
          </div>

          {/* Audit Notes and Compliance Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Panel 1: Audit of Retenção Contratual */}
            <div className="bg-white p-5 rounded-md border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                <span className="material-symbols-outlined text-base">verified_user</span>
                <span>1. Validação de Retenção Contratual</span>
              </div>
              <p className="text-[11px] text-slate-600">
                O valor de <strong className="font-mono text-slate-800">C_FORN (R$ {fmt(cForn)})</strong> reflete a medição
                bruta integral.
              </p>
              <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-amber-900">
                  <span>Caução Retida ({caucaoPercent}%):</span>
                  <strong>R$ {fmt(valorCaucaoRetida)}</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Desembolso Efetivo:</span>
                  <span>R$ {fmt(valorPagoEfetivoEmpreiteira)}</span>
                </div>
                <p className="text-[10px] font-sans text-amber-800 pt-1 border-t border-amber-200/80">
                  * O valor retido em caução permanece registrado no Passivo Circulante (Balanço), sem deduzir o custo no DRE.
                </p>
              </div>
            </div>

            {/* Panel 2: Competência vs Caixa */}
            <div className="bg-white p-5 rounded-md border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                <span>2. Caixa vs. Competência</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Medições homologadas no período vs repasses efetivamente liberados pelo Tesouro/Concedente.
              </p>
              <div className="p-2.5 bg-blue-50 rounded border border-blue-200 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-blue-900">
                  <span>Repasses Recebidos:</span>
                  <span>R$ {fmt(dreState.repassesEfetivamenteRecebidos)}</span>
                </div>
                <div className="flex justify-between text-blue-950 font-bold">
                  <span>Ativo Circulante (Crédito):</span>
                  <span>R$ {fmt(creditoSubvencaoAtivo)}</span>
                </div>
                <p className="text-[10px] font-sans text-blue-800 pt-1 border-t border-blue-200/80">
                  * Mapeado no Ativo Circulante como "Créditos por Subvenção Orçamentária" mantendo o DRE fiel às medições.
                </p>
              </div>
            </div>

            {/* Panel 3: Capital Appropriations */}
            <div className="bg-white p-5 rounded-md border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <span className="material-symbols-outlined text-base">gavel</span>
                <span>3. Regra de Dotações de Capital</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Conforme a norma autárquica DER, valores de investimento permanente não afetam o resultado do exercício.
              </p>
              <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-emerald-900">
                  <span>Trânsito pelo DRE:</span>
                  <strong className="text-emerald-800">Isento (R$ 0,00)</strong>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Destinação Contábil:</span>
                  <span>Ativo Imobilizado (Balanço)</span>
                </div>
                <p className="text-[10px] font-sans text-emerald-800 pt-1 border-t border-emerald-200/80">
                  * Apenas a depreciação periódica (<strong className="font-mono">D_DEP</strong>) transita como despesa operacional.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
        </div>

        {/* Right Sidebar Area: KPI Indicator Cards */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-3 lg:sticky lg:top-4 font-sans">
          <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-bold text-[11px] text-slate-800 flex items-center gap-1 uppercase tracking-wide">
                <span className="material-symbols-outlined text-sm text-[#005daa]">insights</span>
                Indicadores DER
              </h3>
              <span className="text-[9px] bg-blue-50 text-[#005daa] font-mono px-1.5 py-0.5 rounded font-bold border border-blue-200">
                Painel
              </span>
            </div>

            {/* 1) Orçamento Projetado */}
            <div className="bg-slate-50/50 p-3 border border-slate-200 rounded-lg group hover:border-[#005daa]/40 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-1.5">
                <div className="p-1 bg-[#eff6ff] rounded text-[#005daa]">
                  <span className="material-symbols-outlined text-[16px]">account_balance</span>
                </div>
                <span className="text-[#005daa] flex items-center font-bold text-[9px] bg-[#eff6ff] px-1.5 py-0.5 rounded border border-[#005daa]/20">
                  Indicador 1 (Dotação)
                </span>
              </div>
              <p className="text-slate-600 font-bold text-[11px] mb-0.5">1) Orçamento Projetado</p>
              <h3 className="font-mono text-base font-bold text-[#005daa]">
                R$ {fmt(orcamentoProjetado)}
              </h3>
              <p className="text-[9px] text-slate-500 mt-0.5">Teto autorizado (Inicial + Aditivos)</p>
              <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#005daa] w-[100%]" />
              </div>
            </div>

            {/* 2) Em Execução */}
            <div className="bg-slate-50/50 p-3 border border-slate-200 rounded-lg group hover:border-amber-400 transition-all">
              <div className="flex justify-between items-start mb-1.5">
                <div className="p-1 bg-amber-50 rounded text-amber-600">
                  <span className="material-symbols-outlined text-[16px]">pending_actions</span>
                </div>
                <span className="text-amber-700 flex items-center font-bold text-[9px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300/40">
                  Indicador 2 (Empenhado)
                </span>
              </div>
              <p className="text-slate-600 font-bold text-[11px] mb-0.5">2) Em Execução</p>
              <h3 className="font-mono text-base font-bold text-slate-800">
                R$ {fmt(emExecucao)}
              </h3>
              <p className="text-[9px] text-slate-500 mt-0.5">Reservado em contratos e OS</p>
              <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[55%]" />
              </div>
            </div>

            {/* 3) Montante Executado */}
            <div className="bg-slate-50/50 p-3 border border-slate-200 rounded-lg group hover:border-emerald-400 transition-all">
              <div className="flex justify-between items-start mb-1.5">
                <div className="p-1 bg-emerald-50 rounded text-emerald-600">
                  <span className="material-symbols-outlined text-[16px]">fact_check</span>
                </div>
                <span className="text-emerald-700 flex items-center font-bold text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300/40">
                  Indicador 3 (Pago)
                </span>
              </div>
              <p className="text-slate-600 font-bold text-[11px] mb-0.5">3) Montante Executado</p>
              <h3 className="font-mono text-base font-bold text-emerald-700">
                R$ {fmt(montanteExecutado)}
              </h3>
              <p className="text-[9px] text-slate-500 mt-0.5">Obra andou, medição aprovada</p>
              <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[33%]" />
              </div>
            </div>

            {/* 4) Saldo à Desembolsar */}
            <div className="bg-slate-50/50 p-3 border border-slate-200 rounded-lg group hover:border-green-400 transition-all">
              <div className="flex justify-between items-start mb-1.5">
                <div className="p-1 bg-green-50 rounded text-green-700">
                  <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                </div>
                <span className="text-green-800 flex items-center font-bold text-[9px] bg-green-100 px-1.5 py-0.5 rounded border border-green-300 font-mono">
                  (2) - (3)
                </span>
              </div>
              <p className="text-slate-600 font-bold text-[11px] mb-0.5">4) Saldo à Desembolsar</p>
              <h3 className="font-mono text-base font-bold text-green-700">
                R$ {fmt(saldoADesembolsar)}
              </h3>
              <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1 pt-1 border-t border-slate-200 font-mono">
                <span>Saldo Livre:</span>
                <strong className="text-blue-700">R$ {fmt(saldoOrcamentarioLivre)}</strong>
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600 w-[40%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
