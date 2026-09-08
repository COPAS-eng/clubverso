"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, BadgeCheck, Smartphone, Mail } from "lucide-react";
import { MOCK_CATALOG } from "@/lib/catalog";
import { WorkCover } from "@/components/site/WorkCover";

const SPECS = [
  { icon: BookOpen, label: "25 páginas ilustradas" },
  { icon: BadgeCheck, label: "Edição numerada + certificado" },
  { icon: Smartphone, label: "Celular, tablet e computador" },
  { icon: Mail, label: "Entrega por e-mail" },
];

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
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(100% 80% at 50% 50%, transparent 60%, rgba(0,0,0,0.7) 100%)" }}
      />

      <motion.div
        className="absolute -top-1/2 left-1/2 w-[120%] h-[80%] -translate-x-1/2 rounded-full blur-[80px] bg-gradient-to-b from-[#C3281E]/18 via-[#C9A86A]/08 to-transparent pointer-events-none"
        style={{ y, scale, opacity }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center min-h-[620px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-4 py-1.5 text-xs tracking-widest"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            EDIÇÃO 001 • TIRAGEM LIMITADA
          </motion.div>

          <motion.h1
            className="mt-5 text-[40px] md:text-[56px] font-black leading-[1.02] tracking-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            A história do Flamengo como você nunca viu.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-5 max-w-xl text-[15px] md:text-base leading-relaxed text-white/75"
          >
            Uma HQ digital premium com 25 páginas ilustradas, edição numerada e certificado de autenticidade. Leia no
            celular, guarde sua edição e faça parte da primeira tiragem de 10.000 exemplares.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl text-sm text-white/80"
          >
            {SPECS.map((s) => (
              <li key={s.label} className="flex items-center gap-2">
                <s.icon className="h-4 w-4 text-emerald-300 shrink-0" aria-hidden />
                {s.label}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.7 }}
            className="mt-7 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <Link href="/checkout?work=flamengo-1895-2026" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-[#C3281E] hover:bg-[#9F1F18] text-white text-base font-bold px-8 py-6 shadow-[0_10px_30px_rgba(195,40,30,0.4)]"
              >
                Quero minha edição — R$ 49,90
              </Button>
            </Link>
            <Link href="/#preview" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-white text-zinc-900 hover:bg-zinc-100"
              >
                Ver páginas da HQ <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-4 text-xs text-white/50"
          >
            Pagamento via PIX • Sem frete • A numeração é atribuída após a confirmação do pagamento.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: 8, rotateY: -8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: "preserve-3d" }}
          whileHover={{ rotateY: 4, rotateX: -4, y: -6, transition: { duration: 0.4 } }}
          className="relative"
        >
          <div className="absolute -inset-6 bg-gradient-to-br from-[#C3281E]/20 to-[#C9A86A]/10 blur-2xl rounded-[30px]" />
          <WorkCover
            coverUrl={work.coverImageUrl}
            shield={club.shield}
            clubName={club.name}
            primaryColor={club.primaryColor}
            title={work.title}
          />
        </motion.div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
    </section>
  );
}
