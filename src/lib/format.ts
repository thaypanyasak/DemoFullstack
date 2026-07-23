/**
 * ຟໍແມັດຕົວເລກເປັນສະກຸນເງິນກີບລາວ (LAK ₭)
 * Format a number as Lao Kip currency (LAK ₭)
 *
 * @example
 * formatLAK(125000)   // → "₭ 125,000"
 * formatLAK(1500000)  // → "₭ 1,500,000"
 */
export function formatLAK(amount: number): string {
  return new Intl.NumberFormat("lo-LA", {
    style: "currency",
    currency: "LAK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * ຟໍແມັດຕົວເລກເປັນສະກຸນເງິນກີບລາວ ແບບຫຍໍ້ (ສໍາລັບສະຖິຕິ)
 * Format large LAK amounts with short suffix (K, M, B)
 *
 * @example
 * formatLAKShort(1500000)    // → "₭ 1.5M"
 * formatLAKShort(925000000)  // → "₭ 925M"
 * formatLAKShort(1200000000) // → "₭ 1.2B"
 */
export function formatLAKShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `₭ ${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `₭ ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `₭ ${(amount / 1_000).toFixed(0)}K`;
  }
  return formatLAK(amount);
}

/**
 * ຟໍແມັດຕົວເລກໃນ input ດ້ວຍຈຸດໃຫຍ່ (ໃຊ້ໃນ form)
 * Format price value in input field with dot separators
 *
 * @example
 * formatPriceInput("1000")    // → "1.000"
 * formatPriceInput("10000")   // → "10.000"
 * formatPriceInput("1000000") // → "1.000.000"
 */
export function formatPriceInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10);
  if (isNaN(num)) return "";
  // lo-LA uses "." as thousands separator
  return num.toLocaleString("lo-LA");
}

/**
 * ແປງ string ທີ່ຟໍແມັດ ກັບມາເປັນ number (ສໍາລັບ submit)
 * Parse formatted price string back to number
 *
 * @example
 * parsePriceInput("1.000.000") // → 1000000
 */
export function parsePriceInput(formatted: string): number {
  return parseInt(formatted.replace(/\./g, "").replace(/,/g, ""), 10) || 0;
}
