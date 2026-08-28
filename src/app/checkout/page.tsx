"use client";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBRL, PRICE_FIRST_CENTS, PRICE_SECOND_CENTS, calculateTotal } from "@/lib/pricing";
import Link from "next/link";
import { useState, Suspense } from "react";

function CheckoutInner() {
  const sp = useSearchParams();
  const work = sp.get("work") || "flamengo-1895-2026";
  const second = sp.get("second");
  const items = second ? 2 : 1;
  const total = calculateTotal(items);
  const [email, setEmail] = useState("");
  const [pix, setPix] = useState<{ qr: string; copy: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function gerarPix() {
    setLoading(true);
    // MVP mock — em produção POST /api/orders → PAYMENT_PROVIDER
    await new Promise(r => setTimeout(r, 600));
    setPix({
      qr: "MOCK_QR_CODE_BASE64",
      copy: "00020126580014BR.GOV.BCB.PIX0136clubverso-mock-pix-49.90-5204000053039865405" + (total/100).toFixed(2) + "5802BR5920CLUBEVERSO6009SAO PAULO62070503***6304ABCD",
    });
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-black">Checkout — PIX</h1>
      <Card className="mt-4 p-4">
        <div className="text-sm font-bold">Resumo</div>
        <div className="text-sm">1× Flamengo 1895–2026 — {formatBRL(PRICE_FIRST_CENTS)}</div>
        {second && <div className="text-sm">1× 2ª edição ({second}) — {formatBRL(PRICE_SECOND_CENTS)} <span className="text-emerald-600">desconto aplicado</span></div>}
        <div className="mt-2 font-black">Total: {formatBRL(total)}</div>
        <div className="mt-3 text-xs text-zinc-500">Sem frete • Entrega digital • PIX com webhook idempotente • Estoque real</div>
      </Card>
      <Card className="mt-4 p-4">
        <label className="text-sm font-medium">E-mail para entrega</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" className="mt-1 w-full border rounded-xl px-3 py-2 text-sm" />
        {second && <input placeholder="E-mail do presenteado (para a 2ª edição)" className="mt-2 w-full border rounded-xl px-3 py-2 text-sm" />}
        {!pix ? (
          <Button onClick={gerarPix} disabled={!email || loading} className="w-full mt-4">{loading ? "Gerando PIX..." : "GERAR PIX"}</Button>
        ) : (
          <div className="mt-4 text-center">
            <div className="mx-auto h-40 w-40 bg-zinc-900 rounded-xl flex items-center justify-center text-white text-xs">QR CODE PIX<br/>{formatBRL(total)}</div>
            <div className="mt-3 text-xs font-mono bg-zinc-100 p-2 rounded-lg break-all">{pix.copy}</div>
            <Button variant="outline" className="mt-2 w-full" onClick={()=>navigator.clipboard.writeText(pix.copy)}>Copiar PIX Copia e Cola</Button>
            <div className="mt-3 text-sm font-bold text-emerald-600">Aguardando pagamento... (mock) • Webhook confirmará e atribuirá FLA-2026-DIG-xxxxx</div>
            <Link href="/minha-colecao"><Button className="w-full mt-3">Já paguei — ver minha coleção</Button></Link>
          </div>
        )}
      </Card>
      <div className="mt-3 text-xs text-zinc-500">Fluxo real: /api/orders cria Order+Payment → gateway PIX → webhook POST /api/webhooks/pix (valida assinatura HMAC, idempotência por providerTxId) → transação serializável reserva edição → certificado+QR → e-mail.</div>
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
