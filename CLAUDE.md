# Neto STP — Guia de Instruções do Projeto

Este ficheiro é o guia de trabalho para desenvolver a **Neto STP** (nome do projeto no código/repositório: STP Market; nome anterior: Neto Sabores), uma loja online de produtos de São Tomé e Príncipe — comida, artesanato, tecidos e um pouco de tudo — para clientes em Portugal. Especificação completa em [lojastp.md](lojastp.md), plano de execução passo a passo em [passos.md](passos.md).

## Como trabalhar neste projeto

- Seguir os passos de `passos.md` **pela ordem definida** (Passo 1 → Passo 8). Não avançar passos sem confirmação do utilizador.
- Em cada passo, implementar **apenas** o que esse passo pede. O Passo 1, por exemplo, é só fundação — não criar funcionalidades de loja, carrinho ou pagamentos antes de tempo.
- Antes de avançar para o próximo passo, confirmar com o utilizador que o atual está concluído e testado.
- Atualizar a secção "Progresso" abaixo à medida que os passos forem concluídos.

## Stack obrigatória

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, React, Tailwind CSS, shadcn/ui |
| Backend | Server Actions, Route Handlers, API Routes do próprio Next.js |
| Base de dados | PostgreSQL (Neon) + Prisma ORM |
| Pagamentos | Stripe Checkout |
| Imagens | Cloudinary |
| Emails | Brevo |
| Validação | Zod |
| Deploy | Vercel |

## Convenções e decisões técnicas

- **Hashing de password**: usar `bcryptjs` (não `bcrypt`) — evita problemas de build/native bindings em ambiente serverless/edge da Vercel.
- **Autenticação admin**: Auth.js v5 (`next-auth@beta`) com provider Credentials (email/password, bcryptjs), sessão JWT. Config dividida em `auth.config.ts` (edge-safe, usado pelo `middleware.ts`) e `auth.ts` (config completa com Prisma/bcrypt, usado no route handler e nas Server Components/Actions) — evita bundlar Prisma/bcrypt no runtime edge do middleware. Rotas `/admin/*` protegidas pelo `middleware.ts`; `/admin/login` fica fora do route group `(painel)` para não herdar o layout com sidebar.
- **shadcn/ui**: este projeto usa o estilo `base-nova` (assente em `@base-ui/react`, não Radix). Para renderizar outro elemento dentro de `Button`/`AlertDialogTrigger`/etc. usar a prop `render={<Link ... />}` (+ `nativeButton={false}` quando o alvo não é um `<button>`), **não** `asChild` (isso é Radix).
- **Prisma**: ligação sempre via singleton em `lib/prisma.ts` para evitar múltiplas conexões em desenvolvimento. Usa Prisma 7 com o driver adapter `@prisma/adapter-pg` (ligação TCP standard) — funciona com a connection string direta da Neon e com Postgres local; evitar `@prisma/adapter-neon` (driver websocket) a menos que se corra em runtime edge.
- **Validação**: todos os inputs (formulários, API routes, server actions) devem passar por schemas Zod.
- **Segurança**: nunca expor chaves privadas no cliente; variáveis sensíveis só em `.env` (nunca commitadas); rotas `/admin` sempre protegidas por middleware/verificação de sessão.
- **Carrinho**: estado inicial em `localStorage` (sem backend), preparado para evoluir depois.
- **Route groups**: a loja pública vive em `app/(loja)/` (layout com Navbar+Footer) e o admin autenticado em `app/admin/(painel)/` (layout com sidebar); `admin/login` fica fora do grupo `(painel)`. Os parênteses não afetam os URLs finais (`/`, `/loja`, `/admin/dashboard`, etc.). `checkout` e `sucesso` também vivem em `app/(loja)/` porque precisam do `CartProvider` montado nesse layout.
- **Stripe**: cliente criado de forma preguiçosa em `lib/stripe.ts` (`getStripe()`, não uma instância a nível de módulo) — instanciar `new Stripe(...)` no topo do módulo falha o build (`next build` importa as rotas para recolher metadados) sempre que `STRIPE_SECRET_KEY` estiver vazio, como acontece em desenvolvimento sem conta Stripe configurada. Preços dos line items do Checkout Session são sempre recalculados a partir da BD no servidor (nunca confiar no preço que vem do carrinho/cliente). `Order.stripePaymentId` tem constraint `@unique` para o webhook ser idempotente em reentregas do mesmo evento.
- **Páginas públicas com dados da BD**: usar `export const dynamic = "force-dynamic"` (ex: homepage) em vez de deixar o Next pré-renderizar estaticamente no build — evita falhas de build se a BD estiver indisponível nesse momento e garante stock/preços sempre atuais. Páginas com `searchParams` (ex: `/loja`) já são dinâmicas automaticamente.
- **Emails**: usar **Brevo** (pedido explícito do utilizador no Passo 7, substitui o Resend previsto em `lojastp.md`/`passos.md`). Chamada direta à REST API da Brevo (`lib/email/brevo.ts`, `fetch` para `api.brevo.com`) em vez de instalar o SDK — evita mais um cliente instanciado a nível de módulo (o mesmo problema que já aconteceu com o Stripe) e mantém a dependência mínima. Variável de ambiente: `BREVO_API_KEY`. `EMAIL_FROM` tem de ser um remetente **verificado** na conta Brevo (`GET /v3/senders` confirma quais) — usar um não verificado falha o envio silenciosamente (fica só no log, não bloqueia o checkout). Templates em `lib/email/templates.ts` (layout partilhado: cabeçalho colorido com marca, tabela-resumo com fundo claro, linha de destaque, botão CTA + link alternativo por baixo, despedida, rodapé fora do cartão — pedido explícito do utilizador, seguindo um exemplo de referência), funções de envio em `lib/email/send.ts`; confirmação de compra e aviso ao admin (com morada completa, para preparar o envio) disparados no webhook Stripe após criar a `Order`; email de atualização de estado disparado em `admin/encomendas/[id]` ao mudar o estado. O botão CTA de cada email usa `lib/site-url.ts` (`getSiteUrl`) para montar o link absoluto — lê `NEXT_PUBLIC_APP_URL` se definida, senão usa o `origin` do pedido (Route Handler) ou dos `headers()` (Server Action), com fallback para `localhost:3000`.
- **Cloudinary**: `lib/cloudinary.ts` configura o SDK a nível de módulo (ao contrário do Stripe, `cloudinary.config()` não lança erro com credenciais vazias, só falha quando se tenta mesmo fazer upload — por isso não precisa do padrão "lazy client"). Upload feito no servidor (`uploadProductImage` em `app/admin/(painel)/produtos/actions.ts`, via data URI base64) nunca no cliente, para não expor `CLOUDINARY_SECRET`. O campo de imagem no `ProductForm` mantém sempre um input de URL manual como alternativa ao upload.
- **Base UI `Select` + label não-óbvia**: quando o `value` de um `SelectItem` não é já um texto legível (ex: um enum como `PAID`), passar a função de formatação a `<SelectValue>{(value) => label[value]}</SelectValue>` — a resolução automática da label a partir do texto do `SelectItem` nem sempre acontece antes do primeiro render (ver `components/admin/OrderStatusSelect.tsx`).
- **Gestão de encomendas**: `admin/encomendas` (lista) e `admin/encomendas/[id]` (detalhe: dados completos do cliente + mudar estado) foram adicionados fora da sequência de passos, a pedido direto do utilizador — não estavam em nenhum passo do plano até aqui, mas fecham o ciclo de "admin recebe morada completa e prepara o envio" e dão finalmente um trigger ao email de atualização de estado.
- **Postgres local (`npx prisma dev`) foi abandonado por instabilidade** (histórico, 2026-08-02): ao longo do desenvolvimento, o servidor Postgres local efémero morria silenciosamente com frequência (erros "Server has closed the connection" / P1017 em pedidos normais, mesmo pouco depois de reiniciar o `npm run dev`) — confirmado repetidamente ligando diretamente com `pg.Client` enquanto o Prisma falhava, não era bug da app. Mas o problema mais grave era outro: cada vez que o servidor efémero morria e tinha de ser recriado, **todos os dados eram perdidos** (produtos com fotos reais, contas, etc.), voltando sempre só ao `seed.ts`. Migrado para uma **Neon real** (plano grátis) como base de dados de desenvolvimento — `DATABASE_URL` no `.env` aponta agora para `*.neon.tech`, persistente entre reinícios. `npx prisma dev` já não é usado; se algum dia for preciso voltar a Postgres local, o procedimento de recuperação era: `npx prisma dev stop default` → `npx prisma dev rm default` → `npx prisma dev` → `npx prisma migrate deploy` → `npx prisma db seed` → reiniciar `npm run dev`.

## Estrutura de pastas alvo

```text
stp-market/
├── app/
│   ├── page.tsx
│   ├── loja/page.tsx
│   ├── produto/[slug]/page.tsx
│   ├── carrinho/page.tsx
│   ├── checkout/page.tsx
│   ├── sucesso/page.tsx
│   ├── admin/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── produtos/
│   │   └── encomendas/
│   └── api/
│       └── stripe/webhook/
├── components/
│   ├── ProductCard.tsx
│   ├── CategoryCard.tsx
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── Cart.tsx
├── lib/
│   ├── prisma.ts
│   ├── stripe.ts
│   └── cloudinary.ts
├── hooks/
├── types/
└── prisma/
    └── schema.prisma
```

## Modelos Prisma (resumo)

`User` (admin) · `Category` · `Product` (`vendorId` opcional, `approvalStatus`: PENDING, APPROVED, REJECTED — por omissão APPROVED) · `Customer` (`password` opcional — só definido para quem cria conta; `email` é `@unique`) · `Order` (status: PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED) · `OrderItem` (`vendorId`/`vendorAmount`/`commissionAmount` opcionais) · `Vendor` (status: PENDING, APPROVED, REJECTED) · `WithdrawalRequest` (status: PENDING, PAID)

Campos base (User–OrderItem) detalhados em [lojastp.md](lojastp.md#base-de-dados-prisma); `Vendor`/`WithdrawalRequest` são posteriores a essa especificação, ver secção "Marketplace multi-vendedor" abaixo.

## Progresso

- [x] Passo 1 — Base do projeto (Next.js + Neon + Prisma)
- [x] Passo 2 — Base de dados e modelos
- [x] Passo 3 — Painel Admin
- [x] Passo 4 — Loja pública
- [x] Passo 5 — Carrinho
- [x] Passo 6 — Stripe Checkout
- [x] Passo 7 — Cloudinary + Emails
- [ ] Passo 8 — Deploy Vercel

## Marketplace multi-vendedor

Construído fora da sequência de passos, a pedido direto do utilizador (não estava em nenhum passo do plano original). Concretiza o que `lojastp.md` apontava como "objetivo futuro". Loja única e unificada (produtos de vendedores misturados com os do admin no mesmo catálogo `/loja`, sem mini-lojas); sem Stripe Connect — o checkout continua a ser um único pagamento normal e o pagamento aos vendedores é sempre manual (transferência bancária por fora, marcado como "Pago" no admin).

- **Modelos**: `Vendor` (nome, email, password, telefone, `nif` opcional — obrigatório no formulário de candidatura mas nullable na BD para não quebrar candidaturas antigas, `documentUrl` opcional — upload de CC/passaporte para o Cloudinary, pasta `stp-market/fornecedores-documentos`, visível ao admin em `admin/fornecedores` antes de aprovar, `status`: PENDING/APPROVED/REJECTED), `WithdrawalRequest` (vendorId, amount, `paymentMethod`: IBAN/MBWAY opcional, `paymentDetails` opcional — IBAN ou nº de telemóvel, indicado pelo fornecedor ao pedir o levantamento, visível ao admin em `admin/fornecedores` para fazer a transferência manual, `status`: PENDING/PAID). `Product.vendorId` (opcional — produtos do admin continuam sem vendedor). `OrderItem.vendorId`/`vendorAmount`/`commissionAmount` — snapshot calculado no momento da venda (não recalculado se a taxa de comissão mudar depois).
- **Comissão**: taxa única e global via `COMMISSION_RATE` no `.env` (percentagem, ex: `10` = 10%; por omissão 10 se não definida) — decisão explícita a favor de simplicidade em vez de taxa configurável por vendedor. Calculada em `lib/commission.ts`, aplicada no webhook Stripe (`app/api/stripe/webhook/route.ts`) ao criar cada `OrderItem`.
- **Autenticação do vendedor**: segundo provider Credentials em `auth.ts` com `id: "vendor-credentials"` (distinto do `id: "credentials"` do admin), autentica contra `Vendor` e só permite login com `status === "APPROVED"`. Sessão JWT carrega `role: "VENDOR"` tal como o admin carrega `role: "ADMIN"`. **Armadilha já apanhada**: o `authorized()` do middleware corre em `auth.config.ts` (edge-safe, sem os callbacks `jwt`/`session` completos que só existem em `auth.ts`) — sem um `session()` mínimo também em `auth.config.ts` a copiar `token.role` para `session.user.role`, o middleware nunca vê o role e bloqueia toda a gente mesmo com login correto. Qualquer novo campo de sessão usado em `authorized()` tem de ser espelhado ali.
- **Rotas**: `/torna-te-vendedor` (candidatura pública, dentro de `app/(loja)/` para ter Navbar/Footer) · `/fornecedor/login` · `/fornecedor/(painel)/painel` (dashboard) · `/fornecedor/(painel)/produtos` (CRUD só dos produtos próprios, reutiliza `ProductForm`) · `/fornecedor/(painel)/saldo` (saldo + histórico + pedir levantamento) · `/admin/candidaturas` (só candidaturas PENDING/REJECTED, aprovar/rejeitar) · `/admin/fornecedores` (só fornecedores APPROVED + pedidos de levantamento) · `/admin/fornecedores/[id]` (detalhe: estatísticas — nº encomendas, unidades vendidas, total bruto/líquido —, lista de produtos e lista de encomendas com o estado de cada uma). Candidaturas e fornecedores aprovados foram separados em páginas/nav própria a pedido do utilizador, para não misturar "por decidir" com "já ativos". Middleware protege `/fornecedor/:path*` tal como já protegia `/admin/:path*`.
- **Saldo**: calculado em `lib/vendor-balance.ts` (`getVendorBalance`) — soma `OrderItem.vendorAmount` de encomendas com estado PAID/PROCESSING/SHIPPED/DELIVERED, subtrai `WithdrawalRequest` com estado PENDING ou PAID (um pedido pendente já reserva o valor, evita pedir mais do que o saldo permite).
- **`DeleteProductButton`**: generalizado para aceitar a ação a chamar via prop `onDelete` (antes importava `deleteProduct` do admin diretamente) — permite reutilização entre `admin/produtos` e `fornecedor/produtos`.
- **Migrations sem shadow DB**: quando `prisma migrate dev` falha com o Postgres local efémero (erro recorrente "type already exists" no shadow database — ver `npx prisma dev` nas convenções acima), gerar o SQL com `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` (compara contra a BD real, não contra o histórico de migrations, evitando o shadow DB) e criar a pasta de migration à mão, depois `prisma migrate deploy`.
- **Aprovação de produtos de fornecedor**: `Product.approvalStatus` (PENDING/APPROVED/REJECTED, por omissão APPROVED — produtos criados pelo admin não precisam de revisão). `createVendorProduct` e `updateVendorProduct` (`app/fornecedor/(painel)/produtos/actions.ts`) forçam sempre `PENDING`, incluindo em edições a um produto já aprovado (evita que um vendedor troque o conteúdo depois de aprovado sem nova revisão). Todas as queries públicas de produtos (`/`, `/loja`, `/produto/[slug]`, `checkout/actions.ts`) filtram por `active: true AND approvalStatus: "APPROVED"`. Aprovar/rejeitar em `admin/produtos` (`ProductApprovalActions`, mesmo padrão do `VendorActions` para candidaturas de fornecedor), botões só aparecem quando `approvalStatus === "PENDING"`.

Simulação de referência (comissão de 10%): produto vendido a €37,50 (3 unidades a €12,50) → vendedor fica com €33,75, admin com €3,75.

## Contas de cliente

Construído fora da sequência de passos, a pedido direto do utilizador: comprar exige agora conta de cliente (login/registo), para o cliente poder consultar "as minhas encomendas". Antes, o checkout era sempre convidado (guest) e cada compra criava um `Customer` novo, mesmo repetindo o email.

- **Modelo**: `Customer.password` (opcional) — só definido para quem cria conta; `Customer.email` passou a `@unique` (confirmado sem duplicados na BD antes de aplicar a migration). Compras feitas antes de existir conta (`password` null) podem ser "reclamadas" — registar com o mesmo email associa a password a esse `Customer` existente e ao histórico de encomendas que já lá estava, em vez de criar um registo duplicado.
- **Autenticação**: terceiro provider Credentials em `auth.ts` com `id: "customer-credentials"`, sessão `role: "CUSTOMER"`, `session.user.id` = `Customer.id`. Mesmo padrão dos providers admin/vendedor.
- **`/checkout` exige login**: middleware protege `/checkout/:path*` tal como `/conta/:path*` — sem sessão `CUSTOMER`, redireciona para `/conta/login?callbackUrl=...`. `createCheckoutSession` (`app/(loja)/checkout/actions.ts`) também valida a sessão no servidor (defesa em profundidade, não confia só no middleware) e passa `customer_email` à Stripe Checkout Session — a Stripe bloqueia esse campo como texto fixo em vez de input editável, o que é o comportamento esperado (não é bug).
- **Correção ao mesmo tempo**: o `authorized()` em `auth.config.ts` tinha um bug latente — ao aceder a uma rota protegida sem sessão, o NextAuth redirecionava sempre para o `pages.signIn` global (`/admin/login`), mesmo em `/fornecedor/*` (só não se notava porque ninguém tinha testado visitar `/fornecedor/painel` sem sessão). Corrigido para cada área (`/admin`, `/fornecedor`, `/conta`, `/checkout`) redirecionar explicitamente para o seu próprio login com `Response.redirect`, em vez de depender do `pages.signIn` único.
- **Rotas**: `/conta/login`, `/conta/registar` (públicas, dentro de `app/(loja)/` para Navbar/Footer) · `/conta/encomendas` (lista, protegida) · `/conta/encomendas/[id]` (detalhe, protegida — verifica `order.customerId === session.user.id` antes de mostrar, não basta estar autenticado). `Navbar` mostra "Entrar" ou "As minhas encomendas" consoante a sessão. `useSearchParams` em `/conta/login` e `/conta/registar` precisa de `<Suspense>` a envolver (exigência do App Router).
- **Webhook Stripe agora faz upsert por email** (`app/api/stripe/webhook/route.ts`) em vez de criar sempre um `Customer` novo — assim as encomendas de um cliente autenticado ficam todas ligadas à mesma conta. O `update` do upsert não inclui `password`, por isso nunca apaga a password de uma conta já criada.
- **`OrderStatusTimeline`** (`components/admin/OrderStatusTimeline.tsx`, apesar do nome/pasta "admin") é genérico e reutilizado tal qual em `/conta/encomendas/[id]` para o cliente ver o estado visualmente.
