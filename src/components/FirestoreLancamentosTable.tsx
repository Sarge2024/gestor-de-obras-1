import React, { useState, useEffect } from 'react';
import { AuthSession } from '../types';

interface FirestoreLancamentosTableProps {
  currentSession: AuthSession | null;
}

interface LancamentoItem {
  id: string;
  contrato_id: string;
  fornecedor_id: string;
  descricao: string;
  valor: number;
  tipo: string;
  status: string;
  data_vencimento: string;
  criado_por: string;
  createdAt: string;
}

export const FirestoreLancamentosTable: React.FC<FirestoreLancamentosTableProps> = ({
  currentSession
}) => {
  const [lancamentos, setLancamentos] = useState<LancamentoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  // New Record Form State
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [fornecedorId, setFornecedorId] = useState('SUP-9823-STORAGE');
  const [saving, setSaving] = useState(false);

  const perfil = currentSession?.customClaims?.perfil || 'FINANCEIRO';
  const contratoId = currentSession?.customClaims?.contrato_id || 'CTR-2026-SYS';
  const entidadeId = currentSession?.customClaims?.entidade_id || 'SUP-9823-STORAGE';

  const fetchLancamentos = async () => {
    setLoading(true);
    try {
      const url = `/api/firestore/lancamentos?contrato_id=${contratoId}&fornecedor_id=${entidadeId}&perfil=${perfil}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLancamentos(data.lancamentos || []);
      }
    } catch (err) {
      console.error('Error fetching Firestore lancamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLancamentos();
  }, [perfil, contratoId, entidadeId]);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch('/api/firestore/seed-demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSeedMessage(data.message || 'Banco Firestore populado com sucesso!');
        await fetchLancamentos();
      }
    } catch (err) {
      setSeedMessage('Falha ao popular o Firestore.');
    } finally {
      setSeeding(false);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor) return;

    setSaving(true);
    try {
      const targetFornecedor = perfil === 'FORNECEDOR' ? entidadeId : fornecedorId;

      const res = await fetch('/api/firestore/lancamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contrato_id: contratoId,
          fornecedor_id: targetFornecedor,
          descricao,
          valor: parseFloat(valor),
          tipo: 'DESPESA',
          status: 'PENDENTE',
          criado_por: currentSession?.email || 'financeiro@logisticsglobal.com.br',
          perfil
        })
      });

      if (res.ok) {
        setDescricao('');
        setValor('');
        setIsNewRecordOpen(false);
        await fetchLancamentos();
      }
    } catch (err) {
      console.error('Error saving record:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-[#005daa]/20 rounded-lg shadow-sm p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#f8fafc] p-4 rounded-lg border border-[#e2e8f0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005daa]">database</span>
            <h3 className="font-bold text-[#005daa] text-lg">
              Firestore NoSQL: Coleção de Negócio (lancamentos_financeiros)
            </h3>
            <span className="bg-[#10b981]/10 text-[#059669] text-[11px] font-bold px-2 py-0.5 rounded border border-[#10b981]/30">
              firestore.rules Ativas
            </span>
          </div>
          <p className="text-xs text-[#64748b] mt-1">
            Isolamento Intra-Contrato: <strong className="text-[#0f172a]">{contratoId}</strong> | Perfil Atual:{' '}
            <strong className="text-[#005daa]">{perfil}</strong>
            {perfil === 'FORNECEDOR' && (
              <span>
                {' '}
                | Entidade Bloqueada: <strong className="text-[#d97706]">{entidadeId}</strong>
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="px-3 py-1.5 bg-[#005daa] text-white text-xs font-bold rounded hover:bg-[#004882] transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${seeding ? 'animate-spin' : ''}`}>
              published_with_changes
            </span>
            <span>{seeding ? 'Populando...' : 'Seed Coleções NoSQL'}</span>
          </button>

          <button
            onClick={() => setIsNewRecordOpen(true)}
            className="px-3 py-1.5 bg-[#10b981] text-white text-xs font-bold rounded hover:bg-[#059669] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {seedMessage && (
        <div className="p-3 bg-[#ecfdf5] border border-[#10b981]/40 rounded text-xs text-[#065f46] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{seedMessage}</span>
        </div>
      )}

      {/* Security Rule Shield Notice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-[#eff6ff] rounded border border-[#bfdbfe]">
          <span className="font-bold text-[#1d4ed8] block mb-1">🏢 Coleção 'contratos' & 'entidades'</span>
          <span className="text-[#3b82f6]">
            Estruturas de infraestrutura isoladas. Escrita restrita ao Admin e leitura protegida por token JWT claims.
          </span>
        </div>
        <div className="p-3 bg-[#fef3c7] rounded border border-[#fde68a]">
          <span className="font-bold text-[#b45309] block mb-1">🔒 Regra de Segurança {perfil}</span>
          <span className="text-[#d97706]">
            {perfil === 'FORNECEDOR'
              ? `Apenas acessa documentos com contrato_id == "${contratoId}" AND fornecedor_id == "${entidadeId}".`
              : `Acessa todos os lançamentos vinculados ao contrato_id == "${contratoId}".`}
          </span>
        </div>
        <div className="p-3 bg-[#f3e8ff] rounded border border-[#e9d5ff]">
          <span className="font-bold text-[#6b21a8] block mb-1">🛡️ Anti-Elevations Shield</span>
          <span className="text-[#7e22ce]">
            Tentativas de alteração de claims (perfil, contrato_id) pelo cliente são rejeitadas pelo Firestore Rules.
          </span>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-x-auto border border-[#e2e8f0] rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f1f5f9] text-[#475569] font-bold border-b border-[#e2e8f0]">
            <tr>
              <th className="p-3">ID Documento</th>
              <th className="p-3">Descrição / Lançamento</th>
              <th className="p-3">Contrato ID</th>
              <th className="p-3">Fornecedor ID</th>
              <th className="p-3">Vencimento</th>
              <th className="p-3 text-right">Valor (R$)</th>
              <th className="p-3 text-center">Status Firestore</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-[#94a3b8]">
                  <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                  <p className="mt-1">Consultando coleções Firestore...</p>
                </td>
              </tr>
            ) : lancamentos.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-[#94a3b8]">
                  Nenhum lançamento encontrado para o escopo de contrato / fornecedor atual.
                </td>
              </tr>
            ) : (
              lancamentos.map((item) => (
                <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="p-3 font-mono font-bold text-[#005daa]">{item.id}</td>
                  <td className="p-3 font-medium text-[#1e293b]">{item.descricao}</td>
                  <td className="p-3">
                    <span className="bg-[#e0f2fe] text-[#0369a1] font-mono text-[10px] px-2 py-0.5 rounded">
                      {item.contrato_id}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                        item.fornecedor_id === entidadeId
                          ? 'bg-[#fef3c7] text-[#b45309] font-bold'
                          : 'bg-[#f1f5f9] text-[#475569]'
                      }`}
                    >
                      {item.fornecedor_id}
                    </span>
                  </td>
                  <td className="p-3 text-[#64748b]">{item.data_vencimento}</td>
                  <td className="p-3 text-right font-mono font-bold text-[#0f172a]">
                    R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center">
                    <span className="bg-[#ecfdf5] text-[#047857] text-[10px] font-bold px-2 py-0.5 rounded border border-[#a7f3d0]">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Novo Lançamento */}
      {isNewRecordOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4 border border-[#e2e8f0]">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="font-bold text-[#005daa] text-base flex items-center gap-2">
                <span className="material-symbols-outlined">post_add</span>
                Novo Lançamento Financeiro NoSQL
              </h4>
              <button
                onClick={() => setIsNewRecordOpen(false)}
                className="text-[#64748b] hover:text-[#0f172a] cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#334155] mb-1">Contrato (Lock automático)</label>
                <input
                  type="text"
                  disabled
                  value={contratoId}
                  className="w-full bg-[#f1f5f9] p-2 rounded border border-[#cbd5e1] font-mono text-[#64748b]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#334155] mb-1">Fornecedor ID</label>
                {perfil === 'FORNECEDOR' ? (
                  <input
                    type="text"
                    disabled
                    value={entidadeId}
                    className="w-full bg-[#fef3c7] p-2 rounded border border-[#fde68a] font-mono text-[#b45309] font-bold"
                  />
                ) : (
                  <select
                    value={fornecedorId}
                    onChange={(e) => setFornecedorId(e.target.value)}
                    className="w-full p-2 rounded border border-[#cbd5e1] bg-white font-mono"
                  >
                    <option value="SUP-9823-STORAGE">SUP-9823-STORAGE (Storage & Infraestrutura)</option>
                    <option value="SUP-4012-LOGISTICA">SUP-4012-LOGISTICA (Transportes & Logística)</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#334155] mb-1">Descrição do Serviço / Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Serviço de Auditoria de TI"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full p-2 rounded border border-[#cbd5e1]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#334155] mb-1">Valor (R$)</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full p-2 rounded border border-[#cbd5e1] font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewRecordOpen(false)}
                  className="px-3 py-2 bg-[#f1f5f9] text-[#475569] font-bold rounded hover:bg-[#e2e8f0] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#005daa] text-white font-bold rounded hover:bg-[#004882] cursor-pointer flex items-center gap-1"
                >
                  {saving ? 'Gravando...' : 'Gravar no Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
