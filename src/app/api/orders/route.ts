import { NextRequest, NextResponse } from "next/server";
import { createOrderWithPix, SoldOutError } from "@/lib/order-service";

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
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar pedido" },
      { status: 500 }
    );
  }
}
export async function GET() { return NextResponse.json({ ok: true }); }