import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code);
  const valid = /^[A-Z]{2,5}-\d{4}-DIG-\d{5}$/.test(code);
  if (!valid) return NextResponse.json({ authentic: false, code }, { status: 404 });
  return NextResponse.json({ authentic: true, code, club: "Flamengo", work: "Flamengo - 1895-2026", edition: code.slice(-5), total: 10000, version: "FLA-2026-V1" });
}
