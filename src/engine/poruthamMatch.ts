import { RASIS, rasiLord } from "../data/rasis";
import type { ChartResult } from "./types";
import { rasiToHouseNumber } from "./houses";
import { computePorutham, type PoruthamResult } from "./porutham";
import { computeMangalDosha } from "./yogaDosha";

export interface PapaSamyamResult {
  bridePapaScore: number;
  groomPapaScore: number;
  pass: boolean;
  note: string;
}

export interface LagnaPoruthamResult {
  pass: boolean;
  lagnaDistance: number;
  note: string;
}

export interface CommunityMinimumsResult {
  minimumScore: number;
  dasakootaScore: number;
  pass: boolean;
  failedCritical: string[];
  note: string;
}

export interface PoruthamMatchReport {
  dasakoota: PoruthamResult;
  papaSamyam: PapaSamyamResult;
  brideKuja: ReturnType<typeof computeMangalDosha>;
  groomKuja: ReturnType<typeof computeMangalDosha>;
  kujaCompatibilityNote: string;
  lagnaPorutham: LagnaPoruthamResult;
  minimums: CommunityMinimumsResult;
  summary: string;
  recommendation: "favorable" | "review" | "not_favorable";
}

const PAPA_MALEFICS = ["Sun", "Mars", "Saturn", "Rahu", "Ketu"] as const;
const PAPA_BAD_HOUSES = new Set([1, 2, 4, 5, 7, 8, 9, 12]);
const CRITICAL_KOOTA = new Set(["Nadi", "Rajju", "Rasi (Bhakoot)", "Dina (Tara)"]);

function papaScoreFromMoon(chart: ChartResult): number {
  const moonRasi = chart.planetRasi.Moon.rasiIndex;
  let score = 0;
  for (const key of PAPA_MALEFICS) {
    const house = rasiToHouseNumber(moonRasi, chart.planetRasi[key].rasiIndex);
    if (PAPA_BAD_HOUSES.has(house)) {
      score += key === "Mars" || key === "Saturn" ? 2 : 1;
    }
  }
  return score;
}

export function computePapaSamyam(bride: ChartResult, groom: ChartResult): PapaSamyamResult {
  const bridePapaScore = papaScoreFromMoon(bride);
  const groomPapaScore = papaScoreFromMoon(groom);
  // Common Tamil rule-of-thumb: groom should carry at least as much papa tolerance as bride.
  const pass = groomPapaScore >= bridePapaScore || bridePapaScore - groomPapaScore <= 1;
  return {
    bridePapaScore,
    groomPapaScore,
    pass,
    note: pass
      ? "Papa samyam balanced (groom papa score meets or exceeds bride)."
      : "Papa samyam mismatch — groom papa score lower than bride; traditional review advised.",
  };
}

export function computeLagnaPorutham(bride: ChartResult, groom: ChartResult): LagnaPoruthamResult {
  const lagnaDistance =
    (((groom.lagnaRasiIndex - bride.lagnaRasiIndex + 12) % 12) + 1);
  const pass = lagnaDistance !== 6 && lagnaDistance !== 8;
  return {
    pass,
    lagnaDistance,
    note: pass
      ? `Lagna rasi distance ${lagnaDistance} (no 6/8 Shadashtaka between lagnas).`
      : `Lagna Shadashtaka — distance ${lagnaDistance} between ascendant signs.`,
  };
}

export function computeCommunityMinimums(
  dasakoota: PoruthamResult,
  minimumScore = 6,
): CommunityMinimumsResult {
  const failedCritical = dasakoota.checks
    .filter((c) => CRITICAL_KOOTA.has(c.name) && !c.pass)
    .map((c) => c.name);
  const pass = dasakoota.score >= minimumScore && failedCritical.length === 0;
  return {
    minimumScore,
    dasakootaScore: dasakoota.score,
    pass,
    failedCritical,
    note: pass
      ? `Meets ${minimumScore}/10 minimum with critical kootas clear.`
      : `Below community minimum (${dasakoota.score}/${minimumScore}) or critical koota failed.`,
  };
}

function kujaNote(
  bride: ReturnType<typeof computeMangalDosha>,
  groom: ReturnType<typeof computeMangalDosha>,
): string {
  if (!bride.activeAfterCancellation && !groom.activeAfterCancellation) {
    return "No active Kuja dosha on either chart.";
  }
  if (bride.activeAfterCancellation && groom.activeAfterCancellation) {
    return "Both charts show active Kuja dosha — often treated as mutual cancellation in Tamil matching.";
  }
  if (bride.activeAfterCancellation) {
    return "Bride has active Kuja dosha; groom does not — review with astrologer.";
  }
  return "Groom has active Kuja dosha; bride does not — review with astrologer.";
}

export function computePoruthamMatchReport(
  bride: ChartResult,
  groom: ChartResult,
  minimumScore = 6,
): PoruthamMatchReport {
  const bMoon = bride.planetRasi.Moon;
  const gMoon = groom.planetRasi.Moon;
  const dasakoota = computePorutham(
    bMoon.nakshatraIndex,
    gMoon.nakshatraIndex,
    bMoon.rasiIndex,
    gMoon.rasiIndex,
  );
  const papaSamyam = computePapaSamyam(bride, groom);
  const brideKuja = computeMangalDosha(bride);
  const groomKuja = computeMangalDosha(groom);
  const lagnaPorutham = computeLagnaPorutham(bride, groom);
  const minimums = computeCommunityMinimums(dasakoota, minimumScore);
  const kujaCompatibilityNote = kujaNote(brideKuja, groomKuja);

  const flags = [
    minimums.pass,
    papaSamyam.pass,
    lagnaPorutham.pass,
    dasakoota.score >= 8,
  ].filter(Boolean).length;

  let recommendation: PoruthamMatchReport["recommendation"] = "review";
  if (minimums.pass && papaSamyam.pass && lagnaPorutham.pass && dasakoota.score >= 7) {
    recommendation = "favorable";
  } else if (!minimums.pass || (!papaSamyam.pass && dasakoota.score < 5)) {
    recommendation = "not_favorable";
  }

  const summary = [
    `Dasakoota ${dasakoota.score}/${dasakoota.total}.`,
    minimums.note,
    papaSamyam.note,
    lagnaPorutham.note,
    kujaCompatibilityNote,
    `Bride lagna ${RASIS[bride.lagnaRasiIndex].nameEnglish}, groom lagna ${RASIS[groom.lagnaRasiIndex].nameEnglish}.`,
    `Moon rasi lords: ${rasiLord(bMoon.rasiIndex)} / ${rasiLord(gMoon.rasiIndex)}.`,
    `${flags}/4 major match indicators positive.`,
  ].join(" ");

  return {
    dasakoota,
    papaSamyam,
    brideKuja,
    groomKuja,
    kujaCompatibilityNote,
    lagnaPorutham,
    minimums,
    summary,
    recommendation,
  };
}
