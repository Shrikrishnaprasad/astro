import type {
  KpCuspInfo,
  KpPlanetSignificatorRow,
  KpSystemResult,
} from "./kp";
import type { Planet } from "./types";
import { PLANETS } from "./types";

export type KpInterlinkCell = "star" | "sub" | "both" | "sig";

export interface KpCuspInterlink {
  house: number;
  signLord: Planet;
  starLord: Planet;
  subLord: Planet;
  /** Houses the cusp Sub-Lord signifies (classic cuspal interlink). */
  linkedHouses: number[];
  /** Houses via the Sub-Lord's Star Lord (results channel). */
  linkedViaStar: number[];
  /** All A/B/C/D significators for this house. */
  significators: Planet[];
  /** Planets whose Sub-Lord houses include this house (deciding filter). */
  decidingPlanets: Planet[];
  /** Planets whose Star-Lord houses include this house (results). */
  resultPlanets: Planet[];
}

export interface KpPlanetInterlink {
  planet: Planet;
  housesViaStar: number[];
  housesViaSub: number[];
  /** Cusps whose Sub-Lord is this planet. */
  cuspsAsSubLord: number[];
  /** Cusps whose Star-Lord is this planet. */
  cuspsAsStarLord: number[];
}

export interface KpInterlinksResult {
  byCusp: KpCuspInterlink[];
  byPlanet: KpPlanetInterlink[];
  /** planet → house → how the planet links that house. */
  matrix: Record<Planet, Partial<Record<number, KpInterlinkCell>>>;
}

function rowMap(kp: KpSystemResult): Record<Planet, KpPlanetSignificatorRow> {
  return Object.fromEntries(kp.planetSignificators.map((r) => [r.planet, r])) as Record<
    Planet,
    KpPlanetSignificatorRow
  >;
}

function cellFor(star: boolean, sub: boolean, sig: boolean): KpInterlinkCell | undefined {
  if (star && sub) return "both";
  if (star) return "star";
  if (sub) return "sub";
  if (sig) return "sig";
  return undefined;
}

/**
 * Classic KP Cuspal Interlinks derived from an already-computed KP chart:
 * each cusp is interlinked to the houses its Sub-Lord (and that Sub-Lord's Star Lord) signify;
 * planet matrix shows houses via Star vs Sub.
 */
export function buildKpInterlinks(kp: KpSystemResult): KpInterlinksResult {
  const rows = rowMap(kp);
  const cusps: KpCuspInfo[] = kp.cusps;

  const byCusp: KpCuspInterlink[] = cusps.map((c) => {
    const sub = c.subLord as Planet;
    const star = c.nakshatraLord as Planet;
    const subRow = rows[sub];
    const decidingPlanets = PLANETS.filter((p) => rows[p].subLordHouses.includes(c.cuspNumber));
    const resultPlanets = PLANETS.filter((p) => rows[p].starLordHouses.includes(c.cuspNumber));
    const hs = kp.houseSignificators[c.cuspNumber - 1];
    return {
      house: c.cuspNumber,
      signLord: c.rasiLord as Planet,
      starLord: star,
      subLord: sub,
      linkedHouses: subRow.allHouses,
      linkedViaStar: subRow.starLordHouses,
      significators: hs.allSignificators,
      decidingPlanets,
      resultPlanets,
    };
  });

  const byPlanet: KpPlanetInterlink[] = PLANETS.map((p) => {
    const row = rows[p];
    return {
      planet: p,
      housesViaStar: row.starLordHouses,
      housesViaSub: row.subLordHouses,
      cuspsAsSubLord: cusps.filter((c) => c.subLord === p).map((c) => c.cuspNumber),
      cuspsAsStarLord: cusps.filter((c) => c.nakshatraLord === p).map((c) => c.cuspNumber),
    };
  });

  const matrix = {} as Record<Planet, Partial<Record<number, KpInterlinkCell>>>;
  for (const p of PLANETS) {
    const row = rows[p];
    const cells: Partial<Record<number, KpInterlinkCell>> = {};
    for (let h = 1; h <= 12; h++) {
      const viaStar = row.starLordHouses.includes(h);
      const viaSub = row.subLordHouses.includes(h);
      const viaSig = row.allHouses.includes(h);
      const cell = cellFor(viaStar, viaSub, viaSig);
      if (cell) cells[h] = cell;
    }
    matrix[p] = cells;
  }

  return { byCusp, byPlanet, matrix };
}
