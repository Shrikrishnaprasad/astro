import { rasiLord } from "../data/rasis";
import type { Planet } from "./types";

/** Simplified Sthana / dignity score (partial Shadbala — not full six-fold BPHS Shadbala). */
export interface PlanetDignityScore {
  planet: Planet;
  rasiIndex: number;
  house: number;
  /** 0–1 normalized positional dignity proxy. */
  sthanaScore: number;
  notes: string[];
}

const EXALTATION: Partial<Record<Planet, number>> = {
  Sun: 0,
  Moon: 1,
  Mars: 9,
  Mercury: 5,
  Jupiter: 3,
  Venus: 11,
  Saturn: 6,
};

const DEBILITATION: Partial<Record<Planet, number>> = {
  Sun: 6,
  Moon: 7,
  Mars: 3,
  Mercury: 11,
  Jupiter: 9,
  Venus: 5,
  Saturn: 0,
};

const OWN_SIGNS: Partial<Record<Planet, number[]>> = {
  Sun: [4],
  Moon: [3],
  Mars: [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus: [1, 6],
  Saturn: [9, 10],
};

const FRIENDS: Record<string, string[]> = {
  Sun: ["Moon", "Mars", "Jupiter"],
  Moon: ["Sun", "Mercury"],
  Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"],
  Jupiter: ["Sun", "Moon", "Mars"],
  Venus: ["Mercury", "Saturn"],
  Saturn: ["Mercury", "Venus"],
};

function dignityScore(planet: Planet, rasiIndex: number): { score: number; notes: string[] } {
  const notes: string[] = [];
  if (EXALTATION[planet] === rasiIndex) {
    notes.push("Exaltation");
    return { score: 1, notes };
  }
  if (DEBILITATION[planet] === rasiIndex) {
    notes.push("Debilitation");
    return { score: 0.15, notes };
  }
  if (OWN_SIGNS[planet]?.includes(rasiIndex)) {
    notes.push("Own sign");
    return { score: 0.85, notes };
  }
  const lord = rasiLord(rasiIndex);
  if (lord === planet) {
    notes.push("Own sign (lord)");
    return { score: 0.85, notes };
  }
  if ((FRIENDS[planet] ?? []).includes(lord)) {
    notes.push(`Friend sign (${lord})`);
    return { score: 0.65, notes };
  }
  notes.push(`Neutral/enemy sign (${lord})`);
  return { score: 0.45, notes };
}

export function computePartialShadbala(
  planetRasiIndex: Record<Planet, number>,
  planetHouses: Record<Planet, number>,
): PlanetDignityScore[] {
  const planets: Planet[] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
  return planets.map((planet) => {
    const rasiIndex = planetRasiIndex[planet];
    const { score, notes } = dignityScore(planet, rasiIndex);
    return {
      planet,
      rasiIndex,
      house: planetHouses[planet],
      sthanaScore: score,
      notes,
    };
  });
}
