# CLUBEVERSO — A história digital do seu clube.

Plataforma mundial de livros digitais colecionáveis em HQ/Graphic Novel — 25 páginas, 10.000 edições numeradas, certificado + QR, PIX, presentes e NFT opcional.

**Live:** https://COPAS-eng.github.io/clubverso/ (GitHub Pages — estático) · **Completo (com PIX/webhook/DB):** deploy Vercel + Neon

## Stack
Next.js 14 App Router + TypeScript · Tailwind + shadcn/ui · Prisma (PostgreSQL) · NextAuth · pdf-lib + qrcode · S3/R2 presigned · Resend · EFI/Mercado Pago PIX (abstraído) · NFT Polygon (feature-flag)

## Estrutura
```
/continentes → /pais/[country] → /liga/[league] → /clubes/[slug] → /obra/[slug] → /verificar/[code]
/checkout → /checkout/pix/[orderId] → /minha-colecao → /admin
```

## Rodar local
```bash
pnpm install
cp .env.example .env # ajuste DATABASE_URL
docker compose up -d
pnpm exec prisma db push
pnpm exec prisma db seed # Flamengo 1895–2026
pnpm dev # http://localhost:3000
```

## GitHub Pages (estático)
```bash
# Build export é feito pela Action .github/workflows/deploy.yml
pnpm build # com GITHUB_PAGES=true gera out/ (sem /api, apenas site estático)
```

## Blueprint
Ver `CLUBEVERSO — TECHNICAL BLUEPRINT.md` (25 itens: stack, arquitetura, fluxos, segurança, LGPD, infra, testes).

## Fases
F1 Fundação ✓ | F2 Produto | F3 Comércio PIX | F4 Entrega | F5 Presentes | F6 Admin | F7 Escala | F8 NFT

---
**Primeira obra:** Flamengo 1895–2026 · `FLA-2026-DIG-00001` → `10000/10000` · R$49,90 + 2ª R$39,90
