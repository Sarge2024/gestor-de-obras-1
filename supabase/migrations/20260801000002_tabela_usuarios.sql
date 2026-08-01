-- ===================================================================
-- GESTOR DE OBRAS - Migration 02
-- Tabela de Usuários (Integração com Autenticação e Permissões)
-- ===================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  uid         TEXT PRIMARY KEY,
  email       TEXT NOT NULL,
  nome        TEXT,
  foto_url    TEXT,
  contrato_id TEXT REFERENCES empresa_contratante(contrato_id) ON DELETE SET NULL,
  perfil      TEXT NOT NULL DEFAULT 'FORNECEDOR',
  status      TEXT CHECK (status IN ('ATIVO', 'INATIVO', 'BLOQUEADO', 'PENDENTE')) DEFAULT 'ATIVO',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política de Segurança RLS (Isolamento Multitenant via contrato_id)
-- Usuarios podem ver outros usuarios do mesmo contrato, e a si mesmos
DROP POLICY IF EXISTS tenant_usuarios ON usuarios;
CREATE POLICY tenant_usuarios ON usuarios
  FOR ALL USING (
    uid = current_setting('request.jwt.claim.sub', true) OR
    contrato_id = current_setting('app.current_contrato_id', true)
  );

-- Grants
GRANT ALL ON TABLE usuarios TO postgres, anon, authenticated, service_role;
