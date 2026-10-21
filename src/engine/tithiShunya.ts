import { TITHI_SHUNYA_NAKSHATRA_INDICES } from "../data/tithiShunyaNakshatras";
import { NAKSHATRAS } from "../data/nakshatras";

export interface TithiShunyaResult {
  /** Tithi number 1–15 within paksha (Prathama = 1). */
  tithiNumberInPaksha: number;
  shunyaNakshatraIndices: number[];
  shunyaNakshatraNames: string[];
  /** True if Moon's birth nakshatra is listed as shunya for this tithi. */
  moonIsShunya: boolean;
  hasShunyaList: boolean;
}

/** `tithiIndex` is 0–14 as returned by computePanchangam. */
export function computeTithiShunya(tithiIndex: number, moonNakshatraIndex: number): TithiShunyaResult {
  const tithiNumberInPaksha = tithiIndex + 1;
  const shunyaNakshatraIndices = TITHI_SHUNYA_NAKSHATRA_INDICES[tithiNumberInPaksha] ?? [];
  const shunyaNakshatraNames = shunyaNakshatraIndices.map((i) => NAKSHATRAS[i].nameEnglish);
  return {
    tithiNumberInPaksha,
    shunyaNakshatraIndices,
    shunyaNakshatraNames,
    moonIsShunya: shunyaNakshatraIndices.includes(moonNakshatraIndex),
    hasShunyaList: shunyaNakshatraIndices.length > 0,
  };
}
