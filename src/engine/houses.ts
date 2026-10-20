import type { Planet } from "./types";

// Whole-sign houses: house N occupies the rasi that is (N-1) signs ahead of the lagna rasi.
export function houseRasiIndex(lagnaRasiIndex: number, houseNumber: number): number {
  return (((lagnaRasiIndex + houseNumber - 1) % 12) + 12) % 12;
}

// Inverse: given a rasi, which house (1-12) is it relative to the lagna rasi.
export function rasiToHouseNumber(lagnaRasiIndex: number, rasiIndex: number): number {
  return (((rasiIndex - lagnaRasiIndex) % 12) + 12) % 12 + 1;
}

export function planetHouses(
  lagnaRasiIndex: number,
  planetRasi: Record<Planet, number>,
): Record<Planet, number> {
  const result = {} as Record<Planet, number>;
  for (const planet of Object.keys(planetRasi) as Planet[]) {
    result[planet] = rasiToHouseNumber(lagnaRasiIndex, planetRasi[planet]);
  }
  return result;
}
