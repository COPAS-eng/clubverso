import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatEditionCode } from "@/lib/edition-code";
import crypto from "crypto";

// POST /api/numbers/reserve { workSlug, numero, email }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const workSlug = body.workSlug || "flamengo-1895-2026";
  const numero = Number(body.numero);
  const email = String(body.email || "").trim().toLowerCase();

  if (!numero || numero < 1) return NextResponse.json({ error: "Número inválido" }, { status: 400 });
  if (!email || !email.includes("@")) return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });

  try {
    const work = await prisma.work.findUnique({ where: { slug: workSlug }, include: { club: true } });
    if (!work) return NextResponse.json({ error: "Obra não encontrada" }, { status: 404 });
    if (numero > work.maxSupply) return NextResponse.json({ error: `Número deve ser 1-${work.maxSupply}` }, { status: 400 });

    // libera expirados antes de reservar
    const now = new Date();
    await prisma.edition.updateMany({
      where: { workId: work.id, status: "RESERVED", expiresAt: { lt: now } },
      data: { status: "AVAILABLE" as any, reservedAt: null, expiresAt: null, reservedBy: null, paymentId: null },
    });

    const editionCode = formatEditionCode(work.club.shortCode, work.periodEnd, numero);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const paymentId = `pix_${crypto.randomBytes(8).toString("hex")}`;
    const pixCopyPaste = `00020126580014BR.GOV.BCB.PIX0136clubverso-pix-${paymentId}5204000053039865405${(work.priceCents / 100).toFixed(2)}5802BR5920CLUBEVERSO6009SAO PAULO62070503***6304ABCD`;
    // QR mock como data URL simples (em prod gerar com lib qrcode)
    const qrDataUrl = `PIX:${paymentId}:${editionCode}:${work.priceCents}`;

    // transação com bloqueio: tenta reservar apenas se disponivel ou expirado
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.edition.findUnique({ where: { workId_editionNumber: { workId: work.id, editionNumber: numero } } });

      if (existing) {
        if (existing.status === "PAID" || existing.status === "ASSIGNED" || existing.status === "DELIVERED") {
          throw new Error("NUMERO_PAGO");
        }
        if (existing.status === "RESERVED" && existing.expiresAt && new Date(existing.expiresAt) > now) {
          throw new Error("NUMERO_RESERVADO");
        }
        // expirado ou AVAILABLE -> pode reservar (update)
        const updated = await tx.edition.update({
          where: { id: existing.id },
          data: {
            status: "RESERVED",
            reservedAt: now,
            expiresAt,
            reservedBy: email,
            paymentId,
            paymentConfirmed: false,
            editionCode,
          },
        });
        return updated;
      } else {
        // cria reservado
        const created = await tx.edition.create({
          data: {
            workId: work.id,
            editionNumber: numero,
            editionCode,
            status: "RESERVED",
            reservedAt: now,
            expiresAt,
            reservedBy: email,
            paymentId,
            paymentConfirmed: false,
          },
        });
        return created;
      }
    });

    // audit
    await prisma.auditLog.create({
      data: { action: "NUMBER_RESERVED", entity: "Edition", entityId: result.id, metadata: { numero, workSlug, email, expiresAt, paymentId } as any },
    });

    return NextResponse.json({
      ok: true,
      reserva: {
        id: result.id,
        numero,
        editionCode,
        status: "reservado",
        cor: "amarelo",
        reservadoPor: email,
        reservadoEm: result.reservedAt,
        expiraEm: result.expiresAt,
        expiraEmMs: expiresAt.getTime() - now.getTime(),
        paymentId,
        pixQrCode: qrDataUrl,
        pixCopyPaste,
        valorCentavos: work.priceCents,
      },
      mensagem: `Número ${numero} reservado por 5 minutos para ${email}`,
    });
  } catch (e: any) {
    const msg = e.message;
    if (msg === "NUMERO_RESERVADO") return NextResponse.json({ error: "Número já reservado por outro usuário. Tente outro." }, { status: 409 });
    if (msg === "NUMERO_PAGO") return NextResponse.json({ error: "Número já pago. Escolha outro." }, { status: 409 });
    // fallback mock para GH Pages sem DB
    if (String(e).includes("Can't reach database") || String(e).includes("prisma") || e.code === "P1001") {
      const mockPaymentId = `pix_mock_${numero}_${Date.now()}`;
      return NextResponse.json({
        ok: true,
        mock: true,
        reserva: {
          id: `mock_${numero}`,
          numero,
          editionCode: `FLA-2026-DIG-${String(numero).padStart(5, "0")}`,
          status: "reservado",
          cor: "amarelo",
          reservadoPor: email,
          expiraEm: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          expiraEmMs: 5 * 60 * 1000,
          paymentId: mockPaymentId,
          pixQrCode: `PIX:${mockPaymentId}`,
          pixCopyPaste: `000201-MOCK-${mockPaymentId}`,
          valorCentavos: 4990,
        },
      });
    }
    console.error("reserve error", e);
    return NextResponse.json({ error: "Erro ao reservar" }, { status: 500 });
  }
}
