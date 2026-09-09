import { getWork, MOCK_CATALOG } from "@/lib/catalog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatBRL } from "@/lib/pricing";
import { WorkCover } from "@/components/site/WorkCover";
import { PreviewGallery } from "@/components/site/PreviewGallery";
import { assetPath } from "@/lib/utils";
import { PagesGrid } from "@/components/site/PagesGrid";

const PAGES = [
  "Capa — O Mengão em quadrinhos",
  "A fundação — 1895",
  "As cores rubro-negras",
  "O primeiro grande ídolo",
  "O estádio que vira casa",
  "A era de ouro dos anos 1940",
  "A conquista do primeiro título",
  "O time de 1981 — geração imortal",
  "Brasileirão 1987",
  "Anos 90 — raça e ídolos",
  "Domínio nacional — anos 2000",
  "Década de 2010 — novos ídolos",
  "2014 — o ano mágico",
  "2015 — o continente é rubro-negro",
  "2016 — a nova geração",
  "2017 — superação e conquistas",
  "2018 — domínio e recorde",
  "2019 — consagração mundial",
  "2020 — resiliência, fé e mais glórias",
  "2021 — reinvenção, superação e mais uma taça",
  "2020 — o desafio de continuar no topo",
  "2021 — uma final que quase virou glória",
  "2024 — raça, união e conquista",
  "Símbolos e tradições",
  "Mais que um clube",
  "O futuro é rubro-negro + certificado",
];

export function generateStaticParams() {
  return [{ slug: "flamengo-1895-2026" }];
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const work = getWork(params.slug);
  if (!work) return { title: "Obra não encontrada — CLUBEVERSO" };
  return {
    title: `${work.title} — HQ digital R$ 49,90 | CLUBEVERSO`,
    description: `${work.subtitle} ${work.totalPages} páginas ilustradas, edição numerada de 10.000 exemplares, certificado de autenticidade. Entrega digital, pagamento via PIX.`,
    openGraph: {
      title: `${work.title} — HQ digital | CLUBEVERSO`,
      description: `${work.totalPages} páginas • Edição numerada • Certificado • R$ 49,90`,
      type: "website",
      locale: "pt_BR",
    },
  };
}
export default function ObraPage({ params }: { params: { slug: string } }) {
  const work = getWork(params.slug);
  if (!work) return <div className="mx-auto max-w-6xl px-4 py-12">Obra não encontrada.</div>;
  const club = MOCK_CATALOG.clubs.find((c) => c.slug === work.clubSlug)!;
  const available = work.maxSupply - work.issued;
  const previews = ((work as { previewImageUrls?: string[] }).previewImageUrls ?? []).map((src, i) => ({
    src,
    caption: `Página ${i + 1}`,
  }));
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <WorkCover
            coverUrl={work.coverImageUrl}
            shield={club.shield}
            clubName={club.name}
            primaryColor={club.primaryColor}
            title={work.title}
            totalPages={work.totalPages}
          />
          <CardContent className="p-4 flex items-center justify-between text-xs text-zinc-500">
            <span>Fechamento editorial: {work.editorialClosedAt} • {work.version}</span>
            <span className="flex items-center gap-1.5">
              <img src={assetPath(club.shield)} alt={club.name} className="h-5 w-auto" /> {club.name}
            </span>
          </CardContent>
        </div>
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
              <Button size="lg" className="w-full text-base shine bg-[#C3281E] hover:bg-[#9F1F18] font-bold">
                Quero minha edição — {formatBRL(work.priceCents)}
              </Button>
            </Link>
            <div className="text-center text-xs text-zinc-500">Tiragem limitada de 10.000 exemplares • Numeração atribuída após a confirmação • Pagamento via PIX</div>
            <div className="text-center text-xs text-zinc-500">PIX • QR + Copia e Cola • Certificado + QR de autenticidade</div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-center">
            <Card className="p-3">
              <div className="font-black text-lg">{work.totalPages}</div>
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
            Obra com escudo oficial • Edição numerada em tiragem de 10.000
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="font-black text-lg">Prévias reais da edição</h3>
        <p className="text-sm text-zinc-500">Páginas reais da HQ — estilo e qualidade antes de comprar.</p>
        <PreviewGallery pages={previews} />
      </div>

      <div className="mt-10">
        <h3 className="font-black text-lg">As {work.totalPages} páginas — distribuição editorial</h3>
        <p className="text-sm text-zinc-500">Cada página um capítulo ilustrado. Adaptável à história de cada clube, sem forçar acontecimentos.</p>
        <PagesGrid pages={PAGES} clubColor={club.primaryColor} />
        <Card className="mt-4 p-4 bg-amber-50 border-amber-200 text-sm leading-relaxed">
          <b>Princípio editorial:</b> Não é enciclopédia. Conta a história cronológica, emocionante e visualmente premium — origem, eras, ídolos, conquistas, torcida e encerramento autenticado. Sem inventar títulos/jogadores/resultados.
        </Card>
        <Card className="mt-4 p-5 text-center bg-zinc-950 text-white border-zinc-950">
          <div className="text-lg font-black">Garanta sua edição numerada</div>
          <p className="mt-1 text-sm text-white/70">
            Tiragem limitada de {work.maxSupply.toLocaleString("pt-BR")} exemplares • Entrega digital • Pagamento via PIX
          </p>
          <Link href={`/checkout?work=${work.slug}`} className="mt-4 inline-block w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-[#C3281E] hover:bg-[#9F1F18] font-bold px-8">
              Quero minha edição — {formatBRL(work.priceCents)}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
