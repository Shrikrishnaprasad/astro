import { NAKSHATRAS, NAKSHATRA_SPAN_DEGREES } from "../data/nakshatras";
import { rasiLord } from "../data/rasis";
import { normalizeDegrees } from "./constants";

// Indu Lagna (Chandra/wealth lagna, Jaimini system): add the fixed "kaaraka"
// numbers of (a) the lord of the 9th house from Lagna and (b) the lord of
// the 9th house from Moon; the remainder on dividing by 12 (12 if exactly
// divisible) counts rasis forward from the Moon's own rasi (counted as 1).
// Kaaraka values and method per commonly-cited Jaimini/BPHS sources.
const INDU_KAARAKA: Record<string, number> = {
  Sun: 30,
  Moon: 16,
  Mars: 6,
  Mercury: 8,
  Jupiter: 10,
  Venus: 12,
  Saturn: 1,
};

export interface InduLagnaResult {
  rasiIndex: number;
  calculationTrace: string[];
  sourceNote: string;
}

export function computeInduLagna(lagnaRasiIndex: number, moonRasiIndex: number): InduLagnaResult {
  const ninthFromLagnaLord = rasiLord((lagnaRasiIndex + 8) % 12);
  const ninthFromMoonLord = rasiLord((moonRasiIndex + 8) % 12);
  const ka1 = INDU_KAARAKA[ninthFromLagnaLord];
  const ka2 = INDU_KAARAKA[ninthFromMoonLord];
  const sum = ka1 + ka2;
  const remainder = sum % 12 === 0 ? 12 : sum % 12;
  const rasiIndex = (moonRasiIndex + remainder - 1) % 12;
  return {
    rasiIndex,
    calculationTrace: [
      `9th lord from Lagna: ${ninthFromLagnaLord} (kaaraka ${ka1})`,
      `9th lord from Moon: ${ninthFromMoonLord} (kaaraka ${ka2})`,
      `Sum ${sum} → count ${remainder} rasis from Moon rasi index ${moonRasiIndex} → Indu Lagna rasi ${rasiIndex}`,
    ],
    sourceNote:
      "Jaimini-style Indu Lagna per commonly cited BPHS/Jaimini summaries — texts disagree on kaaraka tables; not authoritative for legal/ritual decisions.",
  };
}

// Yogi point: the Yoga Sphuta (same Sun+Moon sum used for the Panchanga's 27
// Yogas) offset by 93°20' locates the Yogi Point; the nakshatra it falls in
// gives the Yogi nakshatra/graha. Method per commonly-cited Jyotish sources -
// treat as indicative.
//
// Avayogi: Yogi point + 186°40' (equivalently Yoga Sphuta + 280°), per commonly
// cited JHora / Dehko Panchang sphuta rules — distinct from the degenerate
// "10th nakshatra from Yogi" counting shortcut.
const YOGI_OFFSET_DEGREES = 93 + 20 / 60;
const AVAYOGI_OFFSET_FROM_YOGI = 186 + 40 / 60;

export function computeYogaSphuta(sunLongitude: number, moonLongitude: number): number {
  return normalizeDegrees(sunLongitude + moonLongitude);
}

export interface YogiResult {
  yogaSphuta: number;
  yogiPoint: number;
  yogiNakshatraIndex: number;
  yogiGraha: string;
  duplicateYogiGraha: string;
  calculationTrace: string[];
  sourceNote: string;
}

export function computeYogi(sunLongitude: number, moonLongitude: number): YogiResult {
  const yogaSphuta = computeYogaSphuta(sunLongitude, moonLongitude);
  const yogiPoint = normalizeDegrees(yogaSphuta + YOGI_OFFSET_DEGREES);
  const yogiNakshatraIndex = Math.floor(yogiPoint / NAKSHATRA_SPAN_DEGREES);
  const yogiGraha = NAKSHATRAS[yogiNakshatraIndex].lord;
  const duplicateYogiGraha = rasiLord(Math.floor(yogiPoint / 30));

  return {
    yogaSphuta,
    yogiPoint,
    yogiNakshatraIndex,
    yogiGraha,
    duplicateYogiGraha,
    calculationTrace: [
      `Yoga Sphuta = Sun ${sunLongitude.toFixed(2)}° + Moon ${moonLongitude.toFixed(2)}° = ${yogaSphuta.toFixed(2)}°`,
      `Yogi point = Yoga Sphuta + 93°20′ = ${yogiPoint.toFixed(2)}°`,
      `Yogi nakshatra index ${yogiNakshatraIndex} → lord ${yogiGraha}; duplicate Yogi (sign lord) ${duplicateYogiGraha}`,
    ],
    sourceNote:
      "Yogi / Duplicate Yogi from Yoga Sphuta + 93°20′ (Pushya offset) — widely used in JHora-style software; treat as indicative, not scripture-authoritative.",
  };
}

export interface AvayogiResult {
  avayogiPoint: number;
  avayogiNakshatraIndex: number;
  avayogiGraha: string;
}

export function computeAvayogi(sunLongitude: number, moonLongitude: number): AvayogiResult {
  const { yogiPoint } = computeYogi(sunLongitude, moonLongitude);
  const avayogiPoint = normalizeDegrees(yogiPoint + AVAYOGI_OFFSET_FROM_YOGI);
  const avayogiNakshatraIndex = Math.floor(avayogiPoint / NAKSHATRA_SPAN_DEGREES);
  const avayogiGraha = NAKSHATRAS[avayogiNakshatraIndex].lord;
  return { avayogiPoint, avayogiNakshatraIndex, avayogiGraha };
}

// Each tithi (1-15 within its paksha) belongs to one of 5 repeating types.
export type TithiType = "Nanda" | "Bhadra" | "Jaya" | "Rikta" | "Purna";
const TITHI_TYPES: TithiType[] = ["Nanda", "Bhadra", "Jaya", "Rikta", "Purna"];

// tithiIndex: 0-14 (as returned by computePanchangam - 0 = Prathama/Pratipat).
export function getTithiType(tithiIndex: number): TithiType {
  return TITHI_TYPES[((tithiIndex % 5) + 5) % 5];
}
