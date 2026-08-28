import QRCode from "qrcode";

export async function generateQRDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { errorCorrectionLevel: "M", margin: 1, width: 400 });
}
export async function generateQRBuffer(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, { errorCorrectionLevel: "M", margin: 1, width: 600 });
}
export function buildVerifyUrl(editionCode: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://clubverso.com";
  return `${base.replace(/\/$/, "")}/verificar/${editionCode}`;
}
