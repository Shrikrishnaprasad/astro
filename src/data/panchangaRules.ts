// Tamil solar month names, indexed by sidereal rasi index (0=Mesha..11=Meena).
// The Tamil calendar is solar: each month begins when the Sun enters that rasi.
export const TAMIL_MONTHS = [
  "Chithirai", "Vaigasi", "Aani", "Aadi", "Aavani", "Purattasi",
  "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni",
];

export type Ritu =
  | "Vasanta (Spring)"
  | "Grishma (Summer)"
  | "Varsha (Monsoon)"
  | "Sharad (Autumn)"
  | "Hemanta (Pre-winter)"
  | "Shishira (Winter)";

// Each ritu spans two consecutive solar rasis, starting from Mesha.
const RITUS: Ritu[] = [
  "Vasanta (Spring)", "Vasanta (Spring)",
  "Grishma (Summer)", "Grishma (Summer)",
  "Varsha (Monsoon)", "Varsha (Monsoon)",
  "Sharad (Autumn)", "Sharad (Autumn)",
  "Hemanta (Pre-winter)", "Hemanta (Pre-winter)",
  "Shishira (Winter)", "Shishira (Winter)",
];

export function ritusForRasi(rasiIndex: number): Ritu {
  return RITUS[rasiIndex];
}

// Uttarayana: Sun in Makara through Mithuna (sidereal Capricorn-Gemini).
// Dakshinayana: Sun in Kataka through Dhanu (sidereal Cancer-Sagittarius).
const UTTARAYANA_RASIS = new Set([9, 10, 11, 0, 1, 2]);

export function ayanaForRasi(rasiIndex: number): "Uttarayana" | "Dakshinayana" {
  return UTTARAYANA_RASIS.has(rasiIndex) ? "Uttarayana" : "Dakshinayana";
}

// Day (sunrise-to-sunset) divided into 8 equal parts; 1-indexed slot assigned
// to each inauspicious period, by weekday (0=Sunday .. 6=Saturday).
export const RAHU_KALAM_SLOT = [8, 2, 7, 5, 6, 4, 3];
export const YAMAGANDAM_SLOT = [5, 4, 3, 2, 1, 7, 6];
export const GULIKA_KALAM_SLOT = [7, 6, 5, 4, 3, 2, 1];

// Night (sunset-to-next-sunrise) divided into 8 equal parts, for the Gulika/
// Mandi point when the moment in question falls after sunset or before the
// following sunrise (classical day/night upagraha rule - see Wikipedia's
// "Upagraha" article for the day vs. night part-number tables; the day table
// above matches it exactly, so the night table is used here too).
export const GULIKA_NIGHT_SLOT = [3, 2, 1, 7, 6, 5, 4];
