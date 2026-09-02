import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { confirmOrderPayment, SoldOutError, OrderNotFoundError } from "@/lib/order-service";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN" || !session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const order = await confirmOrderPayment(params.id, { email: session.user.email });
    return NextResponse.json({ ok: true, order });
  } catch (err) {
    if (err instanceof OrderNotFoundError) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }
    if (err instanceof SoldOutError) {
      return NextResponse.json({ error: "Edição esgotada" }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao confirmar pagamento" },
      { status: 500 }
    );
  }
}