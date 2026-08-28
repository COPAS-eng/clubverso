import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { PageTransition } from "@/components/site/PageTransition";
import { FlamengoBackground } from "@/components/site/FlamengoBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "CLUBEVERSO — A história digital do seu clube.",
  description: "Livros digitais colecionáveis em HQ. 25 páginas. 10.000 edições numeradas. Autenticadas com certificado e QR Code.",
  openGraph: { title: "CLUBEVERSO", description: "A história digital do seu clube.", type: "website" },
};

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="bg-zinc-900 text-white px-2.5 py-1.5 rounded-xl text-sm font-black tracking-widest group-hover:bg-black transition">CLUBEVERSO</span>
          <span className="hidden sm:inline text-xs text-zinc-500 font-medium">A história digital do seu clube.</span>
        </Link>
        <nav className="flex items-center gap-1.5 text-sm">
          <Link href="/minha-colecao" className="px-3 py-2 rounded-xl hover:bg-zinc-100 transition">Minha coleção</Link>
          <Link href="/verificar/FLA-2026-DIG-04827" className="px-3 py-2 rounded-xl hover:bg-zinc-100 transition">Verificar</Link>
          <Link href="/admin" className="px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-black transition font-semibold shadow-sm">
            Admin
          </Link>
        </nav>
      </div>
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
        <footer className="border-t bg-white py-6 text-center text-xs leading-relaxed text-zinc-500">
          <div className="mx-auto max-w-6xl px-4">
            <div className="font-semibold tracking-widest text-zinc-900">CLUBEVERSO</div>
            <div className="mt-1">© 2026 — 1 obra × 10.000 edições numeradas • HQ com ilustrações originais • Escudos via Wikimedia Commons • Conteúdo editorial independente, sem afiliação oficial sem licenciamento.</div>
            <div className="mt-2 text-[11px] opacity-70">Pix com webhook idempotente • Presente R$39,90 • QR em /verificar/[code] • NFT opcional Polygon • LGPD</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
