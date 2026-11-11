/**
 * Eight Jama Grahas (எட்டு ஜாமக்கிரகங்கள்) — 45-degree ring calculation engine.
 *
 * This module implements the observed Vaidyanathan-style 45-degree angular ring
 * for the Jamakkol Arudam application.
 *
 * IMPORTANT:
 *   The eight Jama Grahas are time-dependent special astrological points — they
 *   are NOT the actual astronomical positions of the eight physical planets.
 *   This module intentionally does NOT use planetary ephemeris longitudes.
 *
 * Method: VAIDYANATHAN_45_DEGREE_RING
 *   • At 06:00 AM local time, Surya Jama Graha is at 45°.
 *   • Movement is RETROGRADE at 0.5°/minute (= 30 arcseconds/second).
 *   • Rahu, Chandra, Sani, Sukran, Budhan, Guru, Sevvai follow at fixed
 *     45° offsets from Surya.
 *   • All positions are computed from the applicable 06:00 AM reference:
 *       – query ≥ 06:00 AM local → today's 06:00 AM
 *       – query < 06:00 AM local → yesterday's 06:00 AM
 *
 * Precision: internally uses integer arcseconds to avoid floating-point
 * accumulation. All public outputs are in decimal degrees.
 *
 * Configuration: the reference longitude, movement rate, and reference-time
 * hour/minute are configurable via JamaGrahaRingConfig so that alternative
 * traditional lineages can be supported without modifying this module.
 *
 * NOTE: The formula published here has been validated against reference charts
 * from the Vaidyanathan lineage. It is not claimed to be universally accepted
 * by every Jamakkol tradition.
 */

import { NAKSHATRAS } from "../data/nakshatras";
import { RASIS } from "../data/rasis";
import { longitudeToRasiNakshatra } from "./rasiNakshatra";
import { localToUTC } from "./udhayam";

// ─── Internal arcsecond constants ─────────────────────────────────────────────

const ARCSEC_PER_DEGREE = 3600;
const ARCSEC_PER_CIRCLE = 360 * ARCSEC_PER_DEGREE; // 1 296 000

function normalizeArcsec(arcsec: number): number {
  return ((arcsec % ARCSEC_PER_CIRCLE) + ARCSEC_PER_CIRCLE) % ARCSEC_PER_CIRCLE;
}

function arcsecToDecimalDeg(arcsec: number): number {
  return arcsec / ARCSEC_PER_DEGREE;
}

function arcsecToDms(arcsec: number): { degree: number; minute: number; second: number } {
  const s = Math.round(arcsec);
  const second = s % 60;
  const totalMin = Math.floor(s / 60);
  const minute = totalMin % 60;
  const degree = Math.floor(totalMin / 60);
  return { degree, minute, second };
}

// ─── Configuration ────────────────────────────────────────────────────────────

/**
 * Configurable parameters for the 45-degree Jama Graha ring.
 * Use DEFAULT_JAMA_GRAHA_CONFIG for the published Vaidyanathan implementation.
 */
export interface JamaGrahaRingConfig {
  /** Surya's longitude (degrees) at the reference time. */
  referenceLongitudeDeg: number;
  /** Reference local hour (0–23). */
  referenceTimeHour: number;
  /** Reference local minute (0–59). */
  referenceTimeMinute: number;
  /** Angular movement rate, degrees per minute (magnitude only). */
  movementRateDegPerMin: number;
  /** Direction of movement from the reference time. */
  direction: "RETROGRADE" | "PROGRADE";
}

/** Vaidyanathan published rule: 45° at 06:00 AM, retrograde at 0.5°/min. */
export const DEFAULT_JAMA_GRAHA_CONFIG: JamaGrahaRingConfig = {
  referenceLongitudeDeg: 45,
  referenceTimeHour: 6,
  referenceTimeMinute: 0,
  movementRateDegPerMin: 0.5,
  direction: "RETROGRADE",
};

// ─── Fixed graha sequence ──────────────────────────────────────────────────────

export interface JamaGrahaDefinition {
  id: string;
  name: string;
  tamil: string;
  /** Fixed angular offset from Surya (degrees). */
  offset: number;
}

/**
 * Fixed 45-degree ring sequence — Surya at offset 0, then each successive
 * graha is 45° further forward in the zodiac.
 *
 * NOTE: This sequence and these offsets are specific to the Vaidyanathan
 * 45-degree ring convention.  They are NOT the same as the existing
 * JAMAGRAHAM_SEQUENCE (which is a 1.5-hour sunrise-cycle for a different
 * calculation).
 */
export const JAMA_GRAHA_RING: JamaGrahaDefinition[] = [
  { id: "surya",   name: "Surya",   tamil: "சூரியன்",       offset: 0 },
  { id: "rahu",    name: "Rahu",    tamil: "ராகு / பாம்பு", offset: 45 },
  { id: "chandra", name: "Chandra", tamil: "சந்திரன்",       offset: 90 },
  { id: "sani",    name: "Sani",    tamil: "சனி",            offset: 135 },
  { id: "sukran",  name: "Sukran",  tamil: "சுக்கிரன்",      offset: 180 },
  { id: "budhan",  name: "Budhan",  tamil: "புதன்",          offset: 225 },
  { id: "guru",    name: "Guru",    tamil: "குரு",            offset: 270 },
  { id: "sevvai",  name: "Sevvai",  tamil: "செவ்வாய்",       offset: 315 },
];

// ─── I/O types ────────────────────────────────────────────────────────────────

/** Position details for a single Jama Graha. */
export interface JamaGrahaPosition {
  id: string;
  name: string;
  tamil: string;
  /** Fixed offset from Surya in this ring (degrees). */
  offset: number;
  /** Final ecliptic longitude, 0–360° (decimal). */
  longitude: number;
  /** Degrees within the rasi. */
  degreeInRasi: number;
  degree: number;
  minute: number;
  second: number;
  rasi: string;
  rasiIndex: number;
  rasiLord: string;
  nakshatraIndex: number;
  nakshatra: string;
  nakshatraTamil: string;
  pada: number;
  nakshatraLord: string;
}

/** Input for the string-based / IANA-timezone entry-point. */
export interface JamaGrahaStringInput {
  /** Local date, YYYY-MM-DD. */
  date: string;
  /** Local time, HH:mm or HH:mm:ss. */
  time: string;
  /** IANA timezone identifier, e.g. "Asia/Kolkata". */
  timezone: string;
  /** Configuration override (optional). */
  config?: Partial<JamaGrahaRingConfig>;
}

export interface JamaGrahaRingResult {
  calculationMethod: "VAIDYANATHAN_45_DEGREE_RING";

  reference: {
    /** Local time of the reference moment (HH:mm:ss). */
    time: string;
    /** Surya's longitude at the reference moment (degrees). */
    longitude: number;
    /** Movement rate (degrees per minute). */
    movementRate: number;
    direction: "RETROGRADE" | "PROGRADE";
    /** Elapsed whole minutes since the reference. */
    elapsedMinutes: number;
    /** Elapsed total seconds since the reference. */
    elapsedSeconds: number;
    /** The applicable reference moment (UTC). */
    referenceUtc: Date;
  };

  startingLongitude: {
    degree: number;
    minute: number;
    second: number;
    /** θ in decimal degrees, 0–360. */
    totalLongitude: number;
  };

  jamaGrahas: JamaGrahaPosition[];
}

// ─── Core helpers (exported for unit testing) ─────────────────────────────────

/**
 * Given a UTC instant and a fixed UTC-offset timezone, find the UTC instant
 * corresponding to the applicable reference (06:00 AM local on the current
 * or previous local day).
 *
 * @param queryUtc    The moment being queried.
 * @param tzOffsetHours UTC offset in hours (e.g., +5.5 for IST, −5 for EST).
 * @param config      Ring configuration (reference hour/minute used).
 */
export function getReferenceSixAmUTC(
  queryUtc: Date,
  tzOffsetHours: number,
  config: JamaGrahaRingConfig = DEFAULT_JAMA_GRAHA_CONFIG,
): Date {
  const tzOffsetMs = tzOffsetHours * 3_600_000;

  // Compute query time in local clock
  const localMs = queryUtc.getTime() + tzOffsetMs;
  const localDate = new Date(localMs);

  const localHour = localDate.getUTCHours();
  const localMin = localDate.getUTCMinutes();
  const localSec = localDate.getUTCSeconds();

  const refHour = config.referenceTimeHour;
  const refMin = config.referenceTimeMinute;

  const localSecondsOfDay = localHour * 3600 + localMin * 60 + localSec;
  const refSecondsOfDay = refHour * 3600 + refMin * 60;

  // Which local day does the reference fall on?
  const sameDayRefMs =
    Date.UTC(
      localDate.getUTCFullYear(),
      localDate.getUTCMonth(),
      localDate.getUTCDate(),
      refHour,
      refMin,
      0,
    ) - tzOffsetMs;

  if (localSecondsOfDay >= refSecondsOfDay) {
    // Query is at or after today's reference → use today's
    return new Date(sameDayRefMs);
  } else {
    // Query is before today's reference → use yesterday's
    return new Date(sameDayRefMs - 86_400_000);
  }
}

/**
 * Calculate elapsed seconds from the reference UTC instant to the query.
 * Always ≥ 0 by construction (reference is always ≤ query).
 */
export function calculateElapsedSeconds(queryUtc: Date, referenceUtc: Date): number {
  return (queryUtc.getTime() - referenceUtc.getTime()) / 1000;
}

/**
 * Calculate the starting longitude θ (arcseconds, normalized to [0, 1 296 000)).
 *
 * Uses integer arcseconds internally for precision.
 *
 * For RETROGRADE: θ = reference − elapsed × rate
 * For PROGRADE:   θ = reference + elapsed × rate
 *
 * @param elapsedSeconds Elapsed seconds since the reference.
 * @param config         Ring configuration.
 */
export function calculateStartingLongitudeArcsec(
  elapsedSeconds: number,
  config: JamaGrahaRingConfig = DEFAULT_JAMA_GRAHA_CONFIG,
): number {
  // Rate: 0.5°/min = 30 arcseconds/second
  const arcsecPerSecond = (config.movementRateDegPerMin * ARCSEC_PER_DEGREE) / 60;
  const referenceArcsec = config.referenceLongitudeDeg * ARCSEC_PER_DEGREE;
  const elapsedArcsec = Math.round(elapsedSeconds * arcsecPerSecond);

  const raw =
    config.direction === "RETROGRADE"
      ? referenceArcsec - elapsedArcsec
      : referenceArcsec + elapsedArcsec;

  return normalizeArcsec(raw);
}

/**
 * Given starting longitude θ (decimal degrees, 0–360), calculate all eight
 * Jama Graha positions.
 */
export function calculateAllJamaGrahas(thetaDeg: number): JamaGrahaPosition[] {
  const thetaArcsec = Math.round(thetaDeg * ARCSEC_PER_DEGREE);

  return JAMA_GRAHA_RING.map((def) => {
    const offsetArcsec = def.offset * ARCSEC_PER_DEGREE;
    const grahaArcsec = normalizeArcsec(thetaArcsec + offsetArcsec);
    const longitude = arcsecToDecimalDeg(grahaArcsec);

    const nkInfo = longitudeToRasiNakshatra(longitude);
    const rasi = RASIS[nkInfo.rasiIndex];
    const nakshatra = NAKSHATRAS[nkInfo.nakshatraIndex];
    const { degree, minute, second } = arcsecToDms(grahaArcsec % (30 * ARCSEC_PER_DEGREE));

    return {
      id: def.id,
      name: def.name,
      tamil: def.tamil,
      offset: def.offset,
      longitude,
      degreeInRasi: nkInfo.degreeInRasi,
      degree,
      minute,
      second,
      rasi: rasi.nameEnglish,
      rasiIndex: nkInfo.rasiIndex,
      rasiLord: rasi.lord,
      nakshatraIndex: nkInfo.nakshatraIndex,
      nakshatra: nakshatra.nameEnglish,
      nakshatraTamil: nakshatra.nameTamil,
      pada: nkInfo.pada,
      nakshatraLord: nakshatra.lord,
    };
  });
}

// ─── Main entry-point (UTC Date + numeric offset) ─────────────────────────────

/**
 * Calculate all eight Jama Grahas for a given UTC instant with a fixed
 * numeric timezone offset.  Used by the UI (where offset comes from the
 * selected place's tzOffsetHours).
 *
 * @param queryUtc      The UTC moment to calculate for.
 * @param tzOffsetHours UTC offset in hours (e.g., +5.5 for IST).
 * @param config        Optional configuration override.
 */
export function calculateEightJamaGrahasFromUTC(
  queryUtc: Date,
  tzOffsetHours: number,
  config: Partial<JamaGrahaRingConfig> = {},
): JamaGrahaRingResult {
  const cfg: JamaGrahaRingConfig = { ...DEFAULT_JAMA_GRAHA_CONFIG, ...config };

  const referenceUtc = getReferenceSixAmUTC(queryUtc, tzOffsetHours, cfg);
  const elapsedSeconds = calculateElapsedSeconds(queryUtc, referenceUtc);
  const thetaArcsec = calculateStartingLongitudeArcsec(elapsedSeconds, cfg);
  const thetaDeg = arcsecToDecimalDeg(thetaArcsec);

  const thetaDms = arcsecToDms(thetaArcsec);
  const elapsedWholeMinutes = Math.floor(elapsedSeconds / 60);

  return {
    calculationMethod: "VAIDYANATHAN_45_DEGREE_RING",
    reference: {
      time: `${String(cfg.referenceTimeHour).padStart(2, "0")}:${String(cfg.referenceTimeMinute).padStart(2, "0")}:00`,
      longitude: cfg.referenceLongitudeDeg,
      movementRate: cfg.movementRateDegPerMin,
      direction: cfg.direction,
      elapsedMinutes: elapsedWholeMinutes,
      elapsedSeconds: Math.round(elapsedSeconds),
      referenceUtc,
    },
    startingLongitude: {
      degree: thetaDms.degree,
      minute: thetaDms.minute,
      second: thetaDms.second,
      totalLongitude: thetaDeg,
    },
    jamaGrahas: calculateAllJamaGrahas(thetaDeg),
  };
}

// ─── String-based / IANA entry-point ─────────────────────────────────────────

/**
 * Calculate all eight Jama Grahas from a local date, time, and IANA timezone.
 *
 * Converts the local input to UTC via the same IANA-aware pipeline used by
 * the Udhayam engine, then delegates to calculateEightJamaGrahasFromUTC().
 *
 * Note: the reference-time identification (which 06:00 AM to use) also needs
 * to be done in the local timezone; this entry-point handles that correctly by
 * separately computing the reference anchor via IANA lookup.
 *
 * @throws UdhayamValidationError for invalid timezone (via localToUTC).
 */
export function calculateEightJamaGrahas(
  input: JamaGrahaStringInput,
): JamaGrahaRingResult {
  const cfg: JamaGrahaRingConfig = { ...DEFAULT_JAMA_GRAHA_CONFIG, ...(input.config ?? {}) };

  // Convert the query time to UTC
  const queryUtc = localToUTC(input.date, input.time, input.timezone);

  // Determine the applicable reference 06:00 AM in the IANA timezone
  const refTimeStr = `${String(cfg.referenceTimeHour).padStart(2, "0")}:${String(cfg.referenceTimeMinute).padStart(2, "0")}:00`;

  // Extract the local date components at the query time using Intl
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: input.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(queryUtc).map(({ type, value }) => [type, value]),
  );
  const localHour = Number(parts.hour === "24" ? 0 : parts.hour);
  const localMin = Number(parts.minute);
  const localSec = Number(parts.second);

  const refH = cfg.referenceTimeHour;
  const refM = cfg.referenceTimeMinute;
  const localSecondsOfDay = localHour * 3600 + localMin * 60 + localSec;
  const refSecondsOfDay = refH * 3600 + refM * 60;

  // Is the query before or at/after the reference hour on the local day?
  const localDateStr = `${parts.year}-${parts.month}-${parts.day}`;
  let referenceDateStr: string;
  if (localSecondsOfDay >= refSecondsOfDay) {
    referenceDateStr = localDateStr;
  } else {
    // Yesterday in local time
    const prevDay = new Date(localToUTC(localDateStr, "00:00:00", input.timezone).getTime() - 1);
    const prevParts = Object.fromEntries(
      formatter.formatToParts(prevDay).map(({ type, value }) => [type, value]),
    );
    referenceDateStr = `${prevParts.year}-${prevParts.month}-${prevParts.day}`;
  }

  const referenceUtc = localToUTC(referenceDateStr, refTimeStr, input.timezone);
  const elapsedSeconds = calculateElapsedSeconds(queryUtc, referenceUtc);
  const thetaArcsec = calculateStartingLongitudeArcsec(elapsedSeconds, cfg);
  const thetaDeg = arcsecToDecimalDeg(thetaArcsec);
  const thetaDms = arcsecToDms(thetaArcsec);

  return {
    calculationMethod: "VAIDYANATHAN_45_DEGREE_RING",
    reference: {
      time: refTimeStr,
      longitude: cfg.referenceLongitudeDeg,
      movementRate: cfg.movementRateDegPerMin,
      direction: cfg.direction,
      elapsedMinutes: Math.floor(elapsedSeconds / 60),
      elapsedSeconds: Math.round(elapsedSeconds),
      referenceUtc,
    },
    startingLongitude: {
      degree: thetaDms.degree,
      minute: thetaDms.minute,
      second: thetaDms.second,
      totalLongitude: thetaDeg,
    },
    jamaGrahas: calculateAllJamaGrahas(thetaDeg),
  };
}
