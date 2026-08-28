/**
 * Gera código de edição no padrão CLUBEVERSO.
 * Ex: FLA-2026-DIG-00001
 */
export function formatEditionCode(shortCode: string, year: number, editionNumber: number): string {
  const padded = String(editionNumber).padStart(5, "0");
  return `${shortCode.toUpperCase()}-${year}-DIG-${padded}`;
}

export function parseEditionCode(code: string): { shortCode: string; year: number; number: number } | null {
  const m = code.match(/^([A-Z]{2,5})-(\d{4})-DIG-(\d{5})$/);
  if (!m) return null;
  return { shortCode: m[1], year: Number(m[2]), number: Number(m[3]) };
}
