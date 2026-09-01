/**
 * Gerador de PIX "Copia e Cola" — padrão BR Code (EMV QRCPS-MPM) do Banco Central.
 * Especificação pública: https://www.bcb.gov.br/estabilidadefinanceira/pix
 * Não depende de gateway — qualquer chave PIX (CPF, e-mail, telefone ou aleatória) pode gerar um código válido.
 */

const ACCENT_GROUPS: Record<string, string> = {
  a: "àáâãä",
  e: "èéêë",
  i: "ìíîï",
  o: "òóôõö",
  u: "ùúûü",
  c: "ç",
  n: "ñ",
};

const ACCENT_LOOKUP: Record<string, string> = {};
for (const [base, accented] of Object.entries(ACCENT_GROUPS)) {
  for (const ch of accented) {
    ACCENT_LOOKUP[ch] = base;
    ACCENT_LOOKUP[ch.toUpperCase()] = base.toUpperCase();
  }
}

function tlv(id: string, value: string): string {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function sanitizeAscii(input: string, maxLen: number, fallback: string): string {
  const withoutAccents = input
    .split("")
    .map((ch) => ACCENT_LOOKUP[ch] ?? ch)
    .join("");
  const ascii = withoutAccents
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .toUpperCase()
    .trim();
  return (ascii || fallback).slice(0, maxLen);
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export interface PixPayloadInput {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amountCents: number;
  /** Identificador da cobrança — alfanumérico, até 25 caracteres. */
  txId: string;
}

export function buildPixPayload(input: PixPayloadInput): string {
  const merchantAccountInfo = tlv("00", "br.gov.bcb.pix") + tlv("01", input.pixKey.trim());
  const txId = input.txId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 25) || "***";
  const amount = (input.amountCents / 100).toFixed(2);

  const fields =
    tlv("00", "01") + // Payload Format Indicator
    tlv("26", merchantAccountInfo) + // Merchant Account Information — PIX
    tlv("52", "0000") + // Merchant Category Code
    tlv("53", "986") + // Transaction Currency — BRL
    tlv("54", amount) + // Transaction Amount
    tlv("58", "BR") + // Country Code
    tlv("59", sanitizeAscii(input.merchantName, 25, "CLUBEVERSO")) + // Merchant Name
    tlv("60", sanitizeAscii(input.merchantCity, 15, "SAO PAULO")) + // Merchant City
    tlv("62", tlv("05", txId)); // Additional Data Field — Reference Label

  const withCrcHeader = `${fields}6304`;
  return withCrcHeader + crc16(withCrcHeader);
}