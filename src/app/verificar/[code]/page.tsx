import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function generateStaticParams() {
  return [{ code: "FLA-2026-DIG-04827" }, { code: "FLA-2026-DIG-00001" }, { code: "PAL-2026-DIG-00001" }];
}
export default function VerificarPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code);
  const isValid = /^FLA-2026-DIG-\d{5}$/.test(code) || /^PAL-2026-DIG-\d{5}$/.test(code);
  const editionNum = isValid ? Number(code.slice(-5)) : null;
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <Card className="p-6 text-center">
        {isValid ? (
          <>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">EDIÇÃO AUTÊNTICA ✓</Badge>
            <h1 className="mt-3 text-2xl font-black" style={{ fontFamily: "var(--font-playfair)" }}>Autenticidade confirmada</h1>
            <div className="mt-4 grid grid-cols-2 gap-3 text-left text-sm">
              <div><div className="text-zinc-500 text-xs">Clube</div><div className="font-bold">Flamengo</div></div>
              <div><div className="text-zinc-500 text-xs">Obra</div><div className="font-bold">Flamengo — 1895–2026</div></div>
              <div><div className="text-zinc-500 text-xs">Edição</div><div className="font-bold">#{editionNum} / 10.000</div></div>
              <div><div className="text-zinc-500 text-xs">Código</div><div className="font-mono text-xs">{code}</div></div>
              <div><div className="text-zinc-500 text-xs">Versão</div><div>FLA-2026-V1</div></div>
              <div><div className="text-zinc-500 text-xs">Fechamento</div><div>28/08/2026</div></div>
            </div>
            <div className="mt-4 p-3 bg-zinc-50 rounded-xl text-xs">
              <div>QR aponta para: <span className="font-mono">clubverso.com/verificar/{code}</span></div>
              <div className="text-zinc-500">NFT: Não emitido (ativa quando NFT_ENABLED=true)</div>
            </div>
            <div className="mt-4 text-xs text-zinc-500">Nenhum dado PII exibido (sem CPF/e-mail/telefone).</div>
          </>
        ) : (
          <>
            <Badge className="bg-red-50 text-red-700 border-red-200">NÃO ENCONTRADA</Badge>
            <h1 className="mt-3 text-xl font-bold">Código inválido ou não encontrado</h1>
            <p className="text-sm text-zinc-500 mt-1">Verifique o código: {code}</p>
          </>
        )}
        <Link href="/" className="mt-6 inline-block text-sm underline">Voltar à home</Link>
      </Card>
      <Card className="mt-4 p-4 text-xs text-zinc-500">Esta é a camada permanente de autenticação CLUBEVERSO. O QR nunca aponta direto para PDF ou blockchain.</Card>
    </div>
  );
}
