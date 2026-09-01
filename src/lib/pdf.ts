import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";
import { buildVerifyUrl, generateQRBuffer } from "./qr";
import { putObject } from "./storage";

const GOLD = rgb(0.78, 0.6, 0.12);
const DARK_GOLD = rgb(0.55, 0.42, 0.08);
const SEAL_SIZE_COVER = 100;
const SEAL_SIZE_CERT = 140;
const SEAL_SIZE_WATERMARK = 260;

async function drawSeal(
  page: PDFPage,
  x: number,
  y: number,
  size: number,
  editionCode: string,
  fontBold: PDFFont,
  fontRegular: PDFFont,
  opacity: number = 1,
) {
  const margin = size * 0.06;
  const cornerSize = size * 0.07;

  page.drawRectangle({
    x: x + margin, y: y + margin,
    width: size - margin * 2, height: size - margin * 2,
    borderWidth: 2.5, borderColor: GOLD,
    opacity,
  });
  page.drawRectangle({
    x: x + margin * 1.5, y: y + margin * 1.5,
    width: size - margin * 3, height: size - margin * 3,
    borderWidth: 0.8, borderColor: GOLD,
    opacity,
  });

  const cx = x + margin + 5;
  const cw = size - margin * 2 - 10;

  page.drawRectangle({ x: cx, y: y + size - margin - cornerSize, width: cornerSize, height: cornerSize, color: GOLD, opacity });
  page.drawRectangle({ x: x + size - margin - cornerSize, y: y + size - margin - cornerSize, width: cornerSize, height: cornerSize, color: GOLD, opacity });
  page.drawRectangle({ x: cx, y: y + margin, width: cornerSize, height: cornerSize, color: GOLD, opacity });
  page.drawRectangle({ x: x + size - margin - cornerSize, y: y + margin, width: cornerSize, height: cornerSize, color: GOLD, opacity });

  page.drawText("CLUBEVERSO", { x: cx, y: y + size - margin - 22, size: size * 0.065, font: fontBold, color: DARK_GOLD, opacity });
  page.drawRectangle({ x: cx, y: y + size * 0.5, width: cw, height: 1, color: GOLD, opacity });
  page.drawText("AUTENTICIDADE", { x: cx, y: y + size * 0.5 - 16, size: size * 0.085, font: fontBold, color: DARK_GOLD, opacity });
  page.drawText(editionCode, { x: cx, y: y + margin + 4, size: size * 0.042, font: fontRegular, color: DARK_GOLD, opacity });
}

export async function generatePersonalizedPdf({
  workTitle,
  editionNumber,
  maxSupply,
  editionCode,
  clubName,
}: {
  workTitle: string;
  editionNumber: number;
  maxSupply: number;
  editionCode: string;
  clubName: string;
}): Promise<{ key: string; buffer: Buffer }> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);

  // 25 páginas mock + capa personalizada (para demo, 3 páginas: capa, conteúdo, certificado)
  // Em prod: carrega master.pdf de 25 págs via S3 e sobrepõe
  const addPage = (title: string, body: string, bg = rgb(1, 1, 1)): PDFPage => {
    const p = pdf.addPage([595, 842]);
    p.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: bg });
    p.drawText(title, { x: 40, y: 800, size: 14, font, color: rgb(0, 0, 0) });
    p.drawText(body.slice(0, 900), { x: 40, y: 760, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2), lineHeight: 12, maxWidth: 515 });
    return p;
  };

  // Capa
  const cover = pdf.addPage([595, 842]);
  cover.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(0.76, 0.16, 0.12) });
  cover.drawText("CLUBEVERSO", { x: 40, y: 800, size: 10, font, color: rgb(1, 1, 1) });
  cover.drawText(workTitle, { x: 40, y: 760, size: 22, font, color: rgb(1, 1, 1) });
  cover.drawText(`${clubName} • ${editionCode}`, { x: 40, y: 730, size: 10, font: fontRegular, color: rgb(1, 1, 1) });
  cover.drawText(`Edição #${String(editionNumber).padStart(5, "0")} / ${maxSupply}`, { x: 40, y: 700, size: 16, font, color: rgb(1, 1, 1) });
  cover.drawText(`QR: ${buildVerifyUrl(editionCode)}`, { x: 40, y: 670, size: 8, font: fontRegular, color: rgb(1, 1, 1) });

  // QR embed
  try {
    const qrBuf = await generateQRBuffer(buildVerifyUrl(editionCode));
    const qrImg = await pdf.embedPng(qrBuf);
    cover.drawImage(qrImg, { x: 440, y: 620, width: 100, height: 100 });
  } catch {}

  // Selo na capa (canto superior direito)
  await drawSeal(cover, 485, 720, SEAL_SIZE_COVER, editionCode, font, fontRegular);

  // Conteúdo 25 páginas mock
  for (let i = 1; i <= 25; i++) {
    const page = addPage(`Página ${i} / 25 — ${workTitle}`, `Capítulo ${i}: Conteúdo ilustrado original da obra ${workTitle}. Esta é uma página mock da obra-mestre com ilustrações originais. Em produção, esta página seria a ilustração HQ do acionamento histórico ${i}. Código autenticado: ${editionCode} • Edição #${String(editionNumber).padStart(5, "0")}/${maxSupply}`);
    // Marca d'água do selo no centro (baixa opacidade)
    const cx = (595 - SEAL_SIZE_WATERMARK) / 2;
    const cy = (842 - SEAL_SIZE_WATERMARK) / 2;
    await drawSeal(page, cx, cy, SEAL_SIZE_WATERMARK, editionCode, font, fontRegular, 0.12);
  }

  // Certificado
  const cert = pdf.addPage([595, 842]);
  cert.drawRectangle({ x: 0, y: 0, width: 595, height: 842, color: rgb(0.96, 0.96, 0.96) });
  // Selo grande no certificado (centralizado no topo)
  await drawSeal(cert, 227, 620, SEAL_SIZE_CERT, editionCode, font, fontRegular);
  cert.drawText("CERTIFICADO DE AUTENTICIDADE — CLUBEVERSO", { x: 40, y: 800, size: 12, font, color: rgb(0, 0, 0) });
  cert.drawText(`Obra: ${workTitle}`, { x: 40, y: 760, size: 10, font: fontRegular, color: rgb(0, 0, 0) });
  cert.drawText(`Edição: #${String(editionNumber).padStart(5, "0")} / ${maxSupply}`, { x: 40, y: 740, size: 12, font, color: rgb(0, 0, 0) });
  cert.drawText(`Código: ${editionCode}`, { x: 40, y: 720, size: 10, font: fontRegular, color: rgb(0, 0, 0) });
  cert.drawText(`Verificar: ${buildVerifyUrl(editionCode)}`, { x: 40, y: 700, size: 8, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
  try {
    const qrBuf2 = await generateQRBuffer(buildVerifyUrl(editionCode));
    const qrImg2 = await pdf.embedPng(qrBuf2);
    cert.drawImage(qrImg2, { x: 220, y: 500, width: 150, height: 150 });
  } catch {}

  const bytes = await pdf.save();
  const buffer = Buffer.from(bytes);
  const key = `editions/${editionCode}.pdf`;
  await putObject(key, buffer, "application/pdf");
  return { key, buffer };
}
