import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workSlug = searchParams.get("workSlug") || "flamengo-1895-2026";
  const numero = Number(searchParams.get("numero"));
  if (!numero) return NextResponse.json({ error: "numero required" }, { status: 400 });
  try {
    const work = await prisma.work.findUnique({ where: { slug: workSlug } });
    if (!work) return NextResponse.json({ error: "Obra não encontrada" }, { status: 404 });
    // libera expirados
    const now = new Date();
    await prisma.edition.updateMany({ where: { workId: work.id, status: "RESERVED", expiresAt: { lt: now } }, data: { status: "AVAILABLE" as any, reservedAt: null, expiresAt: null, reservedBy: null, paymentId: null } });
    const e = await prisma.edition.findUnique({ where: { workId_editionNumber: { workId: work.id, editionNumber: numero } } });
    if (!e) return NextResponse.json({ numero, status: "disponivel", cor: "verde" });
    if (e.status === "PAID" || e.status === "ASSIGNED") return NextResponse.json({ numero, status: "pago", cor: "vermelho" });
    if (e.status === "RESERVED") {
      const exp = e.expiresAt ? new Date(e.expiresAt) : null;
      if (exp && exp < now) return NextResponse.json({ numero, status: "disponivel", cor: "verde" });
      return NextResponse.json({ numero, status: "reservado", cor: "amarelo", reservadoPor: e.reservedBy, expiraEm: e.expiresAt, expiraEmMs: exp ? exp.getTime() - now.getTime() : 0, paymentId: e.paymentId });
    }
    return NextResponse.json({ numero, status: "disponivel", cor: "verde" });
  } catch {
    return NextResponse.json({ numero, status: "disponivel", cor: "verde", mock: true });
  }
}
