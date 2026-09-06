"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MinhaColecao() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  async function baixar() {
    setLoading(true);
    setError(null);
    setRemaining(null);
    try {
      const res = await fetch(
        `/api/editions/download?code=${encodeURIComponent(code.trim().toUpperCase())}&email=${encodeURIComponent(email.trim())}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível liberar o download.");
      setRemaining(typeof data.remaining === "number" ? data.remaining : null);
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-black tracking-tight">Minha coleção</h1>
      <p className="text-sm text-zinc-500">
        Digite o código da sua edição e o e-mail usado na compra para baixar o PDF personalizado (limite de 10
        downloads por edição).
      </p>
      <Card className="mt-4">
        <CardContent className="p-4">
          <label className="text-sm font-medium">Código da edição</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="FLA-2026-DIG-00001"
            className="mt-1 w-full border rounded-xl px-3 py-2 text-sm font-mono uppercase"
          />
          <label className="text-sm font-medium mt-3 block">E-mail da compra</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            type="email"
            onKeyDown={(e) => e.key === "Enter" && baixar()}
            className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {remaining !== null && (
            <p className="mt-2 text-sm text-emerald-700">Download liberado! Restam {remaining} downloads.</p>
          )}
          <Button onClick={baixar} disabled={!code || !email || loading} className="w-full mt-4">
            {loading ? "Liberando..." : "BAIXAR PDF"}
          </Button>
        </CardContent>
      </Card>
      <p className="mt-3 text-xs text-zinc-500">
        O e-mail funciona como senha do download — sem login. Guarde seu código e use o mesmo e-mail da compra.
      </p>
    </div>
  );
}