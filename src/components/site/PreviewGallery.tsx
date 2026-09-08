"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BookOpen, X, ZoomIn } from "lucide-react";
import { assetPath } from "@/lib/utils";

export interface PreviewPage {
  src: string;
  caption: string;
}

// Galeria pronta para as páginas reais da HQ.
// Passe `pages` com os assets quando existirem; sem assets, exibe
// espaços reservados honestos (sem inventar conteúdo do produto).
export function PreviewGallery({ pages = [] as PreviewPage[] }: { pages?: PreviewPage[] }) {
  const [zoom, setZoom] = useState<number | null>(null);

  if (pages.length === 0) {
    return (
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((n) => (
          <Card key={n} className="aspect-[3/4] flex flex-col items-center justify-center gap-2 border-dashed text-zinc-400 p-4 text-center">
            <BookOpen className="h-8 w-8" aria-hidden />
            <span className="text-xs font-semibold">Prévia {n} em breve</span>
            <span className="text-[11px]">Página real da edição</span>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mt-5 flex gap-3 overflow-x-auto pb-2 snap-x md:grid md:grid-cols-4 md:overflow-visible">
        {pages.map((p, i) => (
          <button key={i} onClick={() => setZoom(i)} className="snap-start shrink-0 w-56 md:w-auto group text-left">
            <Card className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assetPath(p.src)}
                alt={`Prévia real da HQ — ${p.caption}`}
                className="aspect-[3/4] w-full object-cover group-hover:scale-[1.02] transition"
                loading="lazy"
              />
            </Card>
            <span className="mt-1.5 flex items-center gap-1 text-xs text-zinc-500">
              <ZoomIn className="h-3.5 w-3.5" /> {p.caption} • prévia real
            </span>
          </button>
        ))}
      </div>
      {zoom !== null && pages[zoom] && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 p-4 flex items-center justify-center"
          onClick={() => setZoom(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada da página"
        >
          <div className="relative max-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assetPath(pages[zoom].src)}
              alt={`Prévia real ampliada — ${pages[zoom].caption}`}
              className="max-h-[85vh] w-auto rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setZoom(null)}
              aria-label="Fechar visualização"
              className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white text-zinc-900 grid place-items-center shadow"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="mt-2 text-center text-sm text-white/80">{pages[zoom].caption} • prévia real da edição</p>
          </div>
        </div>
      )}
    </>
  );
}
