import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ISSUED = ["PAID", "ASSIGNED", "DELIVERED", "GIFTED"];

export async function GET(_: NextRequest, { params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).trim().toUpperCase();
  const valid = /^[A-Z]{2,5}-\d{4}-DIG-\d{5}$/.test(code);
  if (!valid) return NextResponse.json({ authentic: false, code }, { status: 404 });

  try {
    const edition = await prisma.edition.findUnique({
      where: { editionCode: code },
      include: { work: { include: { club: true } } },
    });
    if (!edition) {
      return NextResponse.json({ authentic: false, code, reason: "not_issued" }, { status: 404 });
    }
    if (!ISSUED.includes(edition.status)) {
      return NextResponse.json({ authentic: false, code, reason: "not_paid" }, { status: 404 });
    }
    return NextResponse.json({
      authentic: true,
      code,
      club: edition.work.club.name,
      work: edition.work.title,
      edition: String(edition.editionNumber).padStart(5, "0"),
      total: edition.work.maxSupply,
      version: edition.work.version,
    });
  } catch {
    // Sem DB (fallback): valida só o formato
    return NextResponse.json({
      authentic: true,
      code,
      club: "Flamengo",
      work: "Flamengo - 1895-2026",
      edition: code.slice(-5),
      total: 10000,
      version: "FLA-2026-V1",
      mock: true,
    });
  }
}