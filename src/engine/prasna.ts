import { NAKSHATRAS } from "../data/nakshatras";
import { RASIS, rasiLord } from "../data/rasis";
import { computePanchangam } from "./panchanga";
import type { BirthInput, ChartResult } from "./types";
import { kpLordChainAtLongitude } from "./kp";
import { rasiToHouseNumber } from "./houses";

export interface PrasnaResult {
  lagnaRasiIndex: number;
  lagnaLord: string;
  moonNakshatra: string;
  tithiName: string;
  /** KP sub-lord of Prasna lagna degree. */
  lagnaSubLord: string;
  /** Whole-sign house of Moon from Prasna lagna. */
  moonHouse: number;
  /** Simple horary hints (indicative). */
  hints: string[];
}

export function computePrasna(input: BirthInput, chart: ChartResult): PrasnaResult {
  const panch = computePanchangam(input.date, input.latitude, input.longitude);
  const lagnaChain = kpLordChainAtLongitude(chart.lagnaLongitude);
  const moonHouse = rasiToHouseNumber(chart.lagnaRasiIndex, chart.planetRasi.Moon.rasiIndex);
  const lagnaLord = rasiLord(chart.lagnaRasiIndex);

  const hints: string[] = [];
  if ([1, 4, 7, 10].includes(moonHouse)) {
    hints.push("Moon in kendra from Prasna lagna — question tends to manifest visibly.");
  } else if ([6, 8, 12].includes(moonHouse)) {
    hints.push("Moon in dusthana from lagna — delays or hidden factors; verify before acting.");
  } else {
    hints.push("Moon in panapara/upachaya — mixed, depends on lagna lord strength.");
  }

  const lagnaRasi = RASIS[chart.lagnaRasiIndex];
  hints.push(`Prasna lagna ${lagnaRasi.nameEnglish} ruled by ${lagnaLord} (KP sub: ${lagnaChain.subLord}).`);
  hints.push(
    `Moon in ${NAKSHATRAS[chart.planetRasi.Moon.nakshatraIndex].nameEnglish}, ${panch.tithiName} — use with full chart review.`,
  );

  return {
    lagnaRasiIndex: chart.lagnaRasiIndex,
    lagnaLord,
    moonNakshatra: NAKSHATRAS[chart.planetRasi.Moon.nakshatraIndex].nameEnglish,
    tithiName: panch.tithiName,
    lagnaSubLord: lagnaChain.subLord,
    moonHouse,
    hints,
  };
}
