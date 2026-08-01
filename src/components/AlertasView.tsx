import React, { useState } from 'react';
import { SystemAlert } from '../types';

interface AlertasViewProps {
  alerts: SystemAlert[];
  onOpenNovoChamado: () => void;
  onOpenNFDrawer: () => void;
}

export const AlertasView: React.FC<AlertasViewProps> = ({
  alerts,
  onOpenNovoChamado,
  onOpenNFDrawer
}) => {
  const [activeAlerts, setActiveAlerts] = useState<SystemAlert[]>(alerts);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  const handleResolveAlert = (id: string, actionText: string) => {
    if (actionText.includes('NF') || actionText.includes('Validar')) {
      onOpenNFDrawer();
    } else {
      onOpenNovoChamado();
    }
    setResolvedIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-[#191c1e]">
            Central de Alertas e Notificações
          </h2>
          <p className="text-[#404753] font-body-md mt-0.5">
            Monitoramento em tempo real de margens curtas, vencimentos de aditivos e pendências fiscais.
          </p>
        </div>

        <div className="bg-[#fffbeb] border border-[#f59e0b]/40 p-2.5 px-4 rounded-md flex items-center gap-2 text-[#f59e0b] font-bold text-body-sm self-start sm:self-auto">
          <span className="material-symbols-outlined text-[20px]">warning</span>
          <span>{activeAlerts.length - resolvedIds.length} Alertas Ativos</span>
        </div>
      </div>

      {/* Alert List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeAlerts.map((alert) => {
          const isResolved = resolvedIds.includes(alert.id);

          return (
            <div
              key={alert.id}
              className={`p-6 bg-white border rounded-lg shadow-2xs transition-all ${
                isResolved
                  ? 'border-[#10b981]/30 opacity-60 bg-[#ecfdf5]/20'
                  : alert.severity === 'Crítico'
                  ? 'border-l-4 border-l-[#f59e0b] border-[#c0c7d6]'
                  : 'border-[#c0c7d6]'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="font-metric-mono text-[11px] font-bold text-[#005daa] bg-[#eff6ff] px-2.5 py-1 rounded">
                  {alert.contractCode}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${
                    isResolved
                      ? 'bg-[#ecfdf5] text-[#10b981]'
                      : 'bg-[#fffbeb] text-[#f59e0b] border border-[#f59e0b]/20'
                  }`}
                >
                  {isResolved ? 'Resolvido' : alert.severity}
                </span>
              </div>

              <h4 className="font-headline-sm text-[18px] text-[#191c1e] mb-1.5">
                {alert.title}
              </h4>
              <p className="text-body-sm text-[#404753] leading-relaxed mb-4">
                {alert.description}
              </p>

              {alert.daysRemaining !== undefined && !isResolved && (
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] font-label-bold text-[#f59e0b] mb-1">
                    <span>Prazo de Renovação</span>
                    <span>{alert.daysRemaining} dias restantes</span>
                  </div>
                  <div className="w-full bg-[#eceef0] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#f59e0b] h-full w-[20%]" />
                  </div>
                </div>
              )}

              {alert.usagePercent !== undefined && !isResolved && (
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] font-label-bold text-[#f59e0b] mb-1">
                    <span>Teto de Faturamento</span>
                    <span>{alert.usagePercent}% Consumido</span>
                  </div>
                  <div className="w-full bg-[#eceef0] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#f59e0b] h-full w-[95%]" />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#e2e8f0] flex justify-end gap-2">
                {isResolved ? (
                  <span className="text-[12px] font-bold text-[#10b981] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Ação Solicitada
                  </span>
                ) : (
                  <button
                    onClick={() => handleResolveAlert(alert.id, alert.actionText)}
                    className="px-4 py-2 bg-[#005daa] text-white rounded-md font-label-bold text-label-bold hover:bg-[#0075d5] transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{alert.actionText}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
