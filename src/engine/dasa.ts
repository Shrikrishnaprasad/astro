import { dasaIndexForLord, VIMSHOTTARI_SEQUENCE, VIMSHOTTARI_TOTAL_YEARS } from "../data/dasaSequence";
import { NAKSHATRAS, NAKSHATRA_SPAN_DEGREES } from "../data/nakshatras";
import { normalizeDegrees } from "./constants";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

export interface DasaPeriod {
  lord: string;
  start: Date;
  end: Date;
  bhuktis: DasaPeriod[];
}

/** True if `instant` falls in [start, end) for this period. */
export function isWithinDasaPeriod(period: DasaPeriod, instant: Date): boolean {
  const t = instant.getTime();
  return t >= period.start.getTime() && t < period.end.getTime();
}

/** Active Mahadasa and Bhukti (Antardasa) at `instant`, if within the generated timeline. */
export function findActiveMahadasaAndBhukti(
  mahadasas: DasaPeriod[],
  instant: Date,
): { mahadasa: DasaPeriod | null; bhukti: DasaPeriod | null } {
  const mahadasa = mahadasas.find((p) => isWithinDasaPeriod(p, instant)) ?? null;
  const bhukti = mahadasa?.bhuktis.find((p) => isWithinDasaPeriod(p, instant)) ?? null;
  return { mahadasa, bhukti };
}

function addYears(date: Date, years: number): Date {
  return new Date(date.getTime() + years * MS_PER_YEAR);
}

/**
 * Builds one level of sub-periods (Bhukti/Antardasa, then recursively Antara/
 * Pratyantardasa, then Sukshma, ...) under a parent period of the given lord
 * and duration. Each level follows the same rule: the 9-lord cyclic order
 * starting from the parent's own lord, each sub-period's share of the parent
 * duration proportional to its years out of the fixed 120-year total.
 *
 * `remainingDepth` counts how many more nested levels to generate below this
 * one: 1 = just this level (leaves have empty `bhuktis`), 2 = this level plus
 * one more nested inside each, etc.
 */
function buildSubPeriods(
  parentLord: string,
  start: Date,
  parentDurationYears: number,
  remainingDepth: number,
): DasaPeriod[] {
  const startIndex = dasaIndexForLord(parentLord);
  const subPeriods: DasaPeriod[] = [];
  let cursor = start;
  for (let i = 0; i < VIMSHOTTARI_SEQUENCE.length; i++) {
    const seq = VIMSHOTTARI_SEQUENCE[(startIndex + i) % VIMSHOTTARI_SEQUENCE.length];
    const subYears = (parentDurationYears * seq.years) / VIMSHOTTARI_TOTAL_YEARS;
    const end = addYears(cursor, subYears);
    subPeriods.push({
      lord: seq.lord,
      start: cursor,
      end,
      bhuktis: remainingDepth > 1 ? buildSubPeriods(seq.lord, cursor, subYears, remainingDepth - 1) : [],
    });
    cursor = end;
  }
  return subPeriods;
}

// How many nested levels to generate below each Mahadasa: Bhukti (Antardasa),
// Antara (Pratyantardasa), Sukshma - matching the 4-level Dasa/Bhukti/Andaram/
// Sukshmam hierarchy used in Tamil astrology.
const DEFAULT_SUB_LEVELS = 3;

/**
 * Vimshottari Mahadasa-Bhukti-Antara-Sukshma timeline starting from birth.
 *
 * @param moonSiderealLongitude Moon's sidereal longitude (degrees) at birth.
 * @param birthDate Birth instant.
 * @param cyclesToCover Number of full 120-year cycles to generate (default 1,
 *   enough to cover a full lifetime from the partial first dasa onward).
 * @param subLevels How many nested levels below Mahadasa to compute: 1 =
 *   Bhukti only, 2 = + Antara, 3 (default) = + Sukshma.
 */
export function computeVimshottariDasa(
  moonSiderealLongitude: number,
  birthDate: Date,
  cyclesToCover = 1,
  subLevels = DEFAULT_SUB_LEVELS,
): DasaPeriod[] {
  const longitude = normalizeDegrees(moonSiderealLongitude);
  const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN_DEGREES);
  const nakshatra = NAKSHATRAS[nakshatraIndex];
  const fractionElapsed =
    (longitude - nakshatraIndex * NAKSHATRA_SPAN_DEGREES) / NAKSHATRA_SPAN_DEGREES;

  const startIndex = dasaIndexForLord(nakshatra.lord);
  const firstFullYears = VIMSHOTTARI_SEQUENCE[startIndex].years;
  const firstBalanceYears = firstFullYears * (1 - fractionElapsed);

  const periods: DasaPeriod[] = [];
  let cursor = birthDate;
  const totalMahadasas = VIMSHOTTARI_SEQUENCE.length * cyclesToCover;

  for (let i = 0; i < totalMahadasas; i++) {
    const seq = VIMSHOTTARI_SEQUENCE[(startIndex + i) % VIMSHOTTARI_SEQUENCE.length];
    const durationYears = i === 0 ? firstBalanceYears : seq.years;
    const end = addYears(cursor, durationYears);
    periods.push({
      lord: seq.lord,
      start: cursor,
      end,
      bhuktis: buildSubPeriods(seq.lord, cursor, durationYears, subLevels),
    });
    cursor = end;
  }

  return periods;
}
