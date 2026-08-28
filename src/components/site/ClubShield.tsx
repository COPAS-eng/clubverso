"use client";
import { motion } from "framer-motion";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: -8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.2 } }}
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* glow */}
      <motion.div
        className="absolute inset-0 rounded-[20%] blur-2xl opacity-30"
        style={{ background: primaryColor }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* card */}
      <div className="relative w-full h-full rounded-[18%] bg-white border border-zinc-200 shadow-[0_8px_30px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] p-[12%] flex items-center justify-center overflow-hidden">
        {/* inner highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white to-zinc-50" />
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
        <img
          src={src}
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
