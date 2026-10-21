import { VIMSHOTTARI_SEQUENCE, dasaIndexForLord } from "../data/dasaSequence";
import { NAKSHATRAS, NAKSHATRA_SPAN_DEGREES } from "../data/nakshatras";
import { normalizeDegrees } from "./constants";
import type { Planet } from "./types";
import { PLANETS } from "./types";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

export interface KpLordChain {
  longitude: number;
  nakshatraIndex: number;
  nakshatraLord: string;
  /** Vimshottari sub-lord within the nakshatra. */
  subLord: string;
  /** Sub-sub-lord (third level). */
  subSubLord: string;
}

function vimshottariLordsFromPosition(
  startLord: string,
  spanDegrees: number,
  positionInSpan: number,
  depth: number,
): string[] {
  const lords: string[] = [];
  let span = spanDegrees;
  let pos = positionInSpan;
  let lord = startLord;

  for (let d = 0; d < depth; d++) {
    const startIndex = dasaIndexForLord(lord);
    let cursor = 0;
    let chosen = VIMSHOTTARI_SEQUENCE[startIndex].lord;
    let chosenSpan = span / 9;
    for (let i = 0; i < VIMSHOTTARI_SEQUENCE.length; i++) {
      const seq = VIMSHOTTARI_SEQUENCE[(startIndex + i) % VIMSHOTTARI_SEQUENCE.length];
      const partSpan = (span * seq.years) / 120;
      if (pos < cursor + partSpan || i === VIMSHOTTARI_SEQUENCE.length - 1) {
        chosen = seq.lord;
        pos = pos - cursor;
        chosenSpan = partSpan;
        break;
      }
      cursor += partSpan;
    }
    lords.push(chosen);
    lord = chosen;
    span = chosenSpan;
  }
  return lords;
}

export function kpLordChainAtLongitude(siderealLongitude: number): KpLordChain {
  const longitude = normalizeDegrees(siderealLongitude);
  const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN_DEGREES);
  const nakshatraLord = NAKSHATRAS[nakshatraIndex].lord;
  const withinNakshatra = longitude - nakshatraIndex * NAKSHATRA_SPAN_DEGREES;

  const [subLord, subSubLord] = vimshottariLordsFromPosition(
    nakshatraLord,
    NAKSHATRA_SPAN_DEGREES,
    withinNakshatra,
    2,
  );

  return {
    longitude,
    nakshatraIndex,
    nakshatraLord,
    subLord,
    subSubLord,
  };
}

export function kpLordChainsForChart(
  longitudes: Record<Planet, number>,
): Record<Planet, KpLordChain> {
  const result = {} as Record<Planet, KpLordChain>;
  for (const planet of PLANETS) {
    result[planet] = kpLordChainAtLongitude(longitudes[planet]);
  }
  return result;
}

/** Rough sub-lord period end from a start instant (for Prasna timing hints). */
export function approximateSubLordEnd(start: Date, subLord: string, parentSpanYears: number): Date {
  const seq = VIMSHOTTARI_SEQUENCE.find((s) => s.lord === subLord);
  const years = seq ? (parentSpanYears * seq.years) / 120 : parentSpanYears / 9;
  return new Date(start.getTime() + years * MS_PER_YEAR);
}
