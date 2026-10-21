import { NAVAMSA_SPAN_DEGREES } from "../data/pushkaraRules";
import { normalizeDegrees } from "./constants";

export interface NavamsaPosition {
  /** Sign occupied in the D9 chart (0–11). */
  rasiIndex: number;
  /** Degree within that D9 sign (0–30). */
  degreeInRasi: number;
  /** Navamsa pada within the natal rasi (1–9). */
  pada: number;
}

/** First navamsa of a rasi starts in this sign (Parashari movable / fixed / dual rule). */
export function navamsaStartRasiIndex(natalRasiIndex: number): number {
  const r = ((natalRasiIndex % 12) + 12) % 12;
  const mod = r % 3;
  if (mod === 0) return r;
  if (mod === 1) return (r + 8) % 12;
  return (r + 4) % 12;
}

export function longitudeToNavamsa(siderealLongitude: number): NavamsaPosition {
  const longitude = normalizeDegrees(siderealLongitude);
  const natalRasiIndex = Math.floor(longitude / 30);
  let degreeInNatalRasi = longitude - natalRasiIndex * 30;
  if (degreeInNatalRasi >= 30) {
    degreeInNatalRasi = 0;
  }

  let pada = Math.floor(degreeInNatalRasi / NAVAMSA_SPAN_DEGREES) + 1;
  if (pada > 9) pada = 9;

  const start = navamsaStartRasiIndex(natalRasiIndex);
  const rasiIndex = (start + pada - 1) % 12;

  const degreeWithinPada = degreeInNatalRasi - (pada - 1) * NAVAMSA_SPAN_DEGREES;
  const degreeInRasi = (degreeWithinPada / NAVAMSA_SPAN_DEGREES) * 30;

  return { rasiIndex, degreeInRasi, pada };
}
