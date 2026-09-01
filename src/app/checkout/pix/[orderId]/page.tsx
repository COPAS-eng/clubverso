"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/pricing";

interface OrderStatusResponse {
  orderId: string;
  status: string;
  totalCents: number;
  payment: {
    status: string;
    pixQrCode: string | null;
    pixCopyPaste: string | null;
    customerReportedPaidAt: string | null;
  } | null;
  items: { workTitle: string; isGift: boolean; editionCode: string | null }[];
}

export default function PixCheckoutPage() {
  const params = useParams<{ orderId: string }>();
  const [data, setData] = useState<OrderStatusResponse | null>(null);
  const [reporting, setReporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch(`/api/orders/${params.orderId}`);
        if (!res.ok) throw new Error("Pedido não encontrado");
        const json = await res.json();
        if (active) setData(json);
      } catch (e: any) {
        if (active) setError(e.message);
      }
    }
    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [params.orderId]);

  async function jaPaguei() {
    setReporting(true);
    await fetch(`/api/orders/${params.orderId}/notify-paid`, { method: "POST" });
    setReporting(false);
  }

  if (error) return <div className="mx-auto max-w-xl px-4 py-8 text-red-600">{error}</div>;
  if (!data) return <div className="mx-auto max-w-xl px-4 py-8">Carregando...</div>;

  const confirmed = data.payment?.status === "CONFIRMED";

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-black">Pagamento via PIX</h1>
      <Card className="mt-4 p-4 text-center">
        <div className="font-black text-lg">{formatBRL(data.totalCents)}</div>
        {confirmed ? (
          <div className="mt-4">
            <div className="text-emerald-600 font-bold">Pagamento confirmado!</div>
            <ul className="mt-2 text-sm">
              {data.items.map((i, idx) => (
                <li key={idx}>
                  {i.workTitle}
                  {i.isGift ? " (presente)" : ""} — {i.editionCode ?? "processando..."}
                </li>
              ))}
            </ul>
            <Link href="/minha-colecao">
              <Button className="w-full mt-4">Ver minha coleção</Button>
            </Link>
          </div>
        ) : (
          <>
            {data.payment?.pixQrCode && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.payment.pixQrCode} alt="QR Code PIX" className="mx-auto mt-4 h-56 w-56" />
            )}
            {data.payment?.pixCopyPaste && (
              <div className="mt-3 text-xs font-mono bg-zinc-100 p-2 rounded-lg break-all">
                {data.payment.pixCopyPaste}
              </div>
            )}
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => navigator.clipboard.writeText(data.payment?.pixCopyPaste || "")}
            >
              Copiar PIX Copia e Cola
            </Button>
            {data.payment?.customerReportedPaidAt ? (
              <div className="mt-3 text-sm font-bold text-amber-600">
                Aguardando confirmação manual do vendedor...
              </div>
            ) : (
              <Button className="w-full mt-3" disabled={reporting} onClick={jaPaguei}>
                {reporting ? "Enviando..." : "Já paguei — avisar vendedor"}
              </Button>
            )}
          </>
        )}
      </Card>
      <div className="mt-3 text-xs text-zinc-500">
        Pagamento direto via PIX — sem gateway automático. Após pagar, o vendedor confere o extrato e confirma
        manualmente; sua edição numerada é atribuída na hora da confirmação.
      </div>
    </div>
  );
}