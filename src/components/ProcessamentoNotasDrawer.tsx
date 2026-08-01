import React, { useState } from 'react';
import { InvoiceItem } from '../types';

interface ProcessamentoNotasDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: InvoiceItem[];
  onUploadInvoice: (invoice: InvoiceItem) => void;
}

export const ProcessamentoNotasDrawer: React.FC<ProcessamentoNotasDrawerProps> = ({
  isOpen,
  onClose,
  invoices,
  onUploadInvoice
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem>(invoices[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsUploading(true);
    setTimeout(() => {
      const newInv: InvoiceItem = {
        id: Date.now().toString(),
        code: `NF #${Math.floor(9850 + Math.random() * 50)}`,
        description: `Serviços de Logística e Frete - ${file.name}`,
        type: 'Serviços',
        value: 15800.00,
        date: new Date().toLocaleDateString('pt-BR'),
        status: 'EM_PROCESSAMENTO'
      };

      onUploadInvoice(newInv);
      setSelectedInvoice(newInv);
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Drawer Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#c0c7d6]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#4f46e5] text-white rounded-md shadow-2xs">
                <span className="material-symbols-outlined text-[22px]">receipt_long</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-[#191c1e]">
                  Fluxo de Processamento de Notas
                </h3>
                <p className="text-[11px] text-[#707785]">
                  Validação fiscal e técnica automatizada
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#707785] hover:text-[#191c1e] p-1.5 rounded-lg hover:bg-[#eceef0]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Upload New Invoice CTA */}
          <div className="mb-6 p-4 bg-[#eef2ff] border border-[#4f46e5]/30 rounded-lg flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-[#4f46e5] text-body-md">Enviar Nova Nota Fiscal (NF-e)</p>
              <p className="text-[11px] text-[#404753]">Formatos aceitos: XML ou PDF assinado digitalmente.</p>
            </div>
            <label className="px-3.5 py-2 bg-[#4f46e5] text-white rounded-md font-label-bold text-[12px] hover:bg-[#4338ca] transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0">
              {isUploading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Upload NF-e</span>
                </>
              )}
              <input
                type="file"
                accept=".xml,.pdf"
                onChange={handleSimulateUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {uploadSuccess && (
            <div className="mb-6 p-3 bg-[#ecfdf5] border border-[#10b981]/30 rounded-md text-[#10b981] text-body-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Nota Fiscal carregada e enviada para a esteira de validação!</span>
            </div>
          )}

          {/* Invoice Selection Selector */}
          <div className="mb-6">
            <label className="font-label-bold text-[#404753] uppercase text-[11px] block mb-2">
              Selecione a NF para ver a esteira
            </label>
            <div className="grid grid-cols-2 gap-2">
              {invoices.map((inv) => {
                const isSelected = selectedInvoice?.id === inv.id;
                return (
                  <button
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`p-3 rounded-lg text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#4f46e5] bg-[#eef2ff] ring-1 ring-[#4f46e5]'
                        : 'border-[#c0c7d6] bg-white hover:bg-[#f2f4f6]'
                    }`}
                  >
                    <p className="font-bold text-[#191c1e] text-body-sm">{inv.code}</p>
                    <p className="font-metric-mono text-[12px] text-[#4f46e5]">
                      R$ {inv.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workflow Steps Tracker */}
          {selectedInvoice && (
            <div className="p-5 bg-white border border-[#c0c7d6] rounded-xl shadow-2xs space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-[#e2e8f0]">
                <div>
                  <span className="text-[10px] font-bold text-[#4f46e5] uppercase">
                    Status Atual
                  </span>
                  <h4 className="font-headline-sm text-[#191c1e]">{selectedInvoice.code}</h4>
                  <p className="text-body-sm text-[#404753]">{selectedInvoice.description}</p>
                </div>
                <span className="px-3 py-1 bg-[#eef2ff] text-[#4f46e5] font-metric-mono text-body-sm rounded-full font-bold">
                  {selectedInvoice.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-6 relative pl-6 border-l-2 border-[#c0c7d6]">
                {/* Step 1 */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center text-[12px]">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </span>
                  <p className="font-bold text-body-md text-[#191c1e]">
                    1. Recebimento do XML / PDF
                  </p>
                  <p className="text-body-sm text-[#707785]">Concluído em {selectedInvoice.date}</p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-[#10b981] text-white flex items-center justify-center text-[12px]">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </span>
                  <p className="font-bold text-body-md text-[#191c1e]">
                    2. Validação Sefaz & Autenticidade
                  </p>
                  <p className="text-body-sm text-[#707785]">Chave de acesso verificada com sucesso.</p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-[#4f46e5] text-white flex items-center justify-center text-[12px] animate-pulse">
                    <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                  </span>
                  <p className="font-bold text-body-md text-[#4f46e5]">
                    3. Compliance Técnico & Vínculo com Contrato
                  </p>
                  <p className="text-body-sm text-[#404753]">
                    Em análise pelo departamento financeiro da Systems Storage.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative opacity-50">
                  <span className="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-[#c0c7d6] text-white flex items-center justify-center text-[12px]">
                    4
                  </span>
                  <p className="font-bold text-body-md text-[#191c1e]">
                    4. Liberação para Programação de Pagamento
                  </p>
                  <p className="text-body-sm text-[#707785]">Pendente aprovação da etapa 3.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="pt-4 border-t border-[#c0c7d6] mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#f2f4f6] text-[#191c1e] rounded-md font-label-bold hover:bg-[#eceef0] transition-colors"
          >
            Fechar Esteira
          </button>
        </div>
      </div>
    </div>
  );
};
