import React from 'react';
import { ContractItem, InvoiceItem, ActivityItem, NavigationTab } from '../types';

interface DashboardViewProps {
  contracts: ContractItem[];
  invoices: InvoiceItem[];
  activities: ActivityItem[];
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenNFDrawer: () => void;
  onOpenNovoChamado: () => void;
  searchQuery?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  contracts,
  invoices,
  activities,
  onNavigateTab,
  onOpenNFDrawer,
  onOpenNovoChamado,
  searchQuery = ''
}) => {
  const filteredContracts = contracts.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.object.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-[#191c1e]">
            Visão Geral Operacional
          </h2>
          <p className="text-[#404753] font-body-md mt-0.5">
            Gerenciamento de contratos e processamento de documentos fiscais.
          </p>
        </div>

        {/* System Status Indicator */}
        <div className="flex gap-3">
          <div className="bg-white border border-[#c0c7d6] p-2.5 px-3.5 rounded-md shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#ecfdf5] flex items-center justify-center text-[#10b981] flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
            </div>
            <div>
              <p className="text-[10px] font-label-bold text-[#404753] uppercase tracking-wider">
                Status do Portal
              </p>
              <p className="text-body-md font-bold text-[#10b981] leading-tight">
                Sistemas Online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Stats & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main KPI: Alertas de Margem Curta (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#c0c7d6] rounded-md shadow-2xs overflow-hidden flex flex-col">
          <div className="p-5 md:p-6 border-b border-[#c0c7d6] flex justify-between items-center bg-[#fffbeb]/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#f59e0b] rounded-md text-white shadow-2xs">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-[#191c1e]">
                Alertas de Margem Curta
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('alertas')}
              className="px-3 py-1 bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 text-[#f59e0b] font-label-bold rounded-full transition-colors cursor-pointer"
            >
              4 Críticos
            </button>
          </div>

          <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Warning Cards Column */}
            <div className="space-y-4">
              <div
                onClick={() => onNavigateTab('alertas')}
                className="p-4 bg-[#f2f4f6] rounded-md border-l-4 border-[#f59e0b] hover:bg-[#eceef0] transition-colors cursor-pointer"
              >
                <p className="text-[11px] font-label-bold text-[#404753] mb-1 uppercase tracking-wider">
                  CONTRATO #SS-2024-08
                </p>
                <p className="text-body-md font-bold text-[#191c1e] mb-2">Renovação Imediata</p>
                <div className="w-full bg-[#c0c7d6] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#f59e0b] h-full w-[12%]" />
                </div>
                <p className="text-[10px] text-[#f59e0b] font-bold mt-2">Restam 4 dias</p>
              </div>

              <div
                onClick={() => onNavigateTab('alertas')}
                className="p-4 bg-[#f2f4f6] rounded-md border-l-4 border-[#f59e0b] hover:bg-[#eceef0] transition-colors cursor-pointer"
              >
                <p className="text-[11px] font-label-bold text-[#404753] mb-1 uppercase tracking-wider">
                  CONTRATO #SS-2023-15
                </p>
                <p className="text-body-md font-bold text-[#191c1e] mb-2">Teto de Faturamento</p>
                <div className="w-full bg-[#c0c7d6] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#f59e0b] h-full w-[95%]" />
                </div>
                <p className="text-[10px] text-[#f59e0b] font-bold mt-2">95% Utilizado</p>
              </div>
            </div>

            {/* Projected Margin Visual Column */}
            <div className="md:col-span-2 flex items-center justify-center relative min-h-[180px] bg-slate-50/80 rounded-md border border-dashed border-[#c0c7d6]">
              <div className="text-center p-6">
                <p className="text-metric-mono font-headline-lg text-[#f59e0b] leading-tight">
                  12.4%
                </p>
                <p className="font-label-bold text-[#404753] mt-1">Margem Média Projetada</p>
                <p className="text-[11px] text-[#ef4444] mt-2 flex items-center justify-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">trending_down</span>
                  -2.1% em relação ao mês anterior
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Processamento de Notas (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#c0c7d6] rounded-md shadow-2xs p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="p-2 bg-[#4f46e5] rounded-md text-white shadow-2xs">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
              <span className="text-[11px] font-label-bold font-metric-mono text-[#4f46e5] bg-[#eef2ff] px-2.5 py-1 rounded">
                EM PROCESSAMENTO
              </span>
            </div>

            <h3 className="font-headline-sm text-headline-sm text-[#191c1e] mb-1.5">
              Processamento de Notas
            </h3>
            <p className="text-body-md text-[#404753] mb-5">
              Faturas enviadas nos últimos 7 dias para validação técnica.
            </p>

            <div className="space-y-3">
              {invoices.slice(0, 2).map((inv) => (
                <div
                  key={inv.id}
                  onClick={onOpenNFDrawer}
                  className="flex items-center justify-between p-3 bg-[#eef2ff] rounded-md hover:bg-[#e0e7ff] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#4f46e5] text-[20px]">
                      hourglass_empty
                    </span>
                    <span className="text-body-sm font-bold text-[#191c1e]">
                      {inv.code} - {inv.type.substring(0, 4)}.
                    </span>
                  </div>
                  <span className="text-metric-mono text-body-sm text-[#191c1e]">
                    R$ {inv.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenNFDrawer}
            className="mt-6 w-full border border-[#4f46e5] text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white transition-all py-2.5 rounded-md font-label-bold text-label-bold cursor-pointer"
          >
            Ver Fluxo Completo
          </button>
        </div>
      </div>

      {/* Recentes & Contratos Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contracts Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-[#c0c7d6] rounded-md shadow-2xs flex flex-col">
          <div className="p-5 md:p-6 border-b border-[#c0c7d6] flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-[#191c1e]">
              Contratos Recentes
            </h3>
            <button
              onClick={() => onNavigateTab('contratos')}
              className="text-[#005daa] font-label-bold text-label-bold hover:underline"
            >
              Ver Todos
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f2f4f6] border-b border-[#e2e8f0]">
                  <th className="p-4 text-[11px] font-label-bold text-[#404753] uppercase tracking-wider">
                    Identificador
                  </th>
                  <th className="p-4 text-[11px] font-label-bold text-[#404753] uppercase tracking-wider">
                    Objeto do Contrato
                  </th>
                  <th className="p-4 text-[11px] font-label-bold text-[#404753] uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="p-4 text-[11px] font-label-bold text-[#404753] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 text-[11px] font-label-bold text-[#404753] uppercase tracking-wider text-right">
                    Valor Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {filteredContracts.slice(0, 4).map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => onNavigateTab('contratos')}
                  >
                    <td className="p-4 font-metric-mono text-[#191c1e] text-body-sm whitespace-nowrap">
                      {contract.code}
                    </td>
                    <td className="p-4 font-bold text-body-md text-[#191c1e]">
                      {contract.object}
                    </td>
                    <td className="p-4 text-[#404753] text-body-sm whitespace-nowrap">
                      {contract.expirationDate}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {contract.status === 'ATIVO' ? (
                        <span className="px-2.5 py-1 bg-[#ecfdf5] text-[#10b981] text-[10px] font-bold rounded uppercase border border-[#10b981]/20">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-[#fffbeb] text-[#f59e0b] text-[10px] font-bold rounded uppercase border border-[#f59e0b]/20">
                          Renovação
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right font-metric-mono text-body-sm text-[#191c1e] whitespace-nowrap">
                      R$ {contract.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Support & Activity Right Column */}
        <div className="space-y-6">
          {/* Recent Activity Feed */}
          <div className="bg-white border border-[#c0c7d6] rounded-md shadow-2xs p-5 md:p-6">
            <h4 className="font-label-bold text-label-bold text-[#404753] uppercase tracking-wider mb-4">
              Atividades Recentes
            </h4>
            <div className="space-y-5">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-3.5 items-start">
                  <div
                    className={`w-2.5 h-2.5 mt-1.5 rounded-full flex-shrink-0 ${
                      act.color === 'primary'
                        ? 'bg-[#005daa]'
                        : act.color === 'warning'
                        ? 'bg-[#f59e0b]'
                        : 'bg-[#10b981]'
                    }`}
                  />
                  <div>
                    <p className="text-body-sm font-bold text-[#191c1e]">{act.title}</p>
                    <p className="text-[10px] text-[#404753] mt-0.5">{act.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Support Promo Card */}
          <div className="relative rounded-md overflow-hidden bg-[#005daa] p-6 text-white shadow-2xs">
            <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
              <span className="material-symbols-outlined text-[90px]">rocket_launch</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm mb-2">Suporte Prioritário</h4>
            <p className="text-body-sm opacity-90 mb-5 leading-relaxed">
              Precisa de ajuda com a integração de faturas ou renovação de contratos?
            </p>
            <button
              onClick={onOpenNovoChamado}
              className="bg-white text-[#005daa] px-4 py-2.5 rounded-md font-label-bold text-label-bold hover:bg-[#d4e3ff] transition-colors shadow-sm cursor-pointer"
            >
              Falar com Gerente de Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
