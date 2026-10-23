import type { GowriName } from "../data/classicalMuhurtaRules";
import type { MuhurtaActivityId } from "../data/muhurtaActivities";
import { computeAshtakavarga } from "./ashtakavarga";
import { computeLattaVedha } from "./classicalMuhurta";
import { findActiveMahadasaAndBhukti, computeVimshottariDasa, type DasaPeriod } from "./dasa";
import { computePorutham } from "./porutham";
import { computePoruthamMatchReport } from "./poruthamMatch";
import type { ChartResult, Planet } from "./types";
import { PLANETS } from "./types";

function planetRasiIndexMap(chart: ChartResult): Record<Planet, number> {
  const map = {} as Record<Planet, number>;
  for (const planet of PLANETS) {
    map[planet] = chart.planetRasi[planet].rasiIndex;
  }
  return map;
}

const BENEFIC_DASA = new Set(["Jupiter", "Venus", "Moon", "Mercury"]);
const MALEFIC_DASA = new Set(["Saturn", "Rahu", "Ketu", "Mars"]);
const GOOD_GURU_HOUSES = new Set([2, 5, 7, 9, 11]);
const BAD_GURU_HOUSES = new Set([6, 8, 12]);
const SADE_SATI_HOUSES = new Set([12, 1, 2]);

export interface NatalBalaResult {
  deltaScore: number;
  flags: string[];
  dasaLabel: string | null;
  sadeSati: boolean;
  ashtamaSani: boolean;
  savMoon: number | null;
  savLagna: number | null;
  natalAshtamaLagna: boolean;
}

export interface CoupleMatchResult {
  deltaScore: number;
  flags: string[];
  label: string;
}

function houseFrom(fromRasi: number, toRasi: number): number {
  return (((toRasi - fromRasi) % 12 + 12) % 12) + 1;
}

export function prepareNatalDasa(chart: ChartResult, birthDate: Date): DasaPeriod[] {
  return computeVimshottariDasa(chart.planetLongitudes.Moon, birthDate, 1, 1);
}

export function scoreNatalBala(
  prefix: string,
  chart: ChartResult,
  birthDate: Date | undefined,
  dasaTimeline: DasaPeriod[] | undefined,
  instant: Date,
  transitMoonRasi: number,
  transitMoonNak: number,
  transitSaturnRasi: number,
  transitJupiterRasi: number,
  muhurtaLagnaRasi: number | undefined,
): NatalBalaResult {
  let deltaScore = 0;
  const flags: string[] = [];
  let dasaLabel: string | null = null;
  let sadeSati = false;
  let ashtamaSani = false;
  let savMoon: number | null = null;
  let savLagna: number | null = null;
  let natalAshtamaLagna = false;

  const natalMoonRasi = chart.planetRasi.Moon.rasiIndex;
  const natalMoonNak = chart.planetRasi.Moon.nakshatraIndex;

  if (dasaTimeline && birthDate) {
    const { mahadasa, bhukti } = findActiveMahadasaAndBhukti(dasaTimeline, instant);
    if (mahadasa) {
      dasaLabel = bhukti ? `${mahadasa.lord}/${bhukti.lord}` : mahadasa.lord;
      if (BENEFIC_DASA.has(mahadasa.lord)) {
        deltaScore += 8;
        flags.push(`${prefix}Benefic Dasa ${dasaLabel}`);
      } else if (MALEFIC_DASA.has(mahadasa.lord)) {
        deltaScore -= 6;
        flags.push(`${prefix}Malefic Dasa ${dasaLabel}`);
      }
      if (bhukti && MALEFIC_DASA.has(bhukti.lord)) {
        deltaScore -= 3;
      } else if (bhukti && BENEFIC_DASA.has(bhukti.lord)) {
        deltaScore += 2;
      }
    }
  }

  const satHouse = houseFrom(natalMoonRasi, transitSaturnRasi);
  if (SADE_SATI_HOUSES.has(satHouse)) {
    sadeSati = true;
    deltaScore -= 18;
    flags.push(`${prefix}Sade Sati (Saturn in ${satHouse}th from natal Moon)`);
  } else if (satHouse === 8) {
    ashtamaSani = true;
    deltaScore -= 12;
    flags.push(`${prefix}Ashtama Sani`);
  } else if (satHouse === 3 || satHouse === 6 || satHouse === 11) {
    deltaScore += 5;
    flags.push(`${prefix}Saturn in ${satHouse}th (upachaya)`);
  }

  const guruFromMoon = houseFrom(natalMoonRasi, transitJupiterRasi);
  if (GOOD_GURU_HOUSES.has(guruFromMoon)) {
    deltaScore += 8;
    flags.push(`${prefix}Jupiter gochara ${guruFromMoon}th from natal Moon`);
  } else if (BAD_GURU_HOUSES.has(guruFromMoon)) {
    deltaScore -= 8;
    flags.push(`${prefix}Jupiter in ${guruFromMoon}th from natal Moon`);
  }

  const guruFromLagna = houseFrom(chart.lagnaRasiIndex, transitJupiterRasi);
  if (GOOD_GURU_HOUSES.has(guruFromLagna)) {
    deltaScore += 4;
  } else if (BAD_GURU_HOUSES.has(guruFromLagna)) {
    deltaScore -= 4;
  }

  const av = computeAshtakavarga(planetRasiIndexMap(chart), chart.lagnaRasiIndex);
  savMoon = av.sarvaByRasi[transitMoonRasi] ?? null;
  if (savMoon !== null) {
    if (savMoon >= 28) {
      deltaScore += 8;
      flags.push(`${prefix}SAV Moon rasi ${savMoon} bindus`);
    } else if (savMoon < 22) {
      deltaScore -= 10;
      flags.push(`${prefix}Weak SAV Moon rasi (${savMoon})`);
    }
  }
  if (muhurtaLagnaRasi !== undefined) {
    savLagna = av.sarvaByRasi[muhurtaLagnaRasi] ?? null;
    if (savLagna !== null) {
      if (savLagna >= 28) deltaScore += 6;
      else if (savLagna < 22) deltaScore -= 8;
    }
    natalAshtamaLagna = houseFrom(chart.lagnaRasiIndex, muhurtaLagnaRasi) === 8;
    if (natalAshtamaLagna) {
      deltaScore -= 15;
      flags.push(`${prefix}Muhurta Lagna is 8th from natal Lagna`);
    }
  }

  const natalNaks = {} as Record<Planet, number>;
  for (const p of PLANETS) natalNaks[p] = chart.planetRasi[p].nakshatraIndex;
  natalNaks.Moon = natalMoonNak;
  const { lattaHits, vedhaHits } = computeLattaVedha(transitMoonNak, natalNaks);
  if (lattaHits.length) {
    deltaScore -= 12;
    flags.push(`${prefix}Natal ${lattaHits.join(", ")}`);
  }
  if (vedhaHits.length) {
    deltaScore -= 8;
    flags.push(`${prefix}Natal ${vedhaHits.join(", ")}`);
  }

  return {
    deltaScore,
    flags,
    dasaLabel,
    sadeSati,
    ashtamaSani,
    savMoon,
    savLagna,
    natalAshtamaLagna,
  };
}

export function scoreCoupleMatch(
  person1: ChartResult,
  person2: ChartResult,
): CoupleMatchResult {
  const report = computePoruthamMatchReport(person1, person2);
  let deltaScore = 0;
  if (report.recommendation === "favorable") deltaScore += 16;
  else if (report.recommendation === "not_favorable") deltaScore -= 16;
  else deltaScore += 2;
  deltaScore += Math.min(8, report.dasakoota.score - 5);
  return {
    deltaScore,
    flags: [`Couple Porutham: ${report.dasakoota.score}/${report.dasakoota.total} (${report.recommendation})`],
    label: `${report.dasakoota.score}/${report.dasakoota.total} · ${report.recommendation}`,
  };
}

export function scoreCoupleFromStars(
  nak1: number,
  nak2: number,
  rasi1?: number,
  rasi2?: number,
): CoupleMatchResult {
  const porutham = computePorutham(nak1, nak2, rasi1, rasi2);
  let deltaScore = porutham.score >= 7 ? 10 : porutham.score >= 5 ? 2 : -10;
  return {
    deltaScore,
    flags: [`Couple Dasakoota ${porutham.score}/${porutham.total}`],
    label: `${porutham.score}/${porutham.total}`,
  };
}

const DEFAULT_HORA = ["Jupiter", "Venus", "Mercury", "Moon"];

const ACTIVITY_HORA: Partial<Record<MuhurtaActivityId, string[]>> = {
  wedding: ["Venus", "Jupiter", "Moon"],
  betrothal: ["Venus", "Jupiter", "Moon"],
  seemantham: ["Moon", "Venus", "Jupiter"],
  namakarana: ["Moon", "Jupiter", "Mercury"],
  spiritual: ["Jupiter", "Sun", "Moon"],
  upanayanam: ["Jupiter", "Sun", "Mercury"],
  education: ["Mercury", "Jupiter"],
  aksharabhyasam: ["Mercury", "Jupiter"],
  business: ["Jupiter", "Mercury", "Venus"],
  gold: ["Venus", "Jupiter"],
  "loan-finance": ["Jupiter", "Mercury", "Venus"],
  "job-joining": ["Sun", "Jupiter", "Mercury"],
  travel: ["Moon", "Mercury", "Venus"],
  vehicle: ["Moon", "Mercury", "Venus"],
  medical: ["Moon", "Jupiter"],
  "griha-pravesha": ["Jupiter", "Venus", "Mercury"],
  "bhoomi-puja": ["Jupiter", "Mars", "Venus"],
  property: ["Jupiter", "Venus", "Saturn"],
  agriculture: ["Moon", "Venus", "Jupiter"],
  "legal-agreement": ["Jupiter", "Mercury"],
};

const DEFAULT_GOWRI: GowriName[] = ["Amirtham", "Labham", "Dhanam", "Sugam", "Uthi"];

const ACTIVITY_GOWRI: Partial<Record<MuhurtaActivityId, GowriName[]>> = {
  travel: ["Uthi", "Labham", "Amirtham"],
  vehicle: ["Uthi", "Labham", "Amirtham"],
  business: ["Labham", "Dhanam", "Amirtham"],
  gold: ["Dhanam", "Labham", "Amirtham"],
  medical: ["Amirtham", "Sugam"],
  spiritual: ["Amirtham", "Sugam", "Uthi"],
};

export function preferredHoraPlanets(activityId: MuhurtaActivityId): string[] {
  return ACTIVITY_HORA[activityId] ?? DEFAULT_HORA;
}

export function preferredGowriNames(activityId: MuhurtaActivityId): GowriName[] {
  return ACTIVITY_GOWRI[activityId] ?? DEFAULT_GOWRI;
}
