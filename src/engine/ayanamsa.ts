import { julianCenturiesSinceJ2000, toJulianDate } from "./constants";

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
