import * as Astronomy from "astronomy-engine";
import type { Planet, LongitudeMap } from "./types";
import { getLahiriAyanamsa } from "./ayanamsa";
import { normalizeDegrees } from "./constants";
import { getMeanRahuKetuTropical } from "./lunarNodes";

// astronomy-engine's `Ecliptic()` converts an EQJ (J2000 equatorial) vector into
// TRUE ECLIPTIC OF DATE coordinates (see its own doc comment: "Converts a J2000
// mean equator (EQJ) vector to a true ecliptic of date (ECT) vector and angles").
// So GeoVector(body, date, aberration) -> Ecliptic(vector).elon already gives the
// tropical (of-date equinox) geocentric ecliptic longitude we want — no separate
// "of date" rotation step is needed.
const BODIES: Record<Exclude<Planet, "Rahu" | "Ketu">, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
};

function tropicalLongitudeOf(body: Astronomy.Body, date: Date): number {
  const vector = Astronomy.GeoVector(body, date, true);
  return normalizeDegrees(Astronomy.Ecliptic(vector).elon);
}

export function getTropicalLongitudes(date: Date): LongitudeMap {
  const result = {} as LongitudeMap;
  for (const [planet, body] of Object.entries(BODIES) as [
    Exclude<Planet, "Rahu" | "Ketu">,
    Astronomy.Body,
  ][]) {
    result[planet] = tropicalLongitudeOf(body, date);
  }
  const { rahu, ketu } = getMeanRahuKetuTropical(date);
  result.Rahu = rahu;
  result.Ketu = ketu;
  return result;
}

export function getSiderealLongitudes(date: Date): LongitudeMap {
  const ayanamsa = getLahiriAyanamsa(date);
  const tropical = getTropicalLongitudes(date);
  const result = {} as LongitudeMap;
  for (const planet of Object.keys(tropical) as Planet[]) {
    result[planet] = normalizeDegrees(tropical[planet] - ayanamsa);
  }
  return result;
}
