export interface DasaLordDuration {
  lord: string;
  years: number;
}

// Fixed Vimshottari order and durations; total = 120 years.
export const VIMSHOTTARI_SEQUENCE: DasaLordDuration[] = [
  { lord: "Ketu", years: 7 },
  { lord: "Venus", years: 20 },
  { lord: "Sun", years: 6 },
  { lord: "Moon", years: 10 },
  { lord: "Mars", years: 7 },
  { lord: "Rahu", years: 18 },
  { lord: "Jupiter", years: 16 },
  { lord: "Saturn", years: 19 },
  { lord: "Mercury", years: 17 },
];

export const VIMSHOTTARI_TOTAL_YEARS = VIMSHOTTARI_SEQUENCE.reduce(
  (sum, d) => sum + d.years,
  0,
); // 120

export function dasaIndexForLord(lord: string): number {
  const idx = VIMSHOTTARI_SEQUENCE.findIndex((d) => d.lord === lord);
  if (idx === -1) throw new Error(`Unknown dasa lord: ${lord}`);
  return idx;
}
