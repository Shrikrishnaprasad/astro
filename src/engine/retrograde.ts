import { getSiderealLongitudes } from "./planetaryPositions";
import type { LongitudeMap, Planet } from "./types";
import { PLANETS } from "./types";

export type RetrogradeMap = Record<Planet, boolean>;

const DELTA_HOURS = 6;

// Signed shortest angular difference b - a, in (-180, 180].
function signedDiff(a: number, b: number): number {
  return (((b - a + 180) % 360) + 360) % 360 - 180;
}

/**
 * Vakra (retrograde) status per graha at the given moment, found by a central
 * finite difference of sidereal longitude a few hours either side: moving
 * backward through the zodiac means retrograde. Sun and Moon never retrograde
 * (geocentric motion is always prograde) and are always reported false; Rahu
 * and Ketu (mean nodes) always move backward by construction and so are
 * always reported true.
 */
export function getRetrogradeStatus(date: Date, deltaHours = DELTA_HOURS): RetrogradeMap {
  const deltaMs = deltaHours * 60 * 60 * 1000;
  const before: LongitudeMap = getSiderealLongitudes(new Date(date.getTime() - deltaMs));
  const after: LongitudeMap = getSiderealLongitudes(new Date(date.getTime() + deltaMs));

  const result = {} as RetrogradeMap;
  for (const planet of PLANETS) {
    if (planet === "Sun" || planet === "Moon") {
      result[planet] = false;
      continue;
    }
    result[planet] = signedDiff(before[planet], after[planet]) < 0;
  }
  return result;
}

/**
 * Whether the (R) vakram tag should be displayed for this graha. Rahu/Ketu
 * (mean nodes) are always retrograde by construction, so flagging them is
 * pure noise - callers should use this instead of reading `status[planet]`
 * directly wherever a marker/label is shown to the user.
 */
export function shouldShowRetrograde(planet: Planet, status: RetrogradeMap | null): boolean {
  if (!status || planet === "Rahu" || planet === "Ketu") return false;
  return status[planet];
}
