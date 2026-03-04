# Guia de Criação: ShopPerks com Gemini Code Assist

Este documento contém um roteiro de prompts (instruções) projetado para recriar o aplicativo **ShopPerks** utilizando o **Gemini Code Assist** dentro do VSCode.

Siga a ordem dos passos abaixo para garantir que o contexto seja construído corretamente.

---

## Passo 0: Leitura do Contexto
**Prompt:**
> Leia o arquivo `README.md` para entender o propósito, as funcionalidades e a stack tecnológica do projeto "ShopPerks".
> Confirme quando tiver entendido o contexto geral do aplicativo.

## Passo 1: Contexto Inicial e Configuração
**Prompt:**
> Atue como um Engenheiro de Software Sênior especialista em React, TypeScript e Tailwind CSS.
>
> Vamos criar uma aplicação chamada "ShopPerks". É um sistema de cupons para funcionários de shopping.
> O sistema deve usar **Vite**, **React 19**, **TypeScript** e **Tailwind CSS**.
>
> **Estrutura de Pastas Desejada:**
> - `/components`: Para componentes React.
> - `/services`: Para lógica de negócios e simulação de backend.
> - `/types`: Para definições de tipos TypeScript.
>
> Por favor, comece criando o arquivo `types.ts` definindo as interfaces para:
> - `User` (id, name, email, role: 'admin' | 'manager' | 'employee', storeId?)
> - `Store` (id, name, category, logoUrl?)
> - `Coupon` (id, title, description, discountValue, storeId, validUntil)
> - `Redemption` (id, couponId, userId, status: 'PENDING' | 'USED', code)

## Passo 2: Serviço de Backend Simulado
**Prompt:**
> Agora, crie um arquivo `services/backend.ts`.
> Este serviço deve simular um banco de dados local usando dados estáticos (mock data).
>
> **Requisitos:**
> 1. Crie arrays estáticos para `users`, `stores` e `coupons`.
> 2. Implemente métodos assíncronos (simulando delay de rede) para:
>    - `login(email, password)`
>    - `getCoupons()`
>    - `getStores()`
>    - `redeemCoupon(couponId, userId)`
>    - `validateCoupon(redemptionId)`
> 3. Adicione alguns dados de exemplo (um admin, um gerente da Nike, um funcionário da Zara).

## Passo 3: Configuração do Tailwind e Estilos Globais
**Prompt:**
> Configure a estilização do projeto.
>
> 1. Crie um arquivo `index.css` configurando o Tailwind CSS.
> 2. Adicione variáveis CSS para suportar temas (cores primárias, fundo, texto).
> 3. Crie classes utilitárias para um efeito "Glassmorphism" (painéis de vidro translúcido), pois essa será a identidade visual do app.
> 4. Atualize o `tailwind.config.js` (ou a configuração via script) para estender as cores usando essas variáveis CSS.

## Passo 4: Componentes de UI Básicos
**Prompt:**
> Crie componentes reutilizáveis na pasta `/components`:
>
> 1. `LoginScreen.tsx`: Um formulário de login bonito, centralizado, com efeito de vidro.
> 2. `CouponCard.tsx`: Um card para exibir os detalhes do cupom (título, desconto, loja). Deve ter um botão de ação.
> 3. `Modal.tsx`: Um componente de modal genérico com backdrop e animação de entrada.

## Passo 5: Dashboards por Perfil
**Prompt:**
> Vamos implementar as telas principais baseadas no perfil do usuário. Crie os seguintes arquivos em `/components`:
>
> 1. `EmployeeDashboard.tsx`:
>    - Lista todos os cupons disponíveis.
>    - Ao clicar em um cupom, abre um Modal com um QR Code (use uma biblioteca ou placeholder para o QR Code).
>
> 2. `ManagerDashboard.tsx`:
>    - Deve ter uma área para escanear QR Codes.
>    - Use a biblioteca `html5-qrcode` para implementar o scanner.
>    - Exiba uma lista de validações recentes.
>
> 3. `AdminDashboard.tsx`:
>    - Uma tabela simples para listar e adicionar Lojas e Usuários.

## Passo 6: Integração Principal (App.tsx)
**Prompt:**
> Agora vamos montar tudo no `App.tsx`.
>
> 1. Gerencie o estado global de `user` (usuário logado).
> 2. Se não houver usuário, mostre o `LoginScreen`.
> 3. Se houver usuário, renderize o Dashboard correspondente ao `user.role` (Admin, Manager ou Employee).
> 4. Adicione um Navbar no topo com o logo "ShopPerks", botão de logout e um seletor de temas (Dark, Emerald, Indigo).
> 5. Use o `BackendService` para carregar os dados iniciais.

## Passo 7: Refinamento e IA
**Prompt:**
> Para finalizar, crie um arquivo `services/ai.ts`.
>
> Simule uma função `enrichCouponsWithDynamicPricing` que recebe a lista de cupons e "ajusta" os valores ou adiciona tags como "Hot Deal" baseada em regras aleatórias, simulando uma IA de precificação.
>
> Integre isso no `App.tsx` para que os cupons carregados passem por esse serviço antes de serem exibidos.

---

**Dica para o Desenvolvedor:** Ao usar o Gemini Code Assist, você pode copiar e colar esses prompts sequencialmente. Se o Gemini gerar código incompleto, peça: *"Continue o código anterior"* ou *"Mostre o arquivo completo"*.
