"use client";
import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_CATALOG } from "@/lib/catalog";
import { assetPath } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ShieldCheck, Zap, Trophy, Search, X } from "lucide-react";

type Num = { numero: number; status: "disponivel" | "reservado" | "pago"; cor: string; expiraEm?: string; expiraEmMs?: number; reservadoPor?: string; paymentId?: string };

const WORK_SLUG = "flamengo-1895-2026";

export default function NumerosPage() {
  const work = MOCK_CATALOG.works[0];
  const club = MOCK_CATALOG.clubs.find((c) => c.slug === work.clubSlug)!;
  const [nums, setNums] = useState<Num[]>(() => Array.from({ length: work.maxSupply }, (_, i) => ({ numero: i + 1, status: "disponivel", cor: "verde" })));
  const [filter, setFilter] = useState<"todos" | "disponivel" | "reservado" | "pago">("todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [reserva, setReserva] = useState<any>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [stats, setStats] = useState({ disponiveis: work.maxSupply, reservados: 0, pagos: 0, total: work.maxSupply });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const timerRef = useRef<any>(null);

  async function fetchNumbers() {
    try {
      const r = await fetch(`/api/numbers?workSlug=${WORK_SLUG}`, { cache: "no-store" });
      if (!r.ok) throw new Error("api fail");
      const data = await r.json();
      if (data.numbers) {
        setNums(data.numbers);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      // GH Pages fallback: mock localStorage
      const raw = localStorage.getItem("clubverso_mock_numbers");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          // libera expirados local
          const now = Date.now();
          const cleaned = parsed.map((n: any) => {
            if (n.status === "reservado" && n.expiraEm && new Date(n.expiraEm).getTime() < now) return { numero: n.numero, status: "disponivel", cor: "verde" };
            return n;
          });
          setNums(cleaned);
          const disponiveis = cleaned.filter((n: any) => n.status === "disponivel").length;
          const reservados = cleaned.filter((n: any) => n.status === "reservado").length;
          const pagos = cleaned.filter((n: any) => n.status === "pago").length;
          setStats({ disponiveis, reservados, pagos, total: work.maxSupply });
          return;
        } catch {}
      }
      // init mock
      setNums(Array.from({ length: work.maxSupply }, (_, i) => ({ numero: i + 1, status: "disponivel", cor: "verde" })));
    }
  }

  useEffect(() => {
    fetchNumbers();
    const id = setInterval(fetchNumbers, 2500);
    return () => clearInterval(id);
  }, []);

  // countdown
  useEffect(() => {
    if (!reserva?.expiraEm) return;
    const target = new Date(reserva.expiraEm).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setCountdown(0);
        setMsg("Reserva expirou. Número liberado.");
        setReserva(null);
        setSelected(null);
        fetchNumbers();
        if (timerRef.current) clearInterval(timerRef.current);
      } else setCountdown(Math.ceil(diff / 1000));
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [reserva]);

  // polling reserva status para confirmar pagamento e atualizar todos
  useEffect(() => {
    if (!reserva) return;
    const id = setInterval(async () => {
      try {
        const r = await fetch(`/api/numbers/status?workSlug=${WORK_SLUG}&numero=${reserva.numero}`, { cache: "no-store" });
        const data = await r.json();
        if (data.status === "pago") {
          setReserva(null);
          setMsg(`Pagamento confirmado! Número ${reserva.numero} é seu.`);
          fetchNumbers();
          clearInterval(id);
        } else if (data.status === "disponivel" && reserva) {
          // expirou
          setReserva(null);
          setMsg("Reserva expirou.");
          fetchNumbers();
          clearInterval(id);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(id);
  }, [reserva]);

  async function handleReserve() {
    if (!selected || !email) return;
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetch("/api/numbers/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workSlug: WORK_SLUG, numero: selected, email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Erro");
      setReserva(data.reserva);
      setMsg(data.mensagem || `Reservado! Pague em 5 minutos.`);
      // GH Pages mock fallback: salva localStorage
      if (data.mock) {
        const cur = nums.map((n) => (n.numero === selected ? { ...n, status: "reservado", cor: "amarelo", expiraEm: data.reserva.expiraEm, reservadoPor: email, paymentId: data.reserva.paymentId } : n));
        localStorage.setItem("clubverso_mock_numbers", JSON.stringify(cur));
        setNums(cur as any);
      }
      fetchNumbers();
    } catch (e: any) {
      // tenta mock local
      const isGH = typeof window !== "undefined" && window.location.hostname.includes("github.io");
      if (isGH) {
        const mock = { numero: selected, status: "reservado", cor: "amarelo", expiraEm: new Date(Date.now() + 5 * 60 * 1000).toISOString(), reservadoPor: email, paymentId: `mock_${selected}` };
        const cur = nums.map((n) => (n.numero === selected ? (mock as any) : n));
        localStorage.setItem("clubverso_mock_numbers", JSON.stringify(cur));
        setNums(cur as any);
        setReserva({ ...mock, pixQrCode: `PIX:MOCK:${selected}`, pixCopyPaste: `000201-MOCK-${selected}`, editionCode: `FLA-2026-DIG-${String(selected).padStart(5, "0")}`, expiraEm: mock.expiraEm });
        setMsg(`Mock GH Pages: número ${selected} reservado 5min para ${email}`);
      } else {
        setMsg(e.message || "Erro ao reservar");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!reserva) return;
    try {
      const r = await fetch("/api/numbers/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workSlug: WORK_SLUG, numero: reserva.numero, paymentId: reserva.paymentId, email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setMsg(data.mensagem);
      // busca URL de download presigned (15min)
      try {
        const dl = await fetch(`/api/editions/download?code=${data.editionCode || reserva.editionCode}`);
        const dlData = await dl.json();
        if (dlData.url) setDownloadUrl(dlData.url);
      } catch {}
      setReserva(null);
      const cur = nums.map((n) => (n.numero === reserva.numero ? { ...n, status: "pago", cor: "vermelho" } : n));
      try { localStorage.setItem("clubverso_mock_numbers", JSON.stringify(cur)); } catch {}
      setNums(cur as any);
      fetchNumbers();
    } catch (e: any) {
      setMsg(e.message || "Erro ao confirmar");
    }
  }

  function handleCopyPix() {
    if (reserva?.pixCopyPaste) navigator.clipboard.writeText(reserva.pixCopyPaste);
  }

  const filtered = nums.filter((n) => {
    if (filter !== "todos" && n.status !== filter) return false;
    if (search && !String(n.numero).includes(search)) return false;
    return true;
  });

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={assetPath(club.shield)} alt={club.name} className="h-12 w-auto bg-white border rounded-xl p-1.5 shadow" />
          <div>
            <h1 className="text-2xl font-black tracking-tight">Escolha seu número</h1>
            <p className="text-sm text-zinc-500">
              {work.title} • <b className="text-zinc-900">{work.issued} / {work.maxSupply}</b> • {stats.disponiveis} disponíveis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500 border border-emerald-600" /> Disponível</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-400 border border-amber-500" /> Reservado</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-600 border border-red-700" /> Pago</span>
        </div>
      </div>

      <Card className="mt-4 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">{stats.disponiveis} disponíveis</Badge>
          <Badge className="bg-amber-50 text-amber-700 border-amber-200">{stats.reservados} reservados</Badge>
          <Badge className="bg-red-50 text-red-700 border-red-200">{stats.pagos} pagos</Badge>
          <span className="text-xs text-zinc-500">• Atualização em tempo real a cada 2,5s (polling)</span>
        </div>
        <div className="ml-auto flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar número (ex: 7, 42)" className="pl-8 pr-3 py-2 border rounded-xl text-sm w-48" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="border rounded-xl px-3 py-2 text-sm">
            <option value="todos">Todos</option>
            <option value="disponivel">Disponíveis</option>
            <option value="reservado">Reservados</option>
            <option value="pago">Pagos</option>
          </select>
        </div>
      </Card>

      {msg && <div className="mt-3 text-sm bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-3">{msg} {downloadUrl && <a href={downloadUrl} target="_blank" className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold">Baixar PDF</a>}</div>}

      {/* grid */}
      <div className="mt-4 grid grid-cols-5 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2">
        {filtered.map((n) => (
          <motion.button
            key={n.numero}
            whileHover={{ scale: n.status === "disponivel" ? 1.06 : 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => n.status === "disponivel" && setSelected(n.numero)}
            className={`h-12 rounded-xl border font-black text-sm flex flex-col items-center justify-center transition shadow-sm
              ${n.status === "disponivel" ? "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 cursor-pointer" : ""}
              ${n.status === "reservado" ? "bg-amber-400 text-zinc-900 border-amber-500 cursor-not-allowed" : ""}
              ${n.status === "pago" ? "bg-red-600 text-white border-red-700 cursor-not-allowed" : ""}
              ${selected === n.numero ? "ring-2 ring-zinc-900 ring-offset-2" : ""}`}
            title={`${n.numero} - ${n.status}`}
          >
            <span>{n.numero}</span>
            <span className="text-[9px] font-bold tracking-widest opacity-80">{n.status === "disponivel" ? "LIVRE" : n.status === "reservado" ? "RESERV." : "PAGO"}</span>
          </motion.button>
        ))}
      </div>
      <div className="mt-2 text-xs text-zinc-500">{filtered.length} números exibidos • Clique em um número verde para reservar por 5 minutos.</div>

      {/* reserva modal */}
      <AnimatePresence>
        {selected && !reserva && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }} className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-black">Reservar número {selected}</h3>
                <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-zinc-100"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-sm text-zinc-500 mt-1">O número ficará reservado por 5 minutos. Durante esse tempo ninguém mais pode pegá-lo.</p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="h-3 w-3 rounded bg-emerald-500" /> Disponível
                <span className="h-3 w-3 rounded bg-amber-400" /> Reservado 5min
                <span className="h-3 w-3 rounded bg-red-600" /> Pago
              </div>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Seu e-mail para PIX" className="mt-4 w-full border rounded-xl px-3 py-2.5 text-sm" />
              <Button onClick={handleReserve} disabled={!email || loading} className="w-full mt-3">
                {loading ? "Reservando..." : `Reservar ${selected} e gerar PIX`}
              </Button>
              <div className="mt-2 text-xs text-zinc-500 text-center">Pagamento exclusivo via PIX • Reserva com bloqueio transacional • Sem duplicidade</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reserva && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }} className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
              <div className="h-1 w-full bg-amber-400" />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black flex items-center gap-2"><Clock className="h-4 w-4" /> Número {reserva.numero} reservado</h3>
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200">Reservado 5min</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Card className="p-3 text-center bg-amber-50 border-amber-200">
                    <div className="text-xs text-zinc-500">Tempo restante</div>
                    <div className={`text-2xl font-black ${countdown < 60 ? "text-red-600" : "text-zinc-900"}`}>{formatCountdown(countdown)}</div>
                    <div className="text-xs text-zinc-500">Expira em 5:00</div>
                  </Card>
                  <Card className="p-3">
                    <div className="text-xs text-zinc-500">Código</div>
                    <div className="font-mono text-xs font-bold">{reserva.editionCode}</div>
                    <div className="text-xs">Valor: R$ 49,90</div>
                    <div className="text-xs text-amber-700">Status: Reservado (amarelo)</div>
                  </Card>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-3">
                  <div className="border rounded-xl p-3 flex flex-col items-center">
                    <div className="text-xs font-bold">QR Code PIX</div>
                    <div className="mt-2 h-36 w-36 bg-zinc-900 rounded-xl flex items-center justify-center text-white text-xs text-center p-2">
                      QR PIX<br />{reserva.paymentId.slice(0, 12)}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1">Escaneie com seu banco</div>
                  </div>
                  <div className="border rounded-xl p-3">
                    <div className="text-xs font-bold">PIX Copia e Cola</div>
                    <div className="mt-2 text-xs font-mono bg-zinc-100 p-2 rounded-lg break-all line-clamp-3">{reserva.pixCopyPaste}</div>
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={handleCopyPix}>Copiar código PIX</Button>
                    <div className="text-[11px] text-zinc-500 mt-1">Exclusivo PIX • Validação automática</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={handleConfirm} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    <ShieldCheck className="h-4 w-4 mr-1" /> Já paguei — Confirmar
                  </Button>
                  <Button variant="outline" onClick={() => { setReserva(null); setSelected(null); }} className="flex-1">
                    Cancelar
                  </Button>
                </div>
                <div className="mt-2 text-xs text-zinc-500 text-center">Se não pagar em 5min, o número volta automaticamente para verde (disponível) e outro usuário pode comprar. Timer validado no servidor.</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="mt-6 p-4 bg-zinc-900 text-white">
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" /> 1/1000 tirados • Concorrência com transaction FOR UPDATE</span>
          <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Polling 2,5s + validação contínua PIX</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Reserva bloqueante 5min • Sem duplicidade</span>
        </div>
      </Card>
    </div>
  );
}
