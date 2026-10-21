import {
  ASHTAKAVARGA_BINDU_HOUSES,
  ASHTAKAVARGA_CONTRIBUTORS,
  type AshtakavargaContributor,
} from "../data/ashtakavargaTables";
import { rasiToHouseNumber } from "./houses";
import type { Planet } from "./types";

export interface Bhinnashtakavarga {
  planet: AshtakavargaContributor;
  /** Bindus in houses 1–12 from this planet's rasi sign. */
  bindus: number[];
  total: number;
}

export interface AshtakavargaResult {
  bhinna: Bhinnashtakavarga[];
  /** Sarvashtakavarga: sum of seven BAVs per house (from lagna rasi). */
  sarva: number[];
  sarvaTotal: number;
}

function buildBav(
  bavPlanet: AshtakavargaContributor,
  planetRasiIndex: Record<AshtakavargaContributor, number>,
): Bhinnashtakavarga {
  const bindus = Array.from({ length: 12 }, () => 0);
  const bavSign = planetRasiIndex[bavPlanet];

  for (const contributor of ASHTAKAVARGA_CONTRIBUTORS) {
    const houseFromBav = rasiToHouseNumber(bavSign, planetRasiIndex[contributor]);
    const beneficHouses = ASHTAKAVARGA_BINDU_HOUSES[bavPlanet][contributor];
    if (beneficHouses.includes(houseFromBav)) {
      bindus[houseFromBav - 1] += 1;
    }
  }

  return {
    planet: bavPlanet,
    bindus,
    total: bindus.reduce((a, b) => a + b, 0),
  };
}

export function computeAshtakavarga(
  planetRasiIndex: Record<Planet, number>,
  lagnaRasiIndex: number,
): AshtakavargaResult {
  const core = {} as Record<AshtakavargaContributor, number>;
  for (const p of ASHTAKAVARGA_CONTRIBUTORS) {
    core[p] = planetRasiIndex[p];
  }

  const bhinna = ASHTAKAVARGA_CONTRIBUTORS.map((p) => buildBav(p, core));
  const sarva = Array.from({ length: 12 }, () => 0);

  for (const bav of bhinna) {
    const planetSign = core[bav.planet];
    for (let house = 1; house <= 12; house++) {
      const houseRasi = (lagnaRasiIndex + house - 1) % 12;
      const houseFromPlanet = rasiToHouseNumber(planetSign, houseRasi);
      sarva[house - 1] += bav.bindus[houseFromPlanet - 1];
    }
  }

  return {
    bhinna,
    sarva,
    sarvaTotal: sarva.reduce((a, b) => a + b, 0),
  };
}
