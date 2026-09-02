import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
  // segurança: só permite editions/ e certs/
  if (!key.startsWith("editions/") && !key.startsWith("certs/")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const filePath = path.join(process.cwd(), ".mock-storage", key);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const buf = fs.readFileSync(filePath);
  return new NextResponse(buf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${path.basename(key)}"` } });
}
