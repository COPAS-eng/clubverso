import { MOCK_CATALOG, getClub, getWorkByClub } from "@/lib/catalog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatBRL } from "@/lib/pricing";
import { ClubShield } from "@/components/site/ClubShield";
import { assetPath } from "@/lib/utils";

export function generateStaticParams() {
  return MOCK_CATALOG.clubs.map((c) => ({ slug: c.slug }));
}

export default function ClubPage({ params }: { params: { slug: string } }) {
  const club = getClub(params.slug);
  if (!club) return <div className="mx-auto max-w-6xl px-4 py-12">Clube não encontrado. <Link href="/" className="underline">Voltar</Link></div>;
  const work = getWorkByClub(club.slug);
  return (
    <div>
      <div className="relative overflow-hidden text-white py-10" style={{ background: `linear-gradient(135deg, ${club.primaryColor} 0%, #0a0a0a 78%)` }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }} />
        <div className="relative mx-auto max-w-6xl px-4 flex gap-6 items-center">
          <ClubShield src={club.shield} alt={club.name} size={110} primaryColor={club.primaryColor} />
          <div>
            <Badge className="bg-white/15 text-white border-white/20 backdrop-blur">BRASIL • BRASILEIRÃO • {club.shortCode} • {club.city} • {club.founded}</Badge>
            <h1 className="mt-2 text-4xl font-black tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>{club.name}</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">Identidade própria com escudo oficial. Conteúdo editorial independente, sem selo oficial sem licenciamento.</p>
            <div className="mt-3 text-xs bg-black/20 inline-block px-3 py-1 rounded-full border border-white/10">Licenciamento: {club.licensingStatus}</div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="font-black">Obras</h2>
          {work ? (
            <Card className="mt-3 overflow-hidden shine group">
              <div className="h-44 flex items-center justify-center text-white relative overflow-hidden" style={{ background: club.primaryColor }}>
                <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <img src={assetPath(club.shield)} alt={club.name} className="relative h-20 w-auto bg-white rounded-[12%] p-2 shadow-xl group-hover:scale-[1.03] transition duration-300" />
                <span className="absolute bottom-3 text-xs tracking-[0.24em] opacity-80">25 PÁGINAS • EDIÇÃO LIMITADA</span>
              </div>
              <CardContent className="p-4">
                <div className="font-black">{work.title}</div>
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

          <div className="mt-6">
            <h3 className="font-bold text-sm">Outros clubes do Brasileirão</h3>
            <div className="mt-3 grid grid-cols-4 sm:grid-cols-8 gap-2">
              {MOCK_CATALOG.clubs.map((c) => (
                <Link key={c.slug} href={`/clubes/${c.slug}`} className={`rounded-2xl border p-2 flex flex-col items-center gap-1.5 hover:shadow hover:-translate-y-0.5 transition ${c.slug === club.slug ? "bg-zinc-900 text-white border-zinc-900" : "bg-white"}`}>
                  <img src={assetPath(c.shield)} alt={c.name} className="h-9 w-auto object-contain bg-white rounded-lg p-1" />
                  <span className="text-[10px] font-bold">{c.shortCode}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <img src={assetPath(club.shield)} alt={club.name} className="h-10 w-auto bg-white border rounded-xl p-1" />
              <div>
                <div className="font-bold text-sm">{club.name}</div>
                <div className="text-xs text-zinc-500">{club.city} • Fundado em {club.founded}</div>
              </div>
            </div>
            <div className="mt-3 text-xs leading-relaxed text-zinc-600">{work ? `${work.issued} / ${work.maxSupply} • ${work.maxSupply - work.issued} disponíveis` : "em breve"} • Tiragem reiniciada 1/1000.</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
