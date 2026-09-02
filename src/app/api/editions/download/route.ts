import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPresignedUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });
  try {
    const edition = await prisma.edition.findUnique({ where: { editionCode: code } });
    if (!edition) return NextResponse.json({ error: "Edição não encontrada" }, { status: 404 });
    // em prod validar owner via session; mock permite qualquer
    const key = `editions/${code}.pdf`;
    const url = await getPresignedUrl(key, 900);
    return NextResponse.json({ url, expiresIn: 900, editionCode: code });
  } catch {
    // GH Pages mock
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return NextResponse.json({ url: `${base}/api/storage/mock?key=editions/${code}.pdf`, mock: true });
  }
}
