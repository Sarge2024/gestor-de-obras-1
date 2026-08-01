export type NavigationTab = 'login' | 'dashboard' | 'financeiro' | 'contratos' | 'alertas' | 'onboarding' | 'auth-debug' | 'empresas' | 'entidades' | 'matriz-acesso' | 'usuarios';

export interface EmpresaItem {
  id: string;
  nome: string;
  cnpj_cpf: string;
  tipo: 'FORNECEDOR' | 'CLIENTE' | 'PARCEIRO' | 'CONTRATANTE';
  contrato_id: string;
  emailContato: string;
  telefone: string;
  status: 'ATIVO' | 'BLOQUEADO' | 'EM_ANALISE';
  totalFaturado: number;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  email: string;
  displayName: string;
  contrato_id: string;
  empresa_id?: string; // Vínculo OPCIONAL a empresa (fornecedor/parceiro/cliente)
  empresa_nome?: string; // Nome da empresa vinculada
  perfil: 'FINANCEIRO' | 'FORNECEDOR' | 'GESTOR' | 'ADMIN';
  mfaEnabled: boolean;
  status: 'ATIVO' | 'INATIVO' | 'PENDENTE';
  createdAt: string;
}

export interface CustomClaims {
  contrato_id: string; // Tenant principal (ex: CTR-2026-SYS)
  empresa_id: string; // ID do fornecedor ou empresa (ex: SUP-9823-STORAGE)
  entidade_id?: string; // Alias legado para empresa_id
  perfil: 'FINANCEIRO' | 'FORNECEDOR' | 'GESTOR' | 'ADMIN'; // Perfil de acesso
  mfa_verified?: boolean; // Duplo fator verificado
}

export interface AuthSession {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  customClaims: CustomClaims;
  idToken: string;
  mfaVerified: boolean;
  mfaMethod?: 'EMAIL_OTP' | 'GOOGLE_2FA' | 'SMS_OTP';
  lastLoginAt: string;
}

export interface OnboardingInvite {
  id: string;
  email: string;
  contrato_id: string;
  empresa_id: string;
  entidade_id?: string;
  perfil: 'FINANCEIRO' | 'FORNECEDOR' | 'GESTOR' | 'ADMIN';
  inviteToken: string;
  status: 'PENDENTE' | 'ACEITO' | 'EXPIRADO';
  createdAt: string;
  invitedBy?: string;
}

export interface UserProfile {
  name: string;
  role: string;
  company: string;
  tier: string;
  avatarUrl: string;
  email: string;
}

export interface ContractItem {
  id: string;
  code: string;
  object: string;
  expirationDate: string;
  status: 'ATIVO' | 'RENOVAÇÃO' | 'ENCERRADO';
  totalValue: number;
  monthlyValue?: number;
  category?: string;
  marginAlert?: boolean;
  fornecedorId?: string;
  fornecedorNome?: string;
}

export interface InvoiceItem {
  id: string;
  code: string;
  description: string;
  type: string; // e.g. 'Serviços', 'Logística'
  value: number;
  date: string;
  status: 'EM_PROCESSAMENTO' | 'VALIDADA' | 'REJEITADA';
}

export interface PendingPayment {
  id: string;
  title: string;
  category: 'AWS Cloud' | 'TransPort' | 'Serviços' | 'Equipamentos';
  dueDate: string;
  value: number;
  status: 'Pendente' | 'Pago';
  icon: string;
}

export interface DRELine {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  variation: string;
  isPositiveVariation: boolean;
  status?: 'Atingido' | 'Estável' | 'Alerta' | 'Superado' | 'Eficiente';
  isBold?: boolean;
  isTotal?: boolean;
  isSubtotal?: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  type: 'invoice' | 'alert' | 'contract' | 'system';
  color: 'primary' | 'warning' | 'success' | 'processing';
}

export interface ChamadoTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: 'Faturamento' | 'Contratos' | 'Acesso/TI' | 'Geral';
  priority: 'Alta' | 'Média' | 'Baixa';
  description: string;
  createdAt: string;
  status: 'Aberto' | 'Em Atendimento' | 'Concluído';
}

export interface SystemAlert {
  id: string;
  contractCode: string;
  title: string;
  severity: 'Crítico' | 'Aviso' | 'Informativo';
  description: string;
  daysRemaining?: number;
  usagePercent?: number;
  actionText: string;
}
