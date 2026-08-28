import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatEditionNumber(n: number): string {
  return String(n).padStart(5, "0");
}
export function assetPath(p: string): string {
  if (!p.startsWith("/")) return p;
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/clubverso") && !p.startsWith("/clubverso")) return `/clubverso${p}`;
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";
  if (bp && !p.startsWith(bp)) return `${bp}${p}`;
  return p;
}
