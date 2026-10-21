import { julianCenturiesSinceJ2000, toJulianDate } from "./constants";

const DEG2RAD = Math.PI / 180;

/** IAU 1980 nutation in longitude (Δψ), degrees — principal terms only. */
export function getNutationInLongitudeDegrees(date: Date): number {
  const jd = toJulianDate(date);
  const t = julianCenturiesSinceJ2000(jd);
  const omega = (125.04452 - 1934.136261 * t) * DEG2RAD;
  const l = (280.4665 + 36000.7698 * t) * DEG2RAD;
  const lp = (218.3165 + 481267.8813 * t) * DEG2RAD;
  const dPsiArcsec =
    -17.2 * Math.sin(omega) -
    1.32 * Math.sin(2 * l) -
    0.23 * Math.sin(2 * lp) +
    0.21 * Math.sin(2 * omega);
  return dPsiArcsec / 3600;
}
