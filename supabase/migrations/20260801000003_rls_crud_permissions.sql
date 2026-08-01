-- ===================================================================
-- GESTOR DE OBRAS - Migration 03
-- RLS com Validação de JWT e Inserção do Admin Principal
-- ===================================================================

-- 1. Inserir o administrador principal
INSERT INTO usuarios (uid, email, nome, contrato_id, perfil, status)
VALUES (
  'admin_sagacitas', -- Será atualizado quando ele logar com o UID real do Google, ou o backend aceita o email
  'sagacitas.sistemas@gmail.com',
  'Sagacitas Admin',
  'CTR-2026-SYS',
  'ADMIN',
  'ATIVO'
) ON CONFLICT (uid) DO NOTHING;

-- 2. Atualizar RLS da empresa_contratante (Tenant Raiz)
DROP POLICY IF EXISTS tenant_contratante ON empresa_contratante;
CREATE POLICY tenant_contratante ON empresa_contratante
  FOR ALL USING (
    contrato_id = current_setting('request.jwt.claim.contrato_id', true)
  );

-- 3. Atualizar RLS de perfis_permissoes
DROP POLICY IF EXISTS tenant_permissoes ON perfis_permissoes;
CREATE POLICY tenant_permissoes ON perfis_permissoes
  FOR ALL USING (
    contrato_id = current_setting('request.jwt.claim.contrato_id', true)
  );

-- 4. Atualizar RLS de empresas_fornecedores com validação de perfil ADMIN
DROP POLICY IF EXISTS tenant_fornecedores ON empresas_fornecedores;

-- 4a. Visualizar (SELECT) permitido para qualquer pessoa do mesmo contrato_id
CREATE POLICY fornecedores_select ON empresas_fornecedores
  FOR SELECT USING (
    contrato_id = current_setting('request.jwt.claim.contrato_id', true)
  );

-- 4b. Inserir, Atualizar e Deletar (INSERT, UPDATE, DELETE) permitido APENAS para ADMIN
CREATE POLICY fornecedores_modify ON empresas_fornecedores
  FOR ALL USING (
    contrato_id = current_setting('request.jwt.claim.contrato_id', true) AND
    current_setting('request.jwt.claim.perfil', true) = 'ADMIN'
  )
  WITH CHECK (
    contrato_id = current_setting('request.jwt.claim.contrato_id', true) AND
    current_setting('request.jwt.claim.perfil', true) = 'ADMIN'
  );
