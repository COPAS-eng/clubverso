import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-black">ADMIN — CLUBEVERSO</h1>
      <p className="text-sm text-zinc-500">Painel com Inventory, Pedidos, Pagamentos, Direitos, Auditoria. RBAC ADMIN.</p>
      <div className="mt-4 grid md:grid-cols-3 gap-3">
        <Card className="p-4"><div className="text-xs text-zinc-500">Flamengo 1895–2026</div><div className="text-2xl font-black">4.827 / 10.000</div><div className="text-xs text-emerald-600">5.173 disponíveis</div><Badge className="mt-2">PUBLISHED</Badge></Card>
        <Card className="p-4"><div className="text-sm font-bold">Última edição</div><div className="font-mono text-xs">FLA-2026-DIG-04827</div><div className="text-xs text-zinc-500">Reserva transacional com FOR UPDATE</div></Card>
        <Card className="p-4"><div className="text-sm font-bold">Módulos</div><div className="text-xs text-zinc-500">Clubes • Ligas • Países • Continentes • Obras (25 págs) • Edições • Pedidos • Pagamentos • Clientes • Presentes • Certificados • QR • Conteúdo • Direitos • NFT • E-mails • Analytics • Auditoria</div></Card>
      </div>
      <Card className="mt-4 p-4 text-xs">
        <b>AuditLog imutável:</b> criação de obra, venda, pagamento, atribuição de número, certificado, QR, mint NFT, alterações administrativas.<br/>
        <b>Content Rights Manager:</b> asset_id, licença, permite_uso_comercial, exige_atribuição, status. “Encontrado no Google” ≠ livre.
      </Card>
    </div>
  );
}
