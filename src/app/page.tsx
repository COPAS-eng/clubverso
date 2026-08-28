"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_CATALOG } from "@/lib/catalog";
import { formatBRL } from "@/lib/pricing";
import { ClubShield } from "@/components/site/ClubShield";
import { ArrowRight, Sparkles, ShieldCheck, Zap, BookOpen, Trophy } from "lucide-react";
import { useRef } from "react";
import { assetPath } from "@/lib/utils";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function Home() {
  const work = MOCK_CATALOG.works[0];
  const available = work.maxSupply - work.issued;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div ref={ref} className="overflow-clip">
      {/* HERO */}
      <section className="relative clubverso-gradient text-white overflow-hidden">
        {/* grid texture */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        <motion.div style={{ y, opacity }} className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-[520px] w-[520px] rounded-full bg-[#C3281E]/20 blur-[80px]" />
          <div className="absolute top-[30%] -left-24 h-[420px] w-[420px] rounded-full bg-white/[0.06] blur-[60px]" />
        </motion.div>

        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs glass">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              EDIÇÃO LIMITADA • {work.issued} / {work.maxSupply} • {available} DISPONÍVEIS
              <Sparkles className="h-3.5 w-3.5 opacity-70" />
            </motion.div>

            <motion.h1 variants={item} className="mt-4 text-[42px] md:text-[58px] font-black leading-[0.9] tracking-tighter" style={{ fontFamily: "var(--font-playfair)" }}>
              CLUBEVERSO
              <span className="block text-white/60 text-[18px] md:text-[22px] font-light tracking-[0.18em] mt-2">A HISTÓRIA DIGITAL DO SEU CLUBE.</span>
            </motion.h1>

            <motion.p variants={item} className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75">
              Livros digitais colecionáveis em HQ. <b className="text-white">25 páginas</b> com ilustrações originais, cada exemplar <b className="text-white">numerado</b>, com <b className="text-white">certificado e QR</b> em <span className="font-mono text-white/90">clubverso.com/verificar</span>. Começando por <b className="text-white">Flamengo 1895–2026</b>.
            </motion.p>

            <motion.div variants={item} className="mt-6 flex flex-wrap gap-3">
              <Link href="/clubes/flamengo">
                <Button size="lg" className="shine group">
                  Escolha seu clube <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link href="/obra/flamengo-1895-2026">
                <Button variant="outline" size="lg" className="bg-white text-zinc-900 hover:bg-zinc-100 border-white">
                  Ver obra Flamengo
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={item} className="mt-7 grid grid-cols-3 gap-3 max-w-[520px]">
              {[
                { k: "25", l: "páginas HQ", icon: BookOpen },
                { k: `${work.issued}/${work.maxSupply}`, l: "edições", icon: Trophy },
                { k: formatBRL(work.priceCents), l: `+ 2ª ${formatBRL(work.secondPriceCents)}`, icon: Zap },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-white/10 bg-white/[0.06] glass px-3 py-3">
                  <div className="flex items-center gap-1.5 text-white font-black">
                    <s.icon className="h-3.5 w-3.5 opacity-70" /> {s.k}
                  </div>
                  <div className="text-xs text-white/60">{s.l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* FEATURED CARD */}
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }} className="relative lg:pl-6">
            <div className="absolute -inset-4 -z-10 rounded-[28px] bg-white/5 blur-2xl" />
            <Card className="overflow-hidden border-white/10 bg-white text-zinc-900 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <div className="relative h-[280px] overflow-hidden">
                <div className="absolute inset-0 flamengo-accent" />
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }} />
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center text-white p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0], rotate: [0, 1, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                  >
                    <img
                      src={assetPath(MOCK_CATALOG.clubs.find((c) => c.slug === "flamengo")!.shield)}
                      alt="Flamengo"
                      className="h-[110px] w-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)] bg-white rounded-[14%] p-2"
                    />
                    <span className="absolute -top-2 -right-2 bg-white text-[#C3281E] text-[10px] font-black px-2 py-1 rounded-full shadow">1895 — 2026</span>
                  </motion.div>
                  <div className="mt-3 text-center">
                    <div className="text-[11px] tracking-[0.32em] opacity-80">25 PÁGINAS • HQ PREMIUM</div>
                    <div className="text-[11px] bg-white/15 border border-white/20 px-3 py-1 rounded-full mt-2 inline-block">ILUSTRAÇÕES ORIGINAIS • SEM FOTOS COM DIREITOS</div>
                  </div>
                </motion.div>
                {/* top shine */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black">Flamengo — 1895–2026</div>
                    <div className="text-xs text-zinc-500 line-clamp-2">Da origem náutica ao clube do povo. 25 capítulos ilustrados.</div>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">{work.issued} / {work.maxSupply} • {available} disponíveis</Badge>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-black text-[#C3281E]">{formatBRL(work.priceCents)}</span>
                  <span className="text-xs text-zinc-500">+ 2ª por {formatBRL(work.secondPriceCents)}</span>
                </div>
                <Link href="/obra/flamengo-1895-2026" className="mt-3 block">
                  <Button className="w-full shine">COMPRAR POR {formatBRL(work.priceCents)}</Button>
                </Link>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
                  <ShieldCheck className="h-3.5 w-3.5" /> QR + Certificado • Entrega por PIX
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-2 text-zinc-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Tiragem real conectada ao banco • nunca fake
          </span>
          <span className="hidden md:flex items-center gap-6 text-zinc-500">
            <span>QR em clubverso.com/verificar</span> <span>•</span> <span>Certificado por edição</span> <span>•</span> <span>NFT opcional (desativado)</span>
          </span>
        </div>
      </section>

      {/* CLUBE GRID */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Escolha seu clube</h2>
            <p className="text-sm text-zinc-500">Continente → País → Liga → Clube → Obra. Arquitetura para milhares de clubes.</p>
          </div>
          <Link href="/clubes/flamengo" className="hidden md:inline-flex text-sm font-semibold hover:underline">
            Ver Flamengo <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <motion.div
          className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
        >
          {MOCK_CATALOG.clubs.map((c, i) => {
            const hasWork = MOCK_CATALOG.works.some((w) => w.clubSlug === c.slug);
            return (
              <motion.div key={c.slug} variants={item}>
                <Link href={`/clubes/${c.slug}`} className="group block">
                  <Card className="p-3 pt-4 flex flex-col items-center text-center hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 border-zinc-200">
                    <ClubShield src={c.shield} alt={c.name} size={72} primaryColor={c.primaryColor} delay={i * 0.04} />
                    <div className="mt-3 text-[13px] font-bold leading-none">{c.name}</div>
                    <div className="text-[11px] text-zinc-500">
                      {c.city} • {c.founded}
                    </div>
                    <div className={`mt-2 text-[10px] font-bold tracking-widest px-2 py-1 rounded-full border ${hasWork ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-zinc-50 text-zinc-500 border-zinc-200"}`}>
                      {hasWork ? "OBRA DISPONÍVEL" : "EM BREVE"}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="mt-6 grid md:grid-cols-3 gap-3">
          {[
            { t: "Escassez verdadeira", d: `${work.issued} / ${work.maxSupply} • ${available} disponíveis. Contador real reiniciado 1/100.`, icon: Trophy },
            { t: "Autenticidade", d: "Código FLA-2026-DIG-xxxxx, certificado e QR em /verificar/[code]. Camada permanente CLUBEVERSO.", icon: ShieldCheck },
            { t: "PIX + Presente", d: "Webhook HMAC idempotente. Segunda edição R$39,90 pode ser presenteada por e-mail.", icon: Zap },
          ].map((f) => (
            <motion.div key={f.t} variants={item}>
              <Card className="p-4 h-full">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span className="h-7 w-7 rounded-xl bg-zinc-900 text-white grid place-items-center">
                    <f.icon className="h-3.5 w-3.5" />
                  </span>
                  {f.t}
                </div>
                <div className="mt-1.5 text-xs leading-relaxed text-zinc-500">{f.d}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
