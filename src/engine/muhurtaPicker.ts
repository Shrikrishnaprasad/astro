import type { GowriName } from "../data/classicalMuhurtaRules";
import type { MuhurtaActivityDef, NamedMuhurtaKey } from "../data/muhurtaActivities";
import { CHOGHADIYA_NATURE, type ChoghadiyaName } from "../data/muhurtaRules";
import { RASIS } from "../data/rasis";
import { getSiderealAscendant } from "./ascendant";
import {
  computeDurmuhurtam,
  computeGowriPanchangam,
  computeMahadoshas,
  computeSpecialDayYogas,
  computeVarjyamAndAmrita,
  computeVishtiWindows,
  evaluateMuhurtaKundali,
  evaluatePointShuddhi,
  type DayYogaAnalysis,
  type KundaliShuddhiResult,
  type MahadoshaAnalysis,
} from "./classicalMuhurta";
import type { EphemerisSettings } from "./ephemerisSettings";
import { DEFAULT_EPHEMERIS_SETTINGS } from "./ephemerisSettings";
import {
  preferredGowriNames,
  preferredHoraPlanets,
  prepareNatalDasa,
  scoreCoupleFromStars,
  scoreCoupleMatch,
  scoreNatalBala,
} from "./muhurtaNatal";
import { computeChoghadiya, computeMuhurtas, getDishaShool } from "./muhurtas";
import { longitudeToNavamsa } from "./navamsa";
import { computePanchangam, type TimeWindow } from "./panchanga";
import { getSiderealLongitudes } from "./planetaryPositions";
import { computePushkaraForLongitude } from "./pushkara";
import { longitudeToRasiNakshatra } from "./rasiNakshatra";
import { computeMandhi } from "./specialPoints";
import { getSunriseSunset } from "./sunTimes";
import type { ChartResult, LongitudeMap } from "./types";

export const MAX_MUHURTA_RANGE_DAYS = 365;

export type MuhurtaSlotSystem = "both" | "choghadiya" | "gowri";

export interface MuhurtaSearchInput {
  startDateStr: string;
  rangeDays: number;
  latitude: number;
  longitude: number;
  activity: MuhurtaActivityDef;
  /** Person 1 Janma nakshatra index 0–26 for Tarabala; omit to skip. */
  birthNakshatraIndex?: number;
  /** Person 1 Janma rasi index 0–11 (Moon sign at birth) for Chandrabala & Ashtama Lagna; omit to skip. */
  birthRasiIndex?: number;
  /** Person 2 (Partner/Bride/Groom) Janma nakshatra index 0–26; omit to skip. */
  secondBirthNakshatraIndex?: number;
  /** Person 2 (Partner/Bride/Groom) Janma rasi index 0–11; omit to skip. */
  secondBirthRasiIndex?: number;
  /** Include night Choghadiya/Gowri & night muhurtas (default false). */
  includeNightSlots?: boolean;
  /** Time division system: Choghadiya, Tamil Gowri Panchangam, or Both (default "both"). */
  slotSystem?: MuhurtaSlotSystem;
  /** Max top days to return (default 60). */
  maxResults?: number;
  settings?: EphemerisSettings;
  /** Full natal chart for Person 1 (Dasa, SAV, Sade Sati, natal Lagna). */
  natalChart?: ChartResult;
  natalBirthDate?: Date;
  /** Full natal chart for Person 2. */
  secondNatalChart?: ChartResult;
  secondNatalBirthDate?: Date;
}

export interface SuggestedMuhurtaSlot {
  start: Date;
  end: Date;
  label: string;
  period: "day" | "night";
  reason: string;
  lagnaRasiIndex: number;
  lagnaName: string;
  isPreferredLagna: boolean;
  isAshtamaLagna: boolean;
  horaPlanet: string;
  isBeneficHora: boolean;
  gowriName: GowriName | null;
  gowriAuspicious: boolean;
  panchaka: {
    isClean: boolean;
    name: string;
  };
  kundali: KundaliShuddhiResult;
  slotScore: number;
  /** Short natural-language explanation of what makes this time window special/auspicious. */
  specialDescription: string;
  nakshatraPada: number;
  navamsaLagnaName: string;
  pushkaraLagna: boolean;
  pushkaraMoon: boolean;
  lagnaGandanta: boolean;
  lagnaMrityuBhaga: boolean;
  isPreferredHora: boolean;
  isPreferredGowri: boolean;
}

export interface MuhurtaDayResult {
  dateStr: string;
  score: number;
  /** Short natural-language explanation of why this date is picked and what is special on this day. */
  dayDescription: string;
  vara: string;
  tithiLabel: string;
  nakshatraName: string;
  yogaName: string;
  isBadYoga: boolean;
  karanaName: string;
  isBadKarana: boolean;
  moonRasiName: string;
  dayYogas: DayYogaAnalysis;
  mahadoshas: MahadoshaAnalysis;
  varjyamWindow: TimeWindow;
  amritaWindow: TimeWindow;
  durmuhurtamWindows: TimeWindow[];
  tarabalaLabel: string | null;
  tarabalaGood: boolean | null;
  chandrabalaLabel: string | null;
  chandrabalaGood: boolean | null;
  secondTarabalaLabel: string | null;
  secondTarabalaGood: boolean | null;
  secondChandrabalaLabel: string | null;
  secondChandrabalaGood: boolean | null;
  flags: string[];
  slots: SuggestedMuhurtaSlot[];
  natalDasaLabel: string | null;
  secondNatalDasaLabel: string | null;
  sadeSati: boolean;
  couplePoruthamLabel: string | null;
  vishtiWindows: TimeWindow[];
}

const TARABALA_NAMES = [
  "Janma",
  "Sampat",
  "Vipat",
  "Kshema",
  "Pratyak",
  "Sadhana",
  "Naidhana",
  "Mitra",
  "Parama Mitra",
];

const GOOD_TARABALA = new Set([2, 4, 6, 8, 9]);
const GOOD_CHANDRABALA_HOUSES = new Set([1, 3, 6, 7, 10, 11]);

const INAUSPICIOUS_YOGAS = new Set([
  "Vishkambha",
  "Atiganda",
  "Shoola",
  "Ganda",
  "Vyaghata",
  "Vajra",
  "Vyatipata",
  "Parigha",
  "Vaidhriti",
]);

const INAUSPICIOUS_KARANAS = new Set([
  "Vishti",
  "Shakuni",
  "Chatushpada",
  "Naga",
  "Kimstughna",
]);

// Activities that strictly prohibit Guru/Shukra Maudhya (combustion)
const MAUDHYA_SENSITIVE_ACTIVITIES = new Set([
  "wedding",
  "betrothal",
  "upanayanam",
  "griha-pravesha",
  "bhoomi-puja",
  "main-door",
]);

// Chaldean order of planets for Hora calculation
const CHALDEAN_ORDER = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"] as const;
const WEEKDAY_CHALDEAN_START = [0, 3, 6, 2, 5, 1, 4];
const BENEFIC_HORA_PLANETS = new Set(["Jupiter", "Venus", "Mercury", "Moon"]);

function parseDateAtNoonUtc(dateStr: string): Date | null {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d, 12, 0));
}

function addCalendarDays(dateStr: string, days: number): string {
  const base = parseDateAtNoonUtc(dateStr);
  if (!base) return dateStr;
  const next = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
  return next.toISOString().slice(0, 10);
}

export function tarabalaNumber(birthIndex: number, dayIndex: number): number {
  const diff = ((dayIndex - birthIndex) % 27 + 27) % 27;
  return (diff % 9) + 1;
}

export function chandrabalaHouse(birthRasiIndex: number, transitMoonRasiIndex: number): number {
  return (((transitMoonRasiIndex - birthRasiIndex) % 12 + 12) % 12) + 1;
}

export function computePanchaka(
  lunarTithi1To30: number,
  weekday0To6: number,
  nakshatra0To26: number,
  lagnaRasi0To11: number,
): { isClean: boolean; name: string } {
  const sum =
    lunarTithi1To30 + (weekday0To6 + 1) + (nakshatra0To26 + 1) + (lagnaRasi0To11 + 1);
  const rem = sum % 9;
  switch (rem) {
    case 1:
      return { isClean: false, name: "Mrityu Panchaka" };
    case 2:
      return { isClean: false, name: "Agni Panchaka" };
    case 4:
      return { isClean: false, name: "Raja Panchaka" };
    case 6:
      return { isClean: false, name: "Chora Panchaka" };
    case 8:
      return { isClean: false, name: "Roga Panchaka" };
    default:
      return { isClean: true, name: "Panchaka Rahita" };
  }
}

/**
 * Subtract all exclusion windows (Rahu Kalam, Yamagandam, Gulika Kalam, Durmuhurtam, Varjyam)
 * from a candidate time window, returning only clean sub-windows of at least `minMinutes`.
 */
export function subtractTimeWindows(
  base: TimeWindow,
  exclusions: TimeWindow[],
  minMinutes = 15,
): TimeWindow[] {
  let segments: TimeWindow[] = [{ start: base.start, end: base.end }];
  const minMs = minMinutes * 60_000;

  for (const ex of exclusions) {
    const exStart = ex.start.getTime();
    const exEnd = ex.end.getTime();
    if (exEnd <= exStart) continue;

    const nextSegments: TimeWindow[] = [];
    for (const seg of segments) {
      const sStart = seg.start.getTime();
      const sEnd = seg.end.getTime();
      if (exEnd <= sStart || exStart >= sEnd) {
        nextSegments.push(seg);
        continue;
      }
      if (exStart > sStart) {
        nextSegments.push({ start: new Date(sStart), end: new Date(exStart) });
      }
      if (exEnd < sEnd) {
        nextSegments.push({ start: new Date(exEnd), end: new Date(sEnd) });
      }
    }
    segments = nextSegments;
  }

  return segments.filter((s) => s.end.getTime() - s.start.getTime() >= minMs);
}

function getPlanetaryHora(
  instant: Date,
  sunrise: Date | null,
  sunset: Date | null,
  nextSunrise: Date | null,
  weekday: number,
): string {
  const startIdx = WEEKDAY_CHALDEAN_START[weekday] ?? 0;
  if (!sunrise || !sunset) {
    return CHALDEAN_ORDER[startIdx];
  }
  const t = instant.getTime();
  if (t >= sunrise.getTime() && t < sunset.getTime()) {
    const dayDur = sunset.getTime() - sunrise.getTime();
    const horaMs = dayDur / 12;
    const horaNum = Math.min(11, Math.max(0, Math.floor((t - sunrise.getTime()) / horaMs)));
    return CHALDEAN_ORDER[(startIdx + horaNum) % 7];
  }
  const nightEnd = nextSunrise
    ? nextSunrise.getTime()
    : sunset.getTime() + 12 * 60 * 60 * 1000;
  if (t >= sunset.getTime() && t < nightEnd) {
    const nightDur = nightEnd - sunset.getTime();
    const horaMs = nightDur / 12;
    const horaNum = Math.min(11, Math.max(0, Math.floor((t - sunset.getTime()) / horaMs)));
    return CHALDEAN_ORDER[(startIdx + 12 + horaNum) % 7];
  }
  return CHALDEAN_ORDER[startIdx];
}

function findActiveGowri(
  instant: Date,
  gowri: ReturnType<typeof computeGowriPanchangam>,
): { name: GowriName | null; auspicious: boolean } {
  if (!gowri) return { name: null, auspicious: true };
  const t = instant.getTime();
  for (const s of [...gowri.day, ...gowri.night]) {
    if (t >= s.start.getTime() && t < s.end.getTime()) {
      return { name: s.name, auspicious: s.nature === "auspicious" };
    }
  }
  return { name: null, auspicious: true };
}

function allInauspiciousWindows(
  panch: ReturnType<typeof computePanchangam>,
  durmuhurtams: TimeWindow[],
  varjyam: TimeWindow,
  vishtiWindows: TimeWindow[],
): TimeWindow[] {
  const out: TimeWindow[] = [];
  if (panch.rahuKalam) out.push(panch.rahuKalam);
  if (panch.yamagandam) out.push(panch.yamagandam);
  if (panch.gulikaKalam) out.push(panch.gulikaKalam);
  out.push(...durmuhurtams);
  out.push(varjyam);
  out.push(...vishtiWindows);
  return out;
}

function choghadiyaOk(
  name: ChoghadiyaName,
  activity: MuhurtaActivityDef,
): boolean {
  if (activity.preferredChoghadiya.includes(name)) return true;
  if (activity.allowNeutralChoghadiya && CHOGHADIYA_NATURE[name] === "neutral") return true;
  return false;
}

function namedMuhurtaWindow(
  key: NamedMuhurtaKey,
  panch: ReturnType<typeof computePanchangam>,
  muh: ReturnType<typeof computeMuhurtas>,
): { window: TimeWindow | null; period: "day" | "night" } {
  switch (key) {
    case "abhijit":
      return { window: panch.abhijitMuhurta, period: "day" };
    case "brahma":
      return { window: muh.brahmaMuhurta, period: "night" };
    case "vijaya":
      return { window: muh.vijayaMuhurta, period: "day" };
    case "godhuli":
      return { window: muh.godhuliMuhurta, period: "day" };
    case "nishita":
      return { window: muh.nishitaMuhurta, period: "night" };
    default:
      return { window: null, period: "day" };
  }
}

function enrichSlot(
  cleanWindow: TimeWindow,
  label: string,
  period: "day" | "night",
  baseReason: string,
  date: Date,
  latitude: number,
  longitude: number,
  panch: ReturnType<typeof computePanchangam>,
  _dayLongitudes: LongitudeMap,
  gowri: ReturnType<typeof computeGowriPanchangam>,
  nextSunrise: Date | null,
  activity: MuhurtaActivityDef,
  birthRasiIndex: number | undefined,
  secondBirthRasiIndex: number | undefined,
  settings: EphemerisSettings,
): SuggestedMuhurtaSlot {
  const mid = new Date((cleanWindow.start.getTime() + cleanWindow.end.getTime()) / 2);
  const lagnaLon = getSiderealAscendant(mid, latitude, longitude, settings);
  const slotLongitudes = getSiderealLongitudes(mid, settings);
  const mandi = computeMandhi(mid, latitude, longitude, settings);
  const lagnaRasiIndex = Math.floor(lagnaLon / 30) % 12;
  const lagnaName = RASIS[lagnaRasiIndex].nameEnglish;
  const isPreferredLagna = activity.preferredLagnaRasis.includes(lagnaRasiIndex);
  const isAshtamaLagna1 =
    birthRasiIndex !== undefined && chandrabalaHouse(birthRasiIndex, lagnaRasiIndex) === 8;
  const isAshtamaLagna2 =
    secondBirthRasiIndex !== undefined &&
    chandrabalaHouse(secondBirthRasiIndex, lagnaRasiIndex) === 8;
  const isAshtamaLagna = isAshtamaLagna1 || isAshtamaLagna2;

  const weekday = date.getUTCDay();
  const horaPlanet = getPlanetaryHora(mid, panch.sunrise, panch.sunset, nextSunrise, weekday);
  const isBeneficHora = BENEFIC_HORA_PLANETS.has(horaPlanet);
  const horaPreferred = preferredHoraPlanets(activity.id);
  const isPreferredHora = horaPreferred.includes(horaPlanet);

  const activeGowri = findActiveGowri(mid, gowri);
  const gowriPreferred = preferredGowriNames(activity.id);
  const isPreferredGowri = activeGowri.name ? gowriPreferred.includes(activeGowri.name) : false;

  const lunarTithi1To30 =
    (panch.paksha === "Shukla" ? 0 : 15) + (panch.tithiIndex % 15) + 1;
  const panchaka = computePanchaka(
    lunarTithi1To30,
    weekday,
    panch.nakshatraIndex,
    lagnaRasiIndex,
  );

  const kundali = evaluateMuhurtaKundali(lagnaRasiIndex, slotLongitudes, mandi?.rasiIndex);
  const lagnaPoint = evaluatePointShuddhi(lagnaLon, "lagna");
  const moonPoint = evaluatePointShuddhi(slotLongitudes.Moon, "moon");
  const pushkaraLagna = computePushkaraForLongitude(lagnaLon);
  const pushkaraMoon = computePushkaraForLongitude(slotLongitudes.Moon);
  const navamsaLagna = longitudeToNavamsa(lagnaLon);
  const nakshatraPada = longitudeToRasiNakshatra(slotLongitudes.Moon).pada;

  let slotScore = 0;
  if (isPreferredLagna) slotScore += 8;
  if (isAshtamaLagna) slotScore -= 15;
  if (isPreferredHora) slotScore += 7;
  else if (isBeneficHora) slotScore += 3;
  else slotScore -= 3;
  if (isPreferredGowri) slotScore += 6;
  else if (activeGowri.auspicious) slotScore += 3;
  else slotScore -= 6;
  if (panchaka.isClean) slotScore += 6;
  else slotScore -= 8;
  if (kundali.isAshtamaShuddhi) slotScore += 7;
  else slotScore -= 10;
  if (kundali.hasBhriguShatka) slotScore -= 8;
  if (kundali.hasPapaKartari) slotScore -= 10;
  if (kundali.beneficsInKendraTrikona.length >= 2) slotScore += 5;
  if (kundali.maleficsInKendra.length > 0) slotScore -= 4 * kundali.maleficsInKendra.length;
  if (kundali.moonDusthana) slotScore -= 8;
  if (kundali.mandiInDusthana) slotScore -= 6;
  if (pushkaraLagna.isPushkaraNavamsa) slotScore += 8;
  if (pushkaraMoon.isPushkaraNavamsa) slotScore += 6;
  if (pushkaraLagna.isNearPushkaraBhaga) slotScore += 4;
  if (lagnaPoint.nakshatraGandanta || lagnaPoint.rasiGandanta) slotScore -= 12;
  if (moonPoint.nakshatraGandanta || moonPoint.rasiGandanta) slotScore -= 10;
  if (lagnaPoint.mrityuBhaga) slotScore -= 12;
  if (moonPoint.mrityuBhaga) slotScore -= 10;

  const highlights: string[] = [];
  highlights.push(label);
  if (activeGowri.name && activeGowri.auspicious && !label.includes("Gowri")) {
    highlights.push(`auspicious Gowri ${activeGowri.name}`);
  }
  if (isPreferredHora) {
    highlights.push(`preferred ${horaPlanet} Hora`);
  } else if (isBeneficHora) {
    highlights.push(`benefic ${horaPlanet} Hora`);
  }
  if (isPreferredLagna) {
    highlights.push(`preferred Shubha Lagna (${lagnaName})`);
  } else if (!isAshtamaLagna) {
    highlights.push(`${lagnaName} Lagna`);
  }
  highlights.push(`D9 ${RASIS[navamsaLagna.rasiIndex].nameEnglish}`);
  if (kundali.isAshtamaShuddhi) {
    highlights.push("8th house empty (Ashtama Shuddhi)");
  }
  if (kundali.beneficsInKendraTrikona.length > 0) {
    highlights.push(`benefics (${kundali.beneficsInKendraTrikona.join(", ")}) in Kendra/Trikona`);
  }
  if (pushkaraLagna.isPushkaraNavamsa) highlights.push("Pushkara Lagna");
  if (pushkaraMoon.isPushkaraNavamsa) highlights.push("Pushkara Moon");
  if (panchaka.isClean) {
    highlights.push("Panchaka Rahita (dosha-free)");
  }

  const cautions: string[] = [];
  if (isAshtamaLagna) cautions.push("rising Lagna is 8th from Janma Rasi");
  if (!kundali.isAshtamaShuddhi) {
    cautions.push(`8th house occupied by ${kundali.planetsIn8th.join(", ")}`);
  }
  if (kundali.hasPapaKartari) cautions.push("Papa Kartari on Lagna");
  if (kundali.hasBhriguShatka) cautions.push("Venus in 6th (Bhrigu Shatka)");
  if (kundali.moonDusthana) cautions.push(`Moon in ${kundali.moonHouse}th`);
  if (kundali.maleficsInKendra.length) {
    cautions.push(`malefics in Kendra (${kundali.maleficsInKendra.join(", ")})`);
  }
  if (kundali.mandiInDusthana) cautions.push(`Mandi in ${kundali.mandiHouse}th`);
  if (lagnaPoint.nakshatraGandanta || lagnaPoint.rasiGandanta) cautions.push("Lagna Gandanta");
  if (lagnaPoint.mrityuBhaga) cautions.push("Lagna Mrityu Bhaga");
  if (!panchaka.isClean) cautions.push(panchaka.name);

  let specialDescription = `Combines ${highlights.join(" + ")} — clear of Rahu Kalam, Yamagandam, Gulika, Durmuhurtam, Varjyam & Vishti.`;
  if (cautions.length > 0) {
    specialDescription += ` (Note: ${cautions.join("; ")}).`;
  }

  return {
    start: cleanWindow.start,
    end: cleanWindow.end,
    label,
    period,
    reason: baseReason,
    lagnaRasiIndex,
    lagnaName,
    isPreferredLagna,
    isAshtamaLagna,
    horaPlanet,
    isBeneficHora,
    gowriName: activeGowri.name,
    gowriAuspicious: activeGowri.auspicious,
    panchaka,
    kundali,
    slotScore,
    specialDescription,
    nakshatraPada,
    navamsaLagnaName: RASIS[navamsaLagna.rasiIndex].nameEnglish,
    pushkaraLagna: pushkaraLagna.isPushkaraNavamsa,
    pushkaraMoon: pushkaraMoon.isPushkaraNavamsa,
    lagnaGandanta: lagnaPoint.nakshatraGandanta || lagnaPoint.rasiGandanta,
    lagnaMrityuBhaga: lagnaPoint.mrityuBhaga,
    isPreferredHora,
    isPreferredGowri,
  };
}

function collectSlotsForDay(
  date: Date,
  latitude: number,
  longitude: number,
  panch: ReturnType<typeof computePanchangam>,
  dayLongitudes: LongitudeMap,
  durmuhurtams: TimeWindow[],
  varjyam: TimeWindow,
  amritaKalam: TimeWindow,
  vishtiWindows: TimeWindow[],
  activity: MuhurtaActivityDef,
  birthRasiIndex: number | undefined,
  secondBirthRasiIndex: number | undefined,
  includeNightSlots: boolean,
  slotSystem: MuhurtaSlotSystem,
  settings: EphemerisSettings,
): SuggestedMuhurtaSlot[] {
  const muh = computeMuhurtas(date, latitude, longitude);
  const chogh = computeChoghadiya(date, latitude, longitude);
  const gowri = computeGowriPanchangam(date, latitude, longitude);
  const nextDayDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  const nextSunrise = getSunriseSunset(nextDayDate, latitude, longitude).sunrise;
  const exclusions = allInauspiciousWindows(panch, durmuhurtams, varjyam, vishtiWindows);
  const slots: SuggestedMuhurtaSlot[] = [];

  const useChoghadiya = slotSystem === "both" || slotSystem === "choghadiya";
  const useGowri = slotSystem === "both" || slotSystem === "gowri";

  if (useChoghadiya && chogh) {
    for (const slot of chogh.day) {
      if (!choghadiyaOk(slot.name, activity)) continue;
      const cleanPieces = subtractTimeWindows(slot, exclusions, 15);
      for (const piece of cleanPieces) {
        const trimmed =
          piece.start.getTime() !== slot.start.getTime() ||
          piece.end.getTime() !== slot.end.getTime();
        slots.push(
          enrichSlot(
            piece,
            `${slot.name} Choghadiya`,
            "day",
            trimmed
              ? `${CHOGHADIYA_NATURE[slot.name]} · sliced around Rahu/Yama/Gulika/Durmuhurtam/Varjyam`
              : `${CHOGHADIYA_NATURE[slot.name]} · 100% dosha-free window`,
            date,
            latitude,
            longitude,
            panch,
            dayLongitudes,
            gowri,
            nextSunrise,
            activity,
            birthRasiIndex,
            secondBirthRasiIndex,
            settings,
          ),
        );
      }
    }

    if (includeNightSlots) {
      for (const slot of chogh.night) {
        if (!choghadiyaOk(slot.name, activity)) continue;
        const cleanPieces = subtractTimeWindows(slot, [varjyam, ...durmuhurtams, ...vishtiWindows], 15);
        for (const piece of cleanPieces) {
          slots.push(
            enrichSlot(
              piece,
              `${slot.name} Night Choghadiya`,
              "night",
              `${CHOGHADIYA_NATURE[slot.name]} night slot`,
              date,
              latitude,
              longitude,
              panch,
              dayLongitudes,
              gowri,
              nextSunrise,
              activity,
              birthRasiIndex,
              secondBirthRasiIndex,
              settings,
            ),
          );
        }
      }
    }
  }

  if (useGowri && gowri) {
    for (const slot of gowri.day) {
      if (slot.nature !== "auspicious") continue;
      const cleanPieces = subtractTimeWindows(slot, exclusions, 15);
      for (const piece of cleanPieces) {
        slots.push(
          enrichSlot(
            piece,
            `Gowri ${slot.name}`,
            "day",
            "Auspicious Tamil Gowri Nalla Neram · clear of Rahu/Yama/Gulika/Varjyam",
            date,
            latitude,
            longitude,
            panch,
            dayLongitudes,
            gowri,
            nextSunrise,
            activity,
            birthRasiIndex,
            secondBirthRasiIndex,
            settings,
          ),
        );
      }
    }

    if (includeNightSlots) {
      for (const slot of gowri.night) {
        if (slot.nature !== "auspicious") continue;
        const cleanPieces = subtractTimeWindows(slot, [varjyam, ...durmuhurtams, ...vishtiWindows], 15);
        for (const piece of cleanPieces) {
          slots.push(
            enrichSlot(
              piece,
              `Night Gowri ${slot.name}`,
              "night",
              "Auspicious Night Gowri Panchangam",
              date,
              latitude,
              longitude,
              panch,
              dayLongitudes,
              gowri,
              nextSunrise,
              activity,
              birthRasiIndex,
              secondBirthRasiIndex,
              settings,
            ),
          );
        }
      }
    }
  }

  // Amrita Kalam (if it falls during today's daytime or allowed night)
  if (panch.sunrise && panch.sunset) {
    const dayStart = panch.sunrise.getTime();
    const dayEnd = panch.sunset.getTime();
    const aStart = Math.max(amritaKalam.start.getTime(), dayStart);
    const aEnd = Math.min(amritaKalam.end.getTime(), dayEnd);
    if (aEnd - aStart >= 15 * 60_000) {
      const cleanAmrita = subtractTimeWindows(
        { start: new Date(aStart), end: new Date(aEnd) },
        exclusions,
        12,
      );
      for (const piece of cleanAmrita) {
        slots.push(
          enrichSlot(
            piece,
            "Amrita Kalam (Nakshatra Nectar)",
            "day",
            "Nakshatra Amritaghati window · clear of Rahu/Yama/Gulika/Varjyam",
            date,
            latitude,
            longitude,
            panch,
            dayLongitudes,
            gowri,
            nextSunrise,
            activity,
            birthRasiIndex,
            secondBirthRasiIndex,
            settings,
          ),
        );
      }
    }
  }

  for (const key of activity.suggestNamedMuhurtas) {
    const { window: w, period } = namedMuhurtaWindow(key, panch, muh);
    if (!w) continue;
    if (period === "night" && !includeNightSlots && key === "nishita") continue;
    const cleanPieces =
      period === "day"
        ? subtractTimeWindows(w, exclusions, 10)
        : subtractTimeWindows(w, [varjyam, ...durmuhurtams, ...vishtiWindows], 10);
    const label =
      key === "abhijit"
        ? "Abhijit Muhurta"
        : key === "brahma"
          ? "Brahma Muhurta"
          : key === "vijaya"
            ? "Vijaya Muhurta"
            : key === "godhuli"
              ? "Godhuli Muhurta"
              : "Nishita Muhurta";
    for (const piece of cleanPieces) {
      slots.push(
        enrichSlot(
          piece,
          label,
          period,
          "Named daily muhurta · clear of Rahu/Yama/Gulika/Varjyam",
          date,
          latitude,
          longitude,
          panch,
          dayLongitudes,
          gowri,
          nextSunrise,
          activity,
          birthRasiIndex,
          secondBirthRasiIndex,
          settings,
        ),
      );
    }
  }

  slots.sort((a, b) => b.slotScore - a.slotScore || a.start.getTime() - b.start.getTime());
  const deduped: SuggestedMuhurtaSlot[] = [];
  for (const s of slots) {
    const dup = deduped.find(
      (d) =>
        Math.abs(d.start.getTime() - s.start.getTime()) < 60_000 &&
        Math.abs(d.end.getTime() - s.end.getTime()) < 60_000,
    );
    if (!dup) deduped.push(s);
  }
  return deduped
    .slice(0, 6)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

function evaluateOnePersonBala(
  prefix: string,
  birthNakshatraIndex: number | undefined,
  birthRasiIndex: number | undefined,
  panch: ReturnType<typeof computePanchangam>,
): {
  deltaScore: number;
  flags: string[];
  tarabalaLabel: string | null;
  tarabalaGood: boolean | null;
  chandrabalaLabel: string | null;
  chandrabalaGood: boolean | null;
} {
  let deltaScore = 0;
  const flags: string[] = [];
  let tarabalaLabel: string | null = null;
  let tarabalaGood: boolean | null = null;

  if (birthNakshatraIndex !== undefined) {
    const num = tarabalaNumber(birthNakshatraIndex, panch.nakshatraIndex);
    const name = TARABALA_NAMES[num - 1];
    tarabalaLabel = `${name} (${num}/9)`;
    tarabalaGood = GOOD_TARABALA.has(num);
    if (tarabalaGood) {
      deltaScore += 12;
      flags.push(`${prefix}Good Tarabala: ${name}`);
    } else {
      deltaScore -= 15;
      flags.push(`${prefix}Weak Tarabala: ${name}`);
    }
  }

  let chandrabalaLabel: string | null = null;
  let chandrabalaGood: boolean | null = null;
  if (birthRasiIndex !== undefined) {
    const house = chandrabalaHouse(birthRasiIndex, panch.moonRasiIndex);
    chandrabalaGood = GOOD_CHANDRABALA_HOUSES.has(house);
    chandrabalaLabel = `${house}th (${RASIS[panch.moonRasiIndex].nameEnglish})`;
    if (chandrabalaGood) {
      deltaScore += 12;
      flags.push(`${prefix}Good Chandrabala (${house}th)`);
    } else if (house === 8) {
      deltaScore -= 28;
      flags.push(`${prefix}Ashtama Chandra (8th Moon — avoid)`);
    } else {
      deltaScore -= 12;
      flags.push(`${prefix}Weak Chandrabala (${house}th)`);
    }
  }

  return {
    deltaScore,
    flags,
    tarabalaLabel,
    tarabalaGood,
    chandrabalaLabel,
    chandrabalaGood,
  };
}

function scoreDay(
  date: Date,
  panch: ReturnType<typeof computePanchangam>,
  dayYogas: DayYogaAnalysis,
  mahadoshas: MahadoshaAnalysis,
  activity: MuhurtaActivityDef,
  birthNakshatraIndex: number | undefined,
  birthRasiIndex: number | undefined,
  secondBirthNakshatraIndex: number | undefined,
  secondBirthRasiIndex: number | undefined,
): {
  score: number;
  flags: string[];
  isBadYoga: boolean;
  isBadKarana: boolean;
  tarabalaLabel: string | null;
  tarabalaGood: boolean | null;
  chandrabalaLabel: string | null;
  chandrabalaGood: boolean | null;
  secondTarabalaLabel: string | null;
  secondTarabalaGood: boolean | null;
  secondChandrabalaLabel: string | null;
  secondChandrabalaGood: boolean | null;
} {
  let score = 100;
  const flags: string[] = [];

  if (activity.preferShukla && panch.paksha === "Shukla") {
    score += 8;
    flags.push("Shukla paksha");
  } else if (activity.preferShukla && panch.paksha === "Krishna") {
    score -= 5;
  }

  if (activity.avoidTithiIndices.includes(panch.tithiIndex)) {
    score -= 25;
    flags.push(`Avoid tithi: ${panch.tithiName}`);
  }

  if (activity.avoidNakshatraIndices.includes(panch.nakshatraIndex)) {
    score -= 20;
    flags.push(`Avoid nakshatra: ${panch.nakshatraName}`);
  }

  const isBadYoga = INAUSPICIOUS_YOGAS.has(panch.yogaName);
  if (isBadYoga) {
    score -= 15;
    flags.push(`Inauspicious Nitya Yoga: ${panch.yogaName}`);
  }

  const isBadKarana = INAUSPICIOUS_KARANAS.has(panch.karanaName);
  if (isBadKarana) {
    score -= 18;
    flags.push(`Avoid Karana: ${panch.karanaName}`);
  }

  // Tamil Siddha / Amrita / Marana Yoga
  if (dayYogas.siddhaYoga === "Amrita Yoga") {
    score += 10;
    flags.push("Tamil Amrita Yoga");
  } else if (dayYogas.siddhaYoga === "Siddha Yoga") {
    score += 4;
  } else {
    score -= 22;
    flags.push("Tamil Marana Yoga (avoid)");
  }

  // Anandadi Yoga
  if (dayYogas.anandadiYoga.nature === "auspicious") {
    score += 4;
  } else if (dayYogas.anandadiYoga.nature === "inauspicious") {
    score -= 10;
    flags.push(`Anandadi: ${dayYogas.anandadiYoga.name} (inauspicious)`);
  }

  // Special 3-way / 2-way Yogas
  for (const sy of dayYogas.specialYogas) {
    if (sy.nature === "auspicious") {
      score += 10;
      flags.push(sy.name);
    } else {
      score -= 18;
      flags.push(`${sy.name} (avoid)`);
    }
  }

  // Mahadoshas
  if (mahadoshas.sankrantiDosha) {
    score -= 20;
    flags.push("Sankranti Dosha (Solar Ingress)");
  }
  if (mahadoshas.masaShunyaTithi) {
    score -= 18;
    flags.push("Masa Shunya Tithi");
  }
  if (mahadoshas.eclipseProximity) {
    score -= 35;
    flags.push("Eclipse / Grahan Proximity");
  }
  const maudhyaSensitive = MAUDHYA_SENSITIVE_ACTIVITIES.has(activity.id);
  if (mahadoshas.guruMaudhya) {
    score -= maudhyaSensitive ? 30 : 8;
    flags.push("Guru Maudhya (Jupiter Combust)");
  }
  if (mahadoshas.shukraMaudhya) {
    score -= maudhyaSensitive ? 30 : 8;
    flags.push("Shukra Maudhya (Venus Combust)");
  }
  if (mahadoshas.budhaMaudhya) {
    score -= 6;
    flags.push("Budha Maudhya (Mercury Combust)");
  }
  if (mahadoshas.grahaYuddha) {
    score -= 16;
    flags.push("Graha Yuddha");
  }
  if (mahadoshas.moonGandanta) {
    score -= 16;
    flags.push("Moon Gandanta");
  }
  if (mahadoshas.tithiGandanta) {
    score -= 12;
    flags.push("Tithi Gandanta");
  }
  if (mahadoshas.mrityuBhagaMoon) {
    score -= 14;
    flags.push("Moon Mrityu Bhaga");
  }
  if (mahadoshas.lattaHits.length) {
    score -= 8;
    flags.push(...mahadoshas.lattaHits);
  }
  if (mahadoshas.vedhaHits.length) {
    score -= 8;
    flags.push(...mahadoshas.vedhaHits);
  }

  const weekday = date.getUTCDay();
  if (activity.preferredWeekdays.includes(weekday)) {
    score += 5;
  }

  const hasSecond =
    secondBirthNakshatraIndex !== undefined || secondBirthRasiIndex !== undefined;
  const p1 = evaluateOnePersonBala(
    hasSecond ? "P1 " : "",
    birthNakshatraIndex,
    birthRasiIndex,
    panch,
  );
  score += p1.deltaScore;
  flags.push(...p1.flags);

  const p2 = evaluateOnePersonBala(
    "P2 ",
    secondBirthNakshatraIndex,
    secondBirthRasiIndex,
    panch,
  );
  score += p2.deltaScore;
  flags.push(...p2.flags);

  if (panch.abhijitMuhurta && activity.suggestNamedMuhurtas.includes("abhijit")) {
    score += 3;
  }

  return {
    score,
    flags,
    isBadYoga,
    isBadKarana,
    tarabalaLabel: p1.tarabalaLabel,
    tarabalaGood: p1.tarabalaGood,
    chandrabalaLabel: p1.chandrabalaLabel,
    chandrabalaGood: p1.chandrabalaGood,
    secondTarabalaLabel: p2.tarabalaLabel,
    secondTarabalaGood: p2.tarabalaGood,
    secondChandrabalaLabel: p2.chandrabalaLabel,
    secondChandrabalaGood: p2.chandrabalaGood,
  };
}

export function searchMuhurtaDays(input: MuhurtaSearchInput): MuhurtaDayResult[] {
  const settings = input.settings ?? DEFAULT_EPHEMERIS_SETTINGS;
  const range = Math.min(Math.max(1, input.rangeDays), MAX_MUHURTA_RANGE_DAYS);
  const maxResults = Math.min(Math.max(1, input.maxResults ?? 60), 365);
  const slotSystem = input.slotSystem ?? "both";
  const results: MuhurtaDayResult[] = [];
  const p1Dasa = input.natalChart && input.natalBirthDate
    ? prepareNatalDasa(input.natalChart, input.natalBirthDate)
    : undefined;
  const p2Dasa = input.secondNatalChart && input.secondNatalBirthDate
    ? prepareNatalDasa(input.secondNatalChart, input.secondNatalBirthDate)
    : undefined;
  const coupleMatch =
    input.natalChart && input.secondNatalChart
      ? scoreCoupleMatch(input.natalChart, input.secondNatalChart)
      : input.birthNakshatraIndex !== undefined &&
          input.secondBirthNakshatraIndex !== undefined &&
          (input.activity.id === "wedding" || input.activity.id === "betrothal")
        ? scoreCoupleFromStars(
            input.birthNakshatraIndex,
            input.secondBirthNakshatraIndex,
            input.birthRasiIndex,
            input.secondBirthRasiIndex,
          )
        : null;

  for (let i = 0; i < range; i++) {
    const dateStr = addCalendarDays(input.startDateStr, i);
    const date = parseDateAtNoonUtc(dateStr);
    if (!date) continue;

    const panch = computePanchangam(date, input.latitude, input.longitude, settings, {
      includeEndTimes: false,
      includeMoonRiseSet: false,
    });
    const dayLongitudes = getSiderealLongitudes(date, settings);
    const weekday = date.getUTCDay();
    const dayYogas = computeSpecialDayYogas(weekday, panch.tithiIndex, panch.nakshatraIndex);
    const mahadoshas = computeMahadoshas(date, panch.tithiIndex, settings);
    const { varjyam, amritaKalam } = computeVarjyamAndAmrita(date, settings);
    const durmuhurtams = computeDurmuhurtam(date, input.latitude, input.longitude);
    const vishtiDayStart = panch.sunrise ?? new Date(date.getTime() - 6 * 3600_000);
    const vishtiDayEnd =
      panch.sunset && !input.includeNightSlots
        ? panch.sunset
        : getSunriseSunset(new Date(date.getTime() + 24 * 3600_000), input.latitude, input.longitude)
            .sunrise ?? new Date(date.getTime() + 18 * 3600_000);
    const vishtiWindows = computeVishtiWindows(date, vishtiDayStart, vishtiDayEnd, settings);

    let {
      score,
      flags,
      isBadYoga,
      isBadKarana,
      tarabalaLabel,
      tarabalaGood,
      chandrabalaLabel,
      chandrabalaGood,
      secondTarabalaLabel,
      secondTarabalaGood,
      secondChandrabalaLabel,
      secondChandrabalaGood,
    } = scoreDay(
      date,
      panch,
      dayYogas,
      mahadoshas,
      input.activity,
      input.birthNakshatraIndex,
      input.birthRasiIndex,
      input.secondBirthNakshatraIndex,
      input.secondBirthRasiIndex,
    );

    const slots = collectSlotsForDay(
      date,
      input.latitude,
      input.longitude,
      panch,
      dayLongitudes,
      durmuhurtams,
      varjyam,
      amritaKalam,
      vishtiWindows,
      input.activity,
      input.birthRasiIndex,
      input.secondBirthRasiIndex,
      Boolean(input.includeNightSlots),
      slotSystem,
      settings,
    );

    if (slots.length === 0) {
      score -= 30;
    } else {
      const bestSlotBonus = Math.max(...slots.map((s) => s.slotScore));
      score += Math.max(0, Math.min(15, Math.round(bestSlotBonus / 2)));
    }

    const bestLagna = slots[0]
      ? [...slots].sort((a, b) => b.slotScore - a.slotScore)[0].lagnaRasiIndex
      : undefined;
    let natalDasaLabel: string | null = null;
    let secondNatalDasaLabel: string | null = null;
    let sadeSati = false;
    if (input.natalChart) {
      const natal = scoreNatalBala(
        "P1 ",
        input.natalChart,
        input.natalBirthDate,
        p1Dasa,
        date,
        panch.moonRasiIndex,
        panch.nakshatraIndex,
        Math.floor(dayLongitudes.Saturn / 30) % 12,
        Math.floor(dayLongitudes.Jupiter / 30) % 12,
        bestLagna,
      );
      score += natal.deltaScore;
      flags.push(...natal.flags);
      natalDasaLabel = natal.dasaLabel;
      sadeSati = natal.sadeSati || natal.ashtamaSani;
    }
    if (input.secondNatalChart) {
      const natal2 = scoreNatalBala(
        "P2 ",
        input.secondNatalChart,
        input.secondNatalBirthDate,
        p2Dasa,
        date,
        panch.moonRasiIndex,
        panch.nakshatraIndex,
        Math.floor(dayLongitudes.Saturn / 30) % 12,
        Math.floor(dayLongitudes.Jupiter / 30) % 12,
        bestLagna,
      );
      score += natal2.deltaScore;
      flags.push(...natal2.flags);
      secondNatalDasaLabel = natal2.dasaLabel;
      sadeSati = sadeSati || natal2.sadeSati || natal2.ashtamaSani;
    }
    if (coupleMatch) {
      score += coupleMatch.deltaScore;
      flags.push(...coupleMatch.flags);
    }

    if (input.activity.id === "travel") {
      const disha = getDishaShool(date);
      if (disha) flags.push(`Disha Shool: avoid travel toward ${disha}`);
    }

    const dayReasons: string[] = [];
    dayReasons.push(
      `${panch.vara} with ${panch.paksha} Paksha ${panch.tithiName} and ${panch.nakshatraName} star`,
    );
    if (dayYogas.siddhaNature === "auspicious") {
      dayReasons.push(`forms auspicious Tamil ${dayYogas.siddhaYoga}`);
    }
    if (dayYogas.anandadiYoga.nature === "auspicious") {
      dayReasons.push(`${dayYogas.anandadiYoga.name} Anandadi Yoga`);
    }
    const goodSpecials = dayYogas.specialYogas
      .filter((y) => y.nature === "auspicious")
      .map((y) => y.name);
    if (goodSpecials.length > 0) {
      dayReasons.push(`blessed with ${goodSpecials.join(" & ")}`);
    }
    if (!isBadYoga && !isBadKarana) {
      dayReasons.push(`favorable ${panch.yogaName} Yoga & ${panch.karanaName} Karana`);
    }
    if (mahadoshas.activeDoshas.length === 0) {
      dayReasons.push("free of all Mahadoshas (no Maudhya or Sankranti)");
    }
    if (tarabalaGood && tarabalaLabel) {
      dayReasons.push(`strong Tarabala (${tarabalaLabel})`);
    }
    if (chandrabalaGood && chandrabalaLabel) {
      dayReasons.push(`favorable Chandrabala (${chandrabalaLabel})`);
    }
    if (secondTarabalaGood && secondTarabalaLabel) {
      dayReasons.push(`Partner Tarabala (${secondTarabalaLabel})`);
    }
    if (natalDasaLabel) dayReasons.push(`running ${natalDasaLabel} Dasa`);
    if (coupleMatch) dayReasons.push(`couple match ${coupleMatch.label}`);
    if (!sadeSati && input.natalChart) dayReasons.push("not under Sade Sati");
    if (slots.length > 0) {
      const topSlot = [...slots].sort((a, b) => b.slotScore - a.slotScore)[0];
      dayReasons.push(
        `best window offers ${topSlot.lagnaName} Lagna during ${topSlot.horaPlanet} Hora`,
      );
    }

    const dayDescription = `Picked for ${input.activity.label}: ${dayReasons.join(", ")}.`;

    results.push({
      dateStr,
      score,
      dayDescription,
      vara: panch.vara,
      tithiLabel: `${panch.tithiName} (${panch.paksha})`,
      nakshatraName: panch.nakshatraName,
      yogaName: panch.yogaName,
      isBadYoga,
      karanaName: panch.karanaName,
      isBadKarana,
      moonRasiName: RASIS[panch.moonRasiIndex].nameEnglish,
      dayYogas,
      mahadoshas,
      varjyamWindow: varjyam,
      amritaWindow: amritaKalam,
      durmuhurtamWindows: durmuhurtams,
      tarabalaLabel,
      tarabalaGood,
      chandrabalaLabel,
      chandrabalaGood,
      secondTarabalaLabel,
      secondTarabalaGood,
      secondChandrabalaLabel,
      secondChandrabalaGood,
      flags,
      slots,
      natalDasaLabel,
      secondNatalDasaLabel,
      sadeSati,
      couplePoruthamLabel: coupleMatch?.label ?? null,
      vishtiWindows,
    });
  }

  results.sort((a, b) => b.score - a.score || a.dateStr.localeCompare(b.dateStr));
  return results.filter((r) => r.slots.length > 0).slice(0, maxResults);
}
