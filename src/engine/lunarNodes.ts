import { julianCenturiesSinceJ2000, normalizeDegrees, toJulianDate } from "./constants";
import type { LunarNodeMode } from "./ephemerisSettings";

const DEG2RAD = Math.PI / 180;

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

/** Meeus-style true node correction on mean ascending node (tropical). */
export function getTrueRahuKetuTropical(date: Date): { rahu: number; ketu: number } {
  const mean = getMeanRahuKetuTropical(date);
  const jd = toJulianDate(date);
  const t = julianCenturiesSinceJ2000(jd);
  const d = normalizeDegrees(297.8501921 + 445267.1114034 * t);
  const m = normalizeDegrees(357.5291092 + 35999.0502909 * t);
  const mp = normalizeDegrees(134.9633964 + 477198.8675055 * t);
  const corrArcsec =
    -1.4979 * Math.sin((2 * d - 2 * m) * DEG2RAD) -
    0.1500 * Math.sin(m * DEG2RAD) -
    0.1226 * Math.sin(2 * d * DEG2RAD) +
    0.1176 * Math.sin(2 * mp * DEG2RAD);
  const rahu = normalizeDegrees(mean.rahu + corrArcsec / 3600);
  return { rahu, ketu: normalizeDegrees(rahu + 180) };
}

export function getRahuKetuTropical(
  date: Date,
  mode: LunarNodeMode,
): { rahu: number; ketu: number } {
  return mode === "true" ? getTrueRahuKetuTropical(date) : getMeanRahuKetuTropical(date);
}
