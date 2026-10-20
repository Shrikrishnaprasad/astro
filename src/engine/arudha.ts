import { rasiLord } from "../data/rasis";
import { houseRasiIndex } from "./houses";
import type { Planet } from "./types";

const mod12 = (n: number) => ((n % 12) + 12) % 12;

/**
 * Jamakkol Arudam (Arudha Pada) for a single house, per Jaimini astrology rules.
 *
 * 1. Find the house's own rasi and its lord.
 * 2. Find the lord's current rasi, and the sign-distance `n` from the house's
 *    rasi to the lord's rasi.
 * 3. Count the same distance `n` forward from the LORD's rasi to get the
 *    candidate Arudha rasi: candidate = (2*lordRasi - houseRasi) mod 12.
 * 4. Exception: if the candidate falls in the house's own rasi or its 7th
 *    (opposite) rasi, the real Arudha jumps 10 signs ahead of the candidate
 *    instead: arudha = (candidate + 9) mod 12.
 */
export function computeArudhaPada(
  houseNumber: number,
  lagnaRasiIndex: number,
  planetRasiIndex: Record<Planet, number>,
): number {
  const houseRasi = houseRasiIndex(lagnaRasiIndex, houseNumber);
  const lord = rasiLord(houseRasi) as Planet;
  const lordRasi = planetRasiIndex[lord];

  const candidate = mod12(2 * lordRasi - houseRasi);
  const seventhFromHouse = mod12(houseRasi + 6);

  if (candidate === houseRasi || candidate === seventhFromHouse) {
    return mod12(candidate + 9);
  }
  return candidate;
}

export function computeAllArudhaPadas(
  lagnaRasiIndex: number,
  planetRasiIndex: Record<Planet, number>,
): Record<number, number> {
  const result: Record<number, number> = {};
  for (let house = 1; house <= 12; house++) {
    result[house] = computeArudhaPada(house, lagnaRasiIndex, planetRasiIndex);
  }
  return result;
}
