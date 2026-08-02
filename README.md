# Works Manager (Gestor de Obras)

Sistema moderno de Gestão de Obras, Infraestrutura, Fornecedores e Contratos (SaaS Multi-Tenant). Desenvolvido com React, TypeScript, Tailwind CSS, Firebase Auth para autenticação de identidade e Supabase PostgreSQL para controle transacional de negócio com suporte nativo a Row-Level Security (RLS).

## 🚀 Funcionalidades Principais

*   **Painel Operacional (Dashboard):** Visão unificada e em tempo real sobre cronogramas, custos e andamento dos projetos.
*   **Autenticação e Whitelist de Usuários:** Autenticação via Google/Microsoft OAuth com verificação de autorização prévia na tabela `usuarios` do Supabase.
*   **Gestão de Empresas & Fornecedores:** Controle de perfis, homologação, dados de contato e segmentação por tipo (Fornecedores, Clientes, Parceiros, Contratante), com autorização de escrita restrita a Administradores via RLS.
*   **Demonstrativo do Resultado do Exercício (DRE):** Relatórios financeiros consolidados, fluxos de receitas e despesas com filtragem inteligente e insights impulsionados por **Gemini AI**.
*   **Cronograma Viário & Fluxo Físico-Financeiro:** Linha do tempo visual detalhando o progresso físico e os aportes financeiros programados para cada trecho ou obra.
*   **Matriz de Controle de Acesso (RBAC):** Gestão minuciosa de permissões de usuários por perfil (`ADMIN`, `GESTOR`, `FINANCEIRO`, `FORNECEDOR`) com isolamento por tenant (`contrato_id`).
*   **Alertas Inteligentes:** Notificações de margem, vencimento de certidões e prazos contratuais.

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion
*   **Backend:** Express (Node.js) com TypeScript nativo
*   **Autenticação:** Firebase Auth (SSO OAuth Google/Microsoft, MFA)
*   **Banco de Dados & RLS:** Supabase (PostgreSQL) com JWT assinado e Row-Level Security nativo por tenant e por perfil
*   **Inteligência Artificial:** Gemini AI (`gemini-2.5-flash`) para análise de DRE e insights financeiros
*   **Utilitários:** Charting com Recharts/D3 para visualizações elegantes

## 📦 Como Executar o Projeto Localmente

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Configure as variáveis de ambiente:**
    Copie o arquivo `.env.example` para `.env` e preencha as chaves do Firebase, Supabase e JWT:
    ```bash
    cp .env.example .env
    ```

3.  **Execute as migrações do banco (Supabase):**
    ```bash
    npx supabase migration up
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  **Executar Pipeline de Testes de Autenticação/RLS:**
    ```bash
    npx tsx test-server-auth.ts
    ```

---
*Desenvolvido com carinho e precisão técnica.*

