import React, { useState } from 'react';
import { OnboardingInvite } from '../types';

interface OnboardingScreenProps {
  onOnboardingSuccess: (session: any) => void;
  onGoToLogin: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onOnboardingSuccess,
  onGoToLogin
}) => {
  const [activeTab, setActiveTab] = useState<'CONFIRM_INVITE' | 'CREATE_INVITE'>('CONFIRM_INVITE');

  // Confirmation state
  const [tokenInput, setTokenInput] = useState('INV-DEMO-2026');
  const [inviteData, setInviteData] = useState<OnboardingInvite | null>({
    id: '1',
    token: 'INV-DEMO-2026',
    email: 'novo.fornecedor@logistica.com.br',
    contrato_id: 'CTR-2026-SYS',
    entidade_id: 'SUP-9823-STORAGE',
    perfil: 'FORNECEDOR',
    status: 'PENDENTE',
    createdAt: new Date().toISOString()
  } as any);

  const [displayName, setDisplayName] = useState('Novo Fornecedor');
  const [password, setPassword] = useState('Systems@2026');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Create Invite State
  const [newEmail, setNewEmail] = useState('');
  const [newContratoId, setNewContratoId] = useState('CTR-2026-SYS');
  const [newEntidadeId, setNewEntidadeId] = useState('SUP-4012-LOGISTICA');
  const [newPerfil, setNewPerfil] = useState<'FINANCEIRO' | 'FORNECEDOR' | 'GESTOR' | 'ADMIN'>('FORNECEDOR');
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/auth/verify-invite-token?token=${tokenInput}`);
      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.invite) {
        setInviteData(data.invite);
        setMessage('Convite verificado com sucesso!');
      } else {
        setErrorMessage(data.error || 'Convite não encontrado ou expirado.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Erro de rede ao verificar convite.');
    }
  };

  const handleConfirmOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/confirm-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: inviteData.inviteToken || (inviteData as any).token,
          displayName,
          password
        })
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success) {
        setMessage('Onboarding concluído com sucesso! Custom Claims gravadas no token.');
        setTimeout(() => {
          onOnboardingSuccess(data.session);
        }, 1200);
      } else {
        setErrorMessage(data.error || 'Falha ao concluir onboarding.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Erro de conexão ao concluir cadastro.');
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newContratoId || !newEntidadeId) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          contrato_id: newContratoId,
          entidade_id: newEntidadeId,
          perfil: newPerfil
        })
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.invite) {
        setGeneratedInviteUrl(data.inviteUrl);
        setTokenInput(data.invite.token);
        setInviteData(data.invite);
        setMessage(`Convite gerado com sucesso para ${newEmail}!`);
      } else {
        setErrorMessage(data.error || 'Falha ao gerar convite.');
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMessage('Erro ao comunicar com o servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-4 font-body-md text-[#191c1e]">
      <div className="w-full max-w-2xl bg-white border border-[#c0c7d6] rounded-xl shadow-xl p-6 md:p-8 animate-in fade-in duration-300 my-8">
        {/* Header */}
        <div className="flex justify-between items-start pb-6 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#eff6ff] text-[#005daa] rounded-xl">
              <span className="material-symbols-outlined text-3xl">mark_email_read</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#005daa] uppercase tracking-wider">
                Módulo Desacoplado de Autenticação
              </span>
              <h2 className="font-headline-md text-headline-md text-[#191c1e]">
                Fluxo de Onboarding por E-mail
              </h2>
            </div>
          </div>
          <button
            onClick={onGoToLogin}
            className="px-3 py-1.5 border border-[#c0c7d6] rounded-md text-body-sm font-label-bold hover:bg-[#f2f4f6]"
          >
            Voltar ao Login
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 my-6 border-b border-[#c0c7d6] pb-3">
          <button
            onClick={() => setActiveTab('CONFIRM_INVITE')}
            className={`px-4 py-2 rounded-md font-label-bold text-label-bold transition-all cursor-pointer ${
              activeTab === 'CONFIRM_INVITE'
                ? 'bg-[#005daa] text-white shadow-2xs'
                : 'bg-[#f2f4f6] text-[#404753] hover:bg-[#eceef0]'
            }`}
          >
            Confirmar Convite & Ativar Token
          </button>
          <button
            onClick={() => setActiveTab('CREATE_INVITE')}
            className={`px-4 py-2 rounded-md font-label-bold text-label-bold transition-all cursor-pointer ${
              activeTab === 'CREATE_INVITE'
                ? 'bg-[#005daa] text-white shadow-2xs'
                : 'bg-[#f2f4f6] text-[#404753] hover:bg-[#eceef0]'
            }`}
          >
            Enviar Novo Convite
          </button>
        </div>

        {message && (
          <div className="mb-6 p-3.5 bg-[#ecfdf5] border border-[#10b981]/30 rounded-lg text-[#10b981] font-bold text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>{message}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-3.5 bg-[#fef2f2] border border-[#ef4444]/30 rounded-lg text-[#ef4444] font-bold text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: Confirm Invite & Set Identity */}
        {activeTab === 'CONFIRM_INVITE' && (
          <div className="space-y-6">
            <form onSubmit={handleVerifyToken} className="flex gap-3">
              <input
                type="text"
                placeholder="Código ou Token do Convite (ex: INV-DEMO-2026)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 border border-[#c0c7d6] rounded-md font-metric-mono font-bold text-[#005daa]"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2.5 bg-[#005daa] text-white rounded-md font-label-bold hover:bg-[#0075d5]"
              >
                Buscar Convite
              </button>
            </form>

            {inviteData && (
              <form onSubmit={handleConfirmOnboarding} className="space-y-6 bg-[#f7f9fb] p-6 rounded-xl border border-[#c0c7d6]">
                <div className="border-b border-[#e2e8f0] pb-4">
                  <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-widest bg-[#ecfdf5] px-2.5 py-0.5 rounded border border-[#10b981]/20">
                    Identity Verification Pending
                  </span>
                  <h3 className="font-headline-sm text-[#191c1e] mt-2">{inviteData.email}</h3>
                </div>

                {/* Mandatory Custom Claims Container Metadata Card */}
                <div className="bg-white p-4 rounded-lg border border-[#c0c7d6] space-y-2">
                  <p className="text-[11px] font-label-bold text-[#005daa] uppercase">
                    Metadados de Custom Claims a serem gravados no Token Firebase:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-body-sm">
                    <div className="p-2 bg-[#f2f4f6] rounded">
                      <span className="block text-[10px] font-bold text-[#707785]">CONTRATO_ID</span>
                      <span className="font-metric-mono font-bold text-[#191c1e]">{inviteData.contrato_id}</span>
                    </div>
                    <div className="p-2 bg-[#f2f4f6] rounded">
                      <span className="block text-[10px] font-bold text-[#707785]">ENTIDADE_ID</span>
                      <span className="font-metric-mono font-bold text-[#191c1e]">{inviteData.entidade_id}</span>
                    </div>
                    <div className="p-2 bg-[#f2f4f6] rounded">
                      <span className="block text-[10px] font-bold text-[#707785]">PERFIL</span>
                      <span className="font-metric-mono font-bold text-[#005daa]">{inviteData.perfil}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="font-label-bold text-[#191c1e] block mb-1">
                      Nome Completo / Razão Social
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#c0c7d6] rounded-md bg-white font-body-md"
                    />
                  </div>

                  <div>
                    <label className="font-label-bold text-[#191c1e] block mb-1">
                      Definir Senha de Acesso
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#c0c7d6] rounded-md bg-white font-body-md"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-[#10b981] text-white rounded-md font-label-bold hover:bg-[#059669] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Confirmando Identidade...</span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">badge</span>
                      <span>Confirmar Identidade & Gravar Custom Claims</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: Generate New Onboarding Invitation */}
        {activeTab === 'CREATE_INVITE' && (
          <form onSubmit={handleGenerateInvite} className="space-y-4">
            <div>
              <label className="font-label-bold text-[#191c1e] block mb-1">E-mail do Convidado</label>
              <input
                type="email"
                required
                placeholder="novo.usuario@empresa.com.br"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#c0c7d6] rounded-md font-body-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-label-bold text-[#191c1e] block mb-1">Contrato Tenant ID</label>
                <input
                  type="text"
                  required
                  value={newContratoId}
                  onChange={(e) => setNewContratoId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#c0c7d6] rounded-md font-metric-mono"
                />
              </div>

              <div>
                <label className="font-label-bold text-[#191c1e] block mb-1">Entidade / Fornecedor ID</label>
                <input
                  type="text"
                  required
                  value={newEntidadeId}
                  onChange={(e) => setNewEntidadeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#c0c7d6] rounded-md font-metric-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-label-bold text-[#191c1e] block mb-1">Perfil do Token</label>
              <select
                value={newPerfil}
                onChange={(e) => setNewPerfil(e.target.value as any)}
                className="w-full px-3.5 py-2.5 border border-[#c0c7d6] rounded-md font-body-md"
              >
                <option value="FORNECEDOR">FORNECEDOR</option>
                <option value="FINANCEIRO">FINANCEIRO</option>
                <option value="GESTOR">GESTOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#005daa] text-white rounded-md font-label-bold hover:bg-[#0075d5]"
            >
              Gerar Convite de Onboarding
            </button>

            {generatedInviteUrl && (
              <div className="mt-4 p-4 bg-[#f2f4f6] rounded-lg border border-[#c0c7d6] space-y-2">
                <p className="text-[11px] font-bold text-[#005daa]">LINK DE CONVITE GERADO:</p>
                <div className="p-2.5 bg-white border border-[#c0c7d6] rounded font-metric-mono text-body-sm text-[#191c1e] break-all">
                  {window.location.origin}{generatedInviteUrl}
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
