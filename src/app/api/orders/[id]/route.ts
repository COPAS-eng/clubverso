import { NextRequest, NextResponse } from "next/server";
import { getOrderStatus } from "@/lib/order-service";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const order = await getOrderStatus(params.id);
  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    totalCents: order.totalCents,
    payment: order.payment
      ? {
          status: order.payment.status,
          pixQrCode: order.payment.pixQrCode,
          pixCopyPaste: order.payment.pixCopyPaste,
          customerReportedPaidAt: order.payment.customerReportedPaidAt,
        }
      : null,
    items: order.items.map((item) => ({
      workTitle: item.work.title,
      isGift: item.isGift,
      editionCode: item.edition?.editionCode ?? null,
    })),
  });
}