import { getSiderealAscendant } from "./ascendant";
import { getAyanamsa } from "./ayanamsa";
import type { EphemerisSettings } from "./ephemerisSettings";
import { DEFAULT_EPHEMERIS_SETTINGS, resolveEphemerisSettings } from "./ephemerisSettings";
import { getSiderealLongitudes, getTropicalLongitudes } from "./planetaryPositions";
import type { LongitudeMap } from "./types";

export interface EphemerisSnapshot {
  siderealLongitudes: LongitudeMap;
  tropicalLongitudes: LongitudeMap;
  ayanamsaDegrees: number;
  lagnaLongitude: number;
}

export function computeEphemerisSnapshot(
  date: Date,
  latitude: number,
  longitude: number,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): EphemerisSnapshot {
  const resolved = resolveEphemerisSettings(settings);
  const ayanamsaDegrees = getAyanamsa(date, resolved.ayanamsa);
  return {
    siderealLongitudes: getSiderealLongitudes(date, resolved),
    tropicalLongitudes: getTropicalLongitudes(date, resolved),
    ayanamsaDegrees,
    lagnaLongitude: getSiderealAscendant(date, latitude, longitude, resolved),
  };
}

/** Sidereal positions at fixed local clock times on one calendar day (place tz offset). */
export function computeDailyEphemerisRows(
  dateStr: string,
  latitude: number,
  longitude: number,
  tzOffsetHours: number,
  localHours: number[],
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): { localTime: string; snapshot: EphemerisSnapshot }[] {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return [];

  return localHours.map((hh) => {
    const utcMs = Date.UTC(y, m - 1, d, hh, 0) - tzOffsetHours * 60 * 60 * 1000;
    const instant = new Date(utcMs);
    const localTime = `${hh.toString().padStart(2, "0")}:00`;
    return {
      localTime,
      snapshot: computeEphemerisSnapshot(instant, latitude, longitude, settings),
    };
  });
}
