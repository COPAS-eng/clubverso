import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_DOWNLOADS_PER_EDITION = 10;

export async function GET(req: NextRequest) {
  const code = (req.nextUrl.searchParams.get("code") || "").trim().toUpperCase();
  const emailParam = (req.nextUrl.searchParams.get("email") || "").toLowerCase().trim();
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });
  if (!emailParam || !emailParam.includes("@")) {
    return NextResponse.json({ error: "Informe o e-mail usado na compra." }, { status: 400 });
  }
  try {
    const edition = await prisma.edition.findUnique({
      where: { editionCode: code },
      include: { orderItem: { include: { order: true, gift: true } } },
    });
    if (!edition) return NextResponse.json({ error: "Edição não encontrada" }, { status: 404 });

    // Sem login de cliente: o e-mail da compra funciona como senha do download.
    // Não revela se o código existe (403 genérico) e não consome cota em falha.
    const ownerEmails = [edition.orderItem?.order?.customerEmail, edition.orderItem?.gift?.recipientEmail]
      .filter(Boolean)
      .map((e) => String(e).toLowerCase().trim());
    if (!ownerEmails.includes(emailParam)) {
      return NextResponse.json({ error: "Dados não conferem." }, { status: 403 });
    }

    if ((edition.downloadCount ?? 0) >= MAX_DOWNLOADS_PER_EDITION) {
      return NextResponse.json(
        { error: "Limite de downloads atingido (10 por edição).", remaining: 0 },
        { status: 429 }
      );
    }
    await prisma.edition.update({
      where: { id: edition.id },
      data: { downloadCount: { increment: 1 } },
    });
    const key = `editions/${code}.pdf`;
    const url = await getPresignedUrl(key, 900);
    return NextResponse.json({
      url,
      expiresIn: 900,
      editionCode: code,
      remaining: MAX_DOWNLOADS_PER_EDITION - (edition.downloadCount ?? 0) - 1,
    });
  } catch {
    // GH Pages mock
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return NextResponse.json({ url: `${base}/api/storage/mock?key=editions/${code}.pdf`, mock: true });
  }
}