/**
 * Formats a number of ngwee-free ZMW units as a Zambian Kwacha display string.
 * Prices in mock data are stored as whole Kwacha (no decimals) for readability.
 */
export function formatZmw(amount: number): string {
  return `K${amount.toLocaleString('en-ZM', { maximumFractionDigits: 0 })}`;
}

export function calcDiscountPercent(price: number, originalPrice: number | null): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
