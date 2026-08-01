import React, { useState } from 'react';

interface CronogramaItem {
  id: string;
  fornecedorId: string;
  fornecedorNome: string;
  semana: 'W1' | 'W2' | 'W3' | 'W4';
  descricao: string;
  valor: number;
  status: 'COBRANCA' | 'ANALISE' | 'PAGAMENTO_CONCLUIDO';
  contratoId: string;
}

export const CronogramaFluxoTimeline: React.FC = () => {
  const [items, setItems] = useState<CronogramaItem[]>([
    {
      id: 'CRN-101',
      fornecedorId: 'SUP-9823-STORAGE',
      fornecedorNome: 'Storage & Infraestrutura Ltda',
      semana: 'W1',
      descricao: 'Armazenamento Lote 04',
      valor: 45000.0,
      status: 'PAGAMENTO_CONCLUIDO',
      contratoId: 'CTR-2026-SYS'
    },
    {
      id: 'CRN-102',
      fornecedorId: 'SUP-9823-STORAGE',
      fornecedorNome: 'Storage & Infraestrutura Ltda',
      semana: 'W3',
      descricao: 'Manutenção Racks',
      valor: 12500.0,
      status: 'ANALISE',
      contratoId: 'CTR-2026-SYS'
    },
    {
      id: 'CRN-201',
      fornecedorId: 'SUP-4012-LOGISTICA',
      fornecedorNome: 'Transportes & Logística SP-RJ',
      semana: 'W2',
      descricao: 'Frete Hub SP-RJ',
      valor: 89000.0,
      status: 'ANALISE',
      contratoId: 'CTR-2026-SYS'
    },
    {
      id: 'CRN-202',
      fornecedorId: 'SUP-4012-LOGISTICA',
      fornecedorNome: 'Transportes & Logística SP-RJ',
      semana: 'W4',
      descricao: 'Frete Expresso Emergencial',
      valor: 24500.0,
      status: 'COBRANCA',
      contratoId: 'CTR-2026-SYS'
    },
    {
      id: 'CRN-301',
      fornecedorId: 'SUP-1102-AUDITORIA',
      fornecedorNome: 'Auditoria & Compliance Fiscal',
      semana: 'W2',
      descricao: 'Auditoria Tributária Q2',
      valor: 45000.0,
      status: 'COBRANCA',
      contratoId: 'CTR-2026-SYS'
    },
    {
      id: 'CRN-302',
      fornecedorId: 'SUP-1102-AUDITORIA',
      fornecedorNome: 'Auditoria & Compliance Fiscal',
      semana: 'W4',
      descricao: 'Certificação SOC2',
      valor: 32000.0,
      status: 'PAGAMENTO_CONCLUIDO',
      contratoId: 'CTR-2026-SYS'
    },
    {
      id: 'CRN-401',
      fornecedorId: 'SUP-8890-CLOUD',
      fornecedorNome: 'Segurança Cloud & Shield Ltda',
      semana: 'W1',
      descricao: 'Licenciamento WAF',
      valor: 28000.0,
      status: 'PAGAMENTO_CONCLUIDO',
      contratoId: 'CTR-2026-SYS'
    },
    {
      id: 'CRN-402',
      fornecedorId: 'SUP-8890-CLOUD',
      fornecedorNome: 'Segurança Cloud & Shield Ltda',
      semana: 'W3',
      descricao: 'Inspecao de Penetration Test',
      valor: 19500.0,
      status: 'COBRANCA',
      contratoId: 'CTR-2026-SYS'
    }
  ]);

  const fornecedoresUnicos: { id: string; nome: string }[] = Array.from(
    new Set<string>(items.map((i) => JSON.stringify({ id: i.fornecedorId, nome: i.fornecedorNome })))
  ).map((str: string) => JSON.parse(str));

  const semanas = [
    { key: 'W1', label: 'Semana 1', datas: '01/Jun a 07/Jun' },
    { key: 'W2', label: 'Semana 2', datas: '08/Jun a 14/Jun' },
    { key: 'W3', label: 'Semana 3', datas: '15/Jun a 21/Jun' },
    { key: 'W4', label: 'Semana 4', datas: '22/Jun a 30/Jun' }
  ] as const;

  const cycleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatusMap: Record<string, 'COBRANCA' | 'ANALISE' | 'PAGAMENTO_CONCLUIDO'> = {
            COBRANCA: 'ANALISE',
            ANALISE: 'PAGAMENTO_CONCLUIDO',
            PAGAMENTO_CONCLUIDO: 'COBRANCA'
          };
          return { ...item, status: nextStatusMap[item.status] };
        }
        return item;
      })
    );
  };

  const getStatusStyle = (status: 'COBRANCA' | 'ANALISE' | 'PAGAMENTO_CONCLUIDO') => {
    switch (status) {
      case 'COBRANCA':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-300',
          text: 'text-amber-700',
          badge: 'bg-amber-500 text-white',
          label: '1. Cobrança'
        };
      case 'ANALISE':
        return {
          bg: 'bg-indigo-50',
          border: 'border-indigo-300',
          text: 'text-indigo-700',
          badge: 'bg-indigo-600 text-white',
          label: '2. Análise'
        };
      case 'PAGAMENTO_CONCLUIDO':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-300',
          text: 'text-emerald-700',
          badge: 'bg-emerald-500 text-white',
          label: '3. Pago'
        };
    }
  };

  return (
    <div className="bg-white p-6 rounded-md border border-slate-200 shadow-2xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-md border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1890ff] text-xl">view_timeline</span>
            <h3 className="font-bold text-slate-800 text-base">
              Cronograma de Fluxo de Despesas (Timeline Mensal)
            </h3>
            <span className="bg-[#1890ff]/10 text-[#1890ff] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#1890ff]/30">
              Matriz Fornecedores x Semanas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhamento das fases de Cobrança, Análise e Pagamento por fornecedor. Clique nos cards para avançar o fluxo.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Cobrança (Amber)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-md text-indigo-700">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>Análise (Indigo)</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Pago (Emerald)</span>
          </div>
        </div>
      </div>

      {/* Timeline Matrix */}
      <div className="overflow-x-auto border border-slate-200 rounded-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-xs font-bold border-b border-slate-200">
              <th className="p-3 w-64 border-r border-slate-200">Fornecedor / Empresa</th>
              {semanas.map((s) => (
                <th key={s.key} className="p-3 text-center border-r border-slate-200 min-w-[200px]">
                  <div>{s.label}</div>
                  <span className="text-[10px] text-slate-400 font-normal">{s.datas}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {fornecedoresUnicos.map((forn: any) => (
              <tr key={forn.id} className="hover:bg-slate-50/50 transition-colors">
                {/* Fornecedor Cell */}
                <td className="p-3 border-r border-slate-200 bg-slate-50/80">
                  <span className="font-bold text-slate-800 block text-xs">{forn.nome}</span>
                  <span className="font-mono text-[10px] text-[#1890ff] font-bold block mt-0.5">{forn.id}</span>
                </td>

                {/* Week Cells */}
                {semanas.map((s) => {
                  const cellItems = items.filter(
                    (i) => i.fornecedorId === forn.id && i.semana === s.key
                  );

                  return (
                    <td key={s.key} className="p-2 border-r border-slate-200 align-top">
                      {cellItems.length === 0 ? (
                        <div className="h-full min-h-[60px] flex items-center justify-center text-slate-300 text-[11px] italic">
                          Sem agendamento
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {cellItems.map((item) => {
                            const style = getStatusStyle(item.status);

                            return (
                              <div
                                key={item.id}
                                onClick={() => cycleStatus(item.id)}
                                title="Clique para avançar status do fluxo"
                                className={`p-2.5 ${style.bg} border ${style.border} rounded-md shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-1`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${style.badge}`}>
                                    {style.label}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400 font-bold">
                                    {item.id}
                                  </span>
                                </div>

                                <p className="font-semibold text-slate-800 text-[11px] line-clamp-1">
                                  {item.descricao}
                                </p>

                                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                                  <span className="font-mono font-bold text-[#1890ff] text-xs">
                                    R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                  <span className="material-symbols-outlined text-slate-400 text-sm">
                                    touch_app
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-md flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-amber-800 block">Total em Cobrança</span>
            <span className="text-amber-600 text-[10px]">Fase inicial do cronograma</span>
          </div>
          <span className="font-mono font-bold text-amber-900 text-sm">
            R${' '}
            {items
              .filter((i) => i.status === 'COBRANCA')
              .reduce((a, b) => a + b.valor, 0)
              .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-md flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-indigo-800 block">Total em Análise</span>
            <span className="text-indigo-600 text-[10px]">Validação fiscal / medições</span>
          </div>
          <span className="font-mono font-bold text-indigo-900 text-sm">
            R${' '}
            {items
              .filter((i) => i.status === 'ANALISE')
              .reduce((a, b) => a + b.valor, 0)
              .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-md flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-emerald-800 block">Total Concluído (Pago)</span>
            <span className="text-emerald-600 text-[10px]">Liquidação financeira</span>
          </div>
          <span className="font-mono font-bold text-emerald-900 text-sm">
            R${' '}
            {items
              .filter((i) => i.status === 'PAGAMENTO_CONCLUIDO')
              .reduce((a, b) => a + b.valor, 0)
              .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};
