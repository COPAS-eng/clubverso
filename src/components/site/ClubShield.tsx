"use client";
import { motion } from "framer-motion";

function withBasePath(src: string) {
  if (!src.startsWith("/")) return src;
  // GitHub Pages project site precisa de /clubverso prefix
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/clubverso") && !src.startsWith("/clubverso")) {
    return `/clubverso${src}`;
  }
  // fallback para build static: NEXT_PUBLIC_BASE_PATH
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (bp && !src.startsWith(bp)) return `${bp}${src}`;
  return src;
}

export function ClubShield({
  src,
  alt,
  size = 64,
  primaryColor,
  delay = 0,
}: {
  src: string;
  alt: string;
  size?: number;
  primaryColor: string;
  delay?: number;
}) {
  const resolvedSrc = withBasePath(src);
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, rotate: -6, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1], type: "spring", stiffness: 90, damping: 14 }}
      whileHover={{ y: -6, scale: 1.05, rotate: 1.5, transition: { type: "spring", stiffness: 400, damping: 12 } }}
      whileTap={{ scale: 0.98 }}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* glow premium */}
      <motion.div
        className="absolute inset-0 rounded-[20%] blur-2xl"
        style={{ background: `radial-gradient(60% 60% at 50% 50%, ${primaryColor}55, transparent 70%)` }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-[10%] rounded-[20%] blur-xl"
        style={{ background: `${primaryColor}22` }}
        animate={{ scale: [1.12, 1, 1.12], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      />
      {/* card */}
      <div className="relative w-full h-full rounded-[18%] bg-white border border-zinc-200 shadow-[0_8px_30px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] p-[12%] flex items-center justify-center overflow-hidden">
        {/* inner highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-zinc-50" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
        <img
          src={resolvedSrc}
          alt={alt}
          loading="lazy"
          className="relative w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement;
            t.style.display = "none";
            const fallback = t.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        <div
          className="hidden absolute inset-0 items-center justify-center text-[10px] font-black tracking-widest"
          style={{ color: primaryColor }}
        >
          {alt.slice(0, 3).toUpperCase()}
        </div>
      </div>
    </motion.div>
  );
}
