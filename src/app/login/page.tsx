"use client";
import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function LoginInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const rawCallback = sp.get("callbackUrl") || "/admin/pedidos";
  // Anti open-redirect: só aceita caminhos internos relativos
  const callbackUrl = rawCallback.startsWith("/") && !rawCallback.startsWith("//") ? rawCallback : "/admin/pedidos";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        <div className="relative mt-1">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            onKeyDown={(e) => e.key === "Enter" && entrar()}
            className="w-full border rounded-xl px-3 py-2 pr-11 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-zinc-800"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a17.6 17.6 0 0 1-2.16 3.19" /><path d="M6.61 6.61A17.5 17.5 0 0 0 2 12s3 7 10 7a10.7 10.7 0 0 0 4.39-.92" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
            )}
          </button>
        </div>
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