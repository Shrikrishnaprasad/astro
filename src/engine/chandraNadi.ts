import { RASIS } from "../data/rasis";
import { normalizeDegrees } from "./constants";
import { rasiToHouseNumber } from "./houses";
import type { LongitudeMap, Planet } from "./types";
import { PLANETS } from "./types";

const UNFAVOURABLE_HOUSES = new Set([6, 8, 12]);
const EXACT_ORB = 1 / 60;

export type ChandraNadiRelation = "conjunction" | "aspect";

export interface ChandraNadiLink {
  planet: Planet;
  relation: ChandraNadiRelation;
  aspectHouse: number;
  houseFromPlanet: number;
}

export interface ChandraNadiPassage {
  planet: Planet;
  longitude: number;
  rasiIndex: number;
  degreeInRasi: number;
  delta: number;
}

export interface ChandraNadiResult {
  transitMoonLongitude: number;
  transitMoonRasiIndex: number;
  transitMoonDegree: number;
  transitMoonRasiName: string;
  querySignificators: ChandraNadiLink[];
  justCrossed: ChandraNadiPassage[];
  nextTouch: ChandraNadiPassage[];
  unfavourable: ChandraNadiLink[];
}

/** Whole-sign Parashara aspects; Rahu/Ketu use 5/7/9 as in this app's karaka notes. */
export function parasharaAspectHouses(planet: Planet): number[] {
  switch (planet) {
    case "Mars":
      return [4, 7, 8];
    case "Jupiter":
      return [5, 7, 9];
    case "Saturn":
      return [3, 7, 10];
    case "Rahu":
    case "Ketu":
      return [5, 7, 9];
    default:
      return [7];
  }
}

export function computeChandraNadi(
  natalLongitudes: LongitudeMap,
  transitMoonLongitude: number,
): ChandraNadiResult {
  const moonLon = normalizeDegrees(transitMoonLongitude);
  const moonRasi = Math.floor(moonLon / 30);
  const moonDegree = moonLon - moonRasi * 30;

  const querySignificators: ChandraNadiLink[] = [];
  const unfavourable: ChandraNadiLink[] = [];
  const behind: ChandraNadiPassage[] = [];
  const ahead: ChandraNadiPassage[] = [];

  for (const planet of PLANETS) {
    const longitude = normalizeDegrees(natalLongitudes[planet]);
    const rasiIndex = Math.floor(longitude / 30);
    const degreeInRasi = longitude - rasiIndex * 30;
    const houseFromPlanet = rasiToHouseNumber(rasiIndex, moonRasi);
    const aspects = parasharaAspectHouses(planet);

    if (rasiIndex === moonRasi) {
      querySignificators.push({
        planet,
        relation: "conjunction",
        aspectHouse: 1,
        houseFromPlanet,
      });
    } else if (aspects.includes(houseFromPlanet)) {
      querySignificators.push({
        planet,
        relation: "aspect",
        aspectHouse: houseFromPlanet,
        houseFromPlanet,
      });
    }

    if (UNFAVOURABLE_HOUSES.has(houseFromPlanet) && planet !== "Moon") {
      unfavourable.push({
        planet,
        relation: rasiIndex === moonRasi ? "conjunction" : "aspect",
        aspectHouse: houseFromPlanet,
        houseFromPlanet,
      });
    }

    if (planet === "Moon") continue;

    const forward = (longitude - moonLon + 360) % 360;
    const backward = (moonLon - longitude + 360) % 360;
    if (forward <= EXACT_ORB || backward <= EXACT_ORB) continue;

    const passage: ChandraNadiPassage = {
      planet,
      longitude,
      rasiIndex,
      degreeInRasi,
      delta: 0,
    };
    if (forward < backward) {
      ahead.push({ ...passage, delta: forward });
    } else {
      behind.push({ ...passage, delta: backward });
    }
  }

  behind.sort((a, b) => a.delta - b.delta);
  ahead.sort((a, b) => a.delta - b.delta);

  const justCrossedInSign = behind.filter((p) => p.rasiIndex === moonRasi);
  const nextInSign = ahead.filter((p) => p.rasiIndex === moonRasi);

  return {
    transitMoonLongitude: moonLon,
    transitMoonRasiIndex: moonRasi,
    transitMoonDegree: moonDegree,
    transitMoonRasiName: RASIS[moonRasi].nameEnglish,
    querySignificators,
    justCrossed: justCrossedInSign.length ? justCrossedInSign : behind.slice(0, 1),
    nextTouch: nextInSign.length ? nextInSign : ahead.slice(0, 1),
    unfavourable,
  };
}
