"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBRL, PRICE_FIRST_CENTS, PRICE_SECOND_CENTS, calculateTotal } from "@/lib/pricing";
import { useState, Suspense } from "react";

function CheckoutInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const work = sp.get("work") || "flamengo-1895-2026";
  const wantsSecond = sp.get("second") === "1";
  const items = wantsSecond ? 2 : 1;
  const total = calculateTotal(items);
  const [email, setEmail] = useState("");
  const [giftEmail, setGiftEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function gerarPix() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workSlug: work,
          customerEmail: email,
          gift: wantsSecond && giftEmail ? { recipientEmail: giftEmail } : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar pedido");
      router.push(`/checkout/pix/${data.orderId}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-black">Checkout — PIX</h1>
      <Card className="mt-4 p-4">
        <div className="text-sm font-bold">Resumo</div>
        <div className="text-sm">1× Flamengo 1895–2026 — {formatBRL(PRICE_FIRST_CENTS)}</div>
        {wantsSecond && (
          <div className="text-sm">
            1× 2ª edição — {formatBRL(PRICE_SECOND_CENTS)}{" "}
            <span className="text-emerald-600">desconto aplicado</span>
          </div>
        )}
        <div className="mt-2 font-black">Total: {formatBRL(total)}</div>
        <div className="mt-3 text-xs text-zinc-500">Sem frete • Entrega digital • PIX • Estoque real</div>
      </Card>
      <Card className="mt-4 p-4">
        <label className="text-sm font-medium">E-mail para entrega</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
        />
        {wantsSecond && (
          <input
            value={giftEmail}
            onChange={(e) => setGiftEmail(e.target.value)}
            placeholder="E-mail do presenteado (para a 2ª edição)"
            className="mt-2 w-full border rounded-xl px-3 py-2 text-sm"
          />
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <Button onClick={gerarPix} disabled={!email || loading} className="w-full mt-4">
          {loading ? "Gerando PIX..." : "GERAR PIX"}
        </Button>
      </Card>
      <div className="mt-3 text-xs text-zinc-500">
        O QR e o código copia-e-cola são gerados com a chave PIX real do vendedor. Após pagar, o pedido fica
        aguardando confirmação manual no painel admin.
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 py-8">Carregando checkout...</div>}>
      <CheckoutInner />
    </Suspense>
  );
}