/**
 * Udhayam (உதயம்) — Ascendant / Lagna calculation service.
 *
 * This module is the canonical Udhayam entry-point for the Jamakkol Arudam
 * application.  It wraps the existing lower-level functions in
 * ascendant.ts / siderealTime.ts / ayanamsa.ts into a single, richly-typed
 * service that:
 *
 *   • Accepts IANA timezone names (not raw UTC offsets).
 *   • Validates all inputs and throws UdhayamValidationError on bad data.
 *   • Returns a fully-structured result including tropical and sidereal
 *     longitudes, ayanamsa, GMST/GAST/LST, obliquity, nakshatra, pada, and
 *     rasi/nakshatra lords.
 *
 * The underlying ascendant formula and ayanamsa pipeline are intentionally
 * NOT duplicated here — this module re-uses getTropicalAscendant(),
 * getSiderealAscendant(), getAyanamsa() etc. unchanged.
 *
 * Precision: sign- and nakshatra-level, matching the existing application
 * precision (linear mean-precession ayanamsa, mean-obliquity RAMC formula).
 * See VERIFICATION.md for documented accuracy limits.
 *
 * Astronomical library: astronomy-engine ^2.1.19 (via ascendant.ts)
 * Coordinate convention: east-positive geographic longitude, 0–360° ecliptic.
 */

import { NAKSHATRAS } from "../data/nakshatras";
import { RASIS } from "../data/rasis";
import { getAyanamsa } from "./ayanamsa";
import { getTropicalAscendant } from "./ascendant";
import { normalizeDegrees, toJulianDate } from "./constants";
import {
  DEFAULT_EPHEMERIS_SETTINGS,
  resolveEphemerisSettings,
  type AyanamsaMode,
  type EphemerisSettings,
} from "./ephemerisSettings";
import { longitudeToRasiNakshatra } from "./rasiNakshatra";
import {
  getGASTDegrees,
  getGMSTDegrees,
  getLocalSiderealTimeDegrees,
  getMeanObliquityDegrees,
} from "./siderealTime";

// ─── IANA timezone conversion ─────────────────────────────────────────────────

/**
 * Returns how many milliseconds to add to UTC to reach local time in
 * `timezone` at the given `utcDate`.
 *
 * Positive for east of UTC (Asia/Kolkata = +19_800_000 ms = +5.5 h).
 */
function ianaOffsetMs(utcDate: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(utcDate).map(({ type, value }) => [type, value]),
  );
  // hour12: false can produce "24" at midnight on some platforms
  let h = Number(parts.hour);
  if (h === 24) h = 0;
  const localAsUtcMs = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    h,
    Number(parts.minute),
    Number(parts.second),
  );
  return localAsUtcMs - utcDate.getTime();
}

/**
 * Convert a local date + time expressed in an IANA timezone to a UTC Date.
 *
 * Algorithm: treat the local date/time as if it were UTC to get an initial
 * approximation, compute the real offset at that point, subtract it, then
 * re-check to handle DST boundary situations.
 *
 * @param dateStr  "YYYY-MM-DD"
 * @param timeStr  "HH:mm" or "HH:mm:ss"
 * @param timezone IANA timezone identifier, e.g. "Asia/Kolkata"
 */
export function localToUTC(dateStr: string, timeStr: string, timezone: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const timeParts = timeStr.split(":");
  const hour = Number(timeParts[0]);
  const minute = Number(timeParts[1]);
  const second = Number(timeParts[2] ?? 0);

  const naiveMs = Date.UTC(year, month - 1, day, hour, minute, second);

  // Pass 1: offset at the naive UTC instant
  const offset1 = ianaOffsetMs(new Date(naiveMs), timezone);
  const estimate = new Date(naiveMs - offset1);

  // Pass 2: re-evaluate at the estimated UTC (corrects for DST transitions)
  const offset2 = ianaOffsetMs(estimate, timezone);
  return new Date(naiveMs - offset2);
}

// ─── Validation ───────────────────────────────────────────────────────────────

export class UdhayamValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UdhayamValidationError";
  }
}

function assertDate(dateStr: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr))
    throw new UdhayamValidationError(
      `Invalid date format "${dateStr}" — expected YYYY-MM-DD.`,
    );
  const probe = new Date(`${dateStr}T00:00:00Z`);
  if (isNaN(probe.getTime()))
    throw new UdhayamValidationError(`Date "${dateStr}" is not a valid calendar date.`);
}

function assertTime(timeStr: string): void {
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr))
    throw new UdhayamValidationError(
      `Invalid time format "${timeStr}" — expected HH:mm or HH:mm:ss.`,
    );
  const [h, m, s = 0] = timeStr.split(":").map(Number);
  if (h > 23 || m > 59 || s > 59)
    throw new UdhayamValidationError(`Time "${timeStr}" contains an out-of-range value.`);
}

function assertLatitude(lat: number): void {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90)
    throw new UdhayamValidationError(
      `Latitude ${lat} is out of range — must be in [−90, +90].`,
    );
}

function assertLongitude(lon: number): void {
  if (!Number.isFinite(lon) || lon < -180 || lon > 180)
    throw new UdhayamValidationError(
      `Longitude ${lon} is out of range — must be in [−180, +180].`,
    );
}

function assertTimezone(tz: string): void {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: tz });
  } catch {
    throw new UdhayamValidationError(`"${tz}" is not a valid IANA timezone.`);
  }
}

// ─── I/O types ────────────────────────────────────────────────────────────────

/**
 * Input for calculateUdhayam().
 * All fields are required except `ayanamsa`, which defaults to the
 * application's current ephemeris setting.
 */
export interface UdhayamInput {
  /** Local date in YYYY-MM-DD format. */
  date: string;
  /** Local time in HH:mm or HH:mm:ss format. */
  time: string;
  /** Geographic latitude, −90 to +90 (north positive). */
  latitude: number;
  /** Geographic longitude, −180 to +180 (east positive). */
  longitude: number;
  /** IANA timezone identifier, e.g. "Asia/Kolkata". */
  timezone: string;
  /**
   * Ayanamsa to use. Defaults to the app's current ephemeris setting
   * (lahiri-mean unless overridden in EphemerisSettingsContext).
   * Must be one of: "lahiri-mean" | "lahiri-true" | "raman" | "kp" | "yukteswar".
   */
  ayanamsa?: AyanamsaMode;
}

/** Degrees, minutes, and seconds representation. */
export interface DmsValue {
  degree: number;
  minute: number;
  second: number;
}

/** A position on the ecliptic with both decimal and DMS representations. */
export interface EclipticPoint extends DmsValue {
  /** Full ecliptic longitude, 0–360°. */
  longitude: number;
  /** Rasi name (English). */
  rasi: string;
  /** Zero-based rasi index, 0 = Mesha … 11 = Meena. */
  rasiIndex: number;
  /** Degrees within the rasi (0–30). */
  degreeInRasi: number;
}

export interface UdhayamResult {
  /** The UTC instant used for the calculation. */
  utcDate: Date;

  /** Tropical (Western) ascendant — before ayanamsa subtraction. */
  tropicalAscendant: EclipticPoint;

  /** Sidereal ascendant (Udhayam / Lagna) — after ayanamsa subtraction. */
  siderealAscendant: EclipticPoint;

  ayanamsa: {
    /** Human-readable name of the ayanamsa applied. */
    name: string;
    /** Ayanamsa value in decimal degrees. */
    value: number;
  };

  astronomicalData: {
    /** Julian Day Number (fractional) for the UTC instant. */
    julianDay: number;
    /** Greenwich Mean Sidereal Time, degrees. */
    gmst: number;
    /** Greenwich Apparent Sidereal Time (GMST + equation of equinoxes), degrees. */
    gast: number;
    /** Local Sidereal Time (GMST + geographic longitude), degrees. */
    localSiderealTime: number;
    /** Mean obliquity of the ecliptic, degrees. */
    obliquity: number;
  };

  nakshatra: {
    /** Zero-based nakshatra index (0 = Ashwini … 26 = Revati). */
    index: number;
    /** Nakshatra name (English). */
    name: string;
    /** Nakshatra name (Tamil). */
    nameTamil: string;
    /** Nakshatra pada, 1–4. */
    pada: number;
    /** Nakshatra lord (Vimshottari). */
    lord: string;
  };

  /** Rasi lord of the sidereal ascendant. */
  rasiLord: string;

  /** Identifies the calculation convention used. */
  calculationMethod: "ASTRONOMICAL_SIDEREAL_ASCENDANT";
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function toDms(decimalDeg: number): DmsValue {
  const abs = Math.abs(decimalDeg);
  const degree = Math.floor(abs);
  const minuteDecimal = (abs - degree) * 60;
  const minute = Math.floor(minuteDecimal);
  const second = Math.round((minuteDecimal - minute) * 60);
  return { degree, minute, second };
}

function makeEclipticPoint(longitude: number): EclipticPoint {
  const norm = normalizeDegrees(longitude);
  const rasiIndex = Math.floor(norm / 30);
  const degreeInRasi = norm - rasiIndex * 30;
  const dms = toDms(degreeInRasi);
  return {
    longitude: norm,
    rasiIndex,
    rasi: RASIS[rasiIndex].nameEnglish,
    degreeInRasi,
    degree: dms.degree,
    minute: dms.minute,
    second: dms.second,
  };
}

const AYANAMSA_NAMES: Record<AyanamsaMode, string> = {
  "lahiri-mean": "Lahiri (mean precession)",
  "lahiri-true": "Lahiri (mean + nutation)",
  raman: "Raman",
  kp: "KP (Krishnamurti)",
  krishnamurti: "KP (Krishnamurti)",
  yukteswar: "Yukteswar",
};

// ─── Core engine ──────────────────────────────────────────────────────────────

/**
 * Build a full UdhayamResult from a UTC Date and geographic coordinates.
 *
 * This is the low-level entry-point used by the UI (which already has a UTC
 * Date from the existing BirthInput pipeline).  calculateUdhayam() wraps
 * this after handling IANA timezone conversion and validation.
 */
export function calculateUdhayamFromDate(
  utcDate: Date,
  latitude: number,
  longitude: number,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): UdhayamResult {
  const resolved = resolveEphemerisSettings(settings);
  const ayanamsaMode = resolved.ayanamsa;

  // ── Core calculations ──
  const tropical = getTropicalAscendant(utcDate, latitude, longitude);
  const ayanamsaValue = getAyanamsa(utcDate, ayanamsaMode);
  const sidereal = normalizeDegrees(tropical - ayanamsaValue);

  // ── Intermediate astronomical data ──
  const jd = toJulianDate(utcDate);
  const gmst = getGMSTDegrees(utcDate);
  const gast = getGASTDegrees(utcDate);
  const lst = getLocalSiderealTimeDegrees(utcDate, longitude);
  const obliquity = getMeanObliquityDegrees(utcDate);

  // ── Nakshatra / pada ──
  const nkInfo = longitudeToRasiNakshatra(sidereal);
  const nakshatra = NAKSHATRAS[nkInfo.nakshatraIndex];
  const rasi = RASIS[nkInfo.rasiIndex];

  return {
    utcDate,
    tropicalAscendant: makeEclipticPoint(tropical),
    siderealAscendant: makeEclipticPoint(sidereal),
    ayanamsa: {
      name: AYANAMSA_NAMES[ayanamsaMode] ?? ayanamsaMode,
      value: ayanamsaValue,
    },
    astronomicalData: {
      julianDay: jd,
      gmst,
      gast,
      localSiderealTime: lst,
      obliquity,
    },
    nakshatra: {
      index: nkInfo.nakshatraIndex,
      name: nakshatra.nameEnglish,
      nameTamil: nakshatra.nameTamil,
      pada: nkInfo.pada,
      lord: nakshatra.lord,
    },
    rasiLord: rasi.lord,
    calculationMethod: "ASTRONOMICAL_SIDEREAL_ASCENDANT",
  };
}

/**
 * Full Udhayam calculation from a local date/time/timezone input.
 *
 * Validates all inputs, converts local time to UTC via IANA timezone lookup,
 * then delegates to calculateUdhayamFromDate().
 *
 * @throws UdhayamValidationError for any invalid input.
 */
export function calculateUdhayam(
  input: UdhayamInput,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): UdhayamResult {
  // ── Validation ──
  assertDate(input.date);
  assertTime(input.time);
  assertLatitude(input.latitude);
  assertLongitude(input.longitude);
  assertTimezone(input.timezone);

  // ── Timezone conversion ──
  const utcDate = localToUTC(input.date, input.time, input.timezone);

  // ── Ayanamsa override ──
  const effectiveSettings: EphemerisSettings = input.ayanamsa
    ? { ...DEFAULT_EPHEMERIS_SETTINGS, ...settings, ayanamsa: input.ayanamsa }
    : settings;

  return calculateUdhayamFromDate(utcDate, input.latitude, input.longitude, effectiveSettings);
}
