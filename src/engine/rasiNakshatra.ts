import { NAKSHATRA_SPAN_DEGREES, PADA_SPAN_DEGREES } from "../data/nakshatras";
import { normalizeDegrees } from "./constants";
import type { RasiNakshatraInfo } from "./types";

export function longitudeToRasiNakshatra(siderealLongitude: number): RasiNakshatraInfo {
  const longitude = normalizeDegrees(siderealLongitude);
  const rasiIndex = Math.floor(longitude / 30);
  const degreeInRasi = longitude - rasiIndex * 30;
  const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN_DEGREES);
  const withinNakshatra = longitude - nakshatraIndex * NAKSHATRA_SPAN_DEGREES;
  const pada = Math.floor(withinNakshatra / PADA_SPAN_DEGREES) + 1;
  return { longitude, rasiIndex, nakshatraIndex, pada, degreeInRasi };
}
