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
}

export function computeInduLagna(lagnaRasiIndex: number, moonRasiIndex: number): InduLagnaResult {
  const ninthFromLagnaLord = rasiLord((lagnaRasiIndex + 8) % 12);
  const ninthFromMoonLord = rasiLord((moonRasiIndex + 8) % 12);
  const sum = INDU_KAARAKA[ninthFromLagnaLord] + INDU_KAARAKA[ninthFromMoonLord];
  const remainder = sum % 12 === 0 ? 12 : sum % 12;
  const rasiIndex = (moonRasiIndex + remainder - 1) % 12;
  return { rasiIndex };
}

// Yogi point: the Yoga Sphuta (same Sun+Moon sum used for the Panchanga's 27
// Yogas) offset by 93°20' locates the Yogi Point; the nakshatra it falls in
// gives the Yogi nakshatra/graha. Method per commonly-cited Jyotish sources -
// treat as indicative.
//
// Avayogi is deliberately NOT computed here: the commonly-repeated "10th
// nakshatra from Yogi" rule is mathematically degenerate - nakshatra lords
// cycle with period 9, so a 9-step offset (10th counted inclusively) always
// lands back on the same lord as the Yogi graha itself, which contradicts
// how Avayogi is actually used (as a planet distinct from Yogi). Without a
// verified alternative derivation, showing a value would just be wrong.
const YOGI_OFFSET_DEGREES = 93 + 20 / 60;

export interface YogiResult {
  yogiPoint: number;
  yogiNakshatraIndex: number;
  yogiGraha: string;
}

export function computeYogi(sunLongitude: number, moonLongitude: number): YogiResult {
  const yogaSphuta = normalizeDegrees(sunLongitude + moonLongitude);
  const yogiPoint = normalizeDegrees(yogaSphuta + YOGI_OFFSET_DEGREES);
  const yogiNakshatraIndex = Math.floor(yogiPoint / NAKSHATRA_SPAN_DEGREES);
  const yogiGraha = NAKSHATRAS[yogiNakshatraIndex].lord;

  return { yogiPoint, yogiNakshatraIndex, yogiGraha };
}

// Each tithi (1-15 within its paksha) belongs to one of 5 repeating types.
export type TithiType = "Nanda" | "Bhadra" | "Jaya" | "Rikta" | "Purna";
const TITHI_TYPES: TithiType[] = ["Nanda", "Bhadra", "Jaya", "Rikta", "Purna"];

// tithiIndex: 0-14 (as returned by computePanchangam - 0 = Prathama/Pratipat).
export function getTithiType(tithiIndex: number): TithiType {
  return TITHI_TYPES[((tithiIndex % 5) + 5) % 5];
}
