import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MOCK_CATALOG } from "@/lib/catalog";

export default function MinhaColecao() {
  const club = MOCK_CATALOG.clubs.find((c) => c.slug === "flamengo")!;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-black tracking-tight">Minha coleção</h1>
      <p className="text-sm text-zinc-500">Após o pagamento, suas edições aparecem aqui com Ler / Baixar / Certificado / Ver autenticidade / Ver NFT.</p>
      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <Card className="overflow-hidden group">
          <div className="h-28 flex items-center gap-3 px-4 text-white" style={{ background: club.primaryColor }}>
            <img src={club.shield} alt={club.name} className="h-16 w-auto bg-white rounded-xl p-1.5 shadow" />
            <div>
              <div className="font-black">FLA — 1895–2026</div>
              <div className="text-xs opacity-80">HQ premium • 25 páginas</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs bg-white/15 border border-white/20 px-2 py-1 rounded-full">#04827 / 10.000</div>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="text-sm font-bold">Flamengo — 1895–2026 • Edição #04827 / 10.000</div>
            <div className="text-xs font-mono text-zinc-500">FLA-2026-DIG-04827 • AUTÊNTICA</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm">LER</Button>
              <Button size="sm" variant="outline">BAIXAR</Button>
              <Link href="/verificar/FLA-2026-DIG-04827">
                <Button size="sm" variant="outline">
                  VER AUTENTICIDADE
                </Button>
              </Link>
              <Button size="sm" variant="outline">VER CERTIFICADO</Button>
              <Button size="sm" variant="ghost">VER NFT</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="p-6 border-dashed flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-2xl bg-zinc-100 grid place-items-center text-zinc-400">＋</div>
          <div className="mt-2 text-sm font-semibold">Adicione outra edição</div>
          <div className="text-xs text-zinc-500">Segunda edição por R$39,90 — pode presentear por e-mail</div>
          <Link href="/obra/flamengo-1895-2026" className="mt-3">
            <Button variant="outline" size="sm">
              Ver obras
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
