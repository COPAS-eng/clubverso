"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { assetPath } from "@/lib/utils";

// Capa do produto: usa a imagem real quando existir em /public,
// senão apresenta arte com o escudo (sem foto falsa do produto).
export function WorkCover({
  coverUrl,
  shield,
  clubName,
  primaryColor,
  title,
  compact = false,
}: {
  coverUrl?: string;
  shield: string;
  clubName: string;
  primaryColor: string;
  title: string;
  compact?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = !!coverUrl && !failed;

  return (
    <div className="relative bg-white rounded-[20px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)] border border-white/10">
      <div
        className={`relative flex items-center justify-center overflow-hidden ${compact ? "h-[280px]" : "h-[380px]"}`}
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0a0a0a 85%)` }}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={assetPath(coverUrl!)}
            alt={`Capa da HQ ${title}`}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          <motion.img
            src={assetPath(shield)}
            alt={`Escudo do ${clubName}`}
            className="h-[150px] w-auto bg-white rounded-[16%] p-3 shadow-2xl"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }}
          />
        )}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] tracking-widest text-white/70">
          <span>CLUBEVERSO</span>
          <span>25 PÁGINAS</span>
        </div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
        />
      </div>
      <div className="p-5">
        <div className="font-black">{title}</div>
        <div className="text-sm text-zinc-500">Tiragem limitada de 10.000 exemplares • R$ 49,90</div>
        <div className="mt-3 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: primaryColor }}
            initial={{ width: "0%" }}
            animate={{ width: "0.01%" }}
            transition={{ duration: 1.5, delay: 1 }}
          />
        </div>
      </div>
    </div>
  );
}
