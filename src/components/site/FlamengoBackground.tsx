"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { assetPath } from "@/lib/utils";

export function FlamengoBackground() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 40, damping: 18 });
  const springY = useSpring(y, { stiffness: 40, damping: 18 });
  const shieldX = useTransform(springX, [-300, 300], [-14, 14]);
  const shieldY = useTransform(springY, [-300, 300], [-10, 10]);
  const glowX = useTransform(springX, [-300, 300], [-20, 20]);
  const glowY = useTransform(springY, [-300, 300], [-15, 15]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      x.set(e.clientX - cx);
      y.set(e.clientY - cy);
    };
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, [x, y]);

  // partículas
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: 2 + (i % 3) * 2,
    left: 5 + (i * 37) % 90,
    top: 10 + (i * 53) % 80,
    color: i % 3 === 0 ? "#C3281E" : i % 3 === 1 ? "#111111" : "#C9A86A",
    duration: 12 + (i % 5) * 3,
    delay: i * 0.7,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0a]">
      {/* base rubro-negra */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a0a0a] to-[#0a0a0a]" />
      <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(900px 600px at 20% 15%, rgba(195,40,30,0.18), transparent 65%), radial-gradient(700px 500px at 85% 30%, rgba(0,0,0,0.55), transparent 65%), radial-gradient(600px 400px at 50% 85%, rgba(201,168,106,0.07), transparent 65%)" }} />

      {/* raios de luz horizontais */}
      <motion.div className="absolute left-0 right-0 h-[1px] top-[22%] bg-gradient-to-r from-transparent via-[#C3281E]/30 to-transparent" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} style={{ willChange: "transform" }} />
      <motion.div className="absolute left-0 right-0 h-[1px] top-[68%] bg-gradient-to-r from-transparent via-[#C9A86A]/20 to-transparent" animate={{ x: ["100%", "-100%"] }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }} style={{ willChange: "transform" }} />
      <motion.div className="absolute left-0 right-0 h-[120px] top-[40%] opacity-[0.04] bg-gradient-to-r from-transparent via-white to-transparent blur-xl" animate={{ x: ["-60%", "60%"] }} transition={{ duration: 18, repeat: Infinity, ease: "linear", repeatType: "reverse" }} />

      {/* fumaça discreta */}
      <div className="absolute inset-0">
        <motion.div className="absolute -left-1/4 top-0 w-[150%] h-[45%] opacity-[0.06]" style={{ background: "radial-gradient(ellipse 80% 100% at 30% 50%, rgba(255,255,255,0.9), transparent 70%)", filter: "blur(40px)" }} animate={{ x: ["-8%", "8%"] }} transition={{ duration: 22, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
        <motion.div className="absolute -left-1/4 bottom-0 w-[150%] h-[40%] opacity-[0.05]" style={{ background: "radial-gradient(ellipse 80% 100% at 70% 50%, rgba(201,168,106,0.7), transparent 70%)", filter: "blur(50px)" }} animate={{ x: ["8%", "-8%"] }} transition={{ duration: 26, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
      </div>

      {/* escudo central */}
      <motion.div style={{ x: shieldX, y: shieldY }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[78vh] max-w-[88vw] aspect-square flex items-center justify-center">
        {/* glow vermelho + dourado pulsando */}
        <motion.div
          style={{ x: glowX, y: glowY }}
          className="absolute inset-[8%] rounded-[28%] blur-[60px]"
          animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.65, 0.45] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 rounded-[28%] bg-[#C3281E]/35" />
          <div className="absolute inset-[18%] rounded-[28%] bg-[#C9A86A]/18 blur-[30px]" />
        </motion.div>
        <motion.div
          className="absolute inset-[12%] rounded-[24%] blur-[45px] bg-[#C3281E]/25"
          animate={{ scale: [1.08, 1, 1.08], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
        {/* escudo */}
        <motion.img
          src={assetPath("/shields/flamengo.png")}
          alt="Flamengo"
          className="relative w-full h-full object-contain select-none"
          style={{ opacity: 0.14, filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: mounted ? 0.14 : 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          draggable={false}
        />
        {/* brilho sutil no escudo */}
        <motion.div className="absolute inset-0 rounded-[24%] overflow-hidden opacity-30" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1, duration: 1 }}>
          <motion.div className="absolute -inset-[30%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-12" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 8, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }} />
        </motion.div>
      </motion.div>

      {/* partículas */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, background: p.color, boxShadow: `0 0 8px ${p.color}55`, opacity: 0.55 }}
          animate={{ y: [0, -18, 0], x: [0, p.id % 2 ? 6 : -6, 0], opacity: [0.35, 0.75, 0.35], scale: [1, 1.15, 1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* vinheta para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/10 via-transparent to-[#0a0a0a]/15" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.35) 100%)" }} />
    </div>
  );
}
