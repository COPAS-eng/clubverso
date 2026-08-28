"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { MOCK_CATALOG } from "@/lib/catalog";
import { ClubShield } from "@/components/site/ClubShield";
import { ArrowRight, ShieldCheck, Zap, Trophy } from "lucide-react";
import { CinematicHero } from "@/components/site/CinematicHero";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.18 } },
};
const item = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, type: "spring" as const, stiffness: 90, damping: 14 } },
};

export default function Home() {
  const work = MOCK_CATALOG.works[0];
  const available = work.maxSupply - work.issued;

  return (
    <div className="overflow-clip">
      <CinematicHero />

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
            { t: "Escassez verdadeira", d: `${work.issued} / ${work.maxSupply} • ${available} disponíveis. Contador real reiniciado 1/10000.`, icon: Trophy },
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
