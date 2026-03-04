# ShopPerks 🛍️✨

**ShopPerks** é um sistema premium de cupons inter-lojas desenvolvido exclusivamente para funcionários de shopping centers. O aplicativo promove a economia circular dentro do shopping, permitindo que funcionários de uma loja aproveitem descontos exclusivos em outras lojas parceiras.

## 🚀 Funcionalidades

O sistema é dividido em três perfis de acesso, cada um com funcionalidades específicas:

### 👤 Funcionário (Employee)
- **Visualização de Cupons:** Acesso a uma lista de ofertas exclusivas de diversas lojas.
- **Carteira Digital:** Gerenciamento de cupons ativos.
- **Resgate via QR Code:** Geração de QR Code dinâmico para validação do desconto no caixa.
- **Histórico:** Visualização de cupons já utilizados.

### 🏪 Gerente de Loja (Manager)
- **Validação de Cupons:** Scanner de QR Code integrado (utilizando a câmera do dispositivo) para validar descontos em tempo real.
- **Histórico de Vendas:** Registro de todos os cupons validados na sua loja.

### 🛠️ Administrador (Admin)
- **Gestão de Lojas:** Cadastro e edição de lojas parceiras.
- **Gestão de Usuários:** Controle de acesso de funcionários e gerentes.
- **Gestão de Cupons:** Criação de campanhas e ofertas.
- **Dashboard:** Visão geral do sistema.

## 🎨 Design & UI

- **Interface Moderna:** Design fluido com estética "Glassmorphism" (efeito de vidro).
- **Temas:** Suporte a múltiplos temas visuais (Dark Gunmetal, Emerald Light, Indigo Light).
- **Responsividade:** Totalmente adaptado para dispositivos móveis e desktop.
- **Animações:** Transições suaves e micro-interações para uma experiência de usuário premium.

## 🤖 Inteligência Artificial

- **Precificação Dinâmica:** O sistema simula o uso de IA para enriquecer os cupons com precificação dinâmica e insights personalizados (simulado via `AIService`).

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Leitura de QR Code:** [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- **Ícones:** SVG Icons personalizados.

## 📦 Instalação e Execução

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/shopperks.git
   cd shopperks
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse o aplicativo:**
   Abra seu navegador em `http://localhost:3000`.

## 🔐 Credenciais de Teste (Simulação)

O sistema utiliza um backend simulado (`services/backend.ts`) com os seguintes usuários pré-cadastrados para teste:

- **Admin:** `admin@shopping.com` (Senha: qualquer uma)
- **Gerente:** `manager@nike.com` (Senha: qualquer uma)
- **Funcionário:** `joao@zara.com` (Senha: qualquer uma)

---

Desenvolvido com ❤️ para modernizar a experiência de benefícios em shoppings.
