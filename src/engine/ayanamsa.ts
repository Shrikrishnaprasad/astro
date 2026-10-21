import { julianCenturiesSinceJ2000, toJulianDate } from "./constants";
import type { AyanamsaMode } from "./ephemerisSettings";
import { getNutationInLongitudeDegrees } from "./nutation";

// Lahiri ayanamsa approximation: anchored at J2000.0 (2000-01-01 12:00 TT),
// where the Lahiri ayanamsa is 23°51'11" = 23.8531 degrees, precessing at the
// IAU general precession rate of ~50.2877 arcseconds/year.
//
// This is a mean-value approximation (no periodic/nutation correction terms).
// Expect agreement with published ephemerides to within a few arcminutes —
// sufficient for sign/nakshatra-level astrology but not for professional-grade
// arcsecond precision. See VERIFICATION.md for comparison notes.
const J2000_LAHIRI_AYANAMSA_DEGREES = 23.8531;
const PRECESSION_RATE_ARCSEC_PER_YEAR = 50.2877;

export function getLahiriAyanamsa(date: Date): number {
  const jd = toJulianDate(date);
  const centuriesSinceJ2000 = julianCenturiesSinceJ2000(jd);
  const yearsSinceJ2000 = centuriesSinceJ2000 * 100;
  const driftDegrees = (yearsSinceJ2000 * PRECESSION_RATE_ARCSEC_PER_YEAR) / 3600;
  return J2000_LAHIRI_AYANAMSA_DEGREES + driftDegrees;
}

/** Raman ayanamsa — linear from 1900 epoch (approximation). */
function getRamanAyanamsa(date: Date): number {
  const jd = toJulianDate(date);
  const yearsFrom1900 = (jd - 2415020.0) / 365.25;
  const base = 22 + 22 / 60 + 30 / 3600;
  return base + (yearsFrom1900 * PRECESSION_RATE_ARCSEC_PER_YEAR) / 3600;
}

/**
 * K.S. Krishnamurti KP ayanamsa (KP Reader I): 22°27′37″ at calendar year 1900,
 * precession 50.2388475″ per Gregorian year (Newcomb rate cited by KSK).
 */
export const KP_AYANAMSA_EPOCH_YEAR = 1900;
export const KP_AYANAMSA_AT_EPOCH_DEGREES = 22 + 27 / 60 + 37 / 3600;
export const KP_PRECESSION_ARCSEC_PER_YEAR = 50.2388475;

/** Gregorian year with fraction (for sub-year KP ayanamsa). */
export function decimalGregorianYear(date: Date): number {
  const y = date.getUTCFullYear();
  const yearStart = Date.UTC(y, 0, 1);
  const nextYear = Date.UTC(y + 1, 0, 1);
  return y + (date.getTime() - yearStart) / (nextYear - yearStart);
}

export function getKpAyanamsa(date: Date): number {
  const yearsSinceEpoch = decimalGregorianYear(date) - KP_AYANAMSA_EPOCH_YEAR;
  return (
    KP_AYANAMSA_AT_EPOCH_DEGREES + (yearsSinceEpoch * KP_PRECESSION_ARCSEC_PER_YEAR) / 3600
  );
}

/** @deprecated Alias — use getKpAyanamsa */
export function getKrishnamurtiAyanamsa(date: Date): number {
  return getKpAyanamsa(date);
}

export function getAyanamsa(date: Date, mode: AyanamsaMode): number {
  switch (mode) {
    case "lahiri-mean":
      return getLahiriAyanamsa(date);
    case "lahiri-true":
      return getLahiriAyanamsa(date) + getNutationInLongitudeDegrees(date);
    case "raman":
      return getRamanAyanamsa(date);
    case "kp":
    case "krishnamurti":
      return getKpAyanamsa(date);
    default:
      return getLahiriAyanamsa(date);
  }
}
