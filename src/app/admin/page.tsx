import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_CATALOG } from "@/lib/catalog";
import { assetPath } from "@/lib/utils";

export default function AdminPage() {
  const work = MOCK_CATALOG.works[0];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-black tracking-tight">ADMIN — CLUBEVERSO</h1>
      <p className="text-sm text-zinc-500">Painel com Inventory, Pedidos, Pagamentos, Direitos, Auditoria. RBAC ADMIN. Dados mock — com DB mostram valores reais.</p>
      <div className="mt-5 grid md:grid-cols-3 gap-3">
        <Card className="p-4 overflow-hidden">
          <div className="flex items-center gap-3">
            <img src={assetPath(MOCK_CATALOG.clubs.find((c) => c.slug === "flamengo")!.shield)} alt="FLA" className="h-10 w-auto" />
            <div>
              <div className="text-xs text-zinc-500">Flamengo 1895–2026</div>
              <div className="text-2xl font-black">{work.issued} / {work.maxSupply}</div>
            </div>
          </div>
          <div className="text-xs text-emerald-600 font-semibold">{work.maxSupply - work.issued} disponíveis • Reiniciado 1/10000</div>
          <div className="mt-2 w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
            <div className="h-full bg-[#C3281E]" style={{ width: `${(work.issued / work.maxSupply) * 100}%` }} />
          </div>
          <Badge className="mt-3 bg-emerald-50 text-emerald-700 border-emerald-200">PUBLISHED</Badge>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-bold">Última edição</div>
          <div className="font-mono text-xs mt-1">FLA-2026-DIG-04827</div>
          <div className="text-xs text-zinc-500 mt-1">Reserva transacional com FOR UPDATE • UNIQUE(workId, editionNumber)</div>
          <div className="mt-3 text-xs bg-zinc-50 border rounded-xl p-2">8 clubes • 1 obra • 25 páginas cada</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-bold">Clubes com escudo</div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {MOCK_CATALOG.clubs.map((c) => (
              <div key={c.slug} className="flex flex-col items-center gap-1">
                <img src={assetPath(c.shield)} alt={c.name} className="h-8 w-auto bg-white border rounded-lg p-1" />
                <span className="text-[9px] font-bold">{c.shortCode}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-4 p-4 text-xs leading-relaxed">
        <b>Módulos:</b> Continentes • Países • Ligas • Clubes • Obras (25 págs) • Edições • Pedidos • Pagamentos • Clientes • Presentes • Certificados • QR • Conteúdo • Direitos (Content Rights Manager) • NFT • E-mails • Analytics • Auditoria (AuditLog imutável).
        <br />
        <span className="text-zinc-500">Escudos exibidos via Wikimedia Commons. “Encontrado no Google” ≠ livre — RightsRecord verifica licença comercial.</span>
      </Card>
    </div>
  );
}
