import { getWork, MOCK_CATALOG } from "@/lib/catalog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatBRL } from "@/lib/pricing";
import { ClubShield } from "@/components/site/ClubShield";
import { assetPath } from "@/lib/utils";
import { PagesGrid } from "@/components/site/PagesGrid";

const PAGES = [
  "Origem — 1895, remo e Rio",
  "Primeiros anos",
  "Consolidação no futebol — 1911",
  "Primeiros grandes momentos",
  "Crescimento",
  "Formação da identidade",
  "Primeira grande geração",
  "Ascensão",
  "Primeiro grande marco",
  "Grande conquista",
  "Era de ouro — Zico",
  "Transição",
  "Nova geração",
  "Reconstrução",
  "Grande momento moderno — Libertadores 1981",
  "Capítulo histórico de destaque",
  "Continuidade",
  "Nova grande conquista — 2019",
  "Desafios",
  "Nova fase",
  "Grande momento recente",
  "Ano de fechamento — 2026",
  "Ídolos e legado",
  "Torcida, cultura e identidade",
  "Encerramento + autenticação",
];

export function generateStaticParams() {
  return [{ slug: "flamengo-1895-2026" }];
}
export default function ObraPage({ params }: { params: { slug: string } }) {
  const work = getWork(params.slug);
  if (!work) return <div className="mx-auto max-w-6xl px-4 py-12">Obra não encontrada.</div>;
  const club = MOCK_CATALOG.clubs.find((c) => c.slug === work.clubSlug)!;
  const available = work.maxSupply - work.issued;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden shine">
          <div className="relative h-[340px] flex flex-col items-center justify-center text-white overflow-hidden" style={{ background: `linear-gradient(135deg, ${club.primaryColor} 0%, #0a0a0a 80%)` }}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }} />
            <div className="absolute top-4 left-4 right-4 flex justify-between text-[10px] tracking-widest opacity-70">
              <span>CLUBEVERSO • EDIÇÃO LIMITADA</span>
              <span>{work.version}</span>
            </div>
            <ClubShield src={club.shield} alt={club.name} size={120} primaryColor={club.primaryColor} />
            <div className="relative mt-4 text-center">
              <div className="text-2xl font-black tracking-tight">{work.title}</div>
              <div className="text-xs tracking-[0.22em] opacity-70 mt-1">25 PÁGINAS • HQ PREMIUM • ILUSTRAÇÕES ORIGINAIS</div>
              <div className="mt-3 text-xs bg-white/15 border border-white/20 px-3 py-1 rounded-full inline-block backdrop-blur">
                {work.issued} / {work.maxSupply} • {available} disponíveis
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
          <CardContent className="p-4 flex items-center justify-between text-xs text-zinc-500">
            <span>Fechamento editorial: {work.editorialClosedAt} • {work.version}</span>
            <span className="flex items-center gap-1.5">
              <img src={assetPath(club.shield)} alt={club.name} className="h-5 w-auto" /> {club.name}
            </span>
          </CardContent>
        </Card>
        <div>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">{work.issued} / {work.maxSupply} • {available} DISPONÍVEIS</Badge>
          <h1 className="text-3xl font-black mt-2 tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
            {work.title}
          </h1>
          <p className="text-zinc-600 mt-2">{work.subtitle}</p>
          <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{work.description}</p>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-black" style={{ color: club.primaryColor }}>
              {formatBRL(work.priceCents)}
            </span>
            <span className="text-sm text-zinc-500">
              + 2ª edição por <b>{formatBRL(work.secondPriceCents)}</b> • ex: Flamengo + Palmeiras = {formatBRL(8980)}
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Link href={`/checkout?work=${work.slug}`}>
              <Button size="lg" className="w-full text-base shine bg-[#C3281E] hover:bg-[#9F1F18]">
                COMPRAR AGORA • {formatBRL(work.priceCents)} — PIX
              </Button>
            </Link>
            <div className="text-center text-xs text-zinc-500">Venda sequencial: após 1 é o 2, depois 3... • 1/10000 • 9.999 disponíveis • PIX estático</div>
            <div className="text-center text-xs text-zinc-500">PIX • QR + Copia e Cola • Certificado + QR de autenticidade</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-center">
            <Card className="p-3">
              <div className="font-black text-lg">25</div>
              <div className="text-zinc-500">páginas HQ</div>
            </Card>
            <Card className="p-3">
              <div className="font-black text-lg">{work.maxSupply}</div>
              <div className="text-zinc-500">tiragem</div>
            </Card>
            <Card className="p-3">
              <div className="font-black text-lg">✓</div>
              <div className="text-zinc-500">autenticada</div>
            </Card>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
            <img src={assetPath(club.shield)} alt={club.name} className="h-6 w-auto bg-white border rounded-lg p-0.5" />
            Obra com escudo oficial • Tiragem reiniciada 1/10000
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="font-black text-lg">As 25 páginas — distribuição editorial</h3>
        <p className="text-sm text-zinc-500">Cada página um capítulo ilustrado. Adaptável à história de cada clube, sem forçar acontecimentos.</p>
        <PagesGrid pages={PAGES} clubColor={club.primaryColor} />
        <Card className="mt-4 p-4 bg-amber-50 border-amber-200 text-sm leading-relaxed">
          <b>Princípio editorial:</b> Não é enciclopédia. Conta a história cronológica, emocionante e visualmente premium — origem, eras, ídolos, conquistas, torcida e encerramento autenticado. Sem inventar títulos/jogadores/resultados.
        </Card>
      </div>
    </div>
  );
}
