import { NextRequest, NextResponse } from "next/server";
import { createOrderWithPix, SoldOutError } from "@/lib/order-service";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rl = rateLimit(`orders:${clientIp(req)}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um minuto." }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const workSlug = typeof body.workSlug === "string" ? body.workSlug : "flamengo-1895-2026";
  const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim() : "";
  if (!customerEmail || !customerEmail.includes("@")) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }
  const gift =
    body.gift?.recipientEmail && String(body.gift.recipientEmail).includes("@")
      ? { recipientEmail: String(body.gift.recipientEmail).trim() }
      : undefined;

  try {
    const result = await createOrderWithPix({ workSlug, customerEmail, gift });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SoldOutError) {
      return NextResponse.json({ error: "Edição esgotada" }, { status: 409 });
    }
    console.error(err);
    const msg = err instanceof Error ? err.message : "Erro ao criar pedido";
    if (/DATABASE_URL|datasource|Can't reach database|P1001/i.test(msg)) {
      return NextResponse.json(
        { error: "Banco indisponível. Confira a DATABASE_URL na Vercel e redeploye." },
        { status: 500 }
      );
    }
    if (/PIX_KEY/i.test(msg)) {
      return NextResponse.json(
        { error: "PIX não configurado. Confira a PIX_KEY na Vercel e redeploye." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
export async function GET() { return NextResponse.json({ ok: true }); }