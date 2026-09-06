import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/storage";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_DOWNLOADS_PER_EDITION = 10;

export async function GET(req: NextRequest) {
  const rl = rateLimit(`download:${clientIp(req)}`, 20, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um minuto." }, { status: 429 });
  }
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });
  try {
    const edition = await prisma.edition.findUnique({ where: { editionCode: code } });
    if (!edition) return NextResponse.json({ error: "Edição não encontrada" }, { status: 404 });
    // em prod validar owner via session; mock permite qualquer
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