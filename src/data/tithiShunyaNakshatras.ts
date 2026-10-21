/**
 * Tithi ↔ Shunya (Shoonya) nakshatras — tithi number 1–15 within the current paksha.
 * Source: commonly published Panchanga tables (e.g. VedicTime Shoonya Tithi nakshatra list).
 * tithi 4, 10, 14, 15 have no shunya nakshatras in this table.
 */
export const TITHI_SHUNYA_NAKSHATRA_INDICES: Record<number, number[]> = {
  1: [20], // Uttara Ashadha
  2: [16], // Anuradha
  3: [11, 20, 25], // Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada
  5: [9], // Magha
  6: [3], // Rohini
  7: [12, 18], // Hasta, Moola
  8: [24], // Purva Bhadrapada
  9: [2], // Krittika
  11: [3], // Rohini
  12: [8], // Ashlesha
  13: [13, 14], // Chitra, Swati
};
