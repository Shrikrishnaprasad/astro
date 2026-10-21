import { getAyanamsa } from "./ayanamsa";
import { normalizeDegrees } from "./constants";
import {
  DEFAULT_EPHEMERIS_SETTINGS,
  resolveEphemerisSettings,
  type EphemerisSettings,
} from "./ephemerisSettings";
import { getLocalSiderealTimeDegrees, getMeanObliquityDegrees } from "./siderealTime";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Tropical ecliptic longitude of the ascendant (lagna), using the standard
 * RAMC / latitude / obliquity formula:
 *   tan(Asc) = -cos(RAMC) / (sin(RAMC)*cos(eps) + tan(lat)*sin(eps))
 *
 * atan2(-cos(RAMC), sin(RAMC)*cos(eps)+tan(lat)*sin(eps)) lands on the
 * DESCENDANT, not the ascendant (verified against an independent
 * horizon-altitude/azimuth crossing search: that quadrant comes out due
 * west, azimuth ~270°, instead of due east, ~90°). The ascendant is exactly
 * 180° from that root of the same tangent, so flip quadrant by negating both
 * atan2 arguments.
 */
export function getTropicalAscendant(date: Date, latitude: number, longitude: number): number {
  const ramc = getLocalSiderealTimeDegrees(date, longitude) * DEG2RAD;
  const eps = getMeanObliquityDegrees(date) * DEG2RAD;
  const lat = latitude * DEG2RAD;

  const numerator = -Math.cos(ramc);
  const denominator = Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps);
  const lambda = Math.atan2(-numerator, -denominator) * RAD2DEG;
  return normalizeDegrees(lambda);
}

export function getSiderealAscendant(
  date: Date,
  latitude: number,
  longitude: number,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): number {
  const resolved = resolveEphemerisSettings(settings);
  const tropical = getTropicalAscendant(date, latitude, longitude);
  return normalizeDegrees(tropical - getAyanamsa(date, resolved.ayanamsa));
}

export function getLagnaRasiIndex(
  date: Date,
  latitude: number,
  longitude: number,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): number {
  return Math.floor(getSiderealAscendant(date, latitude, longitude, settings) / 30);
}
