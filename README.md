# Neto STP

Loja online de produtos de São Tomé e Príncipe (comida, artesanato, tecidos e mais) para clientes em Portugal.

Especificação completa do produto em [`lojastp.md`](../lojastp.md) e plano de execução em [`passos.md`](../passos.md) (na raiz do repositório, um nível acima desta pasta).

## Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, React, Tailwind CSS, shadcn/ui
- **Backend**: Server Actions, Route Handlers e API Routes do Next.js
- **Base de dados**: PostgreSQL (Neon) + Prisma ORM (com `@prisma/adapter-pg`, ligação TCP standard — compatível com Neon e com Postgres local)
- **Autenticação admin**: Auth.js v5 (`next-auth`), provider Credentials, sessão JWT
- **Validação**: Zod
- **Pagamentos**: Stripe Checkout
- **Imagens**: Cloudinary
- **Emails**: Brevo (o plano original previa Resend; trocado a pedido explícito no Passo 7)
- **Deploy**: Vercel

> Este projeto está atualmente no **Passo 7** do plano (`passos.md`): upload de imagens (Cloudinary) e emails transacionais (Brevo).

## Como instalar

```bash
npm install
```

O `postinstall` corre automaticamente `prisma generate`.

## Como configurar o ambiente

1. Copiar o ficheiro de exemplo:

   ```bash
   cp .env.example .env
   ```

2. Preencher `DATABASE_URL` com a connection string do teu projeto [Neon](https://neon.tech) (formato `postgresql://...`).

   Para desenvolvimento local sem Neon, também podes usar `npx prisma dev` (Postgres local do próprio Prisma, sem Docker) e copiar a `DATABASE_URL` que o comando imprime.

3. Gerar `AUTH_SECRET`:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. Definir `ADMIN_EMAIL` e `ADMIN_PASSWORD` — são usados pelo seed (`npx prisma db seed`) para criar o utilizador administrador com password já cifrada (bcryptjs). É essa a conta usada para entrar em `/admin/login`.

5. Preencher `STRIPE_SECRET_KEY` e `NEXT_PUBLIC_STRIPE_KEY` com as chaves de teste da tua conta Stripe ([dashboard.stripe.com/test/apikeys](https://dashboard.stripe.com/test/apikeys)). Sem isto, a loja funciona normalmente mas o botão "Pagar com Stripe" falha com um erro claro no ecrã.

6. Para testar o pagamento e o webhook localmente, instala a [Stripe CLI](https://docs.stripe.com/stripe-cli) e corre, num terminal à parte:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   Copia o `whsec_...` que o comando imprime para `STRIPE_WEBHOOK_SECRET` no `.env`. Usa um [cartão de teste](https://docs.stripe.com/testing#cards) do Stripe (ex: `4242 4242 4242 4242`, qualquer data futura e CVC) para simular o pagamento.

7. Preencher `CLOUDINARY_NAME`, `CLOUDINARY_KEY` e `CLOUDINARY_SECRET` com os dados da tua conta [Cloudinary](https://console.cloudinary.com). Sem isto, o upload de imagem no admin falha com um erro claro — continua a ser possível colar uma URL de imagem manualmente.

8. Preencher `BREVO_API_KEY` com a chave da tua conta [Brevo](https://app.brevo.com/settings/keys/api) e `EMAIL_FROM` com um remetente **verificado** nessa conta. Sem isto, a compra continua a funcionar normalmente — só o envio de emails falha silenciosamente (fica registado nos logs do servidor, não interrompe o checkout).

9. (Opcional) `COMMISSION_RATE` — percentagem que a plataforma fica de cada venda de um fornecedor (ex: `10` = 10%). Por omissão é 10 se não definida.

## Como correr localmente

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

Outros comandos úteis:

```bash
npm run build   # build de produção
npm run start   # correr a build de produção
npm run lint    # linting
```

Comandos Prisma:

```bash
npx prisma migrate dev   # criar/aplicar migrations em desenvolvimento
npx prisma db seed       # popular a base de dados com produtos de exemplo
npx prisma studio        # explorar a base de dados
```

## Painel Admin

Aceder a [http://localhost:3000/admin](http://localhost:3000/admin) — redireciona para `/admin/login`. Usa as credenciais definidas em `ADMIN_EMAIL`/`ADMIN_PASSWORD` (criadas pelo seed).

Depois de autenticado:

- `/admin/dashboard` — número de produtos, encomendas, total vendido, stock baixo
- `/admin/produtos` — listar, criar, editar e eliminar produtos
- `/admin/categorias` — listar, criar e editar categorias (sem eliminar, para não partir produtos que já as referenciam)
- `/admin/encomendas` — listar encomendas; `/admin/encomendas/[id]` mostra os dados completos do cliente (nome, email, telefone, morada) e os produtos, e permite mudar o estado (dispara o email de atualização para o cliente)
- `/admin/fornecedores` — aprovar/rejeitar candidaturas de vendedores e marcar pedidos de levantamento como pagos

## Loja pública

- `/` — homepage (banner, história, categorias, produtos em destaque)
- `/loja` — listagem de produtos, com pesquisa (`?q=`), filtro por categoria (`?categoria=`) e ordenação por preço (`?sort=price-asc|price-desc`)
- `/produto/[slug]` — página de produto
- `/carrinho` — carrinho de compras
- `/checkout` — resumo da encomenda e botão de pagamento
- `/sucesso` — confirmação após pagamento

## Carrinho

Estado guardado em `localStorage` (chave `stp-market-cart`), gerido por `CartProvider`/`useCart` (`hooks/use-cart.tsx`) e montado no layout da loja pública. Permite adicionar (da listagem ou da página de produto), alterar quantidade, remover e calcular o total.

## Pagamentos (Stripe)

Fluxo: `/carrinho` → `/checkout` (resumo da encomenda) → Stripe Checkout (hospedado pela Stripe, recolhe morada de envio para Portugal, telefone e pagamento) → `/sucesso`.

- `lib/stripe.ts` — cliente Stripe criado de forma preguiçosa (`getStripe()`), só falha se realmente for usado sem `STRIPE_SECRET_KEY` configurada.
- `app/(loja)/checkout/actions.ts` — Server Action que valida o carrinho com Zod, **recalcula os preços a partir da base de dados** (nunca confia no preço vindo do cliente) e cria a Checkout Session.
- `app/api/stripe/webhook/route.ts` — recebe `checkout.session.completed`, cria `Customer`, `Order` (status `PAID`) e `OrderItem`s, e reduz o stock dos produtos. Idempotente: `Order.stripePaymentId` é único, por isso reentregas do mesmo evento (comportamento normal do Stripe) não duplicam a encomenda.
- `/sucesso` — mostra a confirmação (email e total, se a sessão for válida) e limpa o carrinho.

## Imagens (Cloudinary)

No formulário de produto do admin (`/admin/produtos/novo` e `/admin/produtos/[id]/editar`), o campo "Imagem do produto" permite escolher um ficheiro — é enviado para o Cloudinary a partir do servidor (`uploadProductImage`, nunca com as credenciais expostas no browser) para a pasta `stp-market/produtos`. Existe sempre uma alternativa de colar a URL da imagem manualmente, útil sem conta Cloudinary configurada.

## Emails (Brevo)

- **Cliente** — confirmação da compra, disparada automaticamente pelo webhook do Stripe depois de criar a encomenda (`orderConfirmationEmail`)
- **Admin** — aviso de nova encomenda para `ADMIN_EMAIL`, com nome, email, telefone e **morada completa** do cliente e a lista de produtos, para preparar o envio (`newOrderAdminEmail`)
- **Cliente** — atualização do estado da encomenda (`orderStatusUpdateEmail`), disparada quando o estado é alterado em `/admin/encomendas/[id]`

Falhas no envio de email nunca bloqueiam o checkout nem a mudança de estado — ficam apenas registadas nos logs do servidor.

## Marketplace de vendedores

Loja única — os produtos dos vendedores aparecem misturados com os do admin no mesmo catálogo (`/loja`), sem mini-lojas. Não usa Stripe Connect: o checkout continua a ser um único pagamento, e o admin paga os vendedores manualmente por fora (transferência bancária).

- `/torna-te-vendedor` — candidatura pública (nome, email, password, telefone). Fica "Pendente" até o admin aprovar em `/admin/fornecedores`.
- `/fornecedor/login` — só entra depois de aprovado.
- `/fornecedor/painel` — produtos publicados, total vendido, saldo disponível.
- `/fornecedor/produtos` — CRUD dos produtos do próprio vendedor (o mesmo formulário do admin, reutilizado).
- `/fornecedor/saldo` — saldo disponível, histórico de levantamentos, e formulário para solicitar um levantamento.

Em cada venda de um produto com vendedor, o webhook do Stripe divide automaticamente o valor: o vendedor fica com `preço − comissão`, a comissão fica registada para o admin. A taxa é definida por `COMMISSION_RATE` no `.env` (percentagem única para todos os vendedores).

## Estrutura do projeto

```text
app/            rotas (App Router)
components/     componentes React (inclui components/ui do shadcn)
lib/            utilitários e clientes (prisma.ts, generated/)
hooks/          hooks React
types/          tipos TypeScript partilhados
prisma/         schema.prisma e migrations
```

## Como fazer deploy na Vercel

1. Criar um projeto na [Vercel](https://vercel.com) apontado para este repositório (definir a *root directory* como `stp-market/`, se o repositório incluir a documentação na raiz).
2. Configurar as variáveis de ambiente do projeto na Vercel (as mesmas do `.env`). O `STRIPE_WEBHOOK_SECRET` de produção é diferente do de desenvolvimento — só existe depois de criar o endpoint de webhook no dashboard da Stripe a apontar para `https://<o-teu-domínio>/api/stripe/webhook` (feito no Passo 8, quando já há um domínio).
3. A Vercel corre `npm install` (que gera o Prisma Client via `postinstall`) e depois `npm run build` automaticamente.
4. Garantir que as migrations da base de dados Neon estão aplicadas antes ou durante o deploy (`npx prisma migrate deploy`).

Guia detalhado de deploy será expandido no Passo 8.
