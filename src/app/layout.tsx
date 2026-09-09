import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { PageTransition } from "@/components/site/PageTransition";
import { FlamengoBackground } from "@/components/site/FlamengoBackground";
import { Button } from "@/components/ui/button";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "CLUBEVERSO — A história do Flamengo como você nunca viu",
  description:
    "HQ digital premium com 23 páginas ilustradas, edição numerada de 10.000 exemplares e certificado de autenticidade. R$ 49,90, entrega digital, pagamento via PIX.",
  openGraph: {
    title: "CLUBEVERSO — A história do Flamengo como você nunca viu",
    description:
      "HQ digital premium • 23 páginas • Edição numerada • Certificado de autenticidade • R$ 49,90",
    type: "website",
    locale: "pt_BR",
  },
};

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="CLUBEVERSO — início">
          <span className="bg-zinc-900 text-white px-2.5 py-1.5 rounded-xl text-sm font-black tracking-widest group-hover:bg-black transition">
            CLUBEVERSO
          </span>
          <span className="hidden lg:inline text-xs text-zinc-500 font-medium">A história do seu clube em HQ.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Navegação principal">
          <Link href="/#como-funciona" className="px-3 py-2 rounded-xl hover:bg-zinc-100 transition">
            Como funciona
          </Link>
          <Link href="/#edicoes" className="px-3 py-2 rounded-xl hover:bg-zinc-100 transition">
            Ver edições
          </Link>
          <Link href="/verificar/FLA-2026-DIG-00001" className="px-3 py-2 rounded-xl hover:bg-zinc-100 transition">
            Verificar autenticidade
          </Link>
          <Link href="/minha-colecao" className="px-3 py-2 rounded-xl hover:bg-zinc-100 transition">
            Minha coleção
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/minha-colecao" className="md:hidden px-3 py-2 rounded-xl text-sm hover:bg-zinc-100 transition">
            Coleção
          </Link>
          <Link href="/checkout?work=flamengo-1895-2026">
            <Button size="sm" className="bg-[#C3281E] hover:bg-[#9F1F18] font-bold shadow-sm">
              Comprar edição
            </Button>
          </Link>
        </div>
      </div>
      <nav className="md:hidden border-t overflow-x-auto" aria-label="Navegação móvel">
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-4 py-2 text-[13px] whitespace-nowrap">
          <Link href="/#como-funciona" className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition">
            Como funciona
          </Link>
          <Link href="/#edicoes" className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition">
            Ver edições
          </Link>
          <Link href="/verificar/FLA-2026-DIG-00001" className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition">
            Verificar
          </Link>
          <Link href="/obra/flamengo-1895-2026" className="px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition">
            A HQ
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className={`${inter.className} min-h-screen flex flex-col relative`}>
        <FlamengoBackground />
        <Header />
        <main className="flex-1 relative">
          <PageTransition>{children}</PageTransition>
        </main>
        <footer className="border-t bg-white py-8 text-center text-xs leading-relaxed text-zinc-500">
          <div className="mx-auto max-w-6xl px-4">
            <div className="font-semibold tracking-widest text-zinc-900">CLUBEVERSO</div>
            <p className="mx-auto mt-2 max-w-2xl">
              O CLUBEVERSO é um projeto editorial independente criado para celebrar a história dos clubes. As edições
              não representam, não são patrocinadas e não são oficialmente licenciadas pelos clubes, salvo indicação
              expressa.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <Link href="/#como-funciona" className="hover:underline">
                Como funciona
              </Link>
              <Link href="/minha-colecao" className="hover:underline">
                Minha coleção
              </Link>
              <Link href="/verificar/FLA-2026-DIG-00001" className="hover:underline">
                Verificar autenticidade
              </Link>
              <Link href="/obra/flamengo-1895-2026" className="hover:underline">
                A HQ do Flamengo
              </Link>
            </div>
            <div className="mt-3">© 2026 CLUBEVERSO • Entrega digital • Pagamento via PIX • Suporte ao comprador</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
