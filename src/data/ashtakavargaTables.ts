import type { Planet } from "../engine/types";

/** Parashari benefic houses (1–12 counted from the BAV sign) for each contributor. */
export type AshtakavargaContributor = Exclude<Planet, "Rahu" | "Ketu">;

export const ASHTAKAVARGA_CONTRIBUTORS: AshtakavargaContributor[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
];

/**
 * For `bavPlanet`'s chart: when `contributor` occupies house `h` from `bavPlanet`,
 * add one bindu to house `h`.
 * Standard Parashari tables (BPHS / B.V. Raman convention).
 */
export const ASHTAKAVARGA_BINDU_HOUSES: Record<
  AshtakavargaContributor,
  Record<AshtakavargaContributor, number[]>
> = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],
    Moon: [3, 6, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 8, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [1, 3, 4, 6, 7, 9, 10, 11],
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11],
    Moon: [1, 3, 6, 7, 9, 10, 11],
    Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 2, 4, 7, 8, 10, 11],
    Venus: [1, 3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 10, 11, 12],
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11],
    Moon: [3, 6, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11],
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12],
    Moon: [2, 4, 6, 8, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 8, 9, 10, 11],
    Jupiter: [1, 2, 4, 6, 8, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 3, 5, 6, 9, 10, 11, 12],
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon: [2, 5, 7, 9, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12],
  },
  Venus: {
    Sun: [8, 11, 12],
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11],
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11],
    Moon: [3, 6, 7, 10, 11],
    Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [1, 3, 5, 6, 10, 11],
    Jupiter: [1, 2, 4, 5, 6, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 5, 6, 10, 11, 12],
  },
};
