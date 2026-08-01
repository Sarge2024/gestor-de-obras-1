import React, { useState, useEffect } from 'react';
import { AuthSession } from '../types';

interface AuthDebugViewProps {
  session: AuthSession | null;
  onClose: () => void;
}

export const AuthDebugView: React.FC<AuthDebugViewProps> = ({ session, onClose }) => {
  const [inspectedClaims, setInspectedClaims] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const email = session?.email || 'financeiro@logisticsglobal.com.br';
        const res = await fetch(`/api/auth/inspect-claims?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        setInspectedClaims(data);
      } catch (e) {
        console.error('Inspect claims error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, [session]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 md:p-8 border border-[#c0c7d6] shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#eff6ff] text-[#005daa] rounded-lg">
              <span className="material-symbols-outlined text-[24px]">token</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#005daa] uppercase tracking-wider">
                Inspecionar Token de Sessão
              </span>
              <h3 className="font-headline-sm text-[#191c1e]">Firebase Custom Claims Inspector</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#f2f4f6] text-[#707785] hover:text-[#191c1e]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="my-6 space-y-6">
          {/* Active Session Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-[#f7f9fb] border border-[#c0c7d6] rounded-lg">
              <span className="text-[10px] font-bold text-[#707785] uppercase">Contrato ID (Tenant)</span>
              <p className="font-metric-mono font-bold text-lg text-[#005daa]">
                {session?.customClaims?.contrato_id || 'CTR-2026-SYS'}
              </p>
            </div>
            <div className="p-3 bg-[#f7f9fb] border border-[#c0c7d6] rounded-lg">
              <span className="text-[10px] font-bold text-[#707785] uppercase">Entidade ID (Empresa)</span>
              <p className="font-metric-mono font-bold text-lg text-[#005daa]">
                {session?.customClaims?.entidade_id || 'SUP-9823-STORAGE'}
              </p>
            </div>
            <div className="p-3 bg-[#f7f9fb] border border-[#c0c7d6] rounded-lg">
              <span className="text-[10px] font-bold text-[#707785] uppercase">Perfil no Token</span>
              <p className="font-metric-mono font-bold text-lg text-[#10b981]">
                {session?.customClaims?.perfil || 'FINANCEIRO'}
              </p>
            </div>
          </div>

          {/* MFA Security Status Badge */}
          <div className="p-3.5 bg-[#ecfdf5] border border-[#10b981]/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#10b981] text-[20px]">verified</span>
              <span className="font-bold text-[#10b981] text-body-sm">
                Status Duplo Fator (2FA): VERIFICADO
              </span>
            </div>
            <span className="font-metric-mono text-xs text-[#10b981] bg-white px-2 py-0.5 rounded border border-[#10b981]/20">
              mfa_verified: true
            </span>
          </div>

          {/* JSON Decoded JWT Claims Preview */}
          <div className="space-y-2">
            <label className="font-label-bold text-xs uppercase text-[#404753] block">
              Decoded JWT Payload (Custom Claims Embutidas)
            </label>
            <pre className="bg-[#1e293b] text-[#38bdf8] p-4 rounded-lg font-metric-mono text-xs overflow-x-auto border border-[#334155]">
              {loading
                ? 'Carregando claims do servidor Firebase...'
                : JSON.stringify(inspectedClaims?.jwtPayloadPreview || session?.customClaims, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#e2e8f0]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#005daa] text-white rounded-md font-label-bold hover:bg-[#0075d5]"
          >
            Fechar Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
