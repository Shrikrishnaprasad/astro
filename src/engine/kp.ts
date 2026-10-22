import { VIMSHOTTARI_SEQUENCE, dasaIndexForLord } from "../data/dasaSequence";
import { NAKSHATRAS, NAKSHATRA_SPAN_DEGREES } from "../data/nakshatras";
import { RASIS, rasiLord } from "../data/rasis";
import { getAyanamsa } from "./ayanamsa";
import { normalizeDegrees } from "./constants";
import {
  DEFAULT_EPHEMERIS_SETTINGS,
  resolveEphemerisSettings,
  type EphemerisSettings,
} from "./ephemerisSettings";
import { getSiderealLongitudes } from "./planetaryPositions";
import { getRetrogradeStatus } from "./retrograde";
import { getLocalSiderealTimeDegrees, getMeanObliquityDegrees } from "./siderealTime";
import type { LongitudeMap, Planet } from "./types";
import { PLANETS } from "./types";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

const WEEKDAY_LORDS: Planet[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
];

export interface KpLordChain {
  longitude: number;
  rasiIndex: number;
  degreeInRasi: number;
  rasiLord: string;
  nakshatraIndex: number;
  nakshatraName: string;
  pada: number;
  nakshatraLord: string;
  /** Vimshottari sub-lord within the nakshatra. */
  subLord: string;
  /** Sub-sub-lord (third level). */
  subSubLord: string;
  /** Prana-lord (fourth level). */
  pranaLord: string;
}

export interface Kp249Entry {
  /** Horary number 1–249. */
  number: number;
  rasiIndex: number;
  rasiName: string;
  rasiLord: string;
  nakshatraIndex: number;
  nakshatraName: string;
  starLord: string;
  subLord: string;
  /** Start sidereal longitude (0–360°). */
  startLongitude: number;
  /** End sidereal longitude (0–360°). */
  endLongitude: number;
}

export interface KpCuspInfo extends KpLordChain {
  cuspNumber: number; // 1..12
}

export interface KpPlanetInfo extends KpLordChain {
  planet: Planet;
  /** Bhava (1–12) occupied in Placidus Bhava Chalit. */
  bhavaHouse: number;
  isRetrograde: boolean;
  /** True if no planet occupies this planet's nakshatras (untenanted = strong self-significator). */
  isUntenanted: boolean;
}

export interface KpHouseSignificators {
  house: number; // 1..12
  cuspRasiIndex: number;
  cuspSignLord: string;
  cuspStarLord: string;
  cuspSubLord: string;
  /** Level A: Planets in the star of occupants of this house. */
  levelA: Planet[];
  /** Level B: Planets occupying this house. */
  levelB: Planet[];
  /** Level C: Planets in the star of the cusp sign lord of this house. */
  levelC: Planet[];
  /** Level D: The cusp sign lord of this house. */
  levelD: Planet[];
  /** Combined unique significators in priority order A -> B -> C -> D. */
  allSignificators: Planet[];
}

export interface KpPlanetSignificatorRow {
  planet: Planet;
  starLord: Planet;
  subLord: Planet;
  isUntenanted: boolean;
  levelAHouses: number[];
  levelBHouses: number[];
  levelCHouses: number[];
  levelDHouses: number[];
  /** All unique houses signified by this planet. */
  allHouses: number[];
  /** Houses signified by this planet's Star Lord (crucial in KP). */
  starLordHouses: number[];
  /** Houses signified by this planet's Sub Lord (deciding factor in KP). */
  subLordHouses: number[];
  /** If Rahu or Ketu, the agent planets/lords it represents. */
  nodeAgentNote?: string;
}

export interface KpRulingPlanets {
  instant: Date;
  dayLord: Planet;
  moonRasiLord: Planet;
  moonStarLord: Planet;
  moonSubLord: Planet;
  lagnaRasiLord: Planet;
  lagnaStarLord: Planet;
  lagnaSubLord: Planet;
  /** Unique Ruling Planets ranked by frequency & KP hierarchy (Lagna Sub -> Lagna Star -> Moon Sub -> Moon Star -> Lagna Sign -> Moon Sign -> Day Lord). */
  rankedUnique: { planet: Planet; roles: string[] }[];
}

export interface KpEventPromise {
  id: string;
  topic: string;
  primaryCusp: number;
  cuspSubLord: Planet;
  cuspSubLordStarLord: Planet;
  favorableHouses: number[];
  negatingHouses: number[];
  subLordSignifiedHouses: number[];
  matchedFavorable: number[];
  matchedNegating: number[];
  verdict: "Promised (Strong)" | "Promised with Delay / Mixed" | "Denied / Unfavorable";
  explanation: string;
}

export interface KpSystemResult {
  cusps: KpCuspInfo[];
  planets: Record<Planet, KpPlanetInfo>;
  houseSignificators: KpHouseSignificators[];
  planetSignificators: KpPlanetSignificatorRow[];
  rulingPlanets: KpRulingPlanets;
  eventPromises: KpEventPromise[];
  horaryEntry: Kp249Entry | null;
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
      if (pos < cursor + partSpan - 1e-11 || i === VIMSHOTTARI_SEQUENCE.length - 1) {
        chosen = seq.lord;
        pos = Math.max(0, pos - cursor);
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
  const rasiIndex = Math.floor(longitude / 30) % 12;
  const degreeInRasi = longitude - rasiIndex * 30;
  const signLord = rasiLord(rasiIndex);

  const nakshatraIndex = Math.floor(longitude / NAKSHATRA_SPAN_DEGREES) % 27;
  const nakshatra = NAKSHATRAS[nakshatraIndex];
  const nakshatraLord = nakshatra.lord;
  const withinNakshatra = longitude - nakshatraIndex * NAKSHATRA_SPAN_DEGREES;
  const pada = Math.min(4, Math.floor((withinNakshatra / NAKSHATRA_SPAN_DEGREES) * 4) + 1);

  const [subLord, subSubLord, pranaLord] = vimshottariLordsFromPosition(
    nakshatraLord,
    NAKSHATRA_SPAN_DEGREES,
    withinNakshatra,
    3,
  );

  return {
    longitude,
    rasiIndex,
    degreeInRasi,
    rasiLord: signLord,
    nakshatraIndex,
    nakshatraName: nakshatra.nameEnglish,
    pada,
    nakshatraLord,
    subLord,
    subSubLord,
    pranaLord,
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

let cachedKp249Table: Kp249Entry[] | null = null;

/**
 * Generate the canonical 249 KP Sub-Lord Table (1–249).
 * 27 Nakshatras × 9 Subs = 243 sub-divisions; 6 of those sub-divisions straddle a
 * 30° Rasi boundary (Krittika/Sun, Punarvasu/Jupiter, U.Phalguni/Sun, Vishakha/Jupiter,
 * U.Ashadha/Sun, P.Bhadrapada/Jupiter) and are split into two entries -> 243 + 6 = 249.
 */
export function getKp249Table(): Kp249Entry[] {
  if (cachedKp249Table) return cachedKp249Table;

  const entries: Kp249Entry[] = [];
  let num = 1;

  for (let nakIdx = 0; nakIdx < 27; nakIdx++) {
    const nak = NAKSHATRAS[nakIdx];
    const nakStart = nakIdx * NAKSHATRA_SPAN_DEGREES;
    const startLordIdx = dasaIndexForLord(nak.lord);
    let cursor = nakStart;

    for (let s = 0; s < 9; s++) {
      const seq = VIMSHOTTARI_SEQUENCE[(startLordIdx + s) % 9];
      const subSpan = (NAKSHATRA_SPAN_DEGREES * seq.years) / 120;
      const subStart = cursor;
      const subEnd = cursor + subSpan;
      cursor = subEnd;

      const rasiStart = Math.floor((subStart + 1e-9) / 30) % 12;
      const rasiEnd = Math.floor((subEnd - 1e-9) / 30) % 12;

      if (rasiStart !== rasiEnd) {
        const boundaryLon = rasiEnd * 30;
        entries.push({
          number: num++,
          rasiIndex: rasiStart,
          rasiName: RASIS[rasiStart].nameEnglish,
          rasiLord: rasiLord(rasiStart),
          nakshatraIndex: nakIdx,
          nakshatraName: nak.nameEnglish,
          starLord: nak.lord,
          subLord: seq.lord,
          startLongitude: subStart,
          endLongitude: boundaryLon,
        });
        entries.push({
          number: num++,
          rasiIndex: rasiEnd,
          rasiName: RASIS[rasiEnd].nameEnglish,
          rasiLord: rasiLord(rasiEnd),
          nakshatraIndex: nakIdx,
          nakshatraName: nak.nameEnglish,
          starLord: nak.lord,
          subLord: seq.lord,
          startLongitude: boundaryLon,
          endLongitude: subEnd,
        });
      } else {
        entries.push({
          number: num++,
          rasiIndex: rasiStart,
          rasiName: RASIS[rasiStart].nameEnglish,
          rasiLord: rasiLord(rasiStart),
          nakshatraIndex: nakIdx,
          nakshatraName: nak.nameEnglish,
          starLord: nak.lord,
          subLord: seq.lord,
          startLongitude: subStart,
          endLongitude: subEnd,
        });
      }
    }
  }

  cachedKp249Table = entries;
  return entries;
}

export function getKp249Entry(horaryNumber: number): Kp249Entry {
  const table = getKp249Table();
  const clamped = Math.min(249, Math.max(1, Math.round(horaryNumber)));
  return table[clamped - 1];
}

function ascendantFromRamcDegrees(ramcDeg: number, latDeg: number, epsDeg: number): number {
  const ramc = ramcDeg * DEG2RAD;
  const eps = epsDeg * DEG2RAD;
  const lat = latDeg * DEG2RAD;
  const numerator = -Math.cos(ramc);
  const denominator = Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps);
  return normalizeDegrees(Math.atan2(-numerator, -denominator) * RAD2DEG);
}

function mcFromRamcDegrees(ramcDeg: number, epsDeg: number): number {
  const ramc = ramcDeg * DEG2RAD;
  const eps = epsDeg * DEG2RAD;
  return normalizeDegrees(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) * RAD2DEG);
}

/**
 * Find the RAMC (0–360°) that produces a desired tropical Ascendant at `latDeg`.
 * Used when casting a KP 1–249 Horary chart where Cusp 1 is fixed by the Horary number.
 */
function findRamcForTropicalAscendant(
  targetTropicalAsc: number,
  latDeg: number,
  epsDeg: number,
): number {
  // Sample every 5° of RAMC to find the bracket where ascendant crosses targetTropicalAsc
  let bestRamc = 0;
  let bestDiff = 999;
  for (let r = 0; r < 360; r += 2) {
    const asc = ascendantFromRamcDegrees(r, latDeg, epsDeg);
    let diff = Math.abs(asc - targetTropicalAsc);
    if (diff > 180) diff = 360 - diff;
    if (diff < bestDiff) {
      bestDiff = diff;
      bestRamc = r;
    }
  }

  let lo = bestRamc - 2;
  let hi = bestRamc + 2;
  for (let iter = 0; iter < 32; iter++) {
    const mid = (lo + hi) / 2;
    const ascMid = ascendantFromRamcDegrees(mid, latDeg, epsDeg);
    const signedErr = ((ascMid - targetTropicalAsc + 540) % 360) - 180;
    if (signedErr > 0) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return normalizeDegrees((lo + hi) / 2);
}

/**
 * Compute all 12 Tropical Placidus Cusps given RAMC (deg), observer latitude (deg),
 * and mean obliquity (deg), with Porphyry/Sripati fallback at extreme latitudes.
 */
function computeTropicalPlacidusFromRamc(
  ramcDeg: number,
  latDeg: number,
  epsDeg: number,
): number[] {
  const mc = mcFromRamcDegrees(ramcDeg, epsDeg);
  const ic = normalizeDegrees(mc + 180);
  const asc = ascendantFromRamcDegrees(ramcDeg, latDeg, epsDeg);
  const desc = normalizeDegrees(asc + 180);

  // Porphyry / Sripati initial quadrant trisection
  const arcMcToAsc = normalizeDegrees(asc - mc);
  const arcAscToIc = normalizeDegrees(ic - asc);

  const porphyry11 = normalizeDegrees(mc + arcMcToAsc / 3);
  const porphyry12 = normalizeDegrees(mc + (2 * arcMcToAsc) / 3);
  const porphyry2 = normalizeDegrees(asc + arcAscToIc / 3);
  const porphyry3 = normalizeDegrees(asc + (2 * arcAscToIc) / 3);

  if (Math.abs(latDeg) >= 60) {
    return [
      asc,
      porphyry2,
      porphyry3,
      ic,
      normalizeDegrees(porphyry11 + 180),
      normalizeDegrees(porphyry12 + 180),
      desc,
      normalizeDegrees(porphyry2 + 180),
      normalizeDegrees(porphyry3 + 180),
      mc,
      porphyry11,
      porphyry12,
    ];
  }

  const phi = latDeg * DEG2RAD;
  const eps = epsDeg * DEG2RAD;

  // Iterate Placidus semi-diurnal arc for Cusp 11 (f=1/3) and Cusp 12 (f=2/3)
  const solveUpperCusp = (f: number, initialLon: number): number => {
    let lon = initialLon;
    for (let i = 0; i < 15; i++) {
      const tanDelta = Math.tan(eps) * Math.sin(lon * DEG2RAD);
      const arg = Math.max(-0.9999, Math.min(0.9999, -Math.tan(phi) * tanDelta));
      const dsaDeg = Math.acos(arg) * RAD2DEG;
      const raCusp = normalizeDegrees(ramcDeg + f * dsaDeg) * DEG2RAD;
      lon = normalizeDegrees(Math.atan2(Math.sin(raCusp), Math.cos(raCusp) * Math.cos(eps)) * RAD2DEG);
    }
    return lon;
  };

  // Iterate Placidus semi-nocturnal arc from IC toward Asc for Cusp 3 (f=1/3 from IC) and Cusp 2 (f=2/3 from IC)
  const solveLowerCusp = (fFromIc: number, initialLon: number): number => {
    let lon = initialLon;
    const raIcDeg = normalizeDegrees(ramcDeg + 180);
    for (let i = 0; i < 15; i++) {
      const tanDelta = Math.tan(eps) * Math.sin(lon * DEG2RAD);
      const arg = Math.max(-0.9999, Math.min(0.9999, -Math.tan(phi) * tanDelta));
      const dsaDeg = Math.acos(arg) * RAD2DEG;
      const nsaDeg = 180 - dsaDeg;
      const raCusp = normalizeDegrees(raIcDeg - fFromIc * nsaDeg) * DEG2RAD;
      lon = normalizeDegrees(Math.atan2(Math.sin(raCusp), Math.cos(raCusp) * Math.cos(eps)) * RAD2DEG);
    }
    return lon;
  };

  const cusp11 = solveUpperCusp(1 / 3, porphyry11);
  const cusp12 = solveUpperCusp(2 / 3, porphyry12);
  const cusp2 = solveLowerCusp(2 / 3, porphyry2);
  const cusp3 = solveLowerCusp(1 / 3, porphyry3);

  return [
    asc,
    cusp2,
    cusp3,
    ic,
    normalizeDegrees(cusp11 + 180),
    normalizeDegrees(cusp12 + 180),
    desc,
    normalizeDegrees(cusp2 + 180),
    normalizeDegrees(cusp3 + 180),
    mc,
    cusp11,
    cusp12,
  ];
}

/**
 * Compute the 12 Sidereal KP Placidus House Cusps (1..12).
 * If `horaryNumber1To249` is provided, Cusp 1 is set to the start of that Horary Number
 * and all other 11 Placidus cusps are derived from the corresponding RAMC at `latitude`.
 */
export function computeKpPlacidusCusps(
  date: Date,
  latitude: number,
  longitude: number,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
  horaryNumber1To249?: number,
): KpCuspInfo[] {
  const resolved = resolveEphemerisSettings(settings);
  const ayanamsa = getAyanamsa(date, resolved.ayanamsa);
  const epsDeg = getMeanObliquityDegrees(date);

  let ramcDeg: number;
  let forcedSiderealCusp1: number | null = null;
  if (horaryNumber1To249 !== undefined) {
    const entry = getKp249Entry(horaryNumber1To249);
    forcedSiderealCusp1 = entry.startLongitude;
    const targetTropicalAsc = normalizeDegrees(forcedSiderealCusp1 + ayanamsa);
    ramcDeg = findRamcForTropicalAscendant(targetTropicalAsc, latitude, epsDeg);
  } else {
    ramcDeg = getLocalSiderealTimeDegrees(date, longitude);
  }

  const tropicalCusps = computeTropicalPlacidusFromRamc(ramcDeg, latitude, epsDeg);

  return tropicalCusps.map((tropLon, idx) => {
    const sidLon =
      idx === 0 && forcedSiderealCusp1 !== null
        ? forcedSiderealCusp1
        : normalizeDegrees(tropLon - ayanamsa);
    return {
      cuspNumber: idx + 1,
      ...kpLordChainAtLongitude(sidLon),
    };
  });
}

/**
 * Determine which Placidus Bhava (1–12) a sidereal longitude falls into.
 */
export function findPlacidusBhavaHouse(
  siderealLongitude: number,
  cusps: KpCuspInfo[],
): number {
  const lon = normalizeDegrees(siderealLongitude);
  for (let i = 0; i < 12; i++) {
    const start = cusps[i].longitude;
    const end = cusps[(i + 1) % 12].longitude;
    if (start <= end) {
      if (lon >= start && lon < end) return i + 1;
    } else {
      // Wraps across 360° -> 0°
      if (lon >= start || lon < end) return i + 1;
    }
  }
  return 1;
}

/**
 * Compute KP Ruling Planets (RP) at any given moment and location.
 */
export function computeKpRulingPlanets(
  date: Date,
  latitude: number,
  longitude: number,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): KpRulingPlanets {
  const resolved = resolveEphemerisSettings(settings);
  const lons = getSiderealLongitudes(date, resolved);
  const cusps = computeKpPlacidusCusps(date, latitude, longitude, resolved);
  const lagnaChain = cusps[0];
  const moonChain = kpLordChainAtLongitude(lons.Moon);
  const dayLord = WEEKDAY_LORDS[date.getUTCDay()];

  const roleEntries: { planet: Planet; role: string }[] = [
    { planet: lagnaChain.subLord as Planet, role: "Lagna Sub-Lord (1)" },
    { planet: lagnaChain.nakshatraLord as Planet, role: "Lagna Star-Lord (2)" },
    { planet: moonChain.subLord as Planet, role: "Moon Sub-Lord (3)" },
    { planet: moonChain.nakshatraLord as Planet, role: "Moon Star-Lord (4)" },
    { planet: lagnaChain.rasiLord as Planet, role: "Lagna Sign-Lord (5)" },
    { planet: moonChain.rasiLord as Planet, role: "Moon Sign-Lord (6)" },
    { planet: dayLord, role: "Day (Vara) Lord (7)" },
  ];

  const map = new Map<Planet, string[]>();
  for (const item of roleEntries) {
    const list = map.get(item.planet) ?? [];
    list.push(item.role);
    map.set(item.planet, list);
  }

  const rankedUnique = Array.from(map.entries())
    .map(([planet, roles]) => ({ planet, roles }))
    .sort((a, b) => b.roles.length - a.roles.length);

  return {
    instant: date,
    dayLord,
    moonRasiLord: moonChain.rasiLord as Planet,
    moonStarLord: moonChain.nakshatraLord as Planet,
    moonSubLord: moonChain.subLord as Planet,
    lagnaRasiLord: lagnaChain.rasiLord as Planet,
    lagnaStarLord: lagnaChain.nakshatraLord as Planet,
    lagnaSubLord: lagnaChain.subLord as Planet,
    rankedUnique,
  };
}

const EVENT_RULES: {
  id: string;
  topic: string;
  primaryCusp: number;
  favorableHouses: number[];
  negatingHouses: number[];
}[] = [
  {
    id: "marriage",
    topic: "Marriage & Partnership (7th Cusp)",
    primaryCusp: 7,
    favorableHouses: [2, 7, 11],
    negatingHouses: [1, 6, 10],
  },
  {
    id: "career",
    topic: "Career, Promotion & Profession (10th Cusp)",
    primaryCusp: 10,
    favorableHouses: [2, 6, 10, 11],
    negatingHouses: [1, 5, 8, 9, 12],
  },
  {
    id: "finance",
    topic: "Wealth, Gain & Financial Prosperity (2nd / 11th Cusp)",
    primaryCusp: 11,
    favorableHouses: [2, 6, 10, 11],
    negatingHouses: [5, 8, 12],
  },
  {
    id: "childbirth",
    topic: "Childbirth & Progeny (5th Cusp)",
    primaryCusp: 5,
    favorableHouses: [2, 5, 11],
    negatingHouses: [1, 4, 10],
  },
  {
    id: "property",
    topic: "Property, Home & Vehicle Purchase (4th Cusp)",
    primaryCusp: 4,
    favorableHouses: [4, 11, 12],
    negatingHouses: [3, 6, 8],
  },
  {
    id: "education",
    topic: "Education & Academic Success (4th / 9th Cusp)",
    primaryCusp: 4,
    favorableHouses: [4, 9, 11],
    negatingHouses: [3, 8, 12],
  },
  {
    id: "foreign",
    topic: "Foreign Travel & Settlement (12th Cusp)",
    primaryCusp: 12,
    favorableHouses: [3, 9, 12],
    negatingHouses: [2, 4, 11],
  },
  {
    id: "litigation",
    topic: "Competition, Litigation & Loan Recovery (6th Cusp)",
    primaryCusp: 6,
    favorableHouses: [1, 6, 10, 11],
    negatingHouses: [5, 7, 12],
  },
  {
    id: "health",
    topic: "Health, Vitality & Recovery (1st / 11th Cusp)",
    primaryCusp: 1,
    favorableHouses: [1, 5, 9, 11],
    negatingHouses: [6, 8, 12],
  },
];

/**
 * Full Krishnamurti Paddhati (KP) System computation:
 * - 12 Placidus Cusps (or rotated 1–249 Horary Cusps)
 * - Planet Star/Sub/Sub-Sub/Prana chains & Placidus Bhava placement
 * - 4-Step KP House Significators (Levels A, B, C, D) & Planet Significators (with Rahu/Ketu agent rule)
 * - KP Ruling Planets
 * - 9 Cuspal Sub-Lord Event Promise analyzers
 */
export function computeFullKpSystem(
  date: Date,
  latitude: number,
  longitude: number,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
  horaryNumber1To249?: number,
  rulingMoment: Date = date,
): KpSystemResult {
  const resolved = resolveEphemerisSettings(settings);
  const planetLons: LongitudeMap = getSiderealLongitudes(date, resolved);
  const retro = getRetrogradeStatus(date, undefined, resolved);
  const cusps = computeKpPlacidusCusps(
    date,
    latitude,
    longitude,
    resolved,
    horaryNumber1To249,
  );

  // Determine which planets have other planets in their stars
  const rawChains = kpLordChainsForChart(planetLons);
  const starLordsInUse = new Set<string>(
    PLANETS.map((p) => rawChains[p].nakshatraLord),
  );

  const planets = {} as Record<Planet, KpPlanetInfo>;
  for (const p of PLANETS) {
    const chain = rawChains[p];
    const bhavaHouse = findPlacidusBhavaHouse(chain.longitude, cusps);
    planets[p] = {
      planet: p,
      ...chain,
      bhavaHouse,
      isRetrograde: Boolean(retro[p]),
      isUntenanted: !starLordsInUse.has(p),
    };
  }

  // Build 4-step house significators (1..12)
  // First, direct 7-planet ownership & occupancy
  const houseSignificators: KpHouseSignificators[] = cusps.map((c) => {
    const h = c.cuspNumber;
    const owner = c.rasiLord as Planet;
    const occupants = PLANETS.filter((p) => planets[p].bhavaHouse === h);
    const occupantSet = new Set<string>(occupants);

    // Level A: Planets in the Nakshatra (Star) of occupants of house h
    const levelA = PLANETS.filter((p) => occupantSet.has(planets[p].nakshatraLord));
    // Level B: Occupants of house h
    const levelB = occupants;
    // Level C: Planets in the Nakshatra (Star) of owner of cusp h
    const levelC = PLANETS.filter((p) => planets[p].nakshatraLord === owner);
    // Level D: Owner of cusp h
    const levelD: Planet[] = [owner];

    const seen = new Set<Planet>();
    const allSignificators: Planet[] = [];
    for (const grp of [levelA, levelB, levelC, levelD]) {
      for (const p of grp) {
        if (!seen.has(p)) {
          seen.add(p);
          allSignificators.push(p);
        }
      }
    }

    return {
      house: h,
      cuspRasiIndex: c.rasiIndex,
      cuspSignLord: c.rasiLord,
      cuspStarLord: c.nakshatraLord,
      cuspSubLord: c.subLord,
      levelA,
      levelB,
      levelC,
      levelD,
      allSignificators,
    };
  });

  // Build Planet-wise Significators (including Rahu/Ketu agent houses: conjoined planets + star lord + sign lord)
  const baseHousesForPlanet = (p: Planet) => {
    const levelAHouses = houseSignificators
      .filter((hs) => hs.levelA.includes(p))
      .map((hs) => hs.house);
    const levelBHouses = houseSignificators
      .filter((hs) => hs.levelB.includes(p))
      .map((hs) => hs.house);
    const levelCHouses = houseSignificators
      .filter((hs) => hs.levelC.includes(p))
      .map((hs) => hs.house);
    const levelDHouses = houseSignificators
      .filter((hs) => hs.levelD.includes(p))
      .map((hs) => hs.house);
    return { levelAHouses, levelBHouses, levelCHouses, levelDHouses };
  };

  const rawPlanetHouses = new Map<Planet, Set<number>>();
  for (const p of PLANETS) {
    const b = baseHousesForPlanet(p);
    rawPlanetHouses.set(
      p,
      new Set([...b.levelAHouses, ...b.levelBHouses, ...b.levelCHouses, ...b.levelDHouses]),
    );
  }

  // Apply KP Rahu/Ketu Agent Rule: Rahu & Ketu also signify the houses of
  // (1) planets conjoined with them in the same Rasi, (2) their Star Lord, and (3) their Rasi Lord.
  const nodeNotes = new Map<Planet, string>();
  for (const node of ["Rahu", "Ketu"] as const) {
    const nodeInfo = planets[node];
    const conjoined = PLANETS.filter(
      (other) => other !== node && planets[other].rasiIndex === nodeInfo.rasiIndex,
    );
    const starLord = nodeInfo.nakshatraLord as Planet;
    const signLord = nodeInfo.rasiLord as Planet;

    const set = rawPlanetHouses.get(node)!;
    for (const cj of conjoined) {
      for (const h of rawPlanetHouses.get(cj) ?? []) set.add(h);
    }
    for (const h of rawPlanetHouses.get(starLord) ?? []) set.add(h);
    for (const h of rawPlanetHouses.get(signLord) ?? []) set.add(h);

    const parts = [
      conjoined.length > 0 ? `conjoined ${conjoined.join("+")}` : null,
      `Star Lord ${starLord}`,
      `Sign Lord ${signLord}`,
    ].filter(Boolean);
    nodeNotes.set(node, `Agent for ${parts.join(", ")}`);
  }

  const planetSignificators: KpPlanetSignificatorRow[] = PLANETS.map((p) => {
    const b = baseHousesForPlanet(p);
    const starLord = planets[p].nakshatraLord as Planet;
    const subLord = planets[p].subLord as Planet;
    const allHouses = Array.from(rawPlanetHouses.get(p) ?? []).sort((x, y) => x - y);
    const starLordHouses = Array.from(rawPlanetHouses.get(starLord) ?? []).sort((x, y) => x - y);
    const subLordHouses = Array.from(rawPlanetHouses.get(subLord) ?? []).sort((x, y) => x - y);

    return {
      planet: p,
      starLord,
      subLord,
      isUntenanted: planets[p].isUntenanted,
      ...b,
      allHouses,
      starLordHouses,
      subLordHouses,
      nodeAgentNote: nodeNotes.get(p),
    };
  });

  const sigByPlanet = Object.fromEntries(
    planetSignificators.map((row) => [row.planet, row]),
  ) as Record<Planet, KpPlanetSignificatorRow>;

  // Evaluate Cuspal Sub-Lord Event Promises
  const eventPromises: KpEventPromise[] = EVENT_RULES.map((rule) => {
    const cusp = cusps[rule.primaryCusp - 1];
    const subLord = cusp.subLord as Planet;
    const subRow = sigByPlanet[subLord];
    // In KP, a Cusp Sub-Lord's results come primarily through its Star Lord + its own signified houses
    const combinedSet = new Set<number>([
      ...subRow.allHouses,
      ...subRow.starLordHouses,
    ]);
    const subLordSignifiedHouses = Array.from(combinedSet).sort((a, b) => a - b);

    const matchedFavorable = rule.favorableHouses.filter((h) => combinedSet.has(h));
    const matchedNegating = rule.negatingHouses.filter((h) => combinedSet.has(h));

    let verdict: KpEventPromise["verdict"];
    if (matchedFavorable.length >= 2 && matchedNegating.length === 0) {
      verdict = "Promised (Strong)";
    } else if (matchedFavorable.length >= 1 && matchedFavorable.length >= matchedNegating.length) {
      verdict = "Promised with Delay / Mixed";
    } else {
      verdict = "Denied / Unfavorable";
    }

    const explanation =
      `Cusp ${rule.primaryCusp} Sub-Lord is ${subLord} (in Star of ${subRow.starLord}), signifying houses [${subLordSignifiedHouses.join(", ")}]. ` +
      (matchedFavorable.length > 0
        ? `Connects to favorable houses (${matchedFavorable.join(", ")})`
        : `Lacks strong connection to primary houses (${rule.favorableHouses.join(", ")})`) +
      (matchedNegating.length > 0
        ? `, with negating/challenging influence from (${matchedNegating.join(", ")}).`
        : `, with zero negating house affliction.`);

    return {
      id: rule.id,
      topic: rule.topic,
      primaryCusp: rule.primaryCusp,
      cuspSubLord: subLord,
      cuspSubLordStarLord: subRow.starLord,
      favorableHouses: rule.favorableHouses,
      negatingHouses: rule.negatingHouses,
      subLordSignifiedHouses,
      matchedFavorable,
      matchedNegating,
      verdict,
      explanation,
    };
  });

  const rulingPlanets = computeKpRulingPlanets(
    rulingMoment,
    latitude,
    longitude,
    resolved,
  );

  const horaryEntry =
    horaryNumber1To249 !== undefined ? getKp249Entry(horaryNumber1To249) : null;

  return {
    cusps,
    planets,
    houseSignificators,
    planetSignificators,
    rulingPlanets,
    eventPromises,
    horaryEntry,
  };
}
