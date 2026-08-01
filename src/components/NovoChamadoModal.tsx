import React, { useState } from 'react';
import { ChamadoTicket } from '../types';

interface NovoChamadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitChamado: (ticket: ChamadoTicket) => void;
}

export const NovoChamadoModal: React.FC<NovoChamadoModalProps> = ({
  isOpen,
  onClose,
  onSubmitChamado
}) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<'Faturamento' | 'Contratos' | 'Acesso/TI' | 'Geral'>(
    'Faturamento'
  );
  const [priority, setPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Média');
  const [description, setDescription] = useState('');
  const [fileAttached, setFileAttached] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const ticketNum = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTicket: ChamadoTicket = {
        id: Date.now().toString(),
        ticketNumber: ticketNum,
        subject,
        category,
        priority,
        description,
        createdAt: new Date().toLocaleString('pt-BR'),
        status: 'Aberto'
      };

      onSubmitChamado(newTicket);
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setSubject('');
        setDescription('');
        setFileAttached(null);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-[#c0c7d6] shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#eff6ff] rounded-md text-[#005daa]">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[#005daa]">Abrir Novo Chamado</h3>
              <p className="text-[11px] text-[#707785]">Suporte ao Fornecedor - Works Manager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#707785] hover:text-[#191c1e] p-1 rounded-md"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 bg-[#ecfdf5] border border-[#10b981]/30 rounded-lg text-center space-y-3">
            <span className="material-symbols-outlined text-[#10b981] text-4xl animate-bounce">
              check_circle
            </span>
            <h4 className="font-bold text-[#10b981] text-headline-sm">
              Chamado Aberto com Sucesso!
            </h4>
            <p className="text-body-sm text-[#404753]">
              Sua solicitação foi registrada e enviada para a equipe de atendimento do portal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-label-bold text-[#191c1e] block mb-1">Assunto / Título</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Dúvida referente retenção de impostos NF #9822"
                className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md text-[#191c1e] outline-none focus:border-[#005daa]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label-bold text-[#191c1e] block mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#c0c7d6] rounded-md font-body-md text-[#191c1e] outline-none focus:border-[#005daa]"
                >
                  <option value="Faturamento">Faturamento</option>
                  <option value="Contratos">Contratos</option>
                  <option value="Acesso/TI">Acesso/TI</option>
                  <option value="Geral">Geral</option>
                </select>
              </div>

              <div>
                <label className="font-label-bold text-[#191c1e] block mb-1">Prioridade</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#c0c7d6] rounded-md font-body-md text-[#191c1e] outline-none focus:border-[#005daa]"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-label-bold text-[#191c1e] block mb-1">Descrição detalhada</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva detalhadamente o problema ou solicitação..."
                className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md text-[#191c1e] outline-none focus:border-[#005daa]"
              />
            </div>

            {/* File Attachment Upload */}
            <div>
              <label className="font-label-bold text-[#191c1e] block mb-1">
                Anexar documento ou comprovante
              </label>
              <div className="border border-dashed border-[#c0c7d6] rounded-md p-3 text-center bg-[#f2f4f6] hover:bg-[#eceef0] transition-colors cursor-pointer relative">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileAttached(e.target.files[0].name);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="material-symbols-outlined text-[#707785] text-2xl">attach_file</span>
                <p className="text-body-sm text-[#404753] font-medium mt-1">
                  {fileAttached ? `Anexado: ${fileAttached}` : 'Clique para selecionar um arquivo PDF ou Imagem'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#c0c7d6] rounded-md font-label-bold text-[#404753] hover:bg-[#f2f4f6]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#005daa] text-white rounded-md font-label-bold hover:bg-[#0075d5] flex items-center gap-2 cursor-pointer disabled:opacity-80"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Chamado</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
