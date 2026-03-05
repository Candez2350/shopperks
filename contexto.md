# Resumo do Projeto: ShopPerks

## Conceito

O ShopPerks é um protótipo bem estruturado de um sistema de cupons de desconto, projetado para ser usado por funcionários de um shopping center. O objetivo é fomentar uma economia circular interna, permitindo que funcionários obtenham descontos exclusivos nas lojas do próprio shopping. A aplicação é uma Single-Page Application (SPA) moderna, construída com React, TypeScript e Vite, com um design visual sofisticado que utiliza Tailwind CSS.

## Arquitetura e Funcionalidades por Perfil

A aplicação é arquitetada em torno de três perfis de usuário, cada um com seu próprio painel e capacidades:

### 1. Funcionário (Employee)
- **Painel Principal:** `EmployeeDashboard.tsx`.
- **Capacidades:**
    - Explorar, buscar e filtrar cupons disponíveis de todas as lojas.
    - Resgatar um cupom, o que gera um **QR Code seguro e com tempo de validade limitado** (`SecurityService`).
    - Acessar uma "carteira digital" para gerenciar cupons resgatados (pendentes, usados, expirados).
    - Receber notificações "inteligentes" simuladas por IA (`AIService`), como sugestões de ofertas baseadas no horário.
    - Acompanhar seu progresso em um sistema de gamificação, ganhando medalhas (`ProfileModal.tsx`).

### 2. Gerente de Loja (Manager)
- **Painel Principal:** `ManagerDashboard.tsx`.
- **Capacidades:**
    - Visualizar um painel com **estatísticas de desempenho** dos cupons de sua loja.
    - Gerenciar (criar e deletar) os cupons oferecidos pela sua loja.
    - **Validar cupons** apresentados por funcionários, seja escaneando o QR Code com a câmera (`html5-qrcode`) ou inserindo o código do token manualmente.

### 3. Administrador (Admin)
- **Painel Principal:** `AdminDashboard.tsx`.
- **Capacidades:**
    - Ter uma **visão global** do ecossistema com um painel de estatísticas gerais.
    - Realizar o gerenciamento completo (CRUD - Criar, Ler, Atualizar, Deletar) de **todas as lojas e todos os usuários** do sistema.

## Aspectos Técnicos Relevantes

- **Backend Simulado:** O projeto utiliza um "backend em memória" (`services/backend.ts`) que simula um banco de dados e APIs. Isso permite prototipar toda a lógica de negócios (regras, limites, etc.) sem um servidor real. Inclui também uma simulação de cache (`CacheService.ts`) para otimização.
- **Segurança Simulada:** O fluxo de validação do QR Code é protegido por um token assinado digitalmente (HMAC SHA-256) com prazo de validade. Essa verificação é simulada no lado do cliente (`services/security.ts`), uma abordagem eficaz para prototipagem.
- **Design e UI:** A interface é moderna e temática (suporta temas claro e escuro), construída com Tailwind CSS e CSS Variables. A experiência do usuário é aprimorada com animações e micro-interações, como o efeito 3D nos cartões de cupom.
- **Stack Principal:**
    - **Frontend:** React 19, TypeScript.
    - **Build Tool:** Vite.
    - **Estilização:** Tailwind CSS.
    - **Dependências Notáveis:** `html5-qrcode` para o scanner, `@supabase/supabase-js` para futura integração de backend.
- **Visão de Futuro:** O projeto está claramente preparado para evoluir. O documento `Atualizações.Md` e a inclusão da dependência do Supabase indicam um plano para substituir os serviços mock por um backend real na nuvem, implementar autenticação segura e adicionar outras funcionalidades avançadas.