import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_CATALOG } from "@/lib/catalog";
import { formatBRL } from "@/lib/pricing";

export default function Home() {
  const work = MOCK_CATALOG.works[0];
  const available = work.maxSupply - work.issued;
  return (
    <div>
      {/* Hero */}
      <section className="clubverso-gradient text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Badge className="bg-white/10 text-white border-white/20 mb-3">EDIÇÃO LIMITADA • 10.000 EXEMPLARES</Badge>
            <h1 className="font-black text-4xl md:text-5xl leading-none" style={{ fontFamily: "var(--font-playfair)" }}>
              CLUBEVERSO
            </h1>
            <p className="text-xl text-white/80 mt-2 font-light">A história digital do seu clube.</p>
            <p className="mt-4 text-white/70 max-w-xl">Livros digitais colecionáveis em formato HQ/Graphic Novel. 25 páginas originais, edição numerada, certificado e QR de autenticidade. Começando pelo Flamengo 1895–2026.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/clubes/flamengo"><Button size="lg">ESCOLHA SEU CLUBE →</Button></Link>
              <Link href="/obra/flamengo-1895-2026"><Button variant="outline" size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100">Ver obra Flamengo</Button></Link>
            </div>
            <div className="mt-6 flex gap-6 text-sm">
              <span><b className="text-white">25</b> <span className="text-white/60">páginas</span></span>
              <span><b className="text-white">{work.maxSupply.toLocaleString("pt-BR")}</b> <span className="text-white/60">edições</span></span>
              <span><b className="text-white">{formatBRL(work.priceCents)}</b> <span className="text-white/60">+ 2ª por {formatBRL(work.secondPriceCents)}</span></span>
            </div>
          </div>
          <Card className="overflow-hidden border-white/10 bg-white text-zinc-900">
            <div className="h-48 flamengo-accent flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-5xl font-black tracking-tighter">FLA</div>
                <div className="text-xs tracking-[0.3em] opacity-70">1895 — 2026</div>
                <div className="mt-2 text-xs bg-white/20 px-3 py-1 rounded-full">CAPA HQ • ILUSTRAÇÃO ORIGINAL</div>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="text-sm font-bold">{work.title}</div>
              <div className="text-xs text-zinc-500">{work.subtitle}</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-[#C3281E]">{formatBRL(work.priceCents)}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{available.toLocaleString("pt-BR")} disponíveis</span>
              </div>
              <Link href="/obra/flamengo-1895-2026" className="mt-3 block"><Button className="w-full">COMPRAR POR {formatBRL(work.priceCents)}</Button></Link>
              <div className="mt-2 text-center text-[11px] text-zinc-500">Leve 2ª edição por {formatBRL(work.secondPriceCents)} • QR + Certificado</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Escolha seu clube */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-xl font-black">Escolha seu clube</h2>
        <p className="text-sm text-zinc-500">Continente → País → Liga → Clube → Obra</p>
        <div className="mt-4 grid gap-3">
          <Card className="p-4 flex items-center justify-between">
            <div><div className="font-bold">América do Sul</div><div className="text-xs text-zinc-500">1 continente • 1 país • 1 liga • 2 clubes • 1 obra publicada</div></div>
            <Badge>Ativo</Badge>
          </Card>
          <div className="grid sm:grid-cols-2 gap-3">
            {MOCK_CATALOG.clubs.map(c => (
              <Link key={c.slug} href={`/clubes/${c.slug}`}>
                <Card className="p-4 hover:shadow-md transition flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ background: c.primaryColor }}>{c.shortCode}</div>
                  <div><div className="font-bold text-sm">{c.name}</div><div className="text-xs text-zinc-500">Brasileirão • {c.slug === "flamengo" ? "Obra disponível" : "Em breve"}</div></div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-6 grid md:grid-cols-3 gap-3 text-xs">
          <Card className="p-4"><b>✓ Tiragem real</b><div className="text-zinc-500">Contador conectado ao banco. Nunca fake. {available.toLocaleString("pt-BR")} / 10.000 disponíveis.</div></Card>
          <Card className="p-4"><b>✓ Autenticidade</b><div className="text-zinc-500">Cada edição com código único FLA-2026-DIG-xxxxx, certificado e QR em clubverso.com/verificar.</div></Card>
          <Card className="p-4"><b>✓ PIX + Presente</b><div className="text-zinc-500">PIX com webhook idempotente. Presenteie a 2ª edição por R$39,90 via e-mail.</div></Card>
        </div>
      </section>
    </div>
  );
}
