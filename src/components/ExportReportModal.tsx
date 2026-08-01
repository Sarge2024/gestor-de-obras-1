import React from 'react';
import { DRELine, UserProfile } from '../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dreData: DRELine[];
  user: UserProfile;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  dreData,
  user
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 md:p-8 border border-[#c0c7d6] shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Printable Section */}
        <div id="printable-report" className="space-y-6">
          <div className="flex justify-between items-start pb-4 border-b-2 border-[#005daa]">
            <div>
              <h1 className="font-headline-md text-[#005daa] font-extrabold">Systems Storage</h1>
              <p className="text-[10px] font-bold text-[#707785] uppercase tracking-wider">
                Relatório Consolidado Financeiro (DRE)
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#191c1e] text-body-sm">{user.name}</p>
              <p className="text-[10px] text-[#707785]">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="p-4 bg-[#f2f4f6] rounded-md border border-[#c0c7d6] grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-[10px] font-bold text-[#707785] uppercase">Receita Bruta</p>
              <p className="font-metric-mono font-bold text-[#005daa]">R$ 1.240.500,00</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#707785] uppercase">Receita Líquida</p>
              <p className="font-metric-mono font-bold text-[#005daa]">R$ 1.054.425,00</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#707785] uppercase">Margem Contrib.</p>
              <p className="font-metric-mono font-bold text-[#10b981]">45.0%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#707785] uppercase">Lucro Líquido</p>
              <p className="font-metric-mono font-bold text-[#005daa]">R$ 312.440,12</p>
            </div>
          </div>

          <div className="border border-[#c0c7d6] rounded-lg overflow-hidden">
            <table className="w-full text-left text-body-sm">
              <thead>
                <tr className="bg-[#eceef0] font-label-bold text-[#404753] border-b border-[#c0c7d6]">
                  <th className="p-3">CONTA FINANCEIRA</th>
                  <th className="p-3 text-right">VALOR</th>
                  <th className="p-3 text-right">VARIAÇÃO %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {dreData.map((row) => (
                  <tr
                    key={row.id}
                    className={
                      row.isTotal
                        ? 'bg-[#005daa]/10 font-bold'
                        : row.isSubtotal
                        ? 'bg-[#f2f4f6] font-semibold'
                        : ''
                    }
                  >
                    <td className="p-3">{row.label}</td>
                    <td className="p-3 font-metric-mono text-right">{row.formattedValue}</td>
                    <td
                      className={`p-3 font-metric-mono text-right ${
                        row.isPositiveVariation ? 'text-[#10b981]' : 'text-[#ef4444]'
                      }`}
                    >
                      {row.variation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-[#707785] text-center pt-2 border-t border-[#e2e8f0]">
            Documento emitido eletronicamente via Systems Storage Supplier Management System. Válido para simples conferência.
          </p>
        </div>

        {/* Modal Buttons */}
        <div className="mt-6 pt-4 border-t border-[#c0c7d6] flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#c0c7d6] rounded-md font-label-bold text-[#404753] hover:bg-[#f2f4f6]"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#005daa] text-white rounded-md font-label-bold hover:bg-[#0075d5] flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
