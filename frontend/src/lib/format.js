/**
 * Format a numeric price with currency symbol.
 * Falls back to '—' if no price set.
 */
const SYMBOLS = { GBP: "£", USD: "$", EUR: "€" };
export function formatPrice(price, currency = "GBP") {
  if (price == null || isNaN(price)) return null;
  const sym = SYMBOLS[currency] || "";
  return `${sym}${Number(price).toFixed(2)}`;
}
