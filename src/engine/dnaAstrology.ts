import {
  DNA_HOUSE_KARMA,
  DNA_KARMA_CARRIER_PLANETS,
  DNA_KARMA_GUIDANCE,
  DNA_KARMA_HOUSES,
  DNA_KARMA_PLANETS,
  DNA_KARMA_SIGNS,
  DNA_NAKSHATRA_KARMA,
  DNA_PILLAR_WEIGHTS,
  DNA_PLANET_CARRIES_KARMA,
  DNA_SIGN_GUIDANCE,
  DNA_TOPIC_HOUSES,
  DNA_TOPIC_LABELS,
  dnaKarmaForRasi,
  type DnaKarmaPlanet,
  type DnaTopicRole,
} from "../data/dnaAstrology";
import { NAKSHATRAS } from "../data/nakshatras";
import { RASIS, rasiLord } from "../data/rasis";
import { parasharaAspectHouses } from "./chandraNadi";
import { computeVimshottariDasa, findActiveMahadasaAndBhukti } from "./dasa";
import { houseRasiIndex, rasiToHouseNumber } from "./houses";
import { longitudeToRasiNakshatra } from "./rasiNakshatra";
import type { ChartResult, LongitudeMap, Planet } from "./types";
import { PLANETS } from "./types";

export function dnaKarmaForNakshatra(nakshatraIndex: number): DnaKarmaPlanet | null {
  const i = ((nakshatraIndex % 27) + 27) % 27;
  return DNA_NAKSHATRA_KARMA[i];
}

export type DnaPillarId = "lagnaNakshatra" | "lagnaLordNakshatra" | "moonNakshatra";

export interface DnaPillar {
  id: DnaPillarId;
  label: string;
  weight: number;
  nakshatraIndex: number;
  nakshatraName: string;
  karmaPlanet: DnaKarmaPlanet | null;
}

export interface DnaKarmaScore {
  planet: DnaKarmaPlanet;
  weight: number;
  maxWeight: number;
  percent: number;
  pillars: DnaPillarId[];
}

export interface DnaPlanetRegistryRow {
  planet: Planet;
  rasiIndex: number;
  house: number;
  nakshatraIndex: number;
  carriesKarma: DnaKarmaPlanet | null;
  signKarmas: DnaKarmaPlanet[];
}

export interface DnaHouseRegistryRow {
  house: number;
  rasiIndex: number;
  rasiName: string;
  houseKarmas: DnaKarmaPlanet[];
  signKarmas: DnaKarmaPlanet[];
  signGuidanceEnglish: string;
  signGuidanceTamil: string;
}

export interface DnaCoreReport {
  pillars: DnaPillar[];
  rankedKarmas: DnaKarmaScore[];
  lagnaLord: Planet;
  planetRows: DnaPlanetRegistryRow[];
  houseRows: DnaHouseRegistryRow[];
}

/**
 * Opposite nakshatra band for a 7th-from (180°) DNA topic link.
 * Whole nakshatra taken; pada pairing: padas 1–2 ↔ opposite 3–4 and vice versa,
 * so both neighbouring opposite nakshatras are included (public spouse example).
 */
export function oppositeNakshatraIndices(nakshatraIndex: number): number[] {
  const i = ((nakshatraIndex % 27) + 27) % 27;
  // 180° ≈ 13.5 nakshatras; classical writeups use the pair straddling exact opposition.
  const a = (i + 13) % 27;
  const b = (i + 14) % 27;
  return a === b ? [a] : [a, b];
}

export function nakshatrasForKarma(planet: DnaKarmaPlanet): number[] {
  const out: number[] = [];
  for (let i = 0; i < 27; i++) {
    if (DNA_NAKSHATRA_KARMA[i] === planet) out.push(i);
  }
  return out;
}

export function computeDnaCore(chart: ChartResult): DnaCoreReport {
  const lagnaInfo = longitudeToRasiNakshatra(chart.lagnaLongitude);
  const lagnaLord = rasiLord(chart.lagnaRasiIndex) as Planet;
  const lagnaLordInfo = chart.planetRasi[lagnaLord];
  const moonInfo = chart.planetRasi.Moon;

  const pillars: DnaPillar[] = [
    {
      id: "lagnaNakshatra",
      label: "Ascendant star",
      weight: DNA_PILLAR_WEIGHTS.lagnaNakshatra,
      nakshatraIndex: lagnaInfo.nakshatraIndex,
      nakshatraName: NAKSHATRAS[lagnaInfo.nakshatraIndex].nameEnglish,
      karmaPlanet: dnaKarmaForNakshatra(lagnaInfo.nakshatraIndex),
    },
    {
      id: "lagnaLordNakshatra",
      label: "Lagna-lord star",
      weight: DNA_PILLAR_WEIGHTS.lagnaLordNakshatra,
      nakshatraIndex: lagnaLordInfo.nakshatraIndex,
      nakshatraName: NAKSHATRAS[lagnaLordInfo.nakshatraIndex].nameEnglish,
      karmaPlanet: dnaKarmaForNakshatra(lagnaLordInfo.nakshatraIndex),
    },
    {
      id: "moonNakshatra",
      label: "Moon star",
      weight: DNA_PILLAR_WEIGHTS.moonNakshatra,
      nakshatraIndex: moonInfo.nakshatraIndex,
      nakshatraName: NAKSHATRAS[moonInfo.nakshatraIndex].nameEnglish,
      karmaPlanet: dnaKarmaForNakshatra(moonInfo.nakshatraIndex),
    },
  ];

  const weightMap = new Map<DnaKarmaPlanet, { weight: number; pillars: DnaPillarId[] }>();
  for (const pillar of pillars) {
    if (!pillar.karmaPlanet) continue;
    const cur = weightMap.get(pillar.karmaPlanet) ?? { weight: 0, pillars: [] };
    cur.weight += pillar.weight;
    cur.pillars.push(pillar.id);
    weightMap.set(pillar.karmaPlanet, cur);
  }

  const maxWeight =
    DNA_PILLAR_WEIGHTS.lagnaNakshatra +
    DNA_PILLAR_WEIGHTS.lagnaLordNakshatra +
    DNA_PILLAR_WEIGHTS.moonNakshatra;

  const rankedKarmas: DnaKarmaScore[] = [...weightMap.entries()]
    .map(([planet, v]) => ({
      planet,
      weight: v.weight,
      maxWeight,
      percent: Math.round((v.weight / maxWeight) * 100),
      pillars: v.pillars,
    }))
    .sort((a, b) => b.weight - a.weight || a.planet.localeCompare(b.planet));

  const planetRows: DnaPlanetRegistryRow[] = PLANETS.map((planet) => {
    const info = chart.planetRasi[planet];
    return {
      planet,
      rasiIndex: info.rasiIndex,
      house: rasiToHouseNumber(chart.lagnaRasiIndex, info.rasiIndex),
      nakshatraIndex: info.nakshatraIndex,
      carriesKarma: DNA_PLANET_CARRIES_KARMA[planet],
      signKarmas: dnaKarmaForRasi(info.rasiIndex),
    };
  });

  const houseRows: DnaHouseRegistryRow[] = [];
  for (let h = 1; h <= 12; h++) {
    const rasiIndex = houseRasiIndex(chart.lagnaRasiIndex, h);
    houseRows.push({
      house: h,
      rasiIndex,
      rasiName: RASIS[rasiIndex].nameEnglish,
      houseKarmas: DNA_HOUSE_KARMA[h] ?? [],
      signKarmas: dnaKarmaForRasi(rasiIndex),
      signGuidanceEnglish: DNA_SIGN_GUIDANCE[rasiIndex].english,
      signGuidanceTamil: DNA_SIGN_GUIDANCE[rasiIndex].tamil,
    });
  }

  return { pillars, rankedKarmas, lagnaLord, planetRows, houseRows };
}

export interface DnaExpectedPattern {
  role: DnaTopicRole;
  labelEnglish: string;
  labelTamil: string;
  seedNakshatraIndices: number[];
  oppositeNakshatraIndices: number[];
  karmaPlanets: DnaKarmaPlanet[];
  expectedNakshatraIndices: number[];
  expectedCarrierPlanets: Planet[];
  expectedSignIndices: number[];
  expectedHouses: number[];
  notes: string[];
}

function uniqueSortedNumbers(xs: number[]): number[] {
  return [...new Set(xs)].sort((a, b) => a - b);
}

function uniquePlanets(xs: Planet[]): Planet[] {
  const seen = new Set<Planet>();
  const out: Planet[] = [];
  for (const p of xs) {
    if (!seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }
  return out;
}

function uniqueKarmaPlanets(xs: DnaKarmaPlanet[]): DnaKarmaPlanet[] {
  const seen = new Set<DnaKarmaPlanet>();
  const out: DnaKarmaPlanet[] = [];
  for (const p of xs) {
    if (!seen.has(p)) {
      seen.add(p);
      out.push(p);
    }
  }
  return out;
}

function expandFromKarmaPlanets(karmas: DnaKarmaPlanet[]): Omit<
  DnaExpectedPattern,
  | "role"
  | "labelEnglish"
  | "labelTamil"
  | "seedNakshatraIndices"
  | "oppositeNakshatraIndices"
  | "notes"
> {
  const expectedNakshatraIndices: number[] = [];
  const expectedCarrierPlanets: Planet[] = [];
  const expectedSignIndices: number[] = [];
  const expectedHouses: number[] = [];
  for (const k of karmas) {
    expectedNakshatraIndices.push(...nakshatrasForKarma(k));
    expectedCarrierPlanets.push(...DNA_KARMA_CARRIER_PLANETS[k]);
    expectedSignIndices.push(...DNA_KARMA_SIGNS[k]);
    expectedHouses.push(...DNA_KARMA_HOUSES[k]);
  }
  return {
    karmaPlanets: uniqueKarmaPlanets(karmas),
    expectedNakshatraIndices: uniqueSortedNumbers(expectedNakshatraIndices),
    expectedCarrierPlanets: uniquePlanets(expectedCarrierPlanets),
    expectedSignIndices: uniqueSortedNumbers(expectedSignIndices),
    expectedHouses: uniqueSortedNumbers(expectedHouses),
  };
}

/**
 * For spouse/mother/father/child: seed from Lagna (and Moon for spouse) nakshatra,
 * take opposition band(s), collect DNA karma planets, expand registries.
 * Career uses 10th-house / 10th-lord DNA links instead of opposition.
 */
export function inferDnaTopicPattern(chart: ChartResult, role: DnaTopicRole): DnaExpectedPattern {
  const label = DNA_TOPIC_LABELS[role];
  const notes: string[] = [];

  if (role === "career") {
    const tenthRasi = houseRasiIndex(chart.lagnaRasiIndex, 10);
    const tenthLord = rasiLord(tenthRasi) as Planet;
    const tenthLordInfo = chart.planetRasi[tenthLord];
    const karmas: DnaKarmaPlanet[] = [];

    const fromLordStar = dnaKarmaForNakshatra(tenthLordInfo.nakshatraIndex);
    if (fromLordStar) {
      karmas.push(fromLordStar);
      notes.push(
        `10th-lord ${tenthLord} in ${NAKSHATRAS[tenthLordInfo.nakshatraIndex].nameEnglish} → ${fromLordStar} karma`,
      );
    }
    for (const k of dnaKarmaForRasi(tenthRasi)) {
      karmas.push(k);
      notes.push(`10th sign ${RASIS[tenthRasi].nameEnglish} carries ${k} karma`);
    }
    for (const k of DNA_HOUSE_KARMA[10] ?? []) {
      karmas.push(k);
    }
    // Also check which karma planets' carriers sit in / lord the 10th.
    for (const k of DNA_KARMA_PLANETS) {
      for (const carrier of DNA_KARMA_CARRIER_PLANETS[k]) {
        const house = rasiToHouseNumber(chart.lagnaRasiIndex, chart.planetRasi[carrier].rasiIndex);
        if (house === 10 || carrier === tenthLord) {
          karmas.push(k);
          notes.push(`${carrier} links 10th to ${k} karma`);
        }
      }
      if (nakshatrasForKarma(k).includes(tenthLordInfo.nakshatraIndex)) {
        karmas.push(k);
      }
    }

    const expanded = expandFromKarmaPlanets(uniqueKarmaPlanets(karmas));
    return {
      role,
      labelEnglish: label.english,
      labelTamil: label.tamil,
      seedNakshatraIndices: [tenthLordInfo.nakshatraIndex],
      oppositeNakshatraIndices: [],
      ...expanded,
      notes,
    };
  }

  const house = DNA_TOPIC_HOUSES[role];
  const lagnaInfo = longitudeToRasiNakshatra(chart.lagnaLongitude);
  const moonInfo = chart.planetRasi.Moon;

  const seeds: number[] = [lagnaInfo.nakshatraIndex];
  if (role === "spouse") {
    seeds.push(moonInfo.nakshatraIndex);
    notes.push("Spouse pattern uses 7th-from opposition of Lagna star and Moon star.");
  } else {
    notes.push(`Pattern uses ${house}th-from opposition of Lagna star (public relative rule).`);
  }

  // For non-spouse relatives, still seed Lagna nakshatra opposition; optionally
  // also oppose the nakshatra of the topic-house cusp degree ≈ house rasi mid
  // is not used in public writeups — they use Lagna/Moon stars for spouse and
  // analogous house counting from those stars for relatives. We use Lagna star
  // opposition shifted by (house-1) nakshatra steps ≈ house*2.25 — too fuzzy.
  // Published method: for mother/father/child, study connectivity of Nth house
  // the same way as spouse uses 7th — i.e. opposition from Lagna (and often Moon).
  // Practical public approach: take opposition of Lagna nakshatra AND of the
  // nakshatra occupied by the lord of the topic house.
  const topicRasi = houseRasiIndex(chart.lagnaRasiIndex, house);
  const topicLord = rasiLord(topicRasi) as Planet;
  const topicLordNak = chart.planetRasi[topicLord].nakshatraIndex;
  if (role !== "spouse") {
    seeds.push(topicLordNak);
    notes.push(`Also seeds ${house}th-lord ${topicLord} star ${NAKSHATRAS[topicLordNak].nameEnglish}.`);
  }

  const opposite: number[] = [];
  for (const seed of seeds) {
    opposite.push(...oppositeNakshatraIndices(seed));
  }
  const oppUnique = uniqueSortedNumbers(opposite);

  const karmas: DnaKarmaPlanet[] = [];
  for (const n of oppUnique) {
    const k = dnaKarmaForNakshatra(n);
    if (k) karmas.push(k);
  }

  const expanded = expandFromKarmaPlanets(uniqueKarmaPlanets(karmas));
  return {
    role,
    labelEnglish: label.english,
    labelTamil: label.tamil,
    seedNakshatraIndices: uniqueSortedNumbers(seeds),
    oppositeNakshatraIndices: oppUnique,
    ...expanded,
    notes,
  };
}

export function inferAllDnaTopics(chart: ChartResult): DnaExpectedPattern[] {
  return (Object.keys(DNA_TOPIC_HOUSES) as DnaTopicRole[]).map((role) =>
    inferDnaTopicPattern(chart, role),
  );
}

export interface DnaMatchHit {
  id: string;
  label: string;
  matched: boolean;
  detail: string;
}

export interface DnaMatchResult {
  role: DnaTopicRole;
  score: number;
  hits: DnaMatchHit[];
  matchedCount: number;
  totalCount: number;
  summary: string;
}

function planetAspectsOrConjoins(
  fromPlanet: Planet,
  fromRasi: number,
  toRasi: number,
): boolean {
  if (fromRasi === toRasi) return true;
  const houseFrom = rasiToHouseNumber(fromRasi, toRasi);
  return parasharaAspectHouses(fromPlanet).includes(houseFrom);
}

/**
 * Score Chart B against expected DNA pattern inferred from Chart A for a role.
 * Transparent checklist; score = matched / total * 100.
 */
export function scoreDnaMatch(
  pattern: DnaExpectedPattern,
  chartB: ChartResult,
): DnaMatchResult {
  const lagnaB = longitudeToRasiNakshatra(chartB.lagnaLongitude);
  const lagnaLordB = rasiLord(chartB.lagnaRasiIndex) as Planet;
  const lagnaLordInfoB = chartB.planetRasi[lagnaLordB];
  const moonB = chartB.planetRasi.Moon;

  const hits: DnaMatchHit[] = [];

  const nakHit =
    pattern.expectedNakshatraIndices.includes(lagnaB.nakshatraIndex) ||
    pattern.expectedNakshatraIndices.includes(lagnaLordInfoB.nakshatraIndex) ||
    pattern.expectedNakshatraIndices.includes(moonB.nakshatraIndex);
  hits.push({
    id: "nakshatra",
    label: "Lagna / Lagna-lord / Moon star in expected DNA nakshatras",
    matched: nakHit,
    detail: nakHit
      ? `Match among ${NAKSHATRAS[lagnaB.nakshatraIndex].nameEnglish}, ${NAKSHATRAS[lagnaLordInfoB.nakshatraIndex].nameEnglish}, ${NAKSHATRAS[moonB.nakshatraIndex].nameEnglish}`
      : "None of the three pillars fall in the expected nakshatra list",
  });

  let carrierHit = false;
  let carrierDetail = "No expected carrier linked to Lagna / Lagna-lord";
  for (const carrier of pattern.expectedCarrierPlanets) {
    const cRasi = chartB.planetRasi[carrier].rasiIndex;
    const inLagna = cRasi === chartB.lagnaRasiIndex;
    const withLord =
      cRasi === lagnaLordInfoB.rasiIndex ||
      planetAspectsOrConjoins(carrier, cRasi, lagnaLordInfoB.rasiIndex) ||
      planetAspectsOrConjoins(lagnaLordB, lagnaLordInfoB.rasiIndex, cRasi);
    const lordInCarrierStar =
      DNA_PLANET_CARRIES_KARMA[lagnaLordB] !== null &&
      pattern.expectedCarrierPlanets.includes(lagnaLordB);
    if (inLagna || withLord || lordInCarrierStar) {
      carrierHit = true;
      carrierDetail = `${carrier} links Lagna or Lagna-lord (conj/aspect/occupancy)`;
      break;
    }
  }
  if (pattern.expectedCarrierPlanets.length === 0) {
    hits.push({
      id: "carrier",
      label: "Carrier planets (skipped — none for these karmas)",
      matched: true,
      detail: "Mercury/Venus karmas have no birth-star carrier planets",
    });
  } else {
    hits.push({
      id: "carrier",
      label: "Expected carrier planet linked to Lagna or Lagna-lord",
      matched: carrierHit,
      detail: carrierDetail,
    });
  }

  const signHit =
    pattern.expectedSignIndices.includes(chartB.lagnaRasiIndex) ||
    pattern.expectedSignIndices.includes(lagnaLordInfoB.rasiIndex);
  hits.push({
    id: "sign",
    label: "Lagna or Lagna-lord in expected DNA signs",
    matched: signHit,
    detail: signHit
      ? `Lagna ${RASIS[chartB.lagnaRasiIndex].nameEnglish}; lord in ${RASIS[lagnaLordInfoB.rasiIndex].nameEnglish}`
      : "No Lagna / Lagna-lord placement in expected signs",
  });

  const lordHouse = rasiToHouseNumber(chartB.lagnaRasiIndex, lagnaLordInfoB.rasiIndex);
  let houseHit = pattern.expectedHouses.includes(lordHouse);
  let houseDetail = houseHit
    ? `Lagna-lord in house ${lordHouse}`
    : "Lagna-lord not in expected houses";
  if (!houseHit) {
    for (const h of pattern.expectedHouses) {
      const hr = houseRasiIndex(chartB.lagnaRasiIndex, h);
      const hl = rasiLord(hr) as Planet;
      if (chartB.planetRasi[hl].rasiIndex === chartB.lagnaRasiIndex) {
        houseHit = true;
        houseDetail = `Lord of house ${h} sits in Lagna`;
        break;
      }
    }
  }
  hits.push({
    id: "house",
    label: "Lagna-lord in expected houses, or those lords in Lagna",
    matched: houseHit,
    detail: houseDetail,
  });

  const matchedCount = hits.filter((h) => h.matched).length;
  const totalCount = hits.length;
  const score = totalCount === 0 ? 0 : Math.round((matchedCount / totalCount) * 100);
  const summary =
    score >= 75
      ? `Strong DNA pattern match for ${pattern.labelEnglish} (${matchedCount}/${totalCount}).`
      : score >= 50
        ? `Partial DNA pattern match for ${pattern.labelEnglish} (${matchedCount}/${totalCount}).`
        : `Weak DNA pattern match for ${pattern.labelEnglish} (${matchedCount}/${totalCount}).`;

  return {
    role: pattern.role,
    score,
    hits,
    matchedCount,
    totalCount,
    summary,
  };
}

export interface DnaTimingNote {
  kind: "dasa" | "transit";
  text: string;
}

export interface DnaTimingResult {
  mahadasaLord: string | null;
  bhuktiLord: string | null;
  notes: DnaTimingNote[];
}

function isDnaKarmaPlanet(p: string): p is DnaKarmaPlanet {
  return (DNA_KARMA_PLANETS as string[]).includes(p);
}

/**
 * Heuristic timing overlay: active Vimshottari MD/AD vs core karma planets,
 * plus transit of karma planets over natal Lagna / Moon / topic houses.
 */
export function computeDnaTiming(
  chart: ChartResult,
  birthDate: Date,
  core: DnaCoreReport,
  transitLongitudes: LongitudeMap,
  now: Date = new Date(),
): DnaTimingResult {
  const activeKarmas = new Set(core.rankedKarmas.map((k) => k.planet));
  const carriersOfActive = new Set<Planet>();
  for (const k of activeKarmas) {
    for (const c of DNA_KARMA_CARRIER_PLANETS[k]) carriersOfActive.add(c);
  }

  const dasas = computeVimshottariDasa(chart.planetLongitudes.Moon, birthDate, 1, 1);
  const { mahadasa, bhukti } = findActiveMahadasaAndBhukti(dasas, now);
  const notes: DnaTimingNote[] = [];

  const md = mahadasa?.lord ?? null;
  const ad = bhukti?.lord ?? null;

  if (md && isDnaKarmaPlanet(md) && activeKarmas.has(md)) {
    notes.push({
      kind: "dasa",
      text: `Mahadasa lord ${md} is an active DNA karma planet (heuristic highlight).`,
    });
  } else if (md && (PLANETS as string[]).includes(md) && carriersOfActive.has(md as Planet)) {
    notes.push({
      kind: "dasa",
      text: `Mahadasa lord ${md} carries an active DNA karma (heuristic highlight).`,
    });
  }

  if (ad && isDnaKarmaPlanet(ad) && activeKarmas.has(ad)) {
    notes.push({
      kind: "dasa",
      text: `Bhukti lord ${ad} is an active DNA karma planet (heuristic highlight).`,
    });
  } else if (ad && (PLANETS as string[]).includes(ad) && carriersOfActive.has(ad as Planet)) {
    notes.push({
      kind: "dasa",
      text: `Bhukti lord ${ad} carries an active DNA karma (heuristic highlight).`,
    });
  }

  if (notes.filter((n) => n.kind === "dasa").length === 0) {
    notes.push({
      kind: "dasa",
      text: `Current MD ${md ?? "—"} / AD ${ad ?? "—"} is not an active DNA karma lord (heuristic).`,
    });
  }

  const moonRasi = chart.planetRasi.Moon.rasiIndex;
  const focusRasis = new Set<number>([
    chart.lagnaRasiIndex,
    moonRasi,
    houseRasiIndex(chart.lagnaRasiIndex, 7),
    houseRasiIndex(chart.lagnaRasiIndex, 10),
  ]);

  for (const k of activeKarmas) {
    const tRasi = Math.floor(transitLongitudes[k] / 30);
    if (focusRasis.has(tRasi)) {
      const where =
        tRasi === chart.lagnaRasiIndex
          ? "natal Lagna"
          : tRasi === moonRasi
            ? "natal Moon"
            : tRasi === houseRasiIndex(chart.lagnaRasiIndex, 7)
              ? "natal 7th"
              : "natal 10th";
      notes.push({
        kind: "transit",
        text: `Transit ${k} over ${where} activates ${k} DNA karma (heuristic).`,
      });
    }
  }

  if (notes.filter((n) => n.kind === "transit").length === 0) {
    notes.push({
      kind: "transit",
      text: "No active DNA karma planet currently transiting Lagna, Moon, 7th, or 10th (heuristic).",
    });
  }

  return { mahadasaLord: md, bhuktiLord: ad, notes };
}

export function dnaGuidanceFor(planet: DnaKarmaPlanet) {
  return DNA_KARMA_GUIDANCE[planet];
}

export function dnaSignGuidanceFor(rasiIndex: number) {
  return DNA_SIGN_GUIDANCE[((rasiIndex % 12) + 12) % 12];
}
