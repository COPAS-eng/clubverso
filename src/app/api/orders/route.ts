import { NextRequest, NextResponse } from "next/server";
import { calculateTotal } from "@/lib/pricing";
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const items: string[] = body.items || ["flamengo-1895-2026"];
  const total = calculateTotal(items.length);
  const orderId = "ord_" + Math.random().toString(36).slice(2, 9);
  return NextResponse.json({
    orderId,
    totalCents: total,
    pix: {
      providerTxId: "pix_" + orderId,
      pixQrCode: "MOCK_QR_BASE64",
      pixCopyPaste: "00020126580014BR.GOV.BCB.PIX0136mock-" + orderId + "5204000053039865405" + (total / 100).toFixed(2),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
  });
}
export async function GET() { return NextResponse.json({ ok: true }); }
