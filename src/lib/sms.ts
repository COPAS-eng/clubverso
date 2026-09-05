// Envio de SMS via Twilio — notificações de compra/pagamento para o vendedor.
// Env vars necessárias (Vercel → Settings → Environment Variables):
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, ADMIN_PHONE

interface SmsResult {
  sent: boolean;
  sid?: string;
  skipped?: boolean;
  error?: string;
}

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    console.warn("SMS ignorado: TWILIO_ACCOUNT_SID/AUTH_TOKEN/FROM_NUMBER não configurados.");
    return { sent: false, skipped: true };
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const params = new URLSearchParams({ To: to, From: from, Body: body });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Falha ao enviar SMS Twilio:", data);
      return { sent: false, error: (data as any)?.message || `HTTP ${res.status}` };
    }
    return { sent: true, sid: (data as any)?.sid };
  } catch (e) {
    console.error("Erro ao enviar SMS:", e);
    return { sent: false, error: e instanceof Error ? e.message : "Erro desconhecido" };
  }
}

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 ? digits : null;
}

export function adminPhone(): string | null {
  const phones = adminPhones();
  return phones[0] || null;
}

export function adminPhones(): string[] {
  const list = (process.env.ADMIN_PHONES || "")
    .split(",")
    .map((p) => normalizePhone(p))
    .filter((p): p is string => !!p);
  const single = process.env.ADMIN_PHONE ? normalizePhone(process.env.ADMIN_PHONE) : null;
  if (single && !list.includes(single)) list.push(single);
  return list;
}
