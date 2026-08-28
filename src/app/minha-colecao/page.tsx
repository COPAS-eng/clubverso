import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MinhaColecao() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-black">Minha coleção</h1>
      <p className="text-sm text-zinc-500">Após o pagamento, suas edições aparecem aqui com Ler / Baixar / Certificado / Ver autenticidade / Ver NFT.</p>
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <div className="h-28 bg-[#C3281E] flex items-center justify-center text-white font-black">FLA — 1895–2026</div>
          <CardContent className="p-4">
            <div className="text-sm font-bold">Flamengo — 1895–2026 • Edição #04827 / 10.000</div>
            <div className="text-xs font-mono">FLA-2026-DIG-04827 • AUTÊNTICA</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm">LER</Button>
              <Button size="sm" variant="outline">BAIXAR</Button>
              <Link href="/verificar/FLA-2026-DIG-04827"><Button size="sm" variant="outline">VER AUTENTICIDADE</Button></Link>
              <Button size="sm" variant="outline">VER CERTIFICADO</Button>
              <Button size="sm" variant="ghost">VER NFT</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="p-6 border-dashed flex items-center justify-center text-sm text-zinc-500">Faça checkout via PIX para ver suas edições reais aqui (com presigned URL de 15 min).</Card>
      </div>
    </div>
  );
}
