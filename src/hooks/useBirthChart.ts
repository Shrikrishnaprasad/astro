import { useMemo } from "react";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import { getSiderealAscendant } from "../engine/ascendant";
import type { EphemerisSettings } from "../engine/ephemerisSettings";
import { DEFAULT_EPHEMERIS_SETTINGS } from "../engine/ephemerisSettings";
import { getSiderealLongitudes } from "../engine/planetaryPositions";
import { longitudeToRasiNakshatra } from "../engine/rasiNakshatra";
import type { BirthInput, ChartResult, Planet } from "../engine/types";
import { PLANETS } from "../engine/types";

export function computeChart(
  input: BirthInput,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): ChartResult {
  const planetLongitudes = getSiderealLongitudes(input.date, settings);
  const lagnaLongitude = getSiderealAscendant(
    input.date,
    input.latitude,
    input.longitude,
    settings,
  );
  const lagnaRasiIndex = Math.floor(lagnaLongitude / 30);
  const lagnaDegreeInRasi = lagnaLongitude - lagnaRasiIndex * 30;

  const planetRasi = {} as ChartResult["planetRasi"];
  for (const planet of PLANETS) {
    planetRasi[planet] = longitudeToRasiNakshatra(planetLongitudes[planet]);
  }

  return { lagnaRasiIndex, lagnaLongitude, lagnaDegreeInRasi, planetLongitudes, planetRasi };
}

export function useBirthChart(input: BirthInput | null): ChartResult | null {
  const { resolved } = useEphemerisSettings();
  return useMemo(
    () => (input ? computeChart(input, resolved) : null),
    [input, resolved],
  );
}

export function planetRasiIndexMap(chart: ChartResult): Record<Planet, number> {
  const map = {} as Record<Planet, number>;
  for (const planet of PLANETS) {
    map[planet] = chart.planetRasi[planet].rasiIndex;
  }
  return map;
}
