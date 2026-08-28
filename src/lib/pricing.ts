export const PRICE_FIRST_CENTS = 4990;
export const PRICE_SECOND_CENTS = 3990;

export function calculateTotal(items: number): number {
  if (items <= 0) return 0;
  if (items === 1) return PRICE_FIRST_CENTS;
  return PRICE_FIRST_CENTS + (items - 1) * PRICE_SECOND_CENTS;
}
export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
