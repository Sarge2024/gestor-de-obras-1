-- Fix RLS
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
