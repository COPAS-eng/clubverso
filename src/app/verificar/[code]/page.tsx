import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MOCK_CATALOG } from "@/lib/catalog";
import { assetPath } from "@/lib/utils";

export function generateStaticParams() {
  return [{ code: "FLA-2026-DIG-04827" }, { code: "FLA-2026-DIG-00001" }, { code: "PAL-2026-DIG-00001" }];
}
export default function VerificarPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code);
  const m = code.match(/^([A-Z]{2,5})-2026-DIG-(\d{5})$/);
  const club = m ? MOCK_CATALOG.clubs.find((c) => c.shortCode === m[1]) || MOCK_CATALOG.clubs[0] : null;
  const isValid = !!m && !!club;
  const editionNum = m ? Number(m[2]) : null;
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Card className="overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: club ? club.primaryColor : "#C3281E" }} />
        <div className="p-6 text-center">
          {isValid ? (
            <>
              <div className="mx-auto h-16 w-16 rounded-2xl bg-white border shadow flex items-center justify-center p-2">
                <img src={assetPath(club!.shield)} alt={club!.name} className="h-full w-auto object-contain" />
              </div>
              <Badge className="mt-3 bg-emerald-50 text-emerald-700 border-emerald-200">EDIÇÃO AUTÊNTICA ✓</Badge>
              <h1 className="mt-2 text-2xl font-black tracking-tight" style={{ fontFamily: "var(--font-playfair)" }}>
                Autenticidade confirmada
              </h1>
              <p className="text-sm text-zinc-500">Verificação permanente em clubverso.com</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-left text-sm">
                <div className="rounded-xl bg-zinc-50 border p-3">
                  <div className="text-zinc-500 text-xs">Clube</div>
                  <div className="font-bold flex items-center gap-2">
                    <img src={assetPath(club!.shield)} alt={club!.name} className="h-5 w-auto" /> {club!.name}
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-50 border p-3">
                  <div className="text-zinc-500 text-xs">Obra</div>
                  <div className="font-bold">Flamengo — 1895–2026</div>
                </div>
                <div className="rounded-xl bg-zinc-50 border p-3">
                  <div className="text-zinc-500 text-xs">Edição</div>
                  <div className="font-black text-lg">#{String(editionNum).padStart(5, "0")} / 10.000</div>
                </div>
                <div className="rounded-xl bg-zinc-50 border p-3">
                  <div className="text-zinc-500 text-xs">Código</div>
                  <div className="font-mono text-xs font-bold">{code}</div>
                </div>
                <div className="rounded-xl bg-zinc-50 border p-3">
                  <div className="text-zinc-500 text-xs">Versão</div>
                  <div className="font-mono text-xs">FLA-2026-V1</div>
                </div>
                <div className="rounded-xl bg-zinc-50 border p-3">
                  <div className="text-zinc-500 text-xs">Fechamento</div>
                  <div className="text-xs">28/08/2026</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-zinc-900 text-white rounded-xl text-xs text-left">
                <div className="opacity-70">QR aponta para</div>
                <div className="font-mono">clubverso.com/verificar/{code}</div>
                <div className="mt-1 opacity-60">NFT: Não emitido • QR nunca aponta direto para PDF ou blockchain</div>
              </div>
              <div className="mt-3 text-xs text-zinc-500">Nenhum dado PII exibido (sem CPF/e-mail/telefone). LGPD.</div>
            </>
          ) : (
            <>
              <Badge className="bg-red-50 text-red-700 border-red-200">NÃO ENCONTRADA</Badge>
              <h1 className="mt-3 text-xl font-bold">Código inválido</h1>
              <p className="text-sm text-zinc-500 mt-1">Verifique o código: {code}</p>
            </>
          )}
          <Link href="/" className="mt-6 inline-block text-sm font-semibold underline">
            Voltar à home
          </Link>
        </div>
      </Card>
      <Card className="mt-4 p-4 text-xs text-zinc-500 border-dashed">Camada permanente CLUBEVERSO de autenticação. Mesmo se storage ou chain migrarem, o QR continua válido.</Card>
    </div>
  );
}
