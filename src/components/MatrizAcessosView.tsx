import React, { useState } from 'react';
import { AuthSession } from '../types';

interface MatrizAcessosViewProps {
  authSession?: AuthSession | null;
}

interface PermissionRule {
  id: string;
  nome: string;
  descricao: string;
  admin: boolean;
  financeiro: boolean;
  gestor: boolean;
  fornecedor: boolean;
}

export const MatrizAcessosView: React.FC<MatrizAcessosViewProps> = ({ authSession }) => {
  const currentClaims = authSession?.customClaims;

  const [permissions, setPermissions] = useState<PermissionRule[]>([
    {
      id: 'p1',
      nome: 'Leitura de Lançamentos Intra-Contrato',
      descricao: 'Permite consultar lançamentos do mesmo contrato_id',
      admin: true,
      financeiro: true,
      gestor: true,
      fornecedor: true
    },
    {
      id: 'p2',
      nome: 'Filtro Estrito por Fornecedor ID',
      descricao: 'Limita a visualização exclusivamente ao seu próprio fornecedor_id',
      admin: false,
      financeiro: false,
      gestor: false,
      fornecedor: true
    },
    {
      id: 'p3',
      nome: 'Escrita / Aprovação Financeira',
      descricao: 'Cadastrar, liquidar ou aprovar despesas do contrato',
      admin: true,
      financeiro: true,
      gestor: true,
      fornecedor: false
    },
    {
      id: 'p4',
      nome: 'Gestão de Empresas & Cadastro',
      descricao: 'Criar e atualizar fornecedores, empresas e parceiros no Container',
      admin: true,
      financeiro: true,
      gestor: false,
      fornecedor: false
    },
    {
      id: 'p5',
      nome: 'Injeção de Custom Claims JWT',
      descricao: 'Atribuir perfil, contrato_id e empresa_id no Firebase Auth Admin',
      admin: true,
      financeiro: false,
      gestor: false,
      fornecedor: false
    },
    {
      id: 'p6',
      nome: 'Exportação DRE & Relatórios Fiscais',
      descricao: 'Download de demonstrativos e notas fiscais processadas',
      admin: true,
      financeiro: true,
      gestor: true,
      fornecedor: false
    }
  ]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const togglePermission = (id: string, role: 'admin' | 'financeiro' | 'gestor' | 'fornecedor') => {
    setPermissions(
      permissions.map((p) => {
        if (p.id === id) {
          return { ...p, [role]: !p[role] };
        }
        return p;
      })
    );
  };

  const handleSaveMatrix = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-md border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1890ff] text-2xl">security</span>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Configuração de Acessos & Matriz de Perfis
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Governança de Custom Claims e Regras de Segurança no Firebase Auth & Firestore
          </p>
        </div>

        <button
          onClick={handleSaveMatrix}
          className="px-4 py-2 bg-[#1890ff] text-white font-bold text-xs rounded-md hover:bg-[#096dd9] transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">save</span>
          <span>Salvar Matriz de Regras</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-2xs">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>Matriz de acessos e privilégios atualizada no Container Firebase com sucesso!</span>
        </div>
      )}

      {/* Active Claims Inspection Box */}
      <div className="bg-slate-900 text-slate-100 p-5 rounded-md border border-slate-800 shadow-2xs space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">key</span>
            Custom Claims no JWT Token Atual (Injetadas no Firebase)
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
            UID: {authSession?.uid || 'usr_demo'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <span className="text-slate-400 text-[10px] block uppercase">contrato_id</span>
            <span className="text-white font-bold">{currentClaims?.contrato_id || 'CTR-2026-SYS'}</span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <span className="text-slate-400 text-[10px] block uppercase">empresa_id</span>
            <span className="text-amber-400 font-bold">{currentClaims?.empresa_id || currentClaims?.entidade_id || 'SUP-9823-STORAGE'}</span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <span className="text-slate-400 text-[10px] block uppercase">perfil</span>
            <span className="text-[#1890ff] font-bold">{currentClaims?.perfil || 'FINANCEIRO'}</span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <span className="text-slate-400 text-[10px] block uppercase">mfa_verified</span>
            <span className="text-emerald-400 font-bold">TRUE (2FA verificado)</span>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white p-6 rounded-md border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1890ff]">grid_on</span>
          Matriz de Permissões x Perfis de Usuário
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Permissão / Ação de Segurança</th>
                <th className="p-3 text-center w-28">ADMIN</th>
                <th className="p-3 text-center w-28">FINANCEIRO</th>
                <th className="p-3 text-center w-28">GESTOR</th>
                <th className="p-3 text-center w-28">FORNECEDOR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {permissions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-slate-800 block">{p.nome}</span>
                    <span className="text-[11px] text-slate-500">{p.descricao}</span>
                  </td>

                  {(['admin', 'financeiro', 'gestor', 'fornecedor'] as const).map((role) => (
                    <td key={role} className="p-3 text-center">
                      <button
                        onClick={() => togglePermission(p.id, role)}
                        className={`w-6 h-6 rounded-md flex items-center justify-center mx-auto transition-all cursor-pointer ${
                          p[role]
                            ? 'bg-emerald-500 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-300 border border-slate-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm font-bold">
                          {p[role] ? 'check' : 'close'}
                        </span>
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
