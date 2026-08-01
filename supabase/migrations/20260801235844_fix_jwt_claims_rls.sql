-- Fix JWT custom claims mapping in RLS policies

-- 1. Update RLS of empresa_contratante (Tenant Raiz)
DROP POLICY IF EXISTS tenant_contratante ON empresa_contratante;
CREATE POLICY tenant_contratante ON empresa_contratante
  FOR ALL USING (
    contrato_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'contrato_id')
  );

-- 2. Update RLS of perfis_permissoes
DROP POLICY IF EXISTS tenant_permissoes ON perfis_permissoes;
CREATE POLICY tenant_permissoes ON perfis_permissoes
  FOR ALL USING (
    contrato_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'contrato_id')
  );

-- 3. Update RLS of empresas_fornecedores
DROP POLICY IF EXISTS tenant_fornecedores ON empresas_fornecedores;
DROP POLICY IF EXISTS fornecedores_select ON empresas_fornecedores;
DROP POLICY IF EXISTS fornecedores_modify ON empresas_fornecedores;

CREATE POLICY fornecedores_select ON empresas_fornecedores
  FOR SELECT USING (
    contrato_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'contrato_id')
  );

CREATE POLICY fornecedores_modify ON empresas_fornecedores
  FOR ALL USING (
    contrato_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'contrato_id') AND
    (current_setting('request.jwt.claims', true)::jsonb ->> 'perfil') = 'ADMIN'
  )
  WITH CHECK (
    contrato_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'contrato_id') AND
    (current_setting('request.jwt.claims', true)::jsonb ->> 'perfil') = 'ADMIN'
  );
