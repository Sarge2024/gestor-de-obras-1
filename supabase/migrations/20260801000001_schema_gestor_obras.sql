-- ===================================================================
-- GESTOR DE OBRAS - Schema Principal
-- Migração: 20260801000001 - Tabelas base do negócio
-- ===================================================================

-- Tabela da empresa contratante (tenant raiz)
CREATE TABLE IF NOT EXISTS empresa_contratante (
  contrato_id        TEXT PRIMARY KEY,
  natureza           TEXT CHECK (natureza IN ('Privada', 'Publica')),
  nome               TEXT NOT NULL,
  area               TEXT,
  departamento       TEXT,
  cnpj               TEXT,
  email              TEXT,
  telefone           TEXT,
  gestor_responsavel TEXT,
  unidade_administrativa TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de empresas e fornecedores (multitenant via contrato_id)
CREATE TABLE IF NOT EXISTS empresas_fornecedores (
  id           TEXT NOT NULL,
  contrato_id  TEXT NOT NULL REFERENCES empresa_contratante(contrato_id) ON DELETE CASCADE,
  nome         TEXT NOT NULL,
  cnpj_cpf     TEXT NOT NULL,
  tipo         TEXT CHECK (tipo IN ('FORNECEDOR', 'CLIENTE', 'PARCEIRO', 'CONTRATANTE')),
  email_contato TEXT,
  telefone     TEXT,
  status       TEXT CHECK (status IN ('ATIVO', 'BLOQUEADO', 'EM_ANALISE')) DEFAULT 'ATIVO',
  total_faturado NUMERIC DEFAULT 0,
  created_at   TEXT,
  PRIMARY KEY (id, contrato_id)
);

-- Tabela de perfis e permissões granulares (Cerne - Zero Trust)
CREATE TABLE IF NOT EXISTS perfis_permissoes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id             TEXT NOT NULL REFERENCES empresa_contratante(contrato_id) ON DELETE CASCADE,
  perfil                  TEXT NOT NULL,
  pode_ver_dre            BOOLEAN DEFAULT FALSE,
  pode_editar_pagamento   BOOLEAN DEFAULT FALSE,
  pode_aprovar_medicao    BOOLEAN DEFAULT FALSE,
  pode_cadastrar_empresa  BOOLEAN DEFAULT FALSE,
  pode_exportar_relatorio BOOLEAN DEFAULT FALSE,
  pode_gerenciar_usuarios BOOLEAN DEFAULT FALSE,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_contrato_perfil UNIQUE (contrato_id, perfil)
);

-- ===================================================================
-- RLS - Row Level Security (Isolamento Multitenant - Zero Trust)
-- ===================================================================
ALTER TABLE empresa_contratante   ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas_fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis_permissoes     ENABLE ROW LEVEL SECURITY;

-- Políticas: Service Role bypassa RLS automaticamente.
-- Para queries autenticadas, o backend define app.current_contrato_id.
DROP POLICY IF EXISTS tenant_contratante ON empresa_contratante;
CREATE POLICY tenant_contratante ON empresa_contratante
  FOR ALL USING (
    contrato_id = current_setting('app.current_contrato_id', true)
  );

DROP POLICY IF EXISTS tenant_fornecedores ON empresas_fornecedores;
CREATE POLICY tenant_fornecedores ON empresas_fornecedores
  FOR ALL USING (
    contrato_id = current_setting('app.current_contrato_id', true)
  );

DROP POLICY IF EXISTS tenant_permissoes ON perfis_permissoes;
CREATE POLICY tenant_permissoes ON perfis_permissoes
  FOR ALL USING (
    contrato_id = current_setting('app.current_contrato_id', true)
  );

-- ===================================================================
-- SEED: Dados de demonstração para CTR-2026-SYS
-- ===================================================================
INSERT INTO empresa_contratante (contrato_id, natureza, nome, area, departamento)
VALUES ('CTR-2026-SYS', 'Privada', 'Sagacitas Sistemas', 'Tecnologia', 'Engenharia')
ON CONFLICT (contrato_id) DO NOTHING;

INSERT INTO perfis_permissoes (
  contrato_id, perfil,
  pode_ver_dre, pode_editar_pagamento, pode_aprovar_medicao,
  pode_cadastrar_empresa, pode_exportar_relatorio, pode_gerenciar_usuarios
) VALUES
  ('CTR-2026-SYS', 'ADMIN',      TRUE,  TRUE,  TRUE,  TRUE,  TRUE,  TRUE),
  ('CTR-2026-SYS', 'GESTOR',     TRUE,  TRUE,  TRUE,  FALSE, TRUE,  FALSE),
  ('CTR-2026-SYS', 'FINANCEIRO', TRUE,  TRUE,  FALSE, TRUE,  TRUE,  FALSE),
  ('CTR-2026-SYS', 'FORNECEDOR', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (contrato_id, perfil) DO NOTHING;

-- ===================================================================
-- GRANTS: Permissões de Acesso para as Roles do Supabase/Postgrest
-- ===================================================================
GRANT ALL ON TABLE empresa_contratante TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE empresas_fornecedores TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE perfis_permissoes TO postgres, anon, authenticated, service_role;

