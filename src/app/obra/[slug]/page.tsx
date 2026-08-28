import { getWork, MOCK_CATALOG } from "@/lib/catalog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatBRL } from "@/lib/pricing";

const PAGES = [
  "Origem — 1895, remo e Rio","Primeiros anos","Consolidação no futebol — 1911","Primeiros grandes momentos","Crescimento","Formação da identidade","Primeira grande geração","Ascensão","Primeiro grande marco","Grande conquista","Era de ouro — Zico","Transição","Nova geração","Reconstrução","Grande momento moderno — Libertadores 1981","Capítulo histórico de destaque","Continuidade","Nova grande conquista — 2019","Desafios","Nova fase","Grande momento recente","Ano de fechamento — 2026","Ídolos e legado","Torcida, cultura e identidade","Encerramento + autenticação"
];

export function generateStaticParams() {
  return [{ slug: "flamengo-1895-2026" }];
}
export default function ObraPage({ params }: { params: { slug: string } }) {
  const work = getWork(params.slug);
  if (!work) return <div className="mx-auto max-w-6xl px-4 py-12">Obra não encontrada.</div>;
  const club = MOCK_CATALOG.clubs.find(c => c.slug === work.clubSlug)!;
  const available = work.maxSupply - work.issued;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="h-72 flex items-center justify-center text-white" style={{ background: club.primaryColor }}>
            <div className="text-center p-4"><div className="text-4xl font-black">{work.title}</div><div className="text-xs tracking-widest opacity-70 mt-1">25 PÁGINAS • HQ PREMIUM • ILUSTRAÇÕES ORIGINAIS</div><div className="mt-3 text-xs bg-white/20 px-3 py-1 rounded-full inline-block">Edição limitada {work.maxSupply.toLocaleString("pt-BR")} • {available.toLocaleString("pt-BR")} disponíveis</div></div>
          </div>
          <CardContent className="p-4 text-xs text-zinc-500">Capa ilustrada original (sem foto com direitos). Fechamento editorial: {work.editorialClosedAt} • Versão {work.version}</CardContent>
        </Card>
        <div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">{available.toLocaleString("pt-BR")} / {work.maxSupply.toLocaleString("pt-BR")} DISPONÍVEIS</Badge>
          <h1 className="text-3xl font-black mt-2" style={{ fontFamily: "var(--font-playfair)" }}>{work.title}</h1>
          <p className="text-zinc-600 mt-2">{work.subtitle}</p>
          <p className="text-sm text-zinc-500 mt-2">{work.description}</p>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-black text-[#C3281E]">{formatBRL(work.priceCents)}</span>
            <span className="text-sm text-zinc-500">+ 2ª edição por <b>{formatBRL(work.secondPriceCents)}</b> • ex: Flamengo + Palmeiras = {formatBRL(8980)}</span>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Link href={`/checkout?work=${work.slug}`}><Button size="lg" className="w-full text-base">COMPRAR POR {formatBRL(work.priceCents)}</Button></Link>
            <Link href={`/checkout?work=${work.slug}&second=palmeiras`}><Button variant="outline" className="w-full">LEVE 2ª EDIÇÃO POR {formatBRL(work.secondPriceCents)}</Button></Link>
            <div className="text-center text-xs text-zinc-500">PIX • QR + Copia e Cola • Certificado + QR de autenticidade • NFT opcional</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-center">
            <Card className="p-2"><b>25</b><div className="text-zinc-500">páginas</div></Card>
            <Card className="p-2"><b>10k</b><div className="text-zinc-500">tiragem</div></Card>
            <Card className="p-2"><b>HQ</b><div className="text-zinc-500">digital</div></Card>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-bold">As 25 páginas — distribuição editorial (adaptável por clube)</h3>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PAGES.map((t, i) => (
            <Card key={i} className="p-3 flex gap-3">
              <span className="h-6 w-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span>
              <span className="text-sm">{t}</span>
            </Card>
          ))}
        </div>
        <Card className="mt-4 p-4 bg-amber-50 border-amber-200 text-sm">
          <b>Princípio editorial:</b> Não é enciclopédia. Conta a história cronológica, emocionante e visualmente premium — origem, eras, ídolos, conquistas, torcida e encerramento autenticado. Sem inventar títulos/jogadores/resultados.
        </Card>
      </div>
    </div>
  );
}
