import { NAKSHATRAS, NAKSHATRA_SPAN_DEGREES } from "../data/nakshatras";
import {
  ayanaForRasi,
  GULIKA_KALAM_SLOT,
  RAHU_KALAM_SLOT,
  ritusForRasi,
  TAMIL_MONTHS,
  YAMAGANDAM_SLOT,
} from "../data/panchangaRules";
import { normalizeDegrees } from "./constants";
import { getSiderealLongitudes } from "./planetaryPositions";
import { getMoonriseMoonset, getSunriseSunset } from "./sunTimes";

const TITHI_NAMES = [
  "Prathama", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
  "Purnima/Amavasya",
];

const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma",
  "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha",
  "Shukla", "Brahma", "Indra", "Vaidhriti",
];

const KARANA_NAMES = [
  "Bava", "Baalava", "Kaulava", "Taitila", "Garija", "Vanija", "Vishti",
];
const FIXED_KARANAS = ["Shakuni", "Chatushpada", "Naga", "Kimstughna"];

const VARA_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export interface TimeWindow {
  start: Date;
  end: Date;
}

export interface PanchangamResult {
  tithiIndex: number; // 0-29 (0-14 waxing, 15-29 waning)
  tithiName: string;
  paksha: "Shukla" | "Krishna";
  tithiEndsAt: Date | null;
  nakshatraIndex: number;
  nakshatraName: string;
  nakshatraEndsAt: Date | null;
  yogaIndex: number;
  yogaName: string;
  yogaEndsAt: Date | null;
  karanaIndex: number;
  karanaName: string;
  karanaEndsAt: Date | null;
  vara: string;
  sunRasiIndex: number;
  sunDegreeInRasi: number;
  moonRasiIndex: number;
  moonDegreeInRasi: number;
  tamilMasa: string;
  ritu: string;
  ayana: "Uttarayana" | "Dakshinayana";
  sunrise: Date | null;
  sunset: Date | null;
  moonrise: Date | null;
  moonset: Date | null;
  rahuKalam: TimeWindow | null;
  yamagandam: TimeWindow | null;
  gulikaKalam: TimeWindow | null;
  abhijitMuhurta: TimeWindow | null;
}

/**
 * Generic forward search for when an integer-valued, slowly-changing quantity
 * (tithi number, nakshatra index, yoga index, karana number) next changes
 * value, by sampling coarsely then bisecting across the step where it flips.
 */
function nextBoundaryCrossing(
  date: Date,
  valueAt: (d: Date) => number,
  maxHours = 30,
  stepMinutes = 10,
): Date | null {
  const startValue = valueAt(date);
  let prevTime = date.getTime();
  const endTime = prevTime + maxHours * 60 * 60 * 1000;
  let t = prevTime;

  while (t < endTime) {
    t += stepMinutes * 60 * 1000;
    const value = valueAt(new Date(t));
    if (value !== startValue) {
      let lo = prevTime;
      let hi = t;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (valueAt(new Date(mid)) === startValue) lo = mid;
        else hi = mid;
      }
      return new Date(hi);
    }
    prevTime = t;
  }
  return null;
}

function tithiNumberAt(date: Date): number {
  const { Sun, Moon } = getSiderealLongitudes(date);
  return Math.floor(normalizeDegrees(Moon - Sun) / 12);
}

function nakshatraIndexAt(date: Date): number {
  const { Moon } = getSiderealLongitudes(date);
  return Math.floor(normalizeDegrees(Moon) / NAKSHATRA_SPAN_DEGREES);
}

function yogaIndexAt(date: Date): number {
  const { Sun, Moon } = getSiderealLongitudes(date);
  return Math.floor(normalizeDegrees(Sun + Moon) / NAKSHATRA_SPAN_DEGREES);
}

function karanaNumberAt(date: Date): number {
  const { Sun, Moon } = getSiderealLongitudes(date);
  return Math.floor(normalizeDegrees(Moon - Sun) / 6);
}

export function dividedWindow(sunrise: Date, sunset: Date, parts: number, slot1Indexed: number): TimeWindow {
  const totalMs = sunset.getTime() - sunrise.getTime();
  const partMs = totalMs / parts;
  const start = new Date(sunrise.getTime() + (slot1Indexed - 1) * partMs);
  const end = new Date(sunrise.getTime() + slot1Indexed * partMs);
  return { start, end };
}

export function computePanchangam(
  date: Date,
  latitude?: number,
  longitude?: number,
): PanchangamResult {
  const { Sun, Moon } = getSiderealLongitudes(date);

  const moonMinusSun = normalizeDegrees(Moon - Sun);
  const tithiNumber = Math.floor(moonMinusSun / 12); // 0-29
  const paksha: "Shukla" | "Krishna" = tithiNumber < 15 ? "Shukla" : "Krishna";
  const tithiIndex = tithiNumber % 15;
  const tithiName = tithiIndex === 14 ? TITHI_NAMES[14] : TITHI_NAMES[tithiIndex];
  const tithiEndsAt = nextBoundaryCrossing(date, tithiNumberAt);

  const nakshatraIndex = Math.floor(normalizeDegrees(Moon) / NAKSHATRA_SPAN_DEGREES);
  const nakshatraName = NAKSHATRAS[nakshatraIndex].nameEnglish;
  const nakshatraEndsAt = nextBoundaryCrossing(date, nakshatraIndexAt);

  const yogaSum = normalizeDegrees(Sun + Moon);
  const yogaIndex = Math.floor(yogaSum / NAKSHATRA_SPAN_DEGREES);
  const yogaName = YOGA_NAMES[yogaIndex % YOGA_NAMES.length];
  const yogaEndsAt = nextBoundaryCrossing(date, yogaIndexAt);

  // Karana: half-tithi (6° steps), 60 per lunar month; first and last of each
  // fortnight pair are fixed, the rest cycle through the 7 movable karanas.
  const karanaNumber = Math.floor(moonMinusSun / 6); // 0-59
  let karanaName: string;
  if (karanaNumber === 0) karanaName = FIXED_KARANAS[3]; // Kimstughna
  else if (karanaNumber >= 57) karanaName = FIXED_KARANAS[karanaNumber - 57];
  else karanaName = KARANA_NAMES[(karanaNumber - 1) % 7];
  const karanaEndsAt = nextBoundaryCrossing(date, karanaNumberAt, 15);

  const vara = VARA_NAMES[date.getUTCDay()];

  const sunNorm = normalizeDegrees(Sun);
  const moonNorm = normalizeDegrees(Moon);
  const sunRasiIndex = Math.floor(sunNorm / 30);
  const sunDegreeInRasi = sunNorm - sunRasiIndex * 30;
  const moonRasiIndex = Math.floor(moonNorm / 30);
  const moonDegreeInRasi = moonNorm - moonRasiIndex * 30;
  const tamilMasa = TAMIL_MONTHS[sunRasiIndex];
  const ritu = ritusForRasi(sunRasiIndex);
  const ayana = ayanaForRasi(sunRasiIndex);

  let sunrise: Date | null = null;
  let sunset: Date | null = null;
  let moonrise: Date | null = null;
  let moonset: Date | null = null;
  let rahuKalam: TimeWindow | null = null;
  let yamagandam: TimeWindow | null = null;
  let gulikaKalam: TimeWindow | null = null;
  let abhijitMuhurta: TimeWindow | null = null;

  if (latitude !== undefined && longitude !== undefined) {
    ({ sunrise, sunset } = getSunriseSunset(date, latitude, longitude));
    ({ moonrise, moonset } = getMoonriseMoonset(date, latitude, longitude));

    if (sunrise && sunset && sunset > sunrise) {
      const weekday = date.getUTCDay();
      rahuKalam = dividedWindow(sunrise, sunset, 8, RAHU_KALAM_SLOT[weekday]);
      yamagandam = dividedWindow(sunrise, sunset, 8, YAMAGANDAM_SLOT[weekday]);
      gulikaKalam = dividedWindow(sunrise, sunset, 8, GULIKA_KALAM_SLOT[weekday]);
      abhijitMuhurta = dividedWindow(sunrise, sunset, 15, 8);
    }
  }

  return {
    tithiIndex,
    tithiName,
    paksha,
    tithiEndsAt,
    nakshatraIndex,
    nakshatraName,
    nakshatraEndsAt,
    yogaIndex,
    yogaName,
    yogaEndsAt,
    karanaIndex: karanaNumber,
    karanaName,
    karanaEndsAt,
    vara,
    sunRasiIndex,
    sunDegreeInRasi,
    moonRasiIndex,
    moonDegreeInRasi,
    tamilMasa,
    ritu,
    ayana,
    sunrise,
    sunset,
    moonrise,
    moonset,
    rahuKalam,
    yamagandam,
    gulikaKalam,
    abhijitMuhurta,
  };
}
