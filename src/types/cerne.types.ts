export interface CerneUserPermissions {
  id: string;
  contrato_id: string;
  perfil: 'FINANCEIRO' | 'FORNECEDOR' | 'GESTOR' | 'ADMIN';
  pode_ver_dre: boolean;
  pode_editar_pagamento: boolean;
  pode_aprovar_medicao: boolean;
  pode_cadastrar_empresa: boolean;
  pode_exportar_relatorio: boolean;
  pode_gerenciar_usuarios: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CerneEmpresa {
  id: string;
  contrato_id: string;
  nome: string;
  cnpj_cpf: string;
  tipo: 'FORNECEDOR' | 'CLIENTE' | 'PARCEIRO' | 'CONTRATANTE';
  emailContato: string;
  telefone: string;
  status: 'ATIVO' | 'BLOQUEADO' | 'EM_ANALISE';
  totalFaturado: number;
  createdAt: string;
}

export interface CerneContratante {
  contrato_id: string;
  natureza: 'Publica' | 'Privada' | string;
  nome: string;
  area: string;
  departamento: string;
  cnpj: string;
  email: string;
  telefone: string;
  gestorResponsavel: string;
  unidadeAdministrativa: string;
}

export interface CerneLancamento {
  id: string;
  contrato_id: string;
  fornecedor_id: string;
  descricao: string;
  valor: number;
  tipo: 'RECEITA' | 'DESPESA' | string;
  status: 'PAGO' | 'PENDENTE' | 'EM_PROCESSAMENTO' | string;
  data_vencimento: string;
  criado_por: string;
  createdAt: string;
}
