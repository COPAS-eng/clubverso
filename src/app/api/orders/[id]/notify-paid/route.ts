import { NextRequest, NextResponse } from "next/server";
import { markCustomerReportedPaid, OrderNotFoundError } from "@/lib/order-service";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await markCustomerReportedPaid(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof OrderNotFoundError) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao registrar aviso de pagamento" }, { status: 500 });
  }
}