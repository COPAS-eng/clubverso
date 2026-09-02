import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-webhook-signature") || "";
  const secret = process.env.PIX_WEBHOOK_SECRET || "pix-webhook-secret-dev";
  if (sig) {
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let body: any; try { body = JSON.parse(raw); } catch { body = {}; }
  const providerTxId = body.providerTxId || body.txid || body.id;
  if (!providerTxId) return NextResponse.json({ received: true });
  return NextResponse.json({ received: true, providerTxId });
}
