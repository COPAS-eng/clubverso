"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { assetPath } from "@/lib/utils";
import { MOCK_CATALOG } from "@/lib/catalog";
import { formatBRL } from "@/lib/pricing";

export function CinematicHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const work = MOCK_CATALOG.works[0];
  const club = MOCK_CATALOG.clubs.find((c) => c.slug === "flamengo")!;

  return (
    <section ref={ref} className="relative overflow-hidden bg-black text-white" style={{ perspective: "1200px" }}>
      {/* film grain + vignette */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(100% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.7) 100%)" }} />

      {/* light leak top */}
      <motion.div className="absolute -top-1/2 left-1/2 w-[120%] h-[80%] -translate-x-1/2 rounded-full blur-[80px] bg-gradient-to-b from-[#C3281E]/18 via-[#C9A86A]/08 to-transparent pointer-events-none" style={{ y, scale, opacity }} />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center min-h-[620px]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.8 }} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-4 py-1.5 text-xs tracking-widest">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            EDIÇÃO CINEMATOGRÁFICA • 1 / 10000 • HQ 25 PÁGINAS
          </motion.div>

          <motion.h1 className="mt-5 text-[48px] md:text-[64px] font-black leading-[0.88] tracking-tighter" style={{ fontFamily: "var(--font-playfair)" }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <span className="block bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">FLAMENGO</span>
            <span className="block text-white/90 text-[28px] md:text-[32px] font-light tracking-[0.18em] mt-1">1895 — 2026</span>
            <span className="block text-white/60 text-[16px] tracking-[0.22em] font-light mt-2">A HISTÓRIA EM HQ PREMIUM</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/75">
            Cada edição <b className="text-white">numerada e autenticada</b> com certificado e QR em <span className="font-mono text-white">clubverso.com/verificar</span>. Venda sequencial, sem escolha — após 1 é o 2.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.7 }} className="mt-7 flex flex-wrap gap-3">
            <Link href="/obra/flamengo-1895-2026">
              <Button size="lg" className="bg-[#C3281E] hover:bg-[#9F1F18] text-white shadow-[0_10px_30px_rgba(195,40,30,0.4)] group">
                <Play className="mr-2 h-4 w-4 fill-white" /> Ver trailer da obra
              </Button>
            </Link>
            <Link href="/obra/flamengo-1895-2026">
              <Button variant="outline" size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100">
                Comprar por {formatBRL(work.priceCents)} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition" />
              </Button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-8 flex items-center gap-6 text-xs text-white/50">
            <span>25 páginas</span>
            <span className="h-3 w-[1px] bg-white/15" />
            <span>1/10000</span>
            <span className="h-3 w-[1px] bg-white/15" />
            <span>PIX • QR • Certificado</span>
          </motion.div>
        </motion.div>

        {/* 3D card cinematic */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: 8, rotateY: -8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: "preserve-3d" }}
          whileHover={{ rotateY: 4, rotateX: -4, y: -6, transition: { duration: 0.4 } }}
          className="relative"
        >
          <div className="absolute -inset-6 bg-gradient-to-br from-[#C3281E]/20 to-[#C9A86A]/10 blur-2xl rounded-[30px]" />
          <div className="relative bg-white rounded-[20px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)] border border-white/10">
            <div className="h-[380px] relative flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${club.primaryColor} 0%, #0a0a0a 85%)` }}>
              <motion.img
                src={assetPath(club.shield)}
                alt="Flamengo"
                className="h-[150px] w-auto bg-white rounded-[16%] p-3 shadow-2xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }}
              />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] tracking-widest text-white/70">
                <span>CLUBEVERSO</span>
                <span>25 PÁGINAS</span>
              </div>
              {/* light sweep */}
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12" initial={{ x: "-100%" }} animate={{ x: "200%" }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }} />
            </div>
            <div className="p-5">
              <div className="font-black">{work.title}</div>
              <div className="text-sm text-zinc-500">1 / 10000 • 9.999 disponíveis • R$ 49,90</div>
              <div className="mt-3 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <motion.div className="h-full bg-[#C3281E]" initial={{ width: "0%" }} animate={{ width: "0.01%" }} transition={{ duration: 1.5, delay: 1 }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
    </section>
  );
}
