export interface SamvatsaraResult {
  shaka: number;
  vikram: number;
}

/**
 * Shaka and Vikram Samvat year numbers. The real Hindu new year begins at
 * Chaitra Shukla Pratipada (a lunar date, varies year to year, typically
 * March-April); this uses the Gregorian month as an approximate proxy for
 * that changeover rather than computing the exact lunar date, so results can
 * be off by one near the actual new year.
 */
export function computeSamvatsara(date: Date): SamvatsaraResult {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-12
  const afterApproxNewYear = month >= 4;

  return {
    shaka: afterApproxNewYear ? year - 78 : year - 79,
    vikram: afterApproxNewYear ? year + 57 : year + 56,
  };
}
