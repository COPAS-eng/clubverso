// Email transacional: Resend em prod, mock log em dev/GH Pages
type EmailPayload = { to: string; subject: string; html: string; text?: string };

export async function sendEmail(payload: EmailPayload) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "CLUBEVERSO <contato@clubverso.com>";
  if (!key) {
    console.log("[EMAIL MOCK]", { from, to: payload.to, subject: payload.subject });
    // GH Pages: salva em .mock-storage/emails
    try {
      const fs = await import("fs");
      const path = await import("path");
      const dir = path.join(process.cwd(), ".mock-storage", "emails");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${Date.now()}-${payload.to}.json`), JSON.stringify({ ...payload, from, at: new Date().toISOString() }, null, 2));
    } catch {}
    return { id: `mock_${Date.now()}`, mock: true };
  }
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({ from, to: payload.to, subject: payload.subject, html: payload.html });
  if (error) throw error;
  return data;
}

export function renderOrderConfirmedEmail({ editionCode, numero, workTitle, verifyUrl }: { editionCode: string; numero: number; workTitle: string; verifyUrl: string }) {
  return {
    subject: `Sua edição ${editionCode} está pronta!`,
    html: `<div style="font-family:system-ui;padding:24px;max-width:560px"><h1 style="font-size:20px">CLUBEVERSO</h1><p>Obra: <b>${workTitle}</b><br/>Edição: <b>#${String(numero).padStart(5, "0")} / 1000</b><br/>Código: <b>${editionCode}</b></p><p><a href="${verifyUrl}" style="background:#C3281E;color:white;padding:10px 16px;border-radius:10px;text-decoration:none">Ver autenticidade</a></p><p style="font-size:12px;color:#666">QR aponta para ${verifyUrl}</p></div>`,
  };
}
