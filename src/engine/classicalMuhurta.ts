import {
  AMRITA_SIDDHI_BY_VARA,
  AMRITA_START_GHATI,
  ANANDADI_START_NAK,
  ANANDADI_YOGAS,
  DAGDHA_TITHI_BY_VARA,
  DAY_DURMUHURTAM_SLOTS,
  GOWRI_DAY_TABLE,
  GOWRI_NATURE,
  GOWRI_NIGHT_TABLE,
  MASA_SHUNYA_TITHIS_BY_SUN_RASI,
  SARVARTHA_SIDDHI_BY_VARA,
  TAMIL_AMRITA_NAK_BY_VARA,
  TAMIL_MARANA_NAK_BY_VARA,
  VARJYAM_START_GHATI,
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
  sankrantiDosha: boolean;
  masaShunyaTithi: boolean;
  eclipseProximity: boolean;
  activeDoshas: string[];
}

export interface KundaliShuddhiResult {
  isAshtamaShuddhi: boolean;
  planetsIn8th: Planet[];
  hasBhriguShatka: boolean;
  hasPapaKartari: boolean;
  beneficsInKendraTrikona: Planet[];
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
 * Compute daytime (and Tuesday nighttime) Durmuhurtam windows (each 1/15th of day/night).
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

  // On Tuesday, the 2nd Durmuhurtam is in the 7th Muhurta of the night (Nishita-adjacent)
  if (weekday === 2) {
    const nextDay = new Date(date.getTime() + 24 * 3600_000);
    const nextSunrise = getSunriseSunset(nextDay, latitude, longitude).sunrise;
    if (nextSunrise && nextSunrise > sunset) {
      windows.push(dividedWindow(sunset, nextSunrise, 15, 7));
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

/**
 * Evaluate classical Mahadoshas at the day's reference instant:
 * - Guru Maudhya (Jupiter combust within 11° of Sun)
 * - Shukra Maudhya (Venus combust within 10° direct / 8° retrograde of Sun)
 * - Ravi Sankramana / Sankranti Dosha (Sun within 1° of sign ingress)
 * - Masa Shunya Tithi
 * - Eclipse Proximity (Amavasya/Purnima with Sun/Moon within 13° of Rahu/Ketu)
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
  const jupLon = normalizeDegrees(lons.Jupiter);
  const venLon = normalizeDegrees(lons.Venus);
  const rahuLon = normalizeDegrees(lons.Rahu);
  const ketuLon = normalizeDegrees(lons.Ketu);

  const guruMaudhya = angularDistance(sunLon, jupLon) < 11;
  const shukraLimit = retro.Venus ? 8 : 10;
  const shukraMaudhya = angularDistance(sunLon, venLon) < shukraLimit;

  const sunRasiIndex = Math.floor(sunLon / 30) % 12;
  const sunDegInRasi = sunLon - sunRasiIndex * 30;
  const sankrantiDosha = sunDegInRasi < 1 || sunDegInRasi > 29;

  const masaShunyaTithi =
    MASA_SHUNYA_TITHIS_BY_SUN_RASI[sunRasiIndex]?.includes(tithiIndex0To14) ?? false;

  const eclipseProximity =
    tithiIndex0To14 === 14 &&
    (angularDistance(sunLon, rahuLon) < 13.5 || angularDistance(sunLon, ketuLon) < 13.5);

  const activeDoshas: string[] = [];
  if (guruMaudhya) activeDoshas.push("Guru Maudhya (Jupiter Combust)");
  if (shukraMaudhya) activeDoshas.push("Shukra Maudhya (Venus Combust)");
  if (sankrantiDosha) activeDoshas.push("Sankranti (Solar Ingress)");
  if (masaShunyaTithi) activeDoshas.push("Masa Shunya Tithi");
  if (eclipseProximity) activeDoshas.push("Grahan / Eclipse Proximity");

  return {
    guruMaudhya,
    shukraMaudhya,
    sankrantiDosha,
    masaShunyaTithi,
    eclipseProximity,
    activeDoshas,
  };
}

/**
 * Evaluate Kundali-level Lagna Shuddhi for a candidate Muhurta Lagna:
 * - Ashtama Shuddhi (no planets in 8th house from rising Lagna)
 * - Bhrigu Shatka (Venus in 6th house from rising Lagna)
 * - Papa Kartari on Lagna (malefics in both 2nd and 12th houses from rising Lagna)
 * - Benefics in Kendra/Trikona (1, 4, 5, 7, 9, 10)
 */
export function evaluateMuhurtaKundali(
  lagnaRasiIndex: number,
  planetLongitudes: LongitudeMap,
): KundaliShuddhiResult {
  const houseOf = (rasiIdx: number) => (((rasiIdx - lagnaRasiIndex) % 12 + 12) % 12) + 1;

  const planetsIn8th: Planet[] = [];
  const beneficsInKendraTrikona: Planet[] = [];
  let hasBhriguShatka = false;
  let maleficIn2nd = false;
  let maleficIn12th = false;

  const MALEFICS = new Set<Planet>(["Sun", "Mars", "Saturn", "Rahu", "Ketu"]);
  const BENEFICS = new Set<Planet>(["Jupiter", "Venus", "Mercury"]);
  const KENDRA_TRIKONA = new Set([1, 4, 5, 7, 9, 10]);

  for (const p of PLANETS) {
    const rasi = Math.floor(normalizeDegrees(planetLongitudes[p]) / 30) % 12;
    const h = houseOf(rasi);
    if (h === 8) planetsIn8th.push(p);
    if (p === "Venus" && h === 6) hasBhriguShatka = true;
    if (MALEFICS.has(p) && h === 2) maleficIn2nd = true;
    if (MALEFICS.has(p) && h === 12) maleficIn12th = true;
    if (BENEFICS.has(p) && KENDRA_TRIKONA.has(h)) {
      beneficsInKendraTrikona.push(p);
    }
  }

  return {
    isAshtamaShuddhi: planetsIn8th.length === 0,
    planetsIn8th,
    hasBhriguShatka,
    hasPapaKartari: maleficIn2nd && maleficIn12th,
    beneficsInKendraTrikona,
  };
}
