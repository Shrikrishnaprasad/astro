import { julianCenturiesSinceJ2000, normalizeDegrees, toJulianDate } from "./constants";

// Mean lunar ascending node longitude (Meeus, "Astronomical Algorithms", referenced
// to the mean equinox of date) — Rahu is the mean ascending node, Ketu is exactly
// opposite (180°). This is the standard approximation used when a library (like
// astronomy-engine here) doesn't model the lunar nodes directly.
export function getMeanRahuKetuTropical(date: Date): { rahu: number; ketu: number } {
  const jd = toJulianDate(date);
  const t = julianCenturiesSinceJ2000(jd);
  const omega =
    125.0445479 -
    1934.1362891 * t +
    0.0020754 * t * t +
    t ** 3 / 467441 -
    t ** 4 / 60616000;
  const rahu = normalizeDegrees(omega);
  const ketu = normalizeDegrees(omega + 180);
  return { rahu, ketu };
}
