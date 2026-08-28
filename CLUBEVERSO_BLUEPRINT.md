# CLUBEVERSO — TECHNICAL BLUEPRINT
### A história digital do seu clube.

**Versão:** 1.0 — 28/08/2026  
**Status:** Aprovado para FASE 1 (Fundação)  
**Primeira obra:** Flamengo 1895–2026 — 25 páginas — 10.000 edições — R$49,90 / 2ª por R$39,90  
**Data de fechamento editorial:** 28/08/2026

---

## 1. STACK ESCOLHIDA

| Camada | Escolha | Justificativa |
|---|---|---|
| **Framework Web** | **Next.js 14+ (App Router) + TypeScript 5.5 (strict)** | SSR/SSG, RSC, rotas `/(site)` e `/(admin)`, SEO nativo, middleware, edge-friendly. Padrão de mercado. |
| **UI** | Tailwind CSS 3.4 + shadcn/ui + Radix + Framer Motion | Design premium colecionável sem reinventar acessibilidade. Tokens por clube. |
| **DB** | **PostgreSQL 16** | Transações ACID para reserva de edição, `FOR UPDATE SKIP LOCKED`, constraints. |
| **ORM** | **Prisma 5** | Type-safe, migrations, transaction API, ótimo DX. |
| **Auth** | **NextAuth.js v5 (Auth.js)** | Email + senha (bcrypt) + magic-link opcional, JWT + DB sessions, RBAC. |
| **Pagamentos** | **Abstração `PaymentGateway` → implementação inicial EFI / Mercado Pago PIX** | PIX nativo, webhook assinado, homologação simples. Interface permite trocar sem reescrever domínio. |
| **Armazenamento** | **S3-compatível (AWS S3 / Cloudflare R2)** + presigned URLs | PDF obra-mestre privado, PDFs personalizados temporários, capas, certs. |
| **PDF** | **pdf-lib + @pdf-lib/fontkit** (geração) + `qrcode` lib | Personalização server-side com número/código/QR sem serviço externo. |
| **QR** | `qrcode` (npm) → PNG/SVG | Aponta para `/verificar/[editionCode]` — nunca para arquivo direto. |
| **Email** | **Resend** (ou AWS SES) + react-email | Transacional: compra, presente, recuperação. Fila com retry. |
| **Fila/Jobs** | BullMQ + Redis (prod) / in-memory fallback (dev) | Geração PDF, email, mint NFT assíncrono sem bloquear webhook. |
| **Cache** | Redis (Upstash) para contador e rate-limit | `available` e rate limiting de checkout/verificar. |
| **Validação** | Zod 3 | Contratos API, env, formulários. |
| **Testes** | Vitest + Playwright + Testing Library | Unit, integração (estoque transacional), E2E (PIX webhook). |
| **Infra** | Vercel (frontend) + Neon/Supabase Postgres + Upstash Redis + R2 | Deploy zero-ops, escala automática. Docker Compose para dev local. |
| **Observabilidade** | pino + Sentry + AuditLog table | Logs estruturados, exceções, auditoria imutável. |
| **Blockchain (fase 8)** | Abstração `NFTService` → Polygon (inicial) | `NFT_ENABLED=false` por padrão. ERC-721, metadata em IPFS (Pinata) + fallback R2. |

**Decisões documentadas (ADR):**
- ADR-001: Postgres > Mongo — integridade de `edition_number` único e estoque.
- ADR-002: Prisma > Drizzle — produtividade + type-safety, transações interativas.
- ADR-003: pdf-lib > Puppeteer — geração determinística, sem Chromium em lambda.
- ADR-004: Abstração de gateway/neft — não acoplar a um fornecedor.

---

## 2. ARQUITETURA GERAL

```
[Browser / Mobile] 
   ↓ HTTPS
[Vercel Edge Middleware] — rate limit, auth, locale
   ↓
[Next.js App Router]
   ├─ (site) / /continentes /pais /liga /clubes/[slug] /obra/[slug] /verificar/[code] /minha-colecao
   ├─ (checkout) /comprar /checkout /checkout/pix/[orderId]
   ├─ (api) /api/auth /api/orders /api/webhooks/pix /api/editions /api/verify /api/admin/*
   └─ (admin) /admin — RBAC: ADMIN only
   ↓
[Service Layer] — domínio puro, sem Next.js
   ├─ CatalogService (Continent→Work)
   ├─ InventoryService (atomic reservation)
   ├─ OrderService + PricingService (49,90 / 39,90)
   ├─ PaymentService + PIX gateway adapter
   ├─ EditionService (numbering, codes)
   ├─ CertificateService + QRService
   ├─ PDFService (personalização)
   ├─ GiftService
   ├─ EmailService
   ├─ NFTService (feature-flagged)
   ├─ RightsService (ContentAsset + RightsRecord)
   └─ AuditService
   ↓
[Prisma] → PostgreSQL (transações)
[Storage] → R2/S3
[Queue] → Redis/BullMQ
[External] → PIX gateway, Resend, (futuro) Polygon/IPFS
```

**Princípios:**
- Domain-driven: entidades genéricas (`Club`, `Work`, `Edition`) — zero código `if (club === 'flamengo')`.
- Feature flags: `NFT_ENABLED`, `PAYMENT_PROVIDER`, `STORAGE_PROVIDER` via `env`.
- Idempotência em webhooks e mint.
- Nunca confiar no frontend para confirmar pagamento.

---

## 3. ESTRUTURA DE PASTAS

```
clubverso/
├── app/
│   ├── (site)/
│   │   ├── page.tsx                          # Home — CLUBEVERSO hero + Escolha seu clube
│   │   ├── continentes/page.tsx
│   │   ├── pais/[countrySlug]/page.tsx
│   │   ├── liga/[leagueSlug]/page.tsx
│   │   ├── clubes/[clubSlug]/page.tsx        # Identidade visual por clube
│   │   ├── obra/[workSlug]/page.tsx          # Página produto — capa, preço, contador
│   │   ├── verificar/[editionCode]/page.tsx  # Autenticação pública
│   │   ├── minha-colecao/page.tsx            # Protegida
│   │   └── presente/page.tsx
│   ├── (checkout)/
│   │   ├── comprar/page.tsx
│   │   └── checkout/
│   │       ├── page.tsx
│   │       └── pix/[orderId]/page.tsx        # QR + copia-e-cola + polling
│   ├── (admin)/
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── clubes/page.tsx
│   │       ├── obras/page.tsx
│   │       ├── edicoes/page.tsx
│   │       ├── pedidos/page.tsx
│   │       ├── direitos/page.tsx
│   │       └── audit/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── orders/route.ts
│   │   ├── webhooks/pix/route.ts             # POST — validação assinatura
│   │   ├── verify/[code]/route.ts
│   │   ├── editions/route.ts
│   │   └── admin/** 
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/            # shadcn: button, card, dialog, etc.
│   ├── site/          # Header, Footer, ClubCard, ContinentNav, PriceBox, Counter, Hero
│   ├── checkout/      # Cart, PixQR, PixCopyPaste
│   ├── collection/    # EditionCard, CertificateView, QRView
│   └── admin/         # DataTables, InventoryPanel
├── lib/
│   ├── prisma.ts
│   ├── env.ts         # zod validation de process.env
│   ├── auth.ts        # Auth.js config + RBAC
│   ├── pricing.ts     # Regra 49.90 / 39.90
│   ├── edition-code.ts# FLA-2026-DIG-00001
│   ├── qr.ts
│   ├── pdf.ts
│   ├── storage.ts     # S3/R2 abstraction + presigned URL
│   ├── email.ts
│   ├── payments/
│   │   ├── gateway.ts        # interface PaymentGateway
│   │   ├── efi-adapter.ts
│   │   └── mercadopago-adapter.ts
│   ├── nft/
│   │   ├── nft-service.ts    # NFTService abstraction
│   │   └── polygon-adapter.ts
│   ├── security.ts    # rateLimit, csrf, headers
│   └── audit.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts        # Continentes, Brasil, Brasileirão, Flamengo, Work Flamengo 1895-2026
│   └── migrations/
├── jobs/
│   ├── queue.ts
│   ├── workers/
│   │   ├── pdf-worker.ts
│   │   ├── email-worker.ts
│   │   └── nft-worker.ts
│   └── cron.ts
├── emails/
│   ├── OrderConfirmed.tsx
│   ├── GiftReceived.tsx
│   └── CertificateReady.tsx
├── public/
│   ├── covers/        # capa Flamengo (placeholder → ilustração original)
│   └── brand/
├── tests/
│   ├── unit/
│   ├── integration/   # inventory, webhook idempotency
│   └── e2e/           # Playwright
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
└── CLUBEVERSO — TECHNICAL BLUEPRINT.md
```

---

## 4. BANCO DE DADOS — DIAGRAMA & ENTIDADES

### 4.1 ER — visão hierárquica

```
Continent 1—N Country 1—N League 1—N Club 1—N Work 1—N Edition
                                           Work 1—N WorkPage (25)
Club — RightsRecord / LicensingStatus
Work — ContentAsset — RightsRecord
Order 1—N OrderItem N—1 Edition (nullable até atribuição)
Order 1—1 Payment
Edition 1—1 Certificate
Edition 1—1 NFTAsset (opcional)
User 1—N Order, 1—N Edition (owner), 1—N Gift (sender/recipient)
Gift 1—1 Edition + OrderItem
AuditLog (polimórfico)
```

### 4.2 Schema Prisma (resumo — ver prisma/schema.prisma para DDL completo)

```prisma
model Continent { id String @id; slug String @unique; name String; countries Country[] }
model Country   { id String @id; slug String @unique; name String; continentId String; continent Continent @relation(...); leagues League[] }
model League    { id String @id; slug String @unique; name String; countryId String; country Country @relation(...); clubs Club[] }

model Club {
  id               String   @id @default(cuid())
  slug             String   @unique // flamengo
  name             String   // Clube de Regatas do Flamengo
  shortCode        String   @unique // FLA
  countryId        String
  leagueId         String
  primaryColor     String?  // #C3281E
  secondaryColor   String?  // #000000
  licensingStatus  LicensingStatus @default(NOT_VERIFIED) // enum: NOT_VERIFIED, IN_REVIEW, AUTHORIZED, LICENSED, RESTRICTED
  isActive         Boolean  @default(true)
  country          Country @relation(fields: [countryId], references: [id])
  league           League  @relation(fields: [leagueId], references: [id])
  works            Work[]
  rightsRecords    RightsRecord[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Work {
  id                String   @id @default(cuid())
  slug              String   @unique // flamengo-1895-2026
  clubId            String
  club              Club @relation(fields: [clubId], references: [id])
  title             String   // Flamengo — 1895–2026
  subtitle          String?
  description       String   @db.Text
  periodStart       Int      // 1895
  periodEnd         Int      // 2026
  version           String   // FLA-2026-V1
  coverImageUrl     String?
  masterPdfUrl      String?  // R2 key privado — obra-mestre (sem personalização)
  totalPages        Int      @default(25)
  maxSupply         Int      @default(10000)
  issuedCount       Int      @default(0) // denormalizado, mas source of truth é count(Edition)
  priceCents        Int      @default(4990) // R$49,90
  secondPriceCents  Int      @default(3990) // R$39,90
  status            WorkStatus @default(DRAFT) // DRAFT, PUBLISHED, SOLD_OUT, ARCHIVED
  editorialClosedAt DateTime? // 2026-08-28
  club              Club @relation(...)
  pages             WorkPage[]
  editions          Edition[]
  contentAssets     ContentAsset[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  @@index([clubId, status])
}

model WorkPage {
  id          String @id @default(cuid())
  workId      String
  work        Work @relation(fields: [workId], references: [id], onDelete: Cascade)
  pageNumber  Int    // 1..25
  title       String // Origem, Primeiros anos...
  slug        String
  contentUrl  String? // imagem ilustrada (R2)
  scriptMd    String? @db.Text
  @@unique([workId, pageNumber])
}

model Edition {
  id              String   @id @default(cuid())
  workId          String
  work            Work @relation(fields: [workId], references: [id])
  editionNumber   Int      // 1..10000
  editionCode     String   @unique // FLA-2026-DIG-00001
  ownerId         String?
  owner           User? @relation(fields: [ownerId], references: [id])
  orderItemId     String? @unique
  orderItem       OrderItem? @relation(fields: [orderItemId], references: [id])
  status          EditionStatus @default(RESERVED) // RESERVED, ASSIGNED, DELIVERED, GIFTED
  certificate     Certificate?
  nftAsset        NFTAsset?
  qrCodeUrl       String?
  personalizedPdfUrl String? // R2 key
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@unique([workId, editionNumber])
  @@index([workId, status])
  @@index([editionCode])
  @@index([ownerId])
}

model Order {
  id              String   @id @default(cuid())
  userId          String?
  user            User? @relation(fields: [userId], references: [id])
  status          OrderStatus @default(PENDING) // PENDING, PAID, FAILED, CANCELLED
  totalCents      Int
  items           OrderItem[]
  payment         Payment?
  gift            Gift?
  customerEmail   String
  customerName    String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model OrderItem {
  id          String @id @default(cuid())
  orderId     String
  order       Order @relation(fields: [orderId], references: [id])
  workId      String
  work        Work @relation(fields: [workId], references: [id])
  priceCents  Int
  isGift      Boolean @default(false)
  edition     Edition?
  gift        Gift?
  @@index([workId])
}

model Payment {
  id                String @id @default(cuid())
  orderId           String @unique
  order             Order @relation(fields: [orderId], references: [id])
  provider          String // EFI, MERCADOPAGO
  providerTxId      String? @unique // idempotência
  pixTxId           String? @unique // txid/endToEndId
  pixQrCode         String? @db.Text
  pixCopyPaste      String? @db.Text
  amountCents       Int
  status            PaymentStatus @default(PENDING) // PENDING, CONFIRMED, FAILED, EXPIRED
  webhookPayload    Json?
  confirmedAt       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  @@index([status])
}

model Certificate {
  id            String @id @default(cuid())
  editionId     String @unique
  edition       Edition @relation(fields: [editionId], references: [id])
  certificateUrl String? // R2 key do PDF cert
  issuedAt      DateTime @default(now())
  data          Json // snapshot: obra, número, código, data fechamento
}

model Gift {
  id              String @id @default(cuid())
  orderId         String @unique
  order           Order @relation(...)
  orderItemId     String @unique
  orderItem       OrderItem @relation(fields: [orderItemId], references: [id])
  editionId       String? @unique
  senderId        String?
  recipientEmail  String
  recipientId     String?
  status          GiftStatus @default(PENDING) // PENDING, SENT, CLAIMED, EXPIRED
  sentAt          DateTime?
  claimedAt       DateTime?
  createdAt       DateTime @default(now())
}

model User {
  id            String @id @default(cuid())
  email         String @unique
  name          String?
  passwordHash  String?
  emailVerified DateTime?
  role          UserRole @default(CUSTOMER) // CUSTOMER, ADMIN
  orders        Order[]
  editions      Edition[]
  createdAt     DateTime @default(now())
}

model NFTAsset {
  id              String @id @default(cuid())
  editionId       String @unique
  edition         Edition @relation(fields: [editionId], references: [id])
  chain           String? // polygon
  contractAddress String?
  tokenId         String?
  metadataUrl     String? // ipfs://...
  explorerUrl     String?
  status          NFTStatus @default(PENDING) // PENDING, MINTED, FAILED
  retryCount      Int @default(0)
  lastError       String? @db.Text
  mintedAt        DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  @@index([status])
}

model ContentAsset {
  id                  String @id @default(cuid())
  workId              String?
  work                Work? @relation(fields: [workId], references: [id])
  assetId             String @unique // ASSET-0001
  name                String
  type                String // ILLUSTRATION, COVER, PAGE, ICON
  source              String? // prompt, autor, banco
  author              String?
  license             String // PROPRIETARY, CC_BY, PUBLIC_DOMAIN, LICENSED
  allowsCommercial    Boolean
  requiresAttribution Boolean
  allowsModification  Boolean
  url                 String?
  verifiedAt          DateTime?
  notes               String? @db.Text
  status              String @default(PENDING) // APPROVED, REJECTED, PENDING
  rightsRecord        RightsRecord?
}

model RightsRecord {
  id                  String @id @default(cuid())
  assetId             String? @unique
  asset               ContentAsset? @relation(fields: [assetId], references: [id])
  clubId              String?
  club                Club? @relation(fields: [clubId], references: [id])
  license             String
  allowsCommercial    Boolean
  requiresAttribution Boolean
  allowsModification  Boolean
  sourceUrl           String?
  verifiedAt          DateTime?
  notes               String? @db.Text
  status              String
}

model AuditLog {
  id          String @id @default(cuid())
  actorId     String?
  actorEmail  String?
  action      String // WORK_CREATED, EDITION_ASSIGNED, PAYMENT_CONFIRMED, etc.
  entity      String // Work, Edition, Order...
  entityId    String?
  metadata    Json?
  ip          String?
  createdAt   DateTime @default(now())
  @@index([action, createdAt])
  @@index([entity, entityId])
}
```

Enums: `LicensingStatus`, `WorkStatus`, `EditionStatus`, `OrderStatus`, `PaymentStatus`, `GiftStatus`, `NFTStatus`, `UserRole`.

Constraints críticas:
- `Edition(workId, editionNumber)` único + `editionCode` único global.
- `Payment.providerTxId` único para idempotência de webhook.
- Check: `Work.issuedCount <= maxSupply` via trigger/função + validação applicativa.

---

## 5. ENTIDADES & RELACIONAMENTOS

Ver item 4 + 36. Entidades genéricas garantem escala para milhares de clubes.

Regra: **nunca** criar tabela `FlamengoEdition`; sempre `Edition` com `workId`.

---

## 6. APIS

### 6.1 Públicas (sem auth ou com auth opcional)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/catalog/continents` | Lista continentes |
| GET | `/api/catalog/countries?continent=america-do-sul` | Países |
| GET | `/api/catalog/leagues?country=brasil` | Ligas |
| GET | `/api/catalog/clubs?league=brasileirao` | Clubes |
| GET | `/api/works/[slug]` | Detalhe obra + `available = maxSupply - count(Edition where workId)` |
| GET | `/api/works/[slug]/availability` | Polling contador real (cache 5s) |
| GET | `/api/verify/[editionCode]` | Dados públicos de autenticação (sem PII) |
| POST | `/api/orders` | Cria pedido 1-2 itens, calcula preço 49,90/39,90, cria Payment PENDING, retorna `orderId` |
| POST | `/api/webhooks/pix` | Webhook gateway — valida assinatura, idempotente, chama `confirmPayment(txId)` |
| GET | `/api/orders/[id]` | Status pedido (polling pós-PIX) |

### 6.2 Autenticadas (customer)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/me/editions` | Minha coleção |
| GET | `/api/me/editions/[code]/download` | Retorna presigned URL (15 min) — valida `ownerId` |
| GET | `/api/me/editions/[code]/certificate` | Presigned cert |
| POST | `/api/gifts/claim` | Resgate de presente por token/email |
| POST | `/api/gifts/send` | Envia presente (cria Gift + dispara email) |

### 6.3 Admin (RBAC ADMIN)

CRUD completo: `Continent, Country, League, Club, Work, WorkPage, ContentAsset, RightsRecord, Order, Edition, Payment, Gift, NFTAsset, AuditLog`. Todas mutações geram `AuditLog`.

**Padrões:** Zod validation, `NextResponse.json`, rate limit por IP (Upstash), `x-request-id`.

---

## 7. AUTENTICAÇÃO

- **Auth.js v5** com adaptador Prisma.
- Providers: Credentials (email+senha bcrypt 12 rounds) + Email (magic link opcional via Resend) — LGPD: coleta mínima.
- Session: JWT (stateless) + DB para revogação; expiração 30d; refresh silencioso.
- RBAC: middleware verifica `role === ADMIN` para `/admin/*` e `/api/admin/*`.
- Senhas nunca logadas, nunca retornadas.
- Recuperação: token único 1h, enviado por email, hash SHA256 armazenado.

---

## 8. PAGAMENTOS — PIX

### 8.1 Fluxo

```
POST /api/orders { items: [{workSlug: flamengo-1895-2026}, {workSlug: palmeiras-...}] }
  → PricingService: item1=4990, item2=3990, total=8980
  → cria Order PENDING + OrderItems + Payment PENDING
  → PaymentGateway.createPixCharge({ amount: 8980, orderId, customerEmail })
     → retorna { pixQrCode, pixCopyPaste, txId, expiresAt }
  → salva em Payment, retorna ao frontend
Frontend: exibe QR + copia-e-cola + polling GET /api/orders/[id] a cada 3s
Cliente paga no banco → Gateway → POST /api/webhooks/pix (assinado)
  → valida assinatura HMAC (secret por gateway)
  → verifica amount === order.totalCents && status === CONFIRMED
  → idempotência: se Payment.providerTxId já existe com CONFIRMED, retorna 200 sem reprocessar
  → transaction: Order→PAID, Payment→CONFIRMED, reserva Editions (ver item 18), cria Certificate+QR, enfileira PDF/email, AuditLog
  → responde 200
Polling detecta PAID → redireciona para /minha-colecao + email disparado
```

### 8.2 Interface

```ts
interface PaymentGateway {
  createPixCharge(input: { orderId: string; amountCents: number; customerEmail: string; expiresInSec?: number }): Promise<{ providerTxId: string; pixQrCode: string; pixCopyPaste: string; expiresAt: Date; raw: unknown }>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  parseWebhook(rawBody: unknown): { providerTxId: string; amountCents: number; status: 'CONFIRMED'|'FAILED'|'PENDING'; pixTxId?: string };
}
```

### 8.3 Segurança

- Secret do webhook em `env.PIX_WEBHOOK_SECRET`, nunca no client.
- Validar `amountCents` exato; rejeitar divergência.
- Timeout de expiração (30 min padrão EFI/Mercado Pago).
- Jobs de expiração: cron a cada 5 min marca Payments expirados.

---

## 9. PIX NA TELA — UX

- Página `/checkout/pix/[orderId]`: valor, status badge (Pendente → Confirmado), QR (200x200), botão Copiar, contador regressivo `expiresAt`, botão "Já paguei? Verificar".
- Polling 3s + fallback SSE/WebSocket opcional.
- Após `PAID`: animação confete + "Pagamento confirmado! Sua edição #4827 foi reservada." + botão "Ver minha coleção".
- Sem confirmação manual: webhook é a única fonte de verdade; polling apenas lê DB.

---

## 10. WEBHOOKS — IDEMPOTÊNCIA & SEGURANÇA

- Assinatura: `HMAC-SHA256(rawBody, secret)` comparado com header `X-Webhook-Signature` (timing-safe).
- `providerTxId` `UNIQUE` → segunda entrega com mesmo id retorna 200 sem efeito.
- Transação serializável para reserva (ver item 18).
- Log completo de `webhookPayload` em `Payment.webhookPayload` + `AuditLog`.
- Retry do gateway (até 5x) é seguro.

---

## 11. GERAÇÃO DE EDIÇÕES — NUMERAÇÃO

- Código: `${club.shortCode}-${work.periodEnd}-DIG-${String(n).padStart(5,'0')}` → `FLA-2026-DIG-00001`.
- Generalizável: `PAL-2026-DIG-00001`, `BAR-2026-DIG-00001` via `Club.shortCode`.
- `work.version`: `FLA-2026-V1` — imutável após publicação; nova versão cria novo `Work`.

---

## 12. CERTIFICADOS

- Gerados automaticamente após `EDITION_ASSIGNED` (worker).
- Template: HTML → PDF via `pdf-lib` (ou `react-pdf` server).
- Conteúdo: logo CLUBEVERSO, título obra, edição `#4827 / 10.000`, código `FLA-2026-DIG-04827`, QR Code apontando para `/verificar/[code]`, data emissão, hash SHA256, assinatura.
- Armazenado em `R2/certs/[editionCode].pdf`, URL presigned para download.
- `Certificate.data` snapshot JSON para auditoria.

---

## 13. QR CODES

- Lib `qrcode` → PNG 512x512.
- Conteúdo: `https://clubverso.com/verificar/FLA-2026-DIG-04827` (env `NEXT_PUBLIC_SITE_URL`).
- Nunca aponta para PDF direto, nem para explorer blockchain.
- Armazenado em `R2/qr/[editionCode].png` + inline no PDF personalizado e certificado.
- Verificação pública sem auth, sem PII.

---

## 14. ARMAZENAMENTO

| Bucket / Prefix | Conteúdo | Acesso |
|---|---|---|
| `works/master/[workSlug].pdf` | Obra-mestre 25 págs (ilustrações originais) | Privado — nunca exposto |
| `editions/[editionCode].pdf` | PDF personalizado (master + capa dados variáveis) | Privado — presigned 15 min |
| `certs/[editionCode].pdf` | Certificados | Privado — presigned |
| `qr/[editionCode].png` | QR codes | Público opcional (CDN) |
| `covers/[workSlug].webp` | Capas | Público CDN |
| `assets/pages/[workSlug]/[page].webp` | Páginas ilustradas | Público ou privado conforme licença |

- Provider: `S3Client` com `endpoint` configurável → funciona com AWS S3 e Cloudflare R2 sem mudar código (`STORAGE_PROVIDER`).
- Upload via `PutObject` server-side; leitura via `GetObject` presigned.

---

## 15. E-MAILS TRANSACIONAIS

- Provider: Resend (SDK) — fallback SES.
- Templates `react-email`:
  - `OrderConfirmed` — "Sua edição está disponível — #4827 / 10.000 — [Ler] [Baixar] [Ver certificado]"
  - `GiftReceived` — "Você recebeu um presente: Flamengo 1895–2026 — [Resgatar]"
  - `CertificateReady`
  - `AccessRecovery`
- Fila BullMQ: retry 3x com backoff exponencial; DLQ para inspeção admin.
- LGPD: apenas `email`, `name` necessário; sem CPF/endereço. Unsubscribe apenas para marketing (transacional sempre envia).

---

## 16. PRESENTES

- Checkout permite `items[1].isGift=true + giftRecipientEmail`.
- `Order` com 2 itens → 2 `Edition`s reservadas; uma com `Gift` vinculado.
- Fluxo:
  1. `GIFT_PENDING` → email para `recipientEmail` com token único (`Gift.claimToken` hash).
  2. Destinatário clica → se já tem conta com mesmo email, vincula `Edition.ownerId`; se não, cria conta convidada e vincula.
  3. Remetente vê em `/minha-colecao` a edição marcada como "Presente enviado".
- `Gift` registra `senderId`, `recipientEmail`, `status`, `sentAt`, `claimedAt` — sem expor dados do comprador além do nome opcional.
- Presente não gera nova cobrança; já incluso no `Order`.

---

## 17. CONTROLE DE ESTOQUE — EDITION INVENTORY

```ts
// Fonte da verdade: COUNT(Edition WHERE workId) vs Work.maxSupply
available = maxSupply - issuedCount  // issuedCount = SELECT COUNT(*) FROM Edition WHERE workId = ?
```

- Campo `Work.issuedCount` denormalizado atualizado em transação (para leitura rápida) + verificação por count real em operações críticas.
- Quando `available === 0` → `Work.status = SOLD_OUT` → API `/api/orders` rejeita novos pedidos com 409.
- Contador exibido no site: `GET /api/works/[slug]/availability` → `{ total: 10000, issued: 4827, available: 5173, status: 'PUBLISHED' }` — sem cache falso, com revalidação 5s.
- Proibido: contador fake, vendas fake, avaliações fake.

---

## 18. RESERVA DE EDIÇÃO — TRANSAÇÃO ATÔMICA (ANTI-DUPLICIDADE)

**O ponto mais crítico do sistema.** Usar transação serializável + `SELECT ... FOR UPDATE`:

```ts
// dentro de confirmPayment(providerTxId) — idempotente
await prisma.$transaction(async (tx) => {
  // 1. Lock na linha Work para serializar reservas desta obra
  const work = await tx.work.findUnique({ where: { id: workId } });
  // ou: await tx.$queryRaw`SELECT * FROM "Work" WHERE id = ${workId} FOR UPDATE`;

  const issued = await tx.edition.count({ where: { workId } });
  if (issued >= work.maxSupply) throw new SoldOutError();

  for (const item of order.items) {
    const nextNumber = (await tx.edition.count({ where: { workId: item.workId } })) + 1;
    const code = formatEditionCode(item.work.shortCode, item.work.periodEnd, nextNumber);
    const edition = await tx.edition.create({
      data: {
        workId: item.workId,
        editionNumber: nextNumber,
        editionCode: code,
        ownerId: item.isGift ? null : order.userId, // presente: owner null até claim
        orderItemId: item.id,
        status: 'ASSIGNED',
      }
    });
    // increment denormalizado
    await tx.work.update({ where: { id: item.workId }, data: { issuedCount: { increment: 1 } } });
    await tx.auditLog.create({ data: { action: 'EDITION_ASSIGNED', entity: 'Edition', entityId: edition.id, metadata: { code, number: nextNumber } } });
  }
  await tx.order.update({ where: { id: orderId }, data: { status: 'PAID' } });
  await tx.payment.update({ where: { orderId }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
}, { isolationLevel: 'Serializable', maxWait: 5000, timeout: 10000 });
```

- `editionCode` UNIQUE + `UNIQUE(workId, editionNumber)` garantem que mesmo em race condition o DB rejeita duplicata (segunda transação falha e faz retry).
- Teste obrigatório: 100 workers paralelos tentando comprar última edição → apenas 1 sucede.

---

## 19. DOWNLOAD SEGURO

- Nunca link público permanente.
- `GET /api/me/editions/[code]/download` → verifica `session.user.id === edition.ownerId` (ou recipient de Gift CLAIMED) → gera `GetObject presigned URL` com `expires: 900` (15 min) + `Content-Disposition: attachment; filename="Flamengo-1895-2026-FLA-2026-DIG-04827.pdf"` → retorna `{ url }` → frontend faz `window.location = url` ou fetch.
- Presigned URL assinada com `AWS Signature V4`, sem expor bucket/key.
- Rate limit: 10 downloads / min por usuário.
- Auditoria de cada download.

---

## 20. PERSONALIZAÇÃO DO PDF

- `PDFService.personalize(masterPdfBuffer, edition)`:
  1. Carrega `master.pdf` (25 págs) via `PDFDocument.load`.
  2. Adiciona página de guarda ou sobrepõe na capa/contracapa: título, `Edição #4827 / 10.000`, código `FLA-2026-DIG-04827`, QR Code (embed PNG), data emissão, hash.
  3. Adiciona última página (página 25 ou 26 extra de certificado resumido — conforme editorial, sem violar "25 páginas de conteúdo" — a personalização é camada extra, não página de história).
  4. Metadados: Author=CLUBEVERSO, Title, Subject=editionCode.
  5. Salva e faz upload para `editions/[code].pdf`.
- Executado em worker assíncrono após pagamento; se falhar, retry 3x; falha não cancela pedido (status `PDF_PENDING`).

---

## 21. QR CODE — DESTINO

- Valor: `${NEXT_PUBLIC_SITE_URL}/verificar/${editionCode}`.
- Evita link direto para PDF, S3 ou blockchain — camada permanente CLUBEVERSO permite migrar storage/chain sem quebrar QR impresso.

---

## 22. PÁGINA DE AUTENTICAÇÃO — `/verificar/[editionCode]`

- Pública, sem login, sem PII.
- Dados exibidos: `EDIÇÃO AUTÊNTICA` (ou `NÃO ENCONTRADA`), Clube, Obra, Edição `#4827 / 10.000`, Código, Status `AUTÊNTICA`, Tiragem, Data fechamento editorial `28/08/2026`, Versão `FLA-2026-V1`, NFT status (`Não emitido` / `Emitido — Ver no explorer`), Capa miniatura.
- Nunca expor: CPF, endereço, telefone, email.
- Implementação: `GET /api/verify/[code]` → `prisma.edition.findUnique({ where: { editionCode }, include: { work: { include: { club: true } }, nftAsset: true } })`.

---

## 23. CERTIFICADO DIGITAL

Ver item 12. Template adicional: página `/minha-colecao/[code]/certificado` exibe HTML + botão "Baixar PDF".

---

## 24. NFT — ARQUITETURA (feature-flagged)

```ts
// lib/nft/nft-service.ts
interface NFTService {
  createMetadata(edition: Edition & { work: Work }): NFTMetadata; // nome, clube, liga, país, obra, ano, número, tiragem, código, descrição, imagem, authUrl
  uploadMetadata(metadata: NFTMetadata): Promise<string>; // ipfs://... ou https://...
  mintEdition(editionId: string, metadataUrl: string, toAddress: string): Promise<{ chain: string; contractAddress: string; tokenId: string; explorerUrl: string }>;
  verifyToken(contractAddress: string, tokenId: string): Promise<boolean>;
  getTokenData(contractAddress: string, tokenId: string): Promise<unknown>;
  getExplorerUrl(contractAddress: string, tokenId: string): string;
  associateTokenWithEdition(editionId: string, tokenData: MintResult): Promise<void>;
}
```

- `NFT_ENABLED=false` → `nft-worker` não consome fila; UI esconde seção NFT.
- Quando `true`: após `EDITION_ASSIGNED`, enfileira `mint:editionId` → `NFTService.mintEdition` → salva `NFTAsset` com `status=MINTED`.
- Metadata nunca contém PII.

---

## 25. TUDO RESTANTE (consolidado)

### 25.1 Falha de NFT (item 29)
- Pagamento confirmado + edition atribuída não são revertidos se mint falhar.
- `Edition` → `NFTAsset.status=PENDING/FAILED`, `retryCount++`, `lastError`.
- Admin vê fila `NFT pendentes` com botão Retry (idempotente: verifica se token já existe para `editionId` antes de mintar).
- `associateTokenWithEdition` usa `editionId UNIQUE` para evitar duplicata em retry.

### 25.2 Minha Coleção (item 30)
- `/minha-colecao` lista `Edition`s do usuário (owner) + gifts recebidos.
- Card por edição: capa, clube, obra, `#4827 / 10.000`, código, status, botões: Ler (viewer PDF), Baixar (presigned), Ver Certificado, Ver Autenticidade (`/verificar/[code]`), Ver NFT (se houver).

### 25.3 Paineis Admin (33-35)
- Middleware `ADMIN` + audit.
- Módulos: Continentes, Países, Ligas, Clubes (com `licensingStatus`), Obras (25 páginas editor), Edições (tabela com busca por código), Pedidos, Pagamentos, Clientes, Presentes, Certificados, QR, Conteúdo (ContentAsset), Direitos (RightsRecord com checklist comercial), NFT (fila), Emails (log), Analytics (vendidos/disponíveis/última edição), Auditoria (AuditLog imutável).

### 25.4 Escalabilidade (36, 59)
- Entidades genéricas, índices por `workId`, `clubId`, `editionCode`.
- Paginação cursor, CDN para capas, leitura `available` via Redis cache com invalidação em transação.
- Suporta milhares de clubes / milhões de edições sem novo sistema.

### 25.5 URLs (37)
```
/                    # Home
/continentes
/pais/[countrySlug]
/liga/[leagueSlug]
/clubes/[clubSlug]              # /clubes/flamengo
/obra/[workSlug]                # /obra/flamengo-1895-2026
/comprar?work=flamengo-1895-2026
/checkout
/checkout/pix/[orderId]
/minha-colecao
/presente
/verificar/[editionCode]
/admin
```

### 25.6 Design (38-40)
- Premium, editorial, colecionável: tipografia serif para títulos (Playfair Display), sans para UI (Inter), paleta neutra + acentos por clube (Flamengo: vermelho #C3281E + preto, textura náutica sutil).
- Home: hero "CLUBEVERSO — A história digital do seu clube." + CTA "Escolha seu clube" → grid Continentes → Países → Ligas → Clubes.

### 25.7 Produto & Escassez (41-43)
- Página obra: capa, descrição, `8.742 / 10.000 disponíveis` (real), preço, 25 páginas, período, formato, tiragem, autenticação, CTA `COMPRAR POR R$49,90` + `LEVE 2ª POR R$39,90`. Sem fakes.

### 25.8 SEO (44)
- `generateMetadata` por clube/obra, Open Graph, JSON-LD `Book`/`Product`, sitemap.xml dinâmico, URLs amigáveis.

### 25.9 Performance (45)
- Mobile-first, imagens `next/image` com `webp/avif`, fontes `next/font`, `loading.tsx`/`error.tsx`, cache CDN, PDF lazy.

### 25.10 Segurança (46) & Privacidade (47) & LGPD
- HTTPS, Helmet headers, rate limit, Zod, Prisma (sem SQL injection), XSS sanitizado, CSRF via Auth.js, RBAC, secrets em `env` (nunca git/frontend), backups diários, logs sem PII, coleta mínima, consentimento, direito a exclusão (anonimiza, preserva AuditLog por obrigação legal).

### 25.11 Testes (51) — obrigatórios
- `inventory.test.ts`: 2 usuários não recebem mesmo número (concorrência).
- `stock.test.ts`: nunca >10k.
- `webhook.test.ts`: duplicado não duplica pedido/edição.
- `download.test.ts`: não autenticado → 403; presigned expira.
- `gift.test.ts`: edição presenteada corretamente atribuída.
- `certificate.test.ts`: cada edição tem cert único.
- `qr.test.ts`: QR aponta para própria edição.
- `nft.test.ts`: retry não duplica token.

### 25.12 Infra, Deploy, Custos

**Infra dev:** `docker-compose.yml` com Postgres 16 + Redis 7.  
**Prod:** Vercel (Pro $20/mês) + Neon Postgres (Scale $19) + Upstash Redis ($10) + Cloudflare R2 (grátis até 10GB) + Resend (grátis 3k/mês) + EFI/Mercado Pago (taxa PIX ~0,99% — sem mensalidade). Custo fixo inicial ~$49/mês + taxas variáveis por venda. NFT (quando ativar): Polygon mint ~$0,01 + Pinata IPFS $20/mês. Estimativa para 10k vendas: R$499k receita bruta, custo infra marginal <2%.

**Deploy:** `vercel --prod` + `prisma migrate deploy` + `prisma db seed`. Env via Vercel dashboard.

---

## 26. ROADMAP DE FASES

| Fase | Escopo | Entregável verificável |
|---|---|---|
| **1** | Fundação | Projeto Next.js + Prisma + Auth + seed Continentes/Flamengo + design system + rotas base |
| **2** | Produto | Página Flamengo com 25 páginas (conteúdo editorial placeholder + pipeline), contador real, cert + QR |
| **3** | Comércio | Carrinho, pricing 49,90/39,90, checkout PIX (mock + real gateway), webhook idempotente |
| **4** | Entrega | PDF personalizado, download presigned, email transacional |
| **5** | Presentes | Segunda edição presenteável, email destinatário, claim |
| **6** | Admin & Auditoria | CRUD clubes/obras/edições/pedidos + Rights Manager + AuditLog + Analytics |
| **7** | Escala | Seed multi-ligas/países, teste carga |
| **8** | NFT | NFTService Polygon, metadata IPFS, mint 1:1, retry seguro |

---

**Próximo passo:** iniciar **FASE 1 — MVP** (scaffold + DB + seed Flamengo). Aguardar confirmação para executar.

*Documento gerado em 28/08/2026. Toda decisão registrada para auditoria.*
