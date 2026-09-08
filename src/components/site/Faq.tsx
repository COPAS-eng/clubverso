"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "O que eu recebo após comprar?",
    a: "Você recebe a HQ digital de 25 páginas em PDF personalizado com o número da sua edição, além do certificado de autenticidade com QR Code individual para verificação.",
  },
  {
    q: "A HQ é PDF ou acesso online?",
    a: "É um arquivo PDF personalizado com a sua edição, liberado para download. Você guarda o arquivo com você.",
  },
  {
    q: "Posso ler no celular?",
    a: "Sim. O PDF pode ser lido no celular, tablet ou computador, em qualquer aplicativo de leitura de PDF.",
  },
  {
    q: "A entrega é imediata?",
    a: "Após o pagamento, nossa equipe confirma o recebimento e libera sua edição para o e-mail informado. O prazo de liberação é informado no checkout.",
  },
  {
    q: "Como funciona a numeração?",
    a: "A tiragem é limitada a 10.000 exemplares. A numeração da sua edição é atribuída após a confirmação do pagamento, em ordem de confirmação.",
  },
  {
    q: "Como verifico a autenticidade?",
    a: "Cada edição tem um código único (ex.: FLA-2026-DIG-00001) e um QR Code. Consulte a qualquer momento na página Verificar autenticidade.",
  },
  {
    q: "Posso comprar para presente?",
    a: "Sim. No checkout você pode incluir uma segunda edição com desconto e informar o e-mail da pessoa presenteada.",
  },
  {
    q: "O produto é oficial do clube?",
    a: "Não. O CLUBEVERSO é um projeto editorial independente. As edições não são oficialmente licenciadas pelos clubes, salvo indicação expressa.",
  },
  {
    q: "Quais clubes serão lançados?",
    a: "A primeira edição é a do Flamengo. Palmeiras, Corinthians, São Paulo, Santos, Vasco, Cruzeiro e Grêmio estão previstos como próximas edições.",
  },
  {
    q: "Como entro em contato com o suporte?",
    a: "Responda ao e-mail de confirmação do seu pedido ou escreva para o e-mail de contato informado na confirmação. Atendemos dúvidas sobre pagamento, entrega e autenticidade.",
  },
  {
    q: "Posso cancelar ou solicitar reembolso?",
    a: "Por se tratar de produto digital personalizado (edição numerada vinculada a você), cada caso é analisado individualmente pelo suporte. Fale com a gente antes de pagar se tiver qualquer dúvida.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-5 space-y-2">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <Card key={f.q} className="overflow-hidden">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 text-left p-4 font-semibold text-sm hover:bg-zinc-50 transition"
            >
              {f.q}
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && <p className="px-4 pb-4 text-sm leading-relaxed text-zinc-600">{f.a}</p>}
          </Card>
        );
      })}
    </div>
  );
}
