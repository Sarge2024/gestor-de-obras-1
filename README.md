# Gestor de Obras

Sistema moderno de Gestão de Obras, Infraestrutura, Fornecedores e Contratos. Desenvolvido com React, TypeScript, Tailwind CSS e Firebase para armazenamento persistente de dados.

## 🚀 Funcionalidades Principais

*   **Painel Operacional (Dashboard):** Visão unificada e em tempo real sobre cronogramas, custos e andamento dos projetos.
*   **Gestão de Empresas & Fornecedores:** Controle de perfis, homologação, dados de contato e segmentação por tipo (Fornecedores, Clientes, Parceiros, Contratante).
*   **Demonstrativo do Resultado do Exercício (DRE):** Relatórios financeiros consolidados, fluxos de receitas e despesas com filtragem inteligente.
*   **Cronograma Viário & Fluxo Físico-Financeiro:** Linha do tempo visual detalhando o progresso físico e os aportes financeiros programados para cada trecho ou obra.
*   **Matriz de Controle de Acesso:** Gestão minuciosa de permissões de usuários com isolamento por tenant.
*   **Alertas Inteligentes:** Notificações de margem, vencimento de certidões e prazos contratuais.

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion
*   **Backend:** Express (Node.js) com suporte a TypeScript nativo
*   **Banco de Dados:** Firebase Firestore & Firebase Auth (com suporte a MFA)
*   **Utilitários:** Charting com Recharts/D3 para visualizações elegantes

## 📦 Como Executar o Projeto Localmente

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Configure as variáveis de ambiente:**
    Copie o arquivo `.env.example` para `.env` e preencha as chaves do Firebase e do Gemini:
    ```bash
    cp .env.example .env
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  **Construa para produção:**
    ```bash
    npm run build
    ```

---
*Desenvolvido com carinho e precisão técnica.*
