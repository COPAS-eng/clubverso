"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_CATALOG } from "@/lib/catalog";
import { ClubShield } from "@/components/site/ClubShield";
import { CinematicHero } from "@/components/site/CinematicHero";
import { PreviewGallery } from "@/components/site/PreviewGallery";
import { Faq } from "@/components/site/Faq";
import {
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Hash,
  BadgeCheck,
  TabletSmartphone,
  Gift,
  BellRing,
  QrCode,
  MailCheck,
  Headset,
} from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.18 } },
};
const item = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

const BENEFITS = [
  { icon: BookOpen, t: "HQ premium", d: `${MOCK_CATALOG.works[0].totalPages} páginas ilustradas contando a trajetória do clube.` },
  { icon: Hash, t: "Edição numerada", d: "Cada exemplar pertence a uma tiragem limitada de 10.000 unidades." },
  { icon: BadgeCheck, t: "Certificado de autenticidade", d: "Verifique sua edição por meio de um QR Code individual." },
  { icon: TabletSmartphone, t: "Acesso digital", d: "Leia no celular, tablet ou computador." },
  { icon: Gift, t: "Presenteável", d: "Envie a edição para outro torcedor pelo e-mail." },
];

const STEPS = [
  { n: "1", t: "Escolha sua edição", d: "Selecione a HQ do seu clube." },
  { n: "2", t: "Pague via PIX", d: "Gere o PIX e conclua o pagamento com segurança." },
  { n: "3", t: "Receba por e-mail", d: "Após a confirmação do pagamento, sua edição será liberada para o e-mail informado." },
  { n: "4", t: "Verifique sua autenticidade", d: "Consulte o número da edição, o certificado e o QR Code quando quiser." },
];

export default function Home() {
  const work = MOCK_CATALOG.works[0];
  const flamengo = MOCK_CATALOG.clubs.find((c) => c.slug === "flamengo")!;
  const futureClubs = MOCK_CATALOG.clubs.filter((c) => c.slug !== "flamengo");
  const previews = ((work as { previewImageUrls?: string[] }).previewImageUrls ?? []).map((src, i) => ({
    src,
    caption: `Página ${i + 1}`,
  }));

  return (
    <div className="overflow-clip">
      <CinematicHero />

      {/* FAIXA DE CONFIANÇA */}
      <section className="border-y bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-center md:justify-between gap-2 text-xs text-zinc-600">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Autenticidade verificável por QR Code individual
          </span>
          <span className="hidden md:inline text-zinc-500">Entrega digital • Pagamento via PIX • Sem frete</span>
        </div>
      </section>

      {/* PREVIEW */}
      <section id="preview" className="mx-auto max-w-6xl px-4 py-12 scroll-mt-24">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">Veja por dentro da edição</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Prévias reais da HQ — estilo, qualidade e conteúdo antes de comprar.
        </p>
        <PreviewGallery pages={previews} />
      </section>

      {/* BENEFÍCIOS */}
      <section className="bg-zinc-50 border-y">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Uma edição para ler, guardar e presentear</h2>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {BENEFITS.map((b) => (
              <motion.div key={b.t} variants={item}>
                <Card className="p-5 h-full">
                  <span className="h-10 w-10 rounded-2xl bg-zinc-900 text-white grid place-items-center">
                    <b.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="mt-3 font-bold">{b.t}</div>
                  <div className="mt-1 text-sm leading-relaxed text-zinc-500">{b.d}</div>
                </Card>
              </motion.div>
            ))}
            <motion.div variants={item}>
              <Card className="p-5 h-full bg-[#C3281E] text-white border-[#C3281E] flex flex-col justify-between">
                <div>
                  <div className="text-3xl font-black">R$ 49,90</div>
                  <div className="mt-1 text-sm text-white/80">Tiragem limitada de 10.000 exemplares.</div>
                </div>
                <Link href="/checkout?work=flamengo-1895-2026" className="mt-4">
                  <Button className="w-full bg-white text-zinc-900 hover:bg-zinc-100 font-bold">
                    Quero minha edição <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-12 scroll-mt-24">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">Como funciona</h2>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((s) => (
            <Card key={s.n} className="p-5">
              <div className="h-9 w-9 rounded-full bg-zinc-900 text-white grid place-items-center font-black">{s.n}</div>
              <div className="mt-3 font-bold text-sm">{s.t}</div>
              <div className="mt-1 text-sm text-zinc-500 leading-relaxed">{s.d}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* EDIÇÕES */}
      <section id="edicoes" className="mx-auto max-w-6xl px-4 pb-12 scroll-mt-24">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">Disponível agora</h2>
        <Card className="mt-5 p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5 border-[#C3281E]/30 shadow-[0_12px_40px_rgba(195,40,30,0.08)]">
          <ClubShield src={flamengo.shield} alt={flamengo.name} size={96} primaryColor={flamengo.primaryColor} />
          <div className="flex-1">
            <div className="text-xs font-bold tracking-widest text-[#C3281E]">TIRAGEM LIMITADA • 10.000 EXEMPLARES</div>
            <div className="mt-1 text-xl font-black">{work.title}</div>
            <p className="mt-1 text-sm text-zinc-500">{work.subtitle}</p>
            <div className="mt-2 text-sm">
              <span className="text-2xl font-black">R$ 49,90</span>{" "}
              <span className="text-zinc-500">• entrega digital • sem frete</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">A numeração é atribuída após a confirmação do pagamento.</p>
          </div>
          <Link href="/checkout?work=flamengo-1895-2026" className="w-full md:w-auto shrink-0">
            <Button size="lg" className="w-full md:w-auto bg-[#C3281E] hover:bg-[#9F1F18] font-bold px-8">
              Quero minha edição — R$ 49,90
            </Button>
          </Link>
        </Card>

        <h3 className="mt-10 text-xl font-black tracking-tight">Próximas edições</h3>
        <p className="mt-1 text-sm text-zinc-500">Palmeiras, Corinthians, São Paulo, Santos, Vasco, Cruzeiro e Grêmio.</p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {futureClubs.map((c, i) => (
            <Card key={c.slug} className="p-3 pt-4 flex flex-col items-center text-center opacity-90">
              <ClubShield src={c.shield} alt={c.name} size={56} primaryColor={c.primaryColor} delay={i * 0.04} />
              <div className="mt-2 text-[13px] font-bold leading-none">{c.name}</div>
              <a
                href={`mailto:contato@clubverso.com?subject=${encodeURIComponent(`Avise-me: edição do ${c.name}`)}&body=${encodeURIComponent(`Quero ser avisado quando a HQ do ${c.name} lançar. Meu e-mail: `)}`}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#C3281E] hover:underline"
              >
                <BellRing className="h-3.5 w-3.5" /> Avise-me quando lançar
              </a>
            </Card>
          ))}
        </div>
      </section>

      {/* CONFIANÇA */}
      <section className="bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Feito para quem carrega a história do clube</h2>
          <p className="mt-2 max-w-2xl text-sm md:text-[15px] leading-relaxed text-white/70">
            O CLUBEVERSO é um projeto editorial independente: cada edição é numerada dentro de uma tiragem limitada,
            acompanha certificado individual e pode ter a autenticidade consultada a qualquer momento pelo código e pelo
            QR Code da sua edição.
          </p>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            {[
              { icon: BadgeCheck, t: "Certificado individual", d: "Cada exemplar tem código único e certificado próprio." },
              { icon: QrCode, t: "QR de verificação", d: "Aponte a câmera e confira a autenticidade na hora." },
              { icon: MailCheck, t: "Entrega por e-mail", d: "Após a confirmação, a edição é liberada para o e-mail informado." },
              { icon: Headset, t: "Suporte ao comprador", d: "Dúvidas sobre pagamento, entrega e autenticidade? Fale com a gente." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <c.icon className="h-5 w-5 text-emerald-300" aria-hidden />
                <div className="mt-2 font-bold">{c.t}</div>
                <div className="mt-1 text-white/60 leading-relaxed">{c.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight">Perguntas frequentes</h2>
        <Faq />
        <Card className="mt-6 p-5 text-center bg-zinc-950 text-white border-zinc-950">
          <div className="text-lg font-black">Pronto para garantir a sua?</div>
          <p className="mt-1 text-sm text-white/70">Tiragem limitada de 10.000 exemplares • R$ 49,90 • Entrega digital</p>
          <Link href="/checkout?work=flamengo-1895-2026" className="mt-4 inline-block w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-[#C3281E] hover:bg-[#9F1F18] font-bold px-8">
              Quero minha edição — R$ 49,90
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  );
}
