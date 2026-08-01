import React, { useState } from 'react';
import { ContractItem, EmpresaItem } from '../types';

interface ContratosViewProps {
  contracts: ContractItem[];
  empresas: EmpresaItem[];
  searchQuery: string;
  onOpenNovoChamado: () => void;
  onAddContract: (newContract: ContractItem) => void;
  onUpdateContract: (updatedContract: ContractItem) => void;
  onDeleteContract: (contractId: string) => void;
}

export const ContratosView: React.FC<ContratosViewProps> = ({
  contracts,
  empresas,
  searchQuery,
  onOpenNovoChamado,
  onAddContract,
  onUpdateContract,
  onDeleteContract
}) => {
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'ATIVO' | 'RENOVAÇÃO' | 'ENCERRADO'>('TODOS');
  const [selectedContract, setSelectedContract] = useState<ContractItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New contract form state
  const [code, setCode] = useState('');
  const [object, setObject] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [category, setCategory] = useState('Armazenamento');
  const [addStatus, setAddStatus] = useState<'ATIVO' | 'RENOVAÇÃO' | 'ENCERRADO'>('ATIVO');
  const [addMarginAlert, setAddMarginAlert] = useState(false);
  const [fornecedorId, setFornecedorId] = useState('');

  // Edit contract form state
  const [editingContract, setEditingContract] = useState<ContractItem | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editObject, setEditObject] = useState('');
  const [editExpirationDate, setEditExpirationDate] = useState('');
  const [editCategory, setEditCategory] = useState('Armazenamento');
  const [editTotalValue, setEditTotalValue] = useState('');
  const [editStatus, setEditStatus] = useState<'ATIVO' | 'RENOVAÇÃO' | 'ENCERRADO'>('ATIVO');
  const [editMarginAlert, setEditMarginAlert] = useState(false);
  const [editFornecedorId, setEditFornecedorId] = useState('');

  // Delete confirmation state
  const [contractToDelete, setContractToDelete] = useState<ContractItem | null>(null);

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.object.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      filterStatus === 'TODOS' || c.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !object || !expirationDate || !totalValue) return;

    const val = parseFloat(totalValue.replace(/[^0-9,.]/g, '').replace(',', '.')) || 100000;

    const newContract: ContractItem = {
      id: Date.now().toString(),
      code,
      object,
      expirationDate,
      status: addStatus,
      totalValue: val,
      monthlyValue: val / 12,
      category,
      marginAlert: addMarginAlert,
      fornecedorId: fornecedorId || undefined,
      fornecedorNome: empresas.find(emp => emp.id === fornecedorId)?.nome
    };

    onAddContract(newContract);
    setIsAddModalOpen(false);
    setCode('');
    setObject('');
    setExpirationDate('');
    setTotalValue('');
    setAddStatus('ATIVO');
    setAddMarginAlert(false);
    setFornecedorId('');
  };

  const handleOpenEditModal = (contract: ContractItem) => {
    setEditingContract(contract);
    setEditCode(contract.code);
    setEditObject(contract.object);
    setEditExpirationDate(contract.expirationDate);
    setEditCategory(contract.category || 'Armazenamento');
    setEditTotalValue(contract.totalValue.toString());
    setEditStatus(contract.status);
    setEditMarginAlert(!!contract.marginAlert);
    setEditFornecedorId(contract.fornecedorId || '');
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract || !editCode || !editObject || !editExpirationDate || !editTotalValue) return;

    const val = parseFloat(editTotalValue.replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;

    const updatedContract: ContractItem = {
      ...editingContract,
      code: editCode,
      object: editObject,
      expirationDate: editExpirationDate,
      category: editCategory,
      totalValue: val,
      monthlyValue: val / 12,
      status: editStatus,
      marginAlert: editMarginAlert,
      fornecedorId: editFornecedorId || undefined,
      fornecedorNome: empresas.find(emp => emp.id === editFornecedorId)?.nome
    };

    onUpdateContract(updatedContract);
    setEditingContract(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-[#191c1e] font-bold">
            Gestão de Contratos
          </h2>
          <p className="text-[#404753] font-body-md mt-0.5">
            Acompanhe os contratos vigentes, prazos de renovação e limites de faturamento.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#005daa] text-white px-4 py-2.5 rounded-md font-label-bold flex items-center justify-center gap-2 hover:bg-[#0075d5] transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Cadastrar Contrato</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#c0c7d6] pb-3">
        {(['TODOS', 'ATIVO', 'RENOVAÇÃO', 'ENCERRADO'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-md font-label-bold text-label-bold transition-all cursor-pointer ${
              filterStatus === status
                ? 'bg-[#005daa] text-white shadow-2xs font-bold'
                : 'bg-white text-[#404753] border border-[#c0c7d6] hover:bg-[#f2f4f6]'
            }`}
          >
            {status === 'TODOS'
              ? 'Todos os Contratos'
              : status === 'ATIVO'
              ? 'Ativos'
              : status === 'RENOVAÇÃO'
              ? 'Em Renovação'
              : 'Encerrados'}
          </button>
        ))}
      </div>

      {/* Contracts Table */}
      <div className="bg-white border border-[#c0c7d6] rounded-md shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f4f6] border-b border-[#e2e8f0]">
                <th className="p-4 text-[11px] font-label-bold text-[#404753] uppercase tracking-wider">
                  Código
                </th>
                <th className="p-4 text-[11px] font-label-bold text-[#404753] uppercase tracking-wider">
                  Objeto do Contrato
                </th>
                <th className="p-4 text-[11px] font-label-bold text-[#404753] uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="p-4 text-[11px] font-label-bold text-[#404753] uppercase tracking-wider">
                  Categoria
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
                <th className="p-4 text-[11px] font-label-bold text-[#404753] uppercase tracking-wider text-center">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-body-md">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-[#707785]">
                    Nenhum contrato encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-metric-mono text-[#005daa] font-bold">
                      {contract.code}
                    </td>
                    <td className="p-4 font-semibold text-[#191c1e]">
                      {contract.object}
                    </td>
                    <td className="p-4 font-medium text-[#404753]">
                      {empresas.find((emp) => emp.id === contract.fornecedorId)?.nome || contract.fornecedorNome || (
                        <span className="text-[#8e9aa8] italic text-[11px]">Sem Vínculo</span>
                      )}
                    </td>
                    <td className="p-4 text-[#404753]">{contract.category || 'Geral'}</td>
                    <td className="p-4 text-[#404753] whitespace-nowrap">
                      {contract.expirationDate}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {contract.status === 'ATIVO' ? (
                        <span className="px-2.5 py-1 bg-[#ecfdf5] text-[#10b981] text-[10px] font-bold rounded uppercase border border-[#10b981]/20">
                          Ativo
                        </span>
                      ) : contract.status === 'RENOVAÇÃO' ? (
                        <span className="px-2.5 py-1 bg-[#fffbeb] text-[#f59e0b] text-[10px] font-bold rounded uppercase border border-[#f59e0b]/20">
                          Renovação
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase border border-red-200">
                          Encerrado
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right font-metric-mono text-[#191c1e] whitespace-nowrap">
                      R$ {contract.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedContract(contract)}
                          className="p-1.5 bg-[#eff6ff] text-[#005daa] rounded-md hover:bg-[#d4e3ff] transition-colors cursor-pointer flex items-center justify-center"
                          title="Detalhes"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(contract)}
                          className="p-1.5 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => setContractToDelete(contract)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors cursor-pointer flex items-center justify-center"
                          title="Excluir"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-[#c0c7d6] shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#e2e8f0]">
              <div>
                <span className="text-[10px] font-bold text-[#005daa] uppercase tracking-wider">
                  Ficha do Contrato
                </span>
                <h3 className="font-headline-sm text-[#191c1e] font-bold">{selectedContract.code}</h3>
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="text-[#707785] hover:text-[#191c1e] cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-label-bold text-[#707785] uppercase">
                  Objeto do Contrato
                </label>
                <p className="font-bold text-[#191c1e] text-body-lg">
                  {selectedContract.object}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-label-bold text-[#707785] uppercase">
                  Fornecedor / Empresa Vinculada
                </label>
                <p className="font-semibold text-[#005daa]">
                  {empresas.find((emp) => emp.id === selectedContract.fornecedorId)?.nome || selectedContract.fornecedorNome || (
                    <span className="text-[#8e9aa8] italic">Não vinculado</span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#f2f4f6] p-4 rounded-lg">
                <div>
                  <label className="text-[11px] font-label-bold text-[#707785] uppercase">
                    Status Atual
                  </label>
                  <p className="font-bold text-[#005daa]">{selectedContract.status}</p>
                </div>
                <div>
                  <label className="text-[11px] font-label-bold text-[#707785] uppercase">
                    Data de Vencimento
                  </label>
                  <p className="font-metric-mono text-[#191c1e]">
                    {selectedContract.expirationDate}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] font-label-bold text-[#707785] uppercase">
                    Valor Total
                  </label>
                  <p className="font-metric-mono text-[#005daa] font-bold">
                    R${' '}
                    {selectedContract.totalValue.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] font-label-bold text-[#707785] uppercase">
                    Estimativa Mensal
                  </label>
                  <p className="font-metric-mono text-[#191c1e] font-bold">
                    R${' '}
                    {((selectedContract.monthlyValue || (selectedContract.totalValue / 12))).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2
                    })}
                  </p>
                </div>
              </div>

              {selectedContract.marginAlert && (
                <div className="p-3 bg-[#fffbeb] border border-[#f59e0b]/30 rounded-md text-[#f59e0b] text-body-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                  <span>Este contrato possui um alerta de margem curta ou teto financeiro ativo.</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex justify-end gap-3">
              <button
                onClick={() => setSelectedContract(null)}
                className="px-4 py-2 border border-[#c0c7d6] rounded-md font-label-bold text-[#404753] hover:bg-[#f2f4f6] cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setSelectedContract(null);
                  onOpenNovoChamado();
                }}
                className="px-4 py-2 bg-[#005daa] text-white rounded-md font-label-bold hover:bg-[#0075d5] cursor-pointer"
              >
                Solicitar Aditivo / Suporte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contract Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c0c7d6] shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-[#005daa] font-bold">Cadastrar Novo Contrato</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#707785] hover:text-[#191c1e] cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-4">
              <div>
                <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                  Código do Contrato
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CTR-2026-099"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa]"
                />
              </div>

              <div>
                <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                  Objeto do Contrato
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Serviço de Gestão de Estoque"
                  value={object}
                  onChange={(e) => setObject(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa]"
                />
              </div>

              <div>
                <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                  Fornecedor / Empresa Vinculada
                </label>
                <select
                  value={fornecedorId}
                  onChange={(e) => setFornecedorId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa] bg-white"
                >
                  <option value="">-- Selecione uma Empresa / Fornecedor --</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nome} ({emp.tipo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                    Vencimento
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DD/MM/AAAA"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa]"
                  />
                </div>
                <div>
                  <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa] bg-white"
                  >
                    <option value="Armazenamento">Armazenamento</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Logística">Logística</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                    Valor Total (R$)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 250000.00"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa]"
                  />
                </div>
                <div>
                  <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                    Status Inicial
                  </label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa] bg-white"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="RENOVAÇÃO">Renovação</option>
                    <option value="ENCERRADO">Encerrado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="addMarginAlert"
                  checked={addMarginAlert}
                  onChange={(e) => setAddMarginAlert(e.target.checked)}
                  className="w-4 h-4 text-[#005daa] border-[#c0c7d6] rounded focus:ring-[#005daa]"
                />
                <label htmlFor="addMarginAlert" className="font-label-bold text-sm text-[#404753] select-none cursor-pointer">
                  Habilitar Alerta de Margem Curta
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#c0c7d6] rounded-md font-label-bold text-[#404753] hover:bg-[#f2f4f6] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005daa] text-white rounded-md font-label-bold hover:bg-[#0075d5] cursor-pointer"
                >
                  Salvar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contract Modal */}
      {editingContract && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c0c7d6] shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-sm text-[#005daa] font-bold">Editar Contrato</h3>
              <button
                onClick={() => setEditingContract(null)}
                className="text-[#707785] hover:text-[#191c1e] cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                  Código do Contrato
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CTR-2026-099"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa]"
                />
              </div>

              <div>
                <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                  Objeto do Contrato
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Serviço de Gestão de Estoque"
                  value={editObject}
                  onChange={(e) => setEditObject(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa]"
                />
              </div>

              <div>
                <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                  Fornecedor / Empresa Vinculada
                </label>
                <select
                  value={editFornecedorId}
                  onChange={(e) => setEditFornecedorId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa] bg-white"
                >
                  <option value="">-- Selecione uma Empresa / Fornecedor --</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nome} ({emp.tipo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                    Vencimento
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DD/MM/AAAA"
                    value={editExpirationDate}
                    onChange={(e) => setEditExpirationDate(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa]"
                  />
                </div>
                <div>
                  <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                    Categoria
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa] bg-white"
                  >
                    <option value="Armazenamento">Armazenamento</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Logística">Logística</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                    Valor Total (R$)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 250000.00"
                    value={editTotalValue}
                    onChange={(e) => setEditTotalValue(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa]"
                  />
                </div>
                <div>
                  <label className="font-label-bold text-[#191c1e] block mb-1 text-sm">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-[#c0c7d6] rounded-md font-body-md outline-none focus:border-[#005daa] bg-white"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="RENOVAÇÃO">Renovação</option>
                    <option value="ENCERRADO">Encerrado</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="editMarginAlert"
                  checked={editMarginAlert}
                  onChange={(e) => setEditMarginAlert(e.target.checked)}
                  className="w-4 h-4 text-[#005daa] border-[#c0c7d6] rounded focus:ring-[#005daa]"
                />
                <label htmlFor="editMarginAlert" className="font-label-bold text-sm text-[#404753] select-none cursor-pointer">
                  Alerta de Margem Ativo
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setEditingContract(null)}
                  className="px-4 py-2 border border-[#c0c7d6] rounded-md font-label-bold text-[#404753] hover:bg-[#f2f4f6] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#005daa] text-white rounded-md font-label-bold hover:bg-[#0075d5] cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {contractToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-[#c0c7d6] shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-[#ef4444]">
              <span className="material-symbols-outlined text-[32px]">warning</span>
              <h3 className="font-headline-sm text-lg font-bold text-[#191c1e]">Confirmar Exclusão</h3>
            </div>
            
            <p className="text-body-md text-[#404753] mb-4 text-sm">
              Tem certeza de que deseja excluir permanentemente o contrato abaixo? Esta ação não pode ser desfeita.
            </p>

            <div className="bg-slate-50 p-4 rounded-lg border border-[#e2e8f0] mb-6 space-y-2">
              <p className="text-[10px] text-[#707785] uppercase font-bold tracking-wider">Informações do Contrato</p>
              <div>
                <span className="font-mono font-bold text-[#005daa] text-sm">{contractToDelete.code}</span>
              </div>
              <p className="font-bold text-[#191c1e] text-sm">{contractToDelete.object}</p>
              <p className="text-body-sm text-[#404753] text-sm">
                Valor: <span className="font-mono font-bold">R$ {contractToDelete.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setContractToDelete(null)}
                className="px-4 py-2 border border-[#c0c7d6] rounded-md font-label-bold text-[#404753] hover:bg-[#f2f4f6] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteContract(contractToDelete.id);
                  setContractToDelete(null);
                }}
                className="px-4 py-2 bg-[#ef4444] text-white rounded-md font-label-bold hover:bg-[#dc2626] cursor-pointer"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
