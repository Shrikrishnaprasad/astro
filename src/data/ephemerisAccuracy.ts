/** Single-line summary shown on chart / transit pages (keep in sync with VERIFICATION.md). */
export const EPHEMERIS_SUITABILITY_SUMMARY =
  "This app uses mean Lahiri ayanamsa, mean Rahu/Ketu, and a standard closed-form ascendant — suitable for sign- and nakshatra-level astrology, not arcsecond ephemeris.";

export interface EphemerisLimit {
  id: string;
  title: string;
  summary: string;
  detail: string;
  engineRef: string;
}

export const EPHEMERIS_LIMITS: EphemerisLimit[] = [
  {
    id: "lahiri",
    title: "Lahiri ayanamsa (mean)",
    summary: "Linear mean precession from J2000; no nutation-level periodic terms.",
    detail:
      "Expect agreement with published panchangams within a few arcminutes, not arcseconds. Sidereal longitudes inherit this uncertainty.",
    engineRef: "src/engine/ayanamsa.ts",
  },
  {
    id: "rahu-ketu",
    title: "Rahu / Ketu (mean node)",
    summary: "Meeus mean lunar ascending node; Ketu is 180° from Rahu.",
    detail:
      "True node can differ by roughly a degree from the mean node. Sign and nakshatra for the nodes are usually stable; fine degree matches to third-party ephemerides are not guaranteed.",
    engineRef: "src/engine/lunarNodes.ts",
  },
  {
    id: "ascendant",
    title: "Ascendant (lagna)",
    summary: "RAMC / latitude / mean obliquity closed form (Duffett-Smith convention).",
    detail:
      "Self-consistent and correct for sign-level lagna in practice, but not yet cross-checked against a third-party ephemeris for exact degree agreement. Treat lagna degrees as indicative.",
    engineRef: "src/engine/ascendant.ts",
  },
  {
    id: "planets",
    title: "Graha longitudes",
    summary: "Tropical positions from astronomy-engine, minus mean Lahiri ayanamsa.",
    detail:
      "Ecliptic-of-date from the library; sidereal conversion uses the same mean ayanamsa. Good for rasi, nakshatra, and pada; not a substitute for professional-grade Swiss Ephemeris workflows.",
    engineRef: "src/engine/planetaryPositions.ts",
  },
];

export const EPHEMERIS_AUTOMATED_TESTS = [
  "Arudha Pada (including same-sign / 7th exception)",
  "Vimshottari Dasa balance, Bhukti proportions, 120-year cycle",
  "Lahiri ayanamsa at J2000 and precession rate",
  "Panchangam ranges across a month of dates",
  "Porutham Nadi / Rajju dosha flag cases",
];

export const EPHEMERIS_MANUAL_SPOTCHECK =
  "Manual spot-check (2000-01-01 12:00 UTC, Chennai): sidereal Sun ≈ 256.28° (Dhanu); pipeline matches tropical Sun minus Lahiri ayanamsa. See VERIFICATION.md in the repo for full notes.";

export const EPHEMERIS_FOLLOW_UP =
  "Compare 2–3 known charts or panchangam entries (e.g. Drik Panchang) for the same date, time, and place: Sun/Moon sidereal longitude, sign, nakshatra, pada, and ascendant sign.";
