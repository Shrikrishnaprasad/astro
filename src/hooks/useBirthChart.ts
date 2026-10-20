import { useMemo } from "react";
import { getSiderealAscendant } from "../engine/ascendant";
import { getSiderealLongitudes } from "../engine/planetaryPositions";
import { longitudeToRasiNakshatra } from "../engine/rasiNakshatra";
import type { BirthInput, ChartResult, Planet } from "../engine/types";
import { PLANETS } from "../engine/types";

export function computeChart(input: BirthInput): ChartResult {
  const planetLongitudes = getSiderealLongitudes(input.date);
  const lagnaLongitude = getSiderealAscendant(input.date, input.latitude, input.longitude);
  const lagnaRasiIndex = Math.floor(lagnaLongitude / 30);
  const lagnaDegreeInRasi = lagnaLongitude - lagnaRasiIndex * 30;

  const planetRasi = {} as ChartResult["planetRasi"];
  for (const planet of PLANETS) {
    planetRasi[planet] = longitudeToRasiNakshatra(planetLongitudes[planet]);
  }

  return { lagnaRasiIndex, lagnaLongitude, lagnaDegreeInRasi, planetLongitudes, planetRasi };
}

export function useBirthChart(input: BirthInput | null): ChartResult | null {
  return useMemo(() => (input ? computeChart(input) : null), [input]);
}

export function planetRasiIndexMap(chart: ChartResult): Record<Planet, number> {
  const map = {} as Record<Planet, number>;
  for (const planet of PLANETS) {
    map[planet] = chart.planetRasi[planet].rasiIndex;
  }
  return map;
}
