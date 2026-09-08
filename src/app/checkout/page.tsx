"use client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBRL, PRICE_FIRST_CENTS, PRICE_SECOND_CENTS, calculateTotal } from "@/lib/pricing";
import { getWork, getClub } from "@/lib/catalog";
import { ClubShield } from "@/components/site/ClubShield";
import { Check } from "lucide-react";
import { useState, Suspense } from "react";

function CheckoutInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const workSlug = sp.get("work") || "flamengo-1895-2026";
  const work = getWork(workSlug) ?? getWork("flamengo-1895-2026")!;
  const club = getClub(work.clubSlug)!;
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
          workSlug: work.slug,
          customerEmail: email,
          gift: wantsSecond && giftEmail ? { recipientEmail: giftEmail } : undefined,
        }),
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Falha na resposta do servidor (${res.status}). Tente novamente.`);
      }
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
      <Link href={`/obra/${work.slug}`} className="text-sm font-semibold text-zinc-500 hover:underline">
        ← Voltar para a HQ
      </Link>
      <h1 className="mt-2 text-2xl font-black tracking-tight">Finalizar compra</h1>

      <Card className="mt-4 p-4">
        <div className="flex items-center gap-3">
          <ClubShield src={club.shield} alt={club.name} size={56} primaryColor={club.primaryColor} />
          <div>
            <div className="font-black">{work.title}</div>
            <div className="text-xs text-zinc-500">HQ digital • 25 páginas • Edição numerada • Certificado</div>
          </div>
        </div>
        <div className="mt-3 border-t pt-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span>1× {work.title}</span>
            <span className="font-semibold">{formatBRL(PRICE_FIRST_CENTS)}</span>
          </div>
          {wantsSecond && (
            <div className="flex justify-between">
              <span>
                1× 2ª edição <span className="text-emerald-600 font-semibold">(presente, com desconto)</span>
              </span>
              <span className="font-semibold">{formatBRL(PRICE_SECOND_CENTS)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black pt-1">
            <span>Total</span>
            <span>{formatBRL(total)}</span>
          </div>
        </div>
        <ul className="mt-3 space-y-1 text-xs text-zinc-500">
          {["Sem frete", "Entrega digital por e-mail", "Pagamento via PIX", "A numeração é atribuída após a confirmação"].map(
            (t) => (
              <li key={t} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden /> {t}
              </li>
            )
          )}
        </ul>
      </Card>

      <Card className="mt-4 p-4">
        <label htmlFor="checkout-email" className="text-sm font-bold">
          E-mail para receber sua HQ e certificado
        </label>
        <input
          id="checkout-email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nome@exemplo.com"
          type="email"
          autoComplete="email"
          className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Confira se o e-mail está correto. É para ele que enviaremos o acesso à sua edição.
        </p>
        {wantsSecond && (
          <>
            <label htmlFor="checkout-gift" className="text-sm font-bold mt-3 block">
              E-mail do presenteado
            </label>
            <input
              id="checkout-gift"
              value={giftEmail}
              onChange={(e) => setGiftEmail(e.target.value)}
              placeholder="E-mail de quem vai receber a 2ª edição"
              type="email"
              className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
            />
          </>
        )}
        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <Button onClick={gerarPix} disabled={!email || loading} className="w-full mt-4 py-6 text-base font-bold bg-[#C3281E] hover:bg-[#9F1F18]">
          {loading ? "Gerando seu PIX..." : `Gerar meu PIX de ${formatBRL(total)}`}
        </Button>
        <ul className="mt-3 space-y-1 text-xs text-zinc-500">
          <li>• Pagamento via PIX</li>
          <li>• Sem frete</li>
          <li>• Entrega digital</li>
          <li>• Suporte ao comprador</li>
        </ul>
      </Card>

      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Após o pagamento, a confirmação será realizada pela equipe e a edição será liberada para o e-mail informado.
      </p>
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
