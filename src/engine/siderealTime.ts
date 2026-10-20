import { julianCenturiesSinceJ2000, normalizeDegrees, toJulianDate } from "./constants";

// Greenwich Mean Sidereal Time in degrees (Meeus' formula, using the full JD so
// time-of-day is already included).
export function getGMSTDegrees(date: Date): number {
  const jd = toJulianDate(date);
  const t = julianCenturiesSinceJ2000(jd);
  const gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;
  return normalizeDegrees(gmst);
}

// Local Sidereal Time in degrees, given east-positive geographic longitude.
export function getLocalSiderealTimeDegrees(date: Date, geoLongitude: number): number {
  return normalizeDegrees(getGMSTDegrees(date) + geoLongitude);
}

// Mean obliquity of the ecliptic, degrees (low-order approximation, sufficient
// for sign-level ascendant calculation).
export function getMeanObliquityDegrees(date: Date): number {
  const jd = toJulianDate(date);
  const t = julianCenturiesSinceJ2000(jd);
  return 23.439291 - 0.0130042 * t;
}
