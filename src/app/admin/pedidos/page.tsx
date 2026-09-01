import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/pricing";
import ConfirmButton from "./confirm-button";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  const orders = await prisma.order.findMany({
    where: { status: "PENDING" },
    include: { payment: true, items: { include: { work: true } } },
    orderBy: { createdAt: "desc" },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const typedOrders = orders as any[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-black">Pedidos pendentes</h1>
      <p className="text-sm text-zinc-500">
        Confira o extrato PIX no Nubank e marque o pedido correspondente como pago.
      </p>
      <div className="mt-4 space-y-3">
        {typedOrders.length === 0 && <div className="text-sm text-zinc-500">Nenhum pedido pendente.</div>}
        {typedOrders.map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="font-bold">
                  {formatBRL(order.totalCents)} — {order.customerEmail}
                </div>
                <div className="text-xs text-zinc-500">{order.items.map((i: any) => i.work.title).join(", ")}</div>
                <div className="text-xs font-mono text-zinc-400">{order.payment?.providerTxId}</div>
                {order.payment?.customerReportedPaidAt && (
                  <div className="text-xs text-amber-600 mt-1">
                    Cliente avisou pagamento em{" "}
                    {new Date(order.payment.customerReportedPaidAt).toLocaleString("pt-BR")}
                  </div>
                )}
              </div>
              <ConfirmButton orderId={order.id} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}