import { rasiLord } from "../data/rasis";
import { rasiToHouseNumber } from "./houses";
import type { ChartResult } from "./types";

const MANGAL_DOSHA_HOUSES = new Set([1, 2, 4, 7, 8, 12]);

export interface MangalDoshaReference {
  from: "Lagna" | "Moon" | "Venus";
  house: number;
}

export interface MangalDoshaResult {
  present: boolean;
  references: MangalDoshaReference[];
  cancellations: string[];
  /** After applying listed cancellations, is dosha still considered active? */
  activeAfterCancellation: boolean;
}

function wholeSignAspect(fromRasi: number, toRasi: number): boolean {
  const diff = (((toRasi - fromRasi) % 12) + 12) % 12;
  return diff === 0 || diff === 3 || diff === 6 || diff === 7 || diff === 9;
}

function marsCancellations(
  marsRasi: number,
  chart: ChartResult,
  references: MangalDoshaReference[],
): string[] {
  const cancellations: string[] = [];
  if ([0, 7].includes(marsRasi)) cancellations.push("Mars in own sign (Mesha / Vrischika)");
  if (marsRasi === 9) cancellations.push("Mars exalted (Makara)");
  if (marsRasi === 3) cancellations.push("Mars debilitated in Kataka (some traditions reduce severity)");

  const jupiterRasi = chart.planetRasi.Jupiter.rasiIndex;
  if (wholeSignAspect(jupiterRasi, marsRasi)) {
    cancellations.push("Jupiter whole-sign aspect on Mars");
  }

  const venusRasi = chart.planetRasi.Venus.rasiIndex;
  if (marsRasi === venusRasi) cancellations.push("Mars conjoins Venus (common cancellation)");

  if (references.length === 0) cancellations.push("No Mangal dosha houses occupied");

  if (
    cancellations.some((c) => c.includes("own sign") || c.includes("exalted") || c.includes("Jupiter"))
  ) {
    cancellations.push("Classical cancellation applied — treat remaining references as mild");
  }

  return cancellations;
}

export function computeMangalDosha(chart: ChartResult): MangalDoshaResult {
  const marsRasi = chart.planetRasi.Mars.rasiIndex;
  const references: MangalDoshaReference[] = [];

  const refs: Array<{ from: MangalDoshaReference["from"]; anchor: number }> = [
    { from: "Lagna", anchor: chart.lagnaRasiIndex },
    { from: "Moon", anchor: chart.planetRasi.Moon.rasiIndex },
    { from: "Venus", anchor: chart.planetRasi.Venus.rasiIndex },
  ];

  for (const { from, anchor } of refs) {
    const house = rasiToHouseNumber(anchor, marsRasi);
    if (MANGAL_DOSHA_HOUSES.has(house)) {
      references.push({ from, house });
    }
  }

  const cancellations = marsCancellations(marsRasi, chart, references);
  const hasStrongCancel = cancellations.some(
    (c) =>
      c.includes("own sign") ||
      c.includes("exalted") ||
      c.includes("Jupiter whole-sign") ||
      c.includes("No Mangal dosha"),
  );

  return {
    present: references.length > 0,
    references,
    cancellations,
    activeAfterCancellation: references.length > 0 && !hasStrongCancel,
  };
}

export interface YogaDoshaPackResult {
  mangalDosha: MangalDoshaResult;
  /** Placeholder for future classical yoga packs. */
  otherYogasNote: string;
}

export function computeYogaDoshaPack(chart: ChartResult): YogaDoshaPackResult {
  return {
    mangalDosha: computeMangalDosha(chart),
    otherYogasNote:
      "General yoga packs (Gaja Kesari, Pancha Mahapurusha, etc.) are not automated yet — only Mangal dosha with common cancellations.",
  };
}
