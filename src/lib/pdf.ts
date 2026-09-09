import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from "pdf-lib";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { buildVerifyUrl, generateQRBuffer } from "./qr";
import { putObject } from "./storage";

const GOLD = rgb(0.78, 0.6, 0.12);
const DARK_GOLD = rgb(0.55, 0.42, 0.08);
const SEAL_SIZE_COVER = 100;
const SEAL_SIZE_CERT = 140;
const SEAL_SIZE_PAGE = 84;
const PAGE_W = 595;
const PAGE_H = 842;
const STRIP_H = 56;

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

// Páginas reais da HQ em /public/flamengo/pagina-NN.png (ordenadas).
async function loadHqPages(): Promise<{ data: Buffer; width: number; height: number }[]> {
  const dir = path.join(process.cwd(), "public", "flamengo");
  let files: string[];
  try {
    files = (await fs.readdir(dir))
      .filter((f) => /^pagina-\d+\.png$/i.test(f))
      .sort();
  } catch {
    return [];
  }
  const pages: { data: Buffer; width: number; height: number }[] = [];
  for (const f of files) {
    try {
      const raw = await fs.readFile(path.join(dir, f));
      const img = sharp(raw).resize({ width: 1000, withoutEnlargement: true });
      const meta = await img.metadata();
      const data = await img.jpeg({ quality: 68 }).toBuffer();
      pages.push({ data, width: meta.width ?? 1000, height: meta.height ?? 1400 });
    } catch {
      // Pula página corrompida sem quebrar a geração
    }
  }
  return pages;
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
  const editionLabel = `#${String(editionNumber).padStart(5, "0")} / ${maxSupply}`;

  const hqPages = await loadHqPages();

  // Sem assets (dev): cai para páginas mock de texto
  if (hqPages.length === 0) {
    const addPage = (title: string, body: string, bg = rgb(1, 1, 1)): PDFPage => {
      const p = pdf.addPage([PAGE_W, PAGE_H]);
      p.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: bg });
      p.drawText(title, { x: 40, y: 800, size: 14, font, color: rgb(0, 0, 0) });
      p.drawText(body.slice(0, 900), { x: 40, y: 760, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2), lineHeight: 12, maxWidth: 515 });
      return p;
    };
    const cover = addPage(`Capa — ${workTitle}`, `${clubName} • ${editionCode} • Edição ${editionLabel}`, rgb(0.76, 0.16, 0.12));
    await drawSeal(cover, 485, 720, SEAL_SIZE_COVER, editionCode, font, fontRegular);
    const cert = addPage("CERTIFICADO DE AUTENTICIDADE — CLUBEVERSO", `Obra: ${workTitle} • Edição: ${editionLabel} • Código: ${editionCode}`);
    await drawSeal(cert, 227, 620, SEAL_SIZE_CERT, editionCode, font, fontRegular);
    const bytes = await pdf.save();
    const buffer = Buffer.from(bytes);
    const key = `editions/${editionCode}.pdf`;
    await putObject(key, buffer, "application/pdf");
    return { key, buffer };
  }

  const total = hqPages.length;

  for (let i = 0; i < total; i++) {
    const { data, width, height } = hqPages[i];
    const jpg = await pdf.embedJpg(data);
    const page = pdf.addPage([PAGE_W, PAGE_H]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: rgb(1, 1, 1) });

    // Arte da página (contain, acima da faixa de autenticidade)
    const artH = PAGE_H - STRIP_H;
    const scale = Math.min(PAGE_W / width, artH / height);
    const dw = width * scale;
    const dh = height * scale;
    const dx = (PAGE_W - dw) / 2;
    const dy = STRIP_H + (artH - dh) / 2;
    page.drawImage(jpg, { x: dx, y: dy, width: dw, height: dh });

    // Selo de autenticidade em cada página (canto inferior direito, sobre a arte)
    await drawSeal(page, PAGE_W - SEAL_SIZE_PAGE - 10, STRIP_H + 10, SEAL_SIZE_PAGE, editionCode, font, fontRegular, 0.92);

    // Faixa de autenticidade
    page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: STRIP_H, color: rgb(0.05, 0.05, 0.05) });
    page.drawText(`CLUBEVERSO • ${workTitle}`, { x: 12, y: 34, size: 8, font, color: rgb(1, 1, 1) });
    page.drawText(`Edição ${editionLabel} • ${editionCode} • pág. ${i + 1}/${total}`, {
      x: 12, y: 16, size: 8, font: fontRegular, color: rgb(0.85, 0.85, 0.85),
    });
    page.drawText(buildVerifyUrl(editionCode), { x: PAGE_W - 230, y: 16, size: 7, font: fontRegular, color: rgb(0.7, 0.7, 0.7) });

    // QR na primeira página (capa)
    if (i === 0) {
      try {
        const qrBuf = await generateQRBuffer(buildVerifyUrl(editionCode));
        const qrImg = await pdf.embedPng(qrBuf);
        page.drawImage(qrImg, { x: 14, y: STRIP_H + 14, width: 88, height: 88 });
      } catch {}
      await drawSeal(page, PAGE_W - SEAL_SIZE_COVER - 12, PAGE_H - SEAL_SIZE_COVER - 12, SEAL_SIZE_COVER, editionCode, font, fontRegular);
    }
  }

  // Certificado final
  const cert = pdf.addPage([PAGE_W, PAGE_H]);
  cert.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: rgb(0.96, 0.96, 0.96) });
  await drawSeal(cert, 227, 620, SEAL_SIZE_CERT, editionCode, font, fontRegular);
  cert.drawText("CERTIFICADO DE AUTENTICIDADE — CLUBEVERSO", { x: 40, y: 800, size: 12, font, color: rgb(0, 0, 0) });
  cert.drawText(`Obra: ${workTitle}`, { x: 40, y: 760, size: 10, font: fontRegular, color: rgb(0, 0, 0) });
  cert.drawText(`Edição: ${editionLabel}`, { x: 40, y: 740, size: 12, font, color: rgb(0, 0, 0) });
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
