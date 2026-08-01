-- Criar tabela de perfis e permissões granulares
CREATE TABLE IF NOT EXISTS perfis_permissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contrato_id VARCHAR NOT NULL,
    perfil VARCHAR NOT NULL,
    pode_ver_dre BOOLEAN DEFAULT FALSE,
    pode_editar_pagamento BOOLEAN DEFAULT FALSE,
    pode_aprovar_medicao BOOLEAN DEFAULT FALSE,
    pode_cadastrar_empresa BOOLEAN DEFAULT FALSE,
    pode_exportar_relatorio BOOLEAN DEFAULT FALSE,
    pode_gerenciar_usuarios BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_contrato_perfil UNIQUE (contrato_id, perfil)
);

-- Habilitar RLS
ALTER TABLE perfis_permissoes ENABLE ROW LEVEL SECURITY;

-- Política de Segurança RLS (Isolamento Multitenant)
CREATE POLICY tenant_isolation ON perfis_permissoes
    FOR ALL
    USING (contrato_id = current_setting('app.current_contrato_id', true));

-- Inserir permissões default para o contrato demo CTR-2026-SYS
INSERT INTO perfis_permissoes (contrato_id, perfil, pode_ver_dre, pode_editar_pagamento, pode_aprovar_medicao, pode_cadastrar_empresa, pode_exportar_relatorio, pode_gerenciar_usuarios)
VALUES 
('CTR-2026-SYS', 'ADMIN', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
('CTR-2026-SYS', 'GESTOR', TRUE, TRUE, TRUE, FALSE, TRUE, FALSE),
('CTR-2026-SYS', 'FINANCEIRO', TRUE, TRUE, FALSE, TRUE, TRUE, FALSE),
('CTR-2026-SYS', 'FORNECEDOR', FALSE, FALSE, FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (contrato_id, perfil) DO NOTHING;
