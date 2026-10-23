import {
  AMRITA_SIDDHI_BY_VARA,
  AMRITA_START_GHATI,
  ANANDADI_START_NAK,
  ANANDADI_YOGAS,
  DAGDHA_TITHI_BY_VARA,
  DAY_DURMUHURTAM_SLOTS,
  GANDANTA_HEAD_NAK,
  GANDANTA_HEAD_RASI,
  GANDANTA_NAK_PADA_DEG,
  GANDANTA_RASI_DEG,
  GANDANTA_TAIL_NAK,
  GANDANTA_TAIL_RASI,
  GANDANTA_TITHI_ORB_DEG,
  GOWRI_DAY_TABLE,
  GOWRI_NATURE,
  GOWRI_NIGHT_TABLE,
  LATTA_COUNT_INCLUSIVE,
  MASA_SHUNYA_TITHIS_BY_SUN_RASI,
  MRITYU_BHAGA_LAGNA,
  MRITYU_BHAGA_MOON,
  NIGHT_DURMUHURTAM_SLOTS,
  SARVARTHA_SIDDHI_BY_VARA,
  TAMIL_AMRITA_NAK_BY_VARA,
  TAMIL_MARANA_NAK_BY_VARA,
  VARJYAM_START_GHATI,
  VEDHA_NAKSHATRA,
  VISHA_TITHI_BY_VARA,
  type GowriName,
} from "../data/classicalMuhurtaRules";
import { NAKSHATRA_SPAN_DEGREES } from "../data/nakshatras";
import { normalizeDegrees } from "./constants";
import {
  DEFAULT_EPHEMERIS_SETTINGS,
  resolveEphemerisSettings,
  type EphemerisSettings,
} from "./ephemerisSettings";
import { dividedWindow, type TimeWindow } from "./panchanga";
import { getSiderealLongitudes } from "./planetaryPositions";
import { getRetrogradeStatus } from "./retrograde";
import { getSunriseSunset } from "./sunTimes";
import { PLANETS, type LongitudeMap, type Planet } from "./types";

export interface GowriSlot extends TimeWindow {
  name: GowriName;
  nature: "auspicious" | "inauspicious";
}

export interface SpecialDayYoga {
  name: string;
  nature: "auspicious" | "inauspicious";
  description: string;
}

export interface DayYogaAnalysis {
  siddhaYoga: "Amrita Yoga" | "Siddha Yoga" | "Marana Yoga";
  siddhaNature: "auspicious" | "inauspicious";
  anandadiYoga: { name: string; nature: "auspicious" | "inauspicious" | "neutral" };
  specialYogas: SpecialDayYoga[];
}

export interface MahadoshaAnalysis {
  guruMaudhya: boolean;
  shukraMaudhya: boolean;
  budhaMaudhya: boolean;
  sankrantiDosha: boolean;
  masaShunyaTithi: boolean;
  eclipseProximity: boolean;
  grahaYuddha: boolean;
  vyatipataYoga: boolean;
  vaidhritiYoga: boolean;
  moonGandanta: boolean;
  tithiGandanta: boolean;
  mrityuBhagaMoon: boolean;
  lattaHits: string[];
  vedhaHits: string[];
  activeDoshas: string[];
}

export interface KundaliShuddhiResult {
  isAshtamaShuddhi: boolean;
  planetsIn8th: Planet[];
  hasBhriguShatka: boolean;
  hasPapaKartari: boolean;
  beneficsInKendraTrikona: Planet[];
  maleficsInKendra: Planet[];
  moonDusthana: boolean;
  moonHouse: number;
  mandiHouse: number | null;
  mandiInDusthana: boolean;
}

export interface PointShuddhi {
  nakshatraGandanta: boolean;
  rasiGandanta: boolean;
  mrityuBhaga: boolean;
}

export interface LattaVedhaResult {
  lattaHits: string[];
  vedhaHits: string[];
}

function angularDistance(lonA: number, lonB: number): number {
  const diff = Math.abs(normalizeDegrees(lonA) - normalizeDegrees(lonB));
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Compute Varjyam (Vishaghati) and Amrita Kalam time windows for the Moon's active
 * Nakshatra at `date`. Uses linear Moon-speed interpolation across a ±2h window
 * around `date` so it is both fast (only 2 ephemeris calls) and accurate to ~2–3 minutes.
 */
export function computeVarjyamAndAmrita(
  date: Date,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): {
  nakshatraIndex: number;
  nakshatraStart: Date;
  nakshatraEnd: Date;
  varjyam: TimeWindow;
  amritaKalam: TimeWindow;
} {
  const resolved = resolveEphemerisSettings(settings);
  const dtHours = 2;
  const before = new Date(date.getTime() - dtHours * 3600_000);
  const after = new Date(date.getTime() + dtHours * 3600_000);
  const moonNow = normalizeDegrees(getSiderealLongitudes(date, resolved).Moon);
  const moonBefore = normalizeDegrees(getSiderealLongitudes(before, resolved).Moon);
  const moonAfter = normalizeDegrees(getSiderealLongitudes(after, resolved).Moon);

  let deltaDeg = moonAfter - moonBefore;
  if (deltaDeg < 0) deltaDeg += 360;
  // Fallback to mean Moon speed ~13.176°/day (~0.549°/hr) if anomalous
  const degPerMs =
    deltaDeg > 0.5 && deltaDeg < 5
      ? deltaDeg / (2 * dtHours * 3600_000)
      : 13.176358 / 86_400_000;

  const nakshatraIndex = Math.floor(moonNow / NAKSHATRA_SPAN_DEGREES) % 27;
  const nakStartLon = nakshatraIndex * NAKSHATRA_SPAN_DEGREES;
  const degIntoNak = moonNow - nakStartLon;
  const degRemaining = NAKSHATRA_SPAN_DEGREES - degIntoNak;

  const nakStartMs = date.getTime() - degIntoNak / degPerMs;
  const nakEndMs = date.getTime() + degRemaining / degPerMs;
  const totalSpanMs = nakEndMs - nakStartMs;

  const varjyamStartGhati = VARJYAM_START_GHATI[nakshatraIndex] ?? 30;
  const amritaStartGhati = AMRITA_START_GHATI[nakshatraIndex] ?? 54;

  const varjyamStart = new Date(nakStartMs + (varjyamStartGhati / 60) * totalSpanMs);
  const varjyamEnd = new Date(nakStartMs + ((varjyamStartGhati + 4) / 60) * totalSpanMs);

  const amritaStart = new Date(nakStartMs + (amritaStartGhati / 60) * totalSpanMs);
  const amritaEnd = new Date(nakStartMs + ((amritaStartGhati + 4) / 60) * totalSpanMs);

  return {
    nakshatraIndex,
    nakshatraStart: new Date(nakStartMs),
    nakshatraEnd: new Date(nakEndMs),
    varjyam: { start: varjyamStart, end: varjyamEnd },
    amritaKalam: { start: amritaStart, end: amritaEnd },
  };
}

/**
 * Compute daytime and nighttime Durmuhurtam windows (each 1/15th of day/night).
 */
export function computeDurmuhurtam(
  date: Date,
  latitude: number,
  longitude: number,
): TimeWindow[] {
  const { sunrise, sunset } = getSunriseSunset(date, latitude, longitude);
  if (!sunrise || !sunset || sunset <= sunrise) return [];

  const weekday = date.getUTCDay();
  const daySlots = DAY_DURMUHURTAM_SLOTS[weekday] ?? [];
  const windows: TimeWindow[] = daySlots.map((slot1Idx) =>
    dividedWindow(sunrise, sunset, 15, slot1Idx),
  );

  const nextDay = new Date(date.getTime() + 24 * 3600_000);
  const nextSunrise = getSunriseSunset(nextDay, latitude, longitude).sunrise;
  if (nextSunrise && nextSunrise > sunset) {
    const nightSlots = NIGHT_DURMUHURTAM_SLOTS[weekday] ?? [];
    for (const slot1Idx of nightSlots) {
      windows.push(dividedWindow(sunset, nextSunrise, 15, slot1Idx));
    }
  }

  return windows;
}

/**
 * Compute Tamil Gowri Panchangam (8 daytime + 8 nighttime slots).
 */
export function computeGowriPanchangam(
  date: Date,
  latitude: number,
  longitude: number,
): { day: GowriSlot[]; night: GowriSlot[] } | null {
  const { sunrise, sunset } = getSunriseSunset(date, latitude, longitude);
  const nextDay = new Date(date.getTime() + 24 * 3600_000);
  const nextSunrise = getSunriseSunset(nextDay, latitude, longitude).sunrise;
  if (!sunrise || !sunset || !nextSunrise) return null;

  const weekday = date.getUTCDay();
  const dayNames = GOWRI_DAY_TABLE[weekday] ?? GOWRI_DAY_TABLE[0];
  const nightNames = GOWRI_NIGHT_TABLE[weekday] ?? GOWRI_NIGHT_TABLE[0];

  const day: GowriSlot[] = dayNames.map((name, i) => {
    const w = dividedWindow(sunrise, sunset, 8, i + 1);
    return { name, nature: GOWRI_NATURE[name], start: w.start, end: w.end };
  });

  const night: GowriSlot[] = nightNames.map((name, i) => {
    const w = dividedWindow(sunset, nextSunrise, 8, i + 1);
    return { name, nature: GOWRI_NATURE[name], start: w.start, end: w.end };
  });

  return { day, night };
}

/**
 * Evaluate Tamil Siddha/Amrita/Marana Yoga, 28-Anandadi Yoga, and 3-way Special Yogas
 * (Sarvartha Siddhi, Amrita Siddhi, Tripushkara, Dwipushkara, Dagdha, Visha).
 */
export function computeSpecialDayYogas(
  weekday0To6: number,
  tithiIndex0To14: number,
  nakshatraIndex0To26: number,
): DayYogaAnalysis {
  // 1. Tamil Amrita / Siddha / Marana Yoga
  let siddhaYoga: "Amrita Yoga" | "Siddha Yoga" | "Marana Yoga" = "Siddha Yoga";
  let siddhaNature: "auspicious" | "inauspicious" = "auspicious";
  if (TAMIL_AMRITA_NAK_BY_VARA[weekday0To6]?.includes(nakshatraIndex0To26)) {
    siddhaYoga = "Amrita Yoga";
    siddhaNature = "auspicious";
  } else if (TAMIL_MARANA_NAK_BY_VARA[weekday0To6]?.includes(nakshatraIndex0To26)) {
    siddhaYoga = "Marana Yoga";
    siddhaNature = "inauspicious";
  }

  // 2. Anandadi Yoga
  const startNak = ANANDADI_START_NAK[weekday0To6] ?? 0;
  const offset = ((nakshatraIndex0To26 - startNak) % 27 + 27) % 27;
  const anandadiYoga = ANANDADI_YOGAS[offset] ?? ANANDADI_YOGAS[0];

  // 3. Special Yogas
  const specialYogas: SpecialDayYoga[] = [];

  if (SARVARTHA_SIDDHI_BY_VARA[weekday0To6]?.includes(nakshatraIndex0To26)) {
    specialYogas.push({
      name: "Sarvartha Siddhi Yoga",
      nature: "auspicious",
      description: "Fulfillment of all auspicious undertakings",
    });
  }

  if (AMRITA_SIDDHI_BY_VARA[weekday0To6] === nakshatraIndex0To26) {
    specialYogas.push({
      name: "Amrita Siddhi Yoga",
      nature: "auspicious",
      description: "High success & longevity for new beginnings",
    });
  }

  // Bhadra tithis: Dwitiya(1), Saptami(6), Dwadashi(11) + Sun(0)/Tue(2)/Sat(6)
  const isBhadraTithi = [1, 6, 11].includes(tithiIndex0To14);
  const isPushkaraVara = [0, 2, 6].includes(weekday0To6);
  // Tripushkara stars (4-pada / Traipadayukta): Krittika(2), Punarvasu(6), U.Phalguni(11), Vishakha(15), U.Ashadha(20), P.Bhadrapada(24)
  const isTripushkaraNak = [2, 6, 11, 15, 20, 24].includes(nakshatraIndex0To26);
  // Dwipushkara stars (2-pada / Dvipadayukta): Mrigashirsha(4), Chitra(13), Dhanishta(22)
  const isDwipushkaraNak = [4, 13, 22].includes(nakshatraIndex0To26);

  if (isBhadraTithi && isPushkaraVara && isTripushkaraNak) {
    specialYogas.push({
      name: "Tripushkara Yoga",
      nature: "auspicious",
      description: "3× multiplier — great for wealth/assets, avoid for loans",
    });
  }
  if (isBhadraTithi && isPushkaraVara && isDwipushkaraNak) {
    specialYogas.push({
      name: "Dwipushkara Yoga",
      nature: "auspicious",
      description: "2× multiplier — favorable for investments & purchases",
    });
  }

  if (DAGDHA_TITHI_BY_VARA[weekday0To6] === tithiIndex0To14) {
    specialYogas.push({
      name: "Dagdha Yoga",
      nature: "inauspicious",
      description: "Burnt tithi-vara combination — avoid major starts",
    });
  }

  if (VISHA_TITHI_BY_VARA[weekday0To6] === tithiIndex0To14) {
    specialYogas.push({
      name: "Visha Yoga",
      nature: "inauspicious",
      description: "Inauspicious tithi-vara combination",
    });
  }

  return {
    siddhaYoga,
    siddhaNature,
    anandadiYoga,
    specialYogas,
  };
}

export function nakshatraIndexFromLongitude(longitude: number): number {
  return Math.floor(normalizeDegrees(longitude) / NAKSHATRA_SPAN_DEGREES) % 27;
}

export function lattaNakshatra(planetNakshatra: number, planet: string): number | null {
  const count = LATTA_COUNT_INCLUSIVE[planet];
  if (!count) return null;
  return (planetNakshatra + count - 1) % 27;
}

export function computeLattaVedha(
  moonNakshatra: number,
  planetNakshatras: Partial<Record<Planet, number>>,
): LattaVedhaResult {
  const lattaHits: string[] = [];
  const vedhaHits: string[] = [];
  for (const p of PLANETS) {
    const pNak = planetNakshatras[p];
    if (pNak === undefined) continue;
    const latta = lattaNakshatra(pNak, p);
    if (latta === moonNakshatra) lattaHits.push(`${p} Latta`);
    if (VEDHA_NAKSHATRA[pNak] === moonNakshatra && p !== "Moon") {
      vedhaHits.push(`${p} Vedha`);
    }
  }
  return { lattaHits, vedhaHits };
}

export function evaluatePointShuddhi(
  longitude: number,
  kind: "moon" | "lagna",
): PointShuddhi {
  const lon = normalizeDegrees(longitude);
  const nak = Math.floor(lon / NAKSHATRA_SPAN_DEGREES) % 27;
  const degIntoNak = lon - nak * NAKSHATRA_SPAN_DEGREES;
  const rasi = Math.floor(lon / 30) % 12;
  const degIntoRasi = lon - rasi * 30;

  const nakshatraGandanta =
    (GANDANTA_TAIL_NAK.includes(nak) && degIntoNak >= NAKSHATRA_SPAN_DEGREES - GANDANTA_NAK_PADA_DEG) ||
    (GANDANTA_HEAD_NAK.includes(nak) && degIntoNak <= GANDANTA_NAK_PADA_DEG);

  const rasiGandanta =
    (GANDANTA_TAIL_RASI.includes(rasi) && degIntoRasi >= 30 - GANDANTA_RASI_DEG) ||
    (GANDANTA_HEAD_RASI.includes(rasi) && degIntoRasi <= GANDANTA_RASI_DEG);

  const table = kind === "moon" ? MRITYU_BHAGA_MOON : MRITYU_BHAGA_LAGNA;
  const mrityuDeg = table[rasi] ?? 15;
  const mrityuBhaga = Math.abs(degIntoRasi - (mrityuDeg - 0.5)) <= 0.75;

  return { nakshatraGandanta, rasiGandanta, mrityuBhaga };
}

function isTithiGandanta(moonLon: number, sunLon: number): boolean {
  const elong = normalizeDegrees(moonLon - sunLon);
  return (
    elong <= GANDANTA_TITHI_ORB_DEG ||
    elong >= 360 - GANDANTA_TITHI_ORB_DEG ||
    Math.abs(elong - 180) <= GANDANTA_TITHI_ORB_DEG
  );
}

const YUDDHA_PLANETS: Planet[] = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"];

function hasGrahaYuddha(lons: LongitudeMap): boolean {
  for (let i = 0; i < YUDDHA_PLANETS.length; i++) {
    for (let j = i + 1; j < YUDDHA_PLANETS.length; j++) {
      if (angularDistance(lons[YUDDHA_PLANETS[i]], lons[YUDDHA_PLANETS[j]]) < 1) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Vishti (Bhadra) + fixed malefic Karana windows overlapping [dayStart, dayEnd).
 * Uses linear Moon−Sun interpolation around `date` (2 ephemeris calls).
 */
export function computeVishtiWindows(
  date: Date,
  dayStart: Date,
  dayEnd: Date,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): TimeWindow[] {
  const resolved = resolveEphemerisSettings(settings);
  const dtHours = 12;
  const before = new Date(date.getTime() - dtHours * 3600_000);
  const after = new Date(date.getTime() + dtHours * 3600_000);
  const now = getSiderealLongitudes(date, resolved);
  const prev = getSiderealLongitudes(before, resolved);
  const next = getSiderealLongitudes(after, resolved);
  const elongNow = normalizeDegrees(now.Moon - now.Sun);
  let delta = normalizeDegrees(next.Moon - next.Sun) - normalizeDegrees(prev.Moon - prev.Sun);
  if (delta < 0) delta += 360;
  const degPerMs =
    delta > 4 && delta < 20 ? delta / (2 * dtHours * 3600_000) : 12.2 / 86_400_000;

  const isMaleficKarana = (n: number) => {
    const k = ((n % 60) + 60) % 60;
    if (k === 0 || k >= 57) return true;
    return (k - 1) % 7 === 6;
  };

  const windows: TimeWindow[] = [];
  const startElong = elongNow + (dayStart.getTime() - date.getTime()) * degPerMs;
  const endElong = elongNow + (dayEnd.getTime() - date.getTime()) * degPerMs;
  const startN = Math.floor(startElong / 6);
  const endN = Math.floor(endElong / 6);
  for (let n = startN; n <= endN; n++) {
    if (!isMaleficKarana(n)) continue;
    const segStartElong = n * 6;
    const segEndElong = (n + 1) * 6;
    const segStart = new Date(date.getTime() + (segStartElong - elongNow) / degPerMs);
    const segEnd = new Date(date.getTime() + (segEndElong - elongNow) / degPerMs);
    const clippedStart = new Date(Math.max(segStart.getTime(), dayStart.getTime()));
    const clippedEnd = new Date(Math.min(segEnd.getTime(), dayEnd.getTime()));
    if (clippedEnd.getTime() - clippedStart.getTime() >= 5 * 60_000) {
      windows.push({ start: clippedStart, end: clippedEnd });
    }
  }
  return windows;
}

/**
 * Evaluate classical Mahadoshas at the day's reference instant.
 */
export function computeMahadoshas(
  date: Date,
  tithiIndex0To14: number,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): MahadoshaAnalysis {
  const resolved = resolveEphemerisSettings(settings);
  const lons = getSiderealLongitudes(date, resolved);
  const retro = getRetrogradeStatus(date, undefined, resolved);

  const sunLon = normalizeDegrees(lons.Sun);
  const moonLon = normalizeDegrees(lons.Moon);
  const jupLon = normalizeDegrees(lons.Jupiter);
  const venLon = normalizeDegrees(lons.Venus);
  const merLon = normalizeDegrees(lons.Mercury);
  const rahuLon = normalizeDegrees(lons.Rahu);
  const ketuLon = normalizeDegrees(lons.Ketu);

  const guruMaudhya = angularDistance(sunLon, jupLon) < 11;
  const shukraLimit = retro.Venus ? 8 : 10;
  const shukraMaudhya = angularDistance(sunLon, venLon) < shukraLimit;
  const budhaMaudhya = angularDistance(sunLon, merLon) < 14;

  const sunRasiIndex = Math.floor(sunLon / 30) % 12;
  const sunDegInRasi = sunLon - sunRasiIndex * 30;
  const sankrantiDosha = sunDegInRasi < 1 || sunDegInRasi > 29;

  const masaShunyaTithi =
    MASA_SHUNYA_TITHIS_BY_SUN_RASI[sunRasiIndex]?.includes(tithiIndex0To14) ?? false;

  const eclipseProximity =
    tithiIndex0To14 === 14 &&
    (angularDistance(sunLon, rahuLon) < 13.5 || angularDistance(sunLon, ketuLon) < 13.5);

  const grahaYuddha = hasGrahaYuddha(lons);
  const yogaIndex = Math.floor(normalizeDegrees(sunLon + moonLon) / NAKSHATRA_SPAN_DEGREES) % 27;
  const vyatipataYoga = yogaIndex === 16;
  const vaidhritiYoga = yogaIndex === 26;
  const moonPoint = evaluatePointShuddhi(moonLon, "moon");
  const moonGandanta = moonPoint.nakshatraGandanta || moonPoint.rasiGandanta;
  const tithiGandanta = isTithiGandanta(moonLon, sunLon);
  const mrityuBhagaMoon = moonPoint.mrityuBhaga;

  const planetNaks = {} as Record<Planet, number>;
  for (const p of PLANETS) {
    planetNaks[p] = nakshatraIndexFromLongitude(lons[p]);
  }
  const moonNak = planetNaks.Moon;
  const { lattaHits, vedhaHits } = computeLattaVedha(moonNak, planetNaks);

  const activeDoshas: string[] = [];
  if (guruMaudhya) activeDoshas.push("Guru Maudhya (Jupiter Combust)");
  if (shukraMaudhya) activeDoshas.push("Shukra Maudhya (Venus Combust)");
  if (budhaMaudhya) activeDoshas.push("Budha Maudhya (Mercury Combust)");
  if (sankrantiDosha) activeDoshas.push("Sankranti (Solar Ingress)");
  if (masaShunyaTithi) activeDoshas.push("Masa Shunya Tithi");
  if (eclipseProximity) activeDoshas.push("Grahan / Eclipse Proximity");
  if (grahaYuddha) activeDoshas.push("Graha Yuddha");
  if (vyatipataYoga) activeDoshas.push("Vyatipata Yoga");
  if (vaidhritiYoga) activeDoshas.push("Vaidhriti Yoga");
  if (moonGandanta) activeDoshas.push("Moon Gandanta");
  if (tithiGandanta) activeDoshas.push("Tithi Gandanta");
  if (mrityuBhagaMoon) activeDoshas.push("Moon Mrityu Bhaga");
  if (lattaHits.length) activeDoshas.push(...lattaHits);
  if (vedhaHits.length) activeDoshas.push(...vedhaHits);

  return {
    guruMaudhya,
    shukraMaudhya,
    budhaMaudhya,
    sankrantiDosha,
    masaShunyaTithi,
    eclipseProximity,
    grahaYuddha,
    vyatipataYoga,
    vaidhritiYoga,
    moonGandanta,
    tithiGandanta,
    mrityuBhagaMoon,
    lattaHits,
    vedhaHits,
    activeDoshas,
  };
}

/**
 * Evaluate Kundali-level Lagna Shuddhi for a candidate Muhurta Lagna.
 */
export function evaluateMuhurtaKundali(
  lagnaRasiIndex: number,
  planetLongitudes: LongitudeMap,
  mandiRasiIndex?: number,
): KundaliShuddhiResult {
  const houseOf = (rasiIdx: number) => (((rasiIdx - lagnaRasiIndex) % 12 + 12) % 12) + 1;

  const planetsIn8th: Planet[] = [];
  const beneficsInKendraTrikona: Planet[] = [];
  const maleficsInKendra: Planet[] = [];
  let hasBhriguShatka = false;
  let maleficIn2nd = false;
  let maleficIn12th = false;
  let moonHouse = 1;

  const MALEFICS = new Set<Planet>(["Sun", "Mars", "Saturn", "Rahu", "Ketu"]);
  const BENEFICS = new Set<Planet>(["Jupiter", "Venus", "Mercury"]);
  const KENDRA_TRIKONA = new Set([1, 4, 5, 7, 9, 10]);
  const KENDRA = new Set([1, 4, 7, 10]);
  const DUSTHANA = new Set([6, 8, 12]);

  for (const p of PLANETS) {
    const rasi = Math.floor(normalizeDegrees(planetLongitudes[p]) / 30) % 12;
    const h = houseOf(rasi);
    if (p === "Moon") moonHouse = h;
    if (h === 8) planetsIn8th.push(p);
    if (p === "Venus" && h === 6) hasBhriguShatka = true;
    if (MALEFICS.has(p) && h === 2) maleficIn2nd = true;
    if (MALEFICS.has(p) && h === 12) maleficIn12th = true;
    if (BENEFICS.has(p) && KENDRA_TRIKONA.has(h)) {
      beneficsInKendraTrikona.push(p);
    }
    if (MALEFICS.has(p) && KENDRA.has(h)) {
      maleficsInKendra.push(p);
    }
  }

  const mandiHouse = mandiRasiIndex === undefined ? null : houseOf(mandiRasiIndex);

  return {
    isAshtamaShuddhi: planetsIn8th.length === 0,
    planetsIn8th,
    hasBhriguShatka,
    hasPapaKartari: maleficIn2nd && maleficIn12th,
    beneficsInKendraTrikona,
    maleficsInKendra,
    moonDusthana: DUSTHANA.has(moonHouse),
    moonHouse,
    mandiHouse,
    mandiInDusthana: mandiHouse !== null && DUSTHANA.has(mandiHouse),
  };
}
