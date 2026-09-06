// Rate limit simples em memória (por instância serverless).
// Eleva a barreira contra spam/força-bruta; não substitui WAF para ataque distribuído.

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max: number, windowMs: number): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1 };
  }
  if (entry.count >= max) return { ok: false, remaining: 0 };
  entry.count += 1;
  return { ok: true, remaining: max - entry.count };
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

// Limpeza periódica para não vazar memória
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    buckets.forEach((v, k) => {
      if (v.resetAt <= now) buckets.delete(k);
    });
  }, 60_000);
  (timer as any)?.unref?.();
}