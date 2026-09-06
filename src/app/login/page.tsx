"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function LoginInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const callbackUrl = sp.get("callbackUrl") || "/admin/pedidos";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function entrar() {
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Email ou senha inválidos.");
      return;
    }
    router.push(callbackUrl);
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-black text-center">Entrar</h1>
      <Card className="mt-4 p-4">
        <label className="text-sm font-medium">E-mail</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          type="email"
          className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
        />
        <label className="text-sm font-medium mt-3 block">Senha</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          type="password"
          onKeyDown={(e) => e.key === "Enter" && entrar()}
          className="mt-1 w-full border rounded-xl px-3 py-2 text-sm"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <Button onClick={entrar} disabled={!email || !password || loading} className="w-full mt-4">
          {loading ? "Entrando..." : "ENTRAR"}
        </Button>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-sm px-4 py-16">Carregando...</div>}>
      <LoginInner />
    </Suspense>
  );
}