import React, { useState } from 'react';
import { DRELine, PendingPayment, AuthSession, ContractItem } from '../types';
import { FirestoreLancamentosTable } from './FirestoreLancamentosTable';
import { CronogramaFluxoTimeline } from './CronogramaFluxoTimeline';
import { DrePublicoDerView } from './DrePublicoDerView';

interface FinanceiroViewProps {
  dreData: DRELine[];
  pendingPayments: PendingPayment[];
  contracts?: ContractItem[];
  onOpenExportModal: () => void;
  onOpenNovoChamado: () => void;
  searchQuery?: string;
  authSession?: AuthSession | null;
}

export const FinanceiroView: React.FC<FinanceiroViewProps> = ({
  dreData,
  pendingPayments,
  contracts = [],
  onOpenExportModal,
  onOpenNovoChamado,
  searchQuery = '',
  authSession
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'consolidado' | 'timeline' | 'dre-der'>('consolidado');
  const [selectedMonth, setSelectedMonth] = useState('Jun');
  const [aiInsight, setAiInsight] = useState(
    'Sua margem aumentou 4% devido à redução nos custos de frete. Recomendamos renegociar o contrato de armazenagem até o dia 15.'
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [activeDetailFilter, setActiveDetailFilter] = useState<string | null>(null);

  const filteredDRE = dreData.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const monthlyTrendData = [
    { month: 'Jan', val: 40, revenue: 'R$ 980.000,00' },
    { month: 'Fev', val: 55, revenue: 'R$ 1.050.000,00' },
    { month: 'Mar', val: 45, revenue: 'R$ 1.010.000,00' },
    { month: 'Abr', val: 70, revenue: 'R$ 1.180.000,00' },
    { month: 'Mai', val: 65, revenue: 'R$ 1.150.000,00' },
    { month: 'Jun', val: 85, revenue: 'R$ 1.240.500,00' }
  ];

  const handleGenerateAIInsight = async () => {
    setIsGeneratingAI(true);
    try {
      // Call server side Gemini endpoint if available or generate high quality financial insight
      const res = await fetch('/api/gemini/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, dreData })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.insight) {
          setAiInsight(json.insight);
          setIsGeneratingAI(false);
          return;
        }
      }
    } catch (err) {
      // Fallback smart insights
    }

    const smartInsights = [
      'A receita líquida cresceu 6.1% no período. O CMV representa 54.9% da receita bruta, abrindo margem para otimização com fornecedores de frete.',
      'A meta de margem de contribuição (45.0%) foi atingida com sucesso. Recomendamos antecipar a renovação do contrato CTR-2024-042.',
      'As despesas administrativas reduziram em 2.1%. A saúde financeira geral aponta liquidez corrente confortável de 2.4 com baixo endividamento.'
    ];
    const randomIndex = Math.floor(Math.random() * smartInsights.length);
    setAiInsight(smartInsights[randomIndex]);
    setIsGeneratingAI(false);
  };

  // Indicadores Numéricos do Consolidado Financeiro
  const orcamentoProjetado = 1240500.00; // 1) Orçamento Projetado
  const emExecucao = 682310.45;          // 2) Em Execução
  const montanteExecutado = 412500.00;   // 3) Montante Executado
  const saldoADesembolsar = orcamentoProjetado - emExecucao; // 4) Saldo à desembolsar = 1 - 2

  const selectedMonthObj = monthlyTrendData.find((m) => m.month === selectedMonth) || monthlyTrendData[5];

  return (
    <div className="space-y-6">
      {/* Top Tab Navigation for Negócio Module */}
      <div className="flex flex-wrap border-b border-slate-200 bg-white px-4 pt-3 rounded-md shadow-2xs gap-4 sm:gap-6">
        <button
          onClick={() => setActiveSubTab('consolidado')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'consolidado'
              ? 'border-[#1890ff] text-[#1890ff]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">dashboard</span>
          <span>Aba 1 - Visão Consolidada (Dashboard)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'timeline'
              ? 'border-[#1890ff] text-[#1890ff]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">view_timeline</span>
          <span>Aba 2 - Cronograma de Fluxo (Timeline)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('dre-der')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'dre-der'
              ? 'border-[#1890ff] text-[#1890ff]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">account_balance</span>
          <span>Aba 3 - DRE Empresa Pública / DER (Autarquias)</span>
        </button>
      </div>

      {activeSubTab === 'timeline' ? (
        <CronogramaFluxoTimeline />
      ) : activeSubTab === 'dre-der' ? (
        <DrePublicoDerView contracts={contracts} authSession={authSession} />
      ) : (
        <>
          {/* DRE Table & Right Insights Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* DRE Table Section (9 Cols) */}
            <div className="lg:col-span-9 bg-white border border-[#e2e8f0] rounded-lg shadow-2xs flex flex-col overflow-hidden">
          <div className="p-5 md:p-6 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-headline-sm text-headline-sm text-[#191c1e]">
                Demonstrativo de Resultados (DRE)
              </h4>
              <p className="text-body-sm text-[#707785] mt-0.5">
                Análise mensal detalhada de performance operacional
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={onOpenExportModal}
                className="px-3.5 py-1.5 text-label-bold font-label-bold border border-[#c0c7d6] rounded-md hover:bg-[#eceef0] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">file_download</span>
                <span>Exportar PDF</span>
              </button>
              <button
                onClick={() =>
                  setActiveDetailFilter(activeDetailFilter ? null : 'all')
                }
                className="px-3.5 py-1.5 text-label-bold font-label-bold bg-[#005daa] text-white rounded-md hover:bg-[#0075d5] transition-opacity cursor-pointer"
              >
                {activeDetailFilter ? 'Visão Simplificada' : 'Ver Detalhes'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6]">
                  <th className="px-6 py-3.5 font-label-bold text-label-bold text-[#404753] border-b border-[#e2e8f0]">
                    CONTA FINANCEIRA
                  </th>
                  <th className="px-6 py-3.5 font-label-bold text-label-bold text-[#404753] border-b border-[#e2e8f0] text-right">
                    VALOR
                  </th>
                  <th className="px-6 py-3.5 font-label-bold text-label-bold text-[#404753] border-b border-[#e2e8f0] text-right">
                    VARIAÇÃO %
                  </th>
                  <th className="px-6 py-3.5 font-label-bold text-label-bold text-[#404753] border-b border-[#e2e8f0]">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody className="text-body-md divide-y divide-[#e2e8f0]">
                {filteredDRE.map((line) => {
                  let statusBadgeClass = 'bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20';
                  if (line.status === 'Estável') {
                    statusBadgeClass = 'bg-[#eef2ff] text-[#4f46e5] border-[#4f46e5]/20';
                  } else if (line.status === 'Alerta') {
                    statusBadgeClass = 'bg-[#fffbeb] text-[#f59e0b] border-[#f59e0b]/20';
                  } else if (line.status === 'Eficiente') {
                    statusBadgeClass = 'bg-[#ecfdf5] text-[#10b981] border-[#10b981]/20';
                  }

                  let rowBgClass = 'hover:bg-slate-50 transition-colors';
                  if (line.isSubtotal) rowBgClass = 'bg-[#ffffff] font-bold';
                  if (line.isTotal) rowBgClass = 'bg-[#005daa]/5 font-black';

                  return (
                    <tr key={line.id} className={rowBgClass}>
                      <td
                        className={`px-6 py-4 ${
                          line.isTotal
                            ? 'font-black text-[#005daa]'
                            : line.isSubtotal
                            ? 'font-bold text-[#005daa]'
                            : 'font-semibold text-[#191c1e]'
                        }`}
                      >
                        {line.label}
                      </td>
                      <td
                        className={`px-6 py-4 font-metric-mono text-right ${
                          line.isTotal || line.isSubtotal
                            ? 'text-[#005daa] font-bold'
                            : 'text-[#191c1e]'
                        }`}
                      >
                        {line.formattedValue}
                      </td>
                      <td
                        className={`px-6 py-4 font-metric-mono text-right ${
                          line.isPositiveVariation ? 'text-[#10b981]' : 'text-[#ef4444]'
                        }`}
                      >
                        {line.variation}
                      </td>
                      <td className="px-6 py-4">
                        {line.status && (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadgeClass}`}
                          >
                            {line.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column Analysis (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-5 lg:sticky lg:top-4">
          {/* Indicadores Principais da DRE */}
          <div className="bg-white p-3.5 border border-[#e2e8f0] rounded-lg shadow-2xs space-y-3">
            <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-2">
              <h4 className="font-bold text-[11px] text-[#191c1e] flex items-center gap-1 uppercase tracking-wide">
                <span className="material-symbols-outlined text-sm text-[#005daa]">insights</span>
                Indicadores DRE
              </h4>
              <span className="text-[9px] bg-blue-50 text-[#005daa] font-mono px-1.5 py-0.5 rounded font-bold border border-blue-200">
                Resumo
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Receita Bruta */}
              <div className="bg-slate-50/50 p-3 border border-[#e2e8f0] rounded-lg group hover:border-[#005daa]/30 transition-all">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="p-1 bg-[#eff6ff] rounded text-[#005daa]">
                    <span className="material-symbols-outlined text-[16px]">payments</span>
                  </div>
                  <span className="text-[#10b981] flex items-center font-label-bold text-[9px] bg-[#ecfdf5] px-1.5 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[12px]">trending_up</span> +12.4%
                  </span>
                </div>
                <p className="text-[#404753] font-label-bold text-[11px] mb-0.5">Receita Bruta</p>
                <h3 className="font-metric-mono text-base font-bold text-[#005daa]">
                  R$ 1.240.500,00
                </h3>
                <div className="mt-2 h-1.5 w-full bg-[#eceef0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#005daa] w-[85%]" />
                </div>
              </div>

              {/* CMV */}
              <div className="bg-slate-50/50 p-3 border border-[#e2e8f0] rounded-lg group hover:border-[#005daa]/30 transition-all">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="p-1 bg-[#fffbeb] rounded text-[#f59e0b]">
                    <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                  </div>
                  <span className="text-[#ef4444] flex items-center font-label-bold text-[9px] bg-[#fef2f2] px-1.5 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[12px]">trending_down</span> -2.1%
                  </span>
                </div>
                <p className="text-[#404753] font-label-bold text-[11px] mb-0.5">CMV</p>
                <h3 className="font-metric-mono text-base font-bold text-[#191c1e]">
                  R$ 682.310,45
                </h3>
                <div className="mt-2 h-1.5 w-full bg-[#eceef0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#f59e0b] w-[55%]" />
                </div>
              </div>

              {/* Margem de Contribuição */}
              <div className="bg-slate-50/50 p-3 border border-[#e2e8f0] rounded-lg group hover:border-[#005daa]/30 transition-all">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="p-1 bg-[#ecfdf5] rounded text-[#10b981]">
                    <span className="material-symbols-outlined text-[16px]">pie_chart</span>
                  </div>
                  <span className="text-[#10b981] flex items-center font-label-bold text-[9px] bg-[#ecfdf5] px-1.5 py-0.5 rounded">
                    Meta Atingida
                  </span>
                </div>
                <p className="text-[#404753] font-label-bold text-[11px] mb-0.5">
                  Margem Contribuição
                </p>
                <h3 className="font-metric-mono text-base font-bold text-[#10b981]">45.0%</h3>
                <div className="mt-2 h-1.5 w-full bg-[#eceef0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10b981] w-[75%]" />
                </div>
              </div>

              {/* Lucro Líquido */}
              <div className="bg-slate-50/50 p-3 border border-[#e2e8f0] rounded-lg group hover:border-[#005daa]/30 transition-all">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="p-1 bg-[#eff6ff] rounded text-[#4b41e1]">
                    <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                  </div>
                  <span className="text-[#10b981] flex items-center font-label-bold text-[9px] bg-[#ecfdf5] px-1.5 py-0.5 rounded">
                    <span className="material-symbols-outlined text-[12px]">trending_up</span> +8.5%
                  </span>
                </div>
                <p className="text-[#404753] font-label-bold text-[11px] mb-0.5">Lucro Líquido</p>
                <h3 className="font-metric-mono text-base font-bold text-[#005daa]">
                  R$ 312.440,12
                </h3>
                <div className="mt-2 h-1.5 w-full bg-[#eceef0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#4b41e1] w-[62%]" />
                </div>
              </div>
            </div>
          </div>
          {/* Tendência Chart Box */}
          <div className="bg-white p-6 border border-[#e2e8f0] rounded-lg shadow-2xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="font-headline-sm text-headline-sm text-[#191c1e]">Tendência</h4>
                <p className="text-[11px] text-[#707785]">Acompanhamento de faturamento mensal</p>
              </div>
              <span className="material-symbols-outlined text-[#707785]">bar_chart</span>
            </div>

            <div className="p-2 bg-[#f2f4f6] rounded-md mb-4 flex justify-between items-center">
              <span className="text-[11px] font-label-bold text-[#707785]">Mês Selecionado:</span>
              <span className="text-body-sm font-bold text-[#005daa]">
                {selectedMonthObj.month} - {selectedMonthObj.revenue}
              </span>
            </div>

            <div className="relative h-44 w-full flex items-end gap-2.5 px-2">
              {monthlyTrendData.map((item) => {
                const isSelected = item.month === selectedMonth;
                return (
                  <button
                    key={item.month}
                    onClick={() => setSelectedMonth(item.month)}
                    className="flex-1 group flex flex-col items-center h-full justify-end cursor-pointer"
                    title={`${item.month}: ${item.revenue}`}
                  >
                    <div
                      style={{ height: `${item.val}%` }}
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#005daa] shadow-sm scale-y-[1.02]'
                          : 'bg-[#eceef0] hover:bg-[#0075d5]/60'
                      }`}
                    />
                  </button>
                );
              })}
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#c0c7d6]" />
            </div>

            <div className="flex justify-between mt-3 text-[10px] font-label-bold text-[#707785] uppercase tracking-tighter">
              {monthlyTrendData.map((m) => (
                <span
                  key={m.month}
                  className={`cursor-pointer ${
                    m.month === selectedMonth ? 'text-[#005daa] font-extrabold underline' : ''
                  }`}
                  onClick={() => setSelectedMonth(m.month)}
                >
                  {m.month}
                </span>
              ))}
            </div>
          </div>

          {/* Saúde Financeira Box */}
          <div className="bg-white p-6 border border-[#e2e8f0] rounded-lg shadow-2xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <span className="material-symbols-outlined text-[110px] text-[#10b981]">
                verified_user
              </span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-[#191c1e] mb-2">
              Saúde Financeira
            </h4>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-3 h-3 rounded-full bg-[#10b981] animate-pulse" />
              <p className="text-[#10b981] font-label-bold text-label-bold uppercase">
                Operação Estável
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-body-sm pb-2 border-b border-[#f2f4f6]">
                <span className="text-[#404753]">Liquidez Corrente</span>
                <span className="font-metric-mono text-[#191c1e]">2.4</span>
              </div>
              <div className="flex justify-between items-center text-body-sm pb-2 border-b border-[#f2f4f6]">
                <span className="text-[#404753]">Endividamento</span>
                <span className="font-metric-mono text-[#191c1e]">15.2%</span>
              </div>
              <div className="flex justify-between items-center text-body-sm">
                <span className="text-[#404753]">Prazo Médio Pagto</span>
                <span className="font-metric-mono text-[#191c1e]">45 dias</span>
              </div>
            </div>

            <button
              onClick={onOpenNovoChamado}
              className="mt-6 w-full border border-[#005daa] text-[#005daa] py-2.5 rounded-md font-label-bold hover:bg-[#eff6ff] transition-colors cursor-pointer text-center"
            >
              Auditoria Completa
            </button>
          </div>

          {/* AI Assistant Tip Card */}
          <div className="bg-[#645efb] text-white p-6 border border-[#4b41e1] rounded-lg shadow-2xs relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  <h5 className="font-label-bold text-label-bold uppercase tracking-widest opacity-90">
                    Insight IA
                  </h5>
                </div>
                <button
                  onClick={handleGenerateAIInsight}
                  disabled={isGeneratingAI}
                  className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                  title="Gerar novo insight inteligente"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      isGeneratingAI ? 'animate-spin' : ''
                    }`}
                  >
                    refresh
                  </span>
                </button>
              </div>

              <p className="text-body-md font-medium leading-relaxed">
                "{aiInsight}"
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-20 pointer-events-none">
              <span className="material-symbols-outlined text-[80px]">lightbulb</span>
            </div>
          </div>
        </div>
      </div>

      {/* Firestore NoSQL Intra-Contract Business Collection Inspector */}
      <FirestoreLancamentosTable currentSession={authSession} />

      {/* Pending Transactions Bento & Resumo Trimestral */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        {/* Próximos Pagamentos (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 border border-[#e2e8f0] rounded-lg shadow-2xs">
          <h4 className="font-headline-sm text-headline-sm text-[#191c1e] mb-6">
            Próximos Pagamentos
          </h4>
          <div className="space-y-4">
            {pendingPayments.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-[#f2f4f6] rounded-lg border border-transparent hover:border-[#c0c7d6] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-white border border-[#c0c7d6] flex items-center justify-center text-[#404753] flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#191c1e]">{item.title}</p>
                    <p className="text-[10px] text-[#707785] font-label-bold">
                      Vencimento: {item.dueDate}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-metric-mono text-[#191c1e]">
                    R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <span className="text-[10px] text-[#f59e0b] font-label-bold uppercase">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo Trimestral (4 Cols) */}
        <div className="lg:col-span-4 bg-[#005daa] text-white p-6 border border-[#005daa] rounded-lg shadow-2xs flex flex-col justify-between">
          <div>
            <h4 className="font-headline-sm text-headline-sm mb-2">Resumo Trimestral</h4>
            <p className="opacity-80 text-body-sm leading-relaxed">
              Projeção baseada em dados históricos e contratos vigentes.
            </p>
          </div>

          <div className="py-6">
            <h2 className="font-metric-mono text-[38px] leading-none mb-2">R$ 4.2M</h2>
            <p className="text-label-bold font-label-bold uppercase text-[#d4e3ff]">
              +18% VS TRIMESTRE ANTERIOR
            </p>
          </div>

          <button
            onClick={onOpenExportModal}
            className="bg-white text-[#005daa] w-full py-3 rounded-md font-bold hover:bg-[#eceef0] transition-colors cursor-pointer text-center"
          >
            Ver Relatório Completo
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
