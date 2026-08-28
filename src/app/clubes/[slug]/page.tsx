import { MOCK_CATALOG, getClub, getWorkByClub } from "@/lib/catalog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatBRL } from "@/lib/pricing";

export function generateStaticParams() {
  return [{ slug: "flamengo" }, { slug: "palmeiras" }];
}
export default function ClubPage({ params }: { params: { slug: string } }) {
  const club = getClub(params.slug);
  if (!club) return <div className="mx-auto max-w-6xl px-4 py-12">Clube não encontrado. <Link href="/" className="underline">Voltar</Link></div>;
  const work = getWorkByClub(club.slug);
  const isFlamengo = club.slug === "flamengo";
  return (
    <div>
      <div className="text-white py-10" style={{ background: `linear-gradient(135deg, ${club.primaryColor} 0%, ${club.secondaryColor} 100%)` }}>
        <div className="mx-auto max-w-6xl px-4">
          <Badge className="bg-white/20 text-white border-white/30">BRASIL • BRASILEIRÃO • {club.shortCode}</Badge>
          <h1 className="mt-2 text-4xl font-black" style={{ fontFamily: "var(--font-playfair)" }}>{club.name}</h1>
          <p className="text-white/80 text-sm mt-1">Página do clube com identidade própria • {isFlamengo ? "Textura histórica + elementos náuticos + Rio" : "Em breve"}</p>
          <div className="mt-3 text-xs bg-black/20 inline-block px-3 py-1 rounded-full">Status de licenciamento: {club.licensingStatus} • Conteúdo editorial independente</div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="font-bold">Obras</h2>
          {work ? (
            <Card className="mt-3 overflow-hidden">
              <div className="h-40 flex items-center justify-center text-white" style={{ background: club.primaryColor }}>
                <div className="text-center"><div className="text-3xl font-black">{club.shortCode} — 1895–2026</div><div className="text-xs opacity-70">25 PÁGINAS • EDIÇÃO LIMITADA</div></div>
              </div>
              <CardContent className="p-4">
                <div className="font-bold">{work.title}</div>
                <div className="text-sm text-zinc-600">{work.description}</div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/obra/${work.slug}`}><Button>Ver obra • {formatBRL(work.priceCents)}</Button></Link>
                  <Link href={`/obra/${work.slug}`}><Button variant="outline">Detalhes</Button></Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-3 p-6 text-sm text-zinc-500">Obra em produção. Pipeline: Pesquisa → Roteiro 25 págs → Ilustrações originais → Revisão → Publicação.</Card>
          )}
        </div>
        <div>
          <Card className="p-4">
            <div className="font-bold text-sm">Sobre o clube</div>
            <div className="text-xs text-zinc-500 mt-1">{isFlamengo ? "Fundado em 1895 para remo, consolidação no futebol a partir de 1911, identidade rubro-negra e maior torcida do Brasil." : "História em curadoria. 25 capítulos cobrindo origem, eras de ouro, ídolos e torcida."}</div>
            <div className="mt-3 text-xs">Disponíveis: {work ? (work.maxSupply - work.issued).toLocaleString("pt-BR") + " / " + work.maxSupply.toLocaleString("pt-BR") : "—"}</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
