"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
};

export function PagesGrid({ pages, clubColor }: { pages: string[]; clubColor: string }) {
  return (
    <motion.div
      className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
    >
      {pages.map((t, i) => (
        <motion.div key={i} variants={item}>
          <Card className="p-3 flex gap-3 hover:shadow-md hover:-translate-y-0.5 transition h-full">
            <span className="h-7 w-7 rounded-xl text-white flex items-center justify-center text-xs font-black shrink-0" style={{ background: clubColor }}>
              {i + 1}
            </span>
            <span className="text-sm leading-snug">{t}</span>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
