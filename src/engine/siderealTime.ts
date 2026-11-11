import { julianCenturiesSinceJ2000, normalizeDegrees, toJulianDate } from "./constants";
import { getNutationInLongitudeDegrees } from "./nutation";

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

/**
 * Greenwich Apparent Sidereal Time (GAST) in degrees.
 *
 * GAST = GMST + equation of equinoxes
 * Equation of equinoxes ≈ ΔΨ × cos(ε₀)
 * where ΔΨ is nutation in longitude and ε₀ is mean obliquity.
 *
 * This is the true sidereal time that accounts for nutation (polar wobble)
 * and is required for highest-precision hour-angle calculations.
 */
export function getGASTDegrees(date: Date): number {
  const gmst = getGMSTDegrees(date);
  const dPsi = getNutationInLongitudeDegrees(date); // degrees
  const eps0 = getMeanObliquityDegrees(date); // degrees
  const DEG2RAD = Math.PI / 180;
  const equationOfEquinoxes = dPsi * Math.cos(eps0 * DEG2RAD);
  return normalizeDegrees(gmst + equationOfEquinoxes);
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
