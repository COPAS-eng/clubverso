import { NextRequest, NextResponse } from "next/server";
import { createOrderWithPix, SoldOutError } from "@/lib/order-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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
    console.error("order create fail", err instanceof Error ? err.message : err);
    const msg = err instanceof Error ? err.message : "";
    if (/DATABASE_URL|datasource|Can't reach database|P1001/i.test(msg)) {
      return NextResponse.json({ error: "Serviço indisponível. Tente novamente em instantes." }, { status: 500 });
    }
    if (/PIX_KEY/i.test(msg)) {
      return NextResponse.json({ error: "Pagamento indisponível no momento. Tente novamente em instantes." }, { status: 500 });
    }
    return NextResponse.json({ error: "Erro ao criar pedido. Tente novamente." }, { status: 500 });
  }
}
export async function GET() { return NextResponse.json({ ok: true }); }