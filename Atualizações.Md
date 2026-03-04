# 🚀 Plano de Atualizações e Inovações - ShopPerks

Com base na análise do estado atual do projeto e do `README.md`, este documento lista sugestões estratégicas para elevar o nível da aplicação, focando em robustez, engajamento e tecnologia de ponta.

## 🛠️ 10 Melhorias Sugeridas

Estas melhorias visam transformar o protótipo atual em um produto de produção robusto e escalável.

1.  **Persistência de Dados Real (Supabase/Firebase)**
    *   **Atual:** Dados são mockados em memória (`services/backend.ts`) e perdidos ao recarregar.
    *   **Sugestão:** Integrar com Supabase ou Firebase para persistência real de usuários, lojas e transações, permitindo histórico confiável.

2.  **Autenticação e Autorização Segura**
    *   **Atual:** Login simulado sem validação criptográfica.
    *   **Sugestão:** Implementar autenticação via JWT ou OAuth (Google/Apple) e proteger rotas com *Route Guards* reais baseados nos perfis (RBAC).

3.  **Transformação em PWA (Progressive Web App)**
    *   **Atual:** Aplicação web padrão.
    *   **Sugestão:** Configurar Service Workers e Manifesto para permitir instalação no celular, funcionamento offline básico e ícone na home screen, essencial para uso rápido por funcionários no shopping.

4.  **Sistema de Notificações Push**
    *   **Atual:** Nenhuma notificação.
    *   **Sugestão:** Implementar Web Push Notifications para alertar funcionários sobre novos cupons ("Oferta Relâmpago na Nike!") ou lembrar da expiração de cupons salvos.

5.  **Dashboard de Analytics com Gráficos (Recharts)**
    *   **Atual:** Listas simples de histórico.
    *   **Sugestão:** Adicionar gráficos visuais para Gerentes e Admins visualizarem tendências de resgate, horários de pico e performance das campanhas.

6.  **Gamificação para Funcionários**
    *   **Atual:** Apenas uso funcional de cupons.
    *   **Sugestão:** Criar um sistema de níveis ou "badges" (ex: "Economizador Master", "Explorador de Lojas") para incentivar o uso recorrente e a circulação entre lojas.

7.  **Testes Automatizados (Vitest & Playwright)**
    *   **Atual:** Sem testes documentados.
    *   **Sugestão:** Implementar testes unitários para regras de negócio (ex: validação de cupom) e testes E2E para garantir que o fluxo de resgate via QR Code não quebre.

8.  **Acessibilidade (a11y) Aprimorada**
    *   **Atual:** Foco visual (Glassmorphism).
    *   **Sugestão:** Garantir contraste adequado (WCAG), navegação completa por teclado e suporte a leitores de tela (ARIA labels), tornando o app inclusivo para todos os funcionários.

9.  **Busca e Filtragem Avançada**
    *   **Atual:** Listagem simples.
    *   **Sugestão:** Adicionar barra de busca global e filtros por categoria (Alimentação, Vestuário, Serviços) e ordenação por "Maior Desconto" ou "Mais Próximos".

10. **Feedback e Avaliação de Experiência**
    *   **Atual:** Apenas validação binária (usado/não usado).
    *   **Sugestão:** Permitir que o funcionário avalie o atendimento na loja parceira após o uso do cupom (1-5 estrelas), gerando métricas de qualidade para os gerentes.

---

## 💡 2 Inovações (Diferenciais Competitivos)

Estas inovações utilizam tecnologias emergentes para criar um fator "Uau" e utilidade real.

### 1. Geração de Campanhas com IA Generativa (Gemini API Real)
*   **Conceito:** Em vez de apenas simular preços, integrar a API real do Google Gemini para auxiliar os Gerentes de Loja.
*   **Como funcionaria:** O gerente tira uma foto de um produto (ex: um tênis) e a IA automaticamente:
    1.  Identifica o produto.
    2.  Gera um título criativo e uma descrição persuasiva para o cupom.
    3.  Sugere uma porcentagem de desconto baseada em tendências (se conectado a dados externos).
*   **Valor:** Reduz o atrito para criar novas ofertas e aumenta a qualidade do copy de vendas.

### 2. Geolocalização Indoor e "Radar de Ofertas"
*   **Conceito:** Utilizar a API de Geolocalização do navegador (ou beacons bluetooth em uma versão futura) para ordenar os cupons pela distância física do usuário dentro do shopping.
*   **Como funcionaria:** Uma aba "Perto de Mim" que mostra, em tempo real, quais lojas ao redor do funcionário têm cupons ativos. Se ele estiver na praça de alimentação, os cupons de sobremesa aparecem no topo.
*   **Valor:** Aumenta a conversão por conveniência e impulso, aproveitando o contexto físico do usuário.
