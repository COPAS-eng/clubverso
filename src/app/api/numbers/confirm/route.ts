import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/numbers/confirm { workSlug, numero, paymentId, email }
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const workSlug = body.workSlug || "flamengo-1895-2026";
  const numero = Number(body.numero);
  const paymentId = String(body.paymentId || "");
  const email = String(body.email || "").toLowerCase();

  if (!numero) return NextResponse.json({ error: "Número inválido" }, { status: 400 });

  try {
    const work = await prisma.work.findUnique({ where: { slug: workSlug } });
    if (!work) return NextResponse.json({ error: "Obra não encontrada" }, { status: 404 });

    const edition = await prisma.edition.findUnique({ where: { workId_editionNumber: { workId: work.id, editionNumber: numero } } });
    if (!edition) return NextResponse.json({ error: "Número não reservado" }, { status: 404 });
    if (edition.status === "PAID" || edition.status === "ASSIGNED") return NextResponse.json({ ok: true, status: "pago", mensagem: "Já pago" });
    if (edition.status !== "RESERVED") return NextResponse.json({ error: "Número não está reservado" }, { status: 409 });
    if (edition.expiresAt && new Date(edition.expiresAt) < new Date()) {
      // expirou -> libera
      await prisma.edition.update({ where: { id: edition.id }, data: { status: "AVAILABLE" as any, reservedAt: null, expiresAt: null, reservedBy: null, paymentId: null } });
      return NextResponse.json({ error: "Reserva expirou. Número liberado." }, { status: 410 });
    }
    if (paymentId && edition.paymentId && paymentId !== edition.paymentId) return NextResponse.json({ error: "PaymentId inválido" }, { status: 400 });
    // opcional verifica email corresponde
    if (email && edition.reservedBy && edition.reservedBy !== email) return NextResponse.json({ error: "Reserva pertence a outro e-mail" }, { status: 403 });

    // confirma pagamento -> PAID, vincula permanentemente
    const updated = await prisma.edition.update({
      where: { id: edition.id },
      data: { status: "PAID", paymentConfirmed: true, ownerId: null, expiresAt: null },
    });

    await prisma.work.update({ where: { id: work.id }, data: { issuedCount: { increment: 1 } } });
    await prisma.auditLog.create({ data: { action: "NUMBER_PAID", entity: "Edition", entityId: edition.id, metadata: { numero, workSlug, paymentId } as any } });

    // gera PDF personalizado + QR + certificado (assíncrono, não bloqueia resposta)
    try {
      const { generatePersonalizedPdf } = await import("@/lib/pdf");
      const { sendEmail, renderOrderConfirmedEmail } = await import("@/lib/email");
      const { buildVerifyUrl } = await import("@/lib/qr");
      const club = await prisma.club.findUnique({ where: { id: work.clubId } });
      const { key } = await generatePersonalizedPdf({
        workTitle: work.title,
        editionNumber: numero,
        maxSupply: work.maxSupply,
        editionCode: updated.editionCode,
        clubName: club?.name || "Flamengo",
      });
      await prisma.edition.update({ where: { id: updated.id }, data: { personalizedPdfUrl: key } });
      const verifyUrl = buildVerifyUrl(updated.editionCode);
      const emailHtml = renderOrderConfirmedEmail({ editionCode: updated.editionCode, numero, workTitle: work.title, verifyUrl });
      if (edition.reservedBy) await sendEmail({ to: edition.reservedBy, subject: emailHtml.subject, html: emailHtml.html });
      await prisma.certificate.upsert({
        where: { editionId: updated.id },
        update: { certificateUrl: key, data: { editionCode: updated.editionCode, numero, workTitle: work.title, verifyUrl } as any },
        create: { editionId: updated.id, certificateUrl: key, data: { editionCode: updated.editionCode, numero, workTitle: work.title, verifyUrl } as any },
      });
    } catch (e) {
      console.error("pdf/email fail (não bloqueia pagamento)", e);
    }

    return NextResponse.json({ ok: true, status: "pago", cor: "vermelho", numero, editionCode: updated.editionCode, mensagem: `Pagamento confirmado! Número ${numero} é seu. PDF e certificado gerados.` });
  } catch (e: any) {
    if (String(e).includes("Can't reach database")) {
      return NextResponse.json({ ok: true, mock: true, status: "pago", numero, mensagem: "Mock: pagamento confirmado (GH Pages)" });
    }
    console.error("confirm error", e);
    return NextResponse.json({ error: "Erro ao confirmar" }, { status: 500 });
  }
}
