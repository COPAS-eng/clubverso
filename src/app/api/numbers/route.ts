import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_CATALOG } from "@/lib/catalog";

// GET /api/numbers?workSlug=flamengo-1895-2026
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workSlug = searchParams.get("workSlug") || "flamengo-1895-2026";

  // tenta DB, fallback mock (GH Pages)
  try {
    const work = await prisma.work.findUnique({ where: { slug: workSlug } });
    if (!work) return NextResponse.json({ error: "Obra não encontrada" }, { status: 404 });

    // libera expirados antes de listar (5min)
    const now = new Date();
    await prisma.edition.updateMany({
      where: { workId: work.id, status: "RESERVED", expiresAt: { lt: now } },
      data: { status: "AVAILABLE" as any, reservedAt: null, expiresAt: null, reservedBy: null, paymentId: null },
    });

    const editions = await prisma.edition.findMany({
      where: { workId: work.id },
      select: { editionNumber: true, status: true, reservedBy: true, reservedAt: true, expiresAt: true, paymentConfirmed: true },
    });
    const map = new Map(editions.map((e) => [e.editionNumber, e]));
    const numbers = Array.from({ length: work.maxSupply }, (_, i) => {
      const n = i + 1;
      const e = map.get(n);
      if (!e) return { numero: n, status: "disponivel", cor: "verde" };
      if (e.status === "PAID" || e.status === "ASSIGNED" || (e as any).paymentConfirmed) return { numero: n, status: "pago", cor: "vermelho", pago: true };
      if (e.status === "RESERVED") {
        const exp = e.expiresAt ? new Date(e.expiresAt) : null;
        const isExpired = exp ? exp < now : false;
        if (isExpired) return { numero: n, status: "disponivel", cor: "verde" };
        return { numero: n, status: "reservado", cor: "amarelo", reservadoPor: e.reservedBy, reservadoEm: e.reservedAt, expiraEm: e.expiresAt, expiraEmMs: exp ? exp.getTime() - now.getTime() : 0 };
      }
      return { numero: n, status: "disponivel", cor: "verde" };
    });

    const disponiveis = numbers.filter((n) => n.status === "disponivel").length;
    const reservados = numbers.filter((n) => n.status === "reservado").length;
    const pagos = numbers.filter((n) => n.status === "pago").length;

    return NextResponse.json({ work: { slug: work.slug, title: work.title, maxSupply: work.maxSupply }, numbers, stats: { disponiveis, reservados, pagos, total: work.maxSupply } });
  } catch (e) {
    // fallback GH Pages sem DB: mock em memória via header? usa MOCK_CATALOG
    const work = MOCK_CATALOG.works.find((w) => w.slug === workSlug) || MOCK_CATALOG.works[0];
    const max = work.maxSupply;
    // GH Pages: sem DB, retorna todos disponiveis (UI fará mock localStorage)
    const numbers = Array.from({ length: max }, (_, i) => ({ numero: i + 1, status: "disponivel", cor: "verde" }));
    return NextResponse.json({ work: { slug: work.slug, title: work.title, maxSupply: max }, numbers, stats: { disponiveis: max, reservados: 0, pagos: 0, total: max }, mock: true });
  }
}
