import {
  findPlacidusBhavaHouse,
  kpLordChainAtLongitude,
  type KpCuspInfo,
  type KpLordChain,
  type KpSystemResult,
} from "./kp";
import type { EphemerisSettings } from "./ephemerisSettings";
import { DEFAULT_EPHEMERIS_SETTINGS, resolveEphemerisSettings } from "./ephemerisSettings";
import { normalizeDegrees } from "./constants";
import { getSiderealAscendant } from "./ascendant";
import { getSiderealLongitudes } from "./planetaryPositions";
import { getSunriseSunset } from "./sunTimes";
import type { Planet } from "./types";
import { PLANETS } from "./types";

export interface KpFortunaInfo extends KpLordChain {
  isDayChart: boolean;
  formula: "Asc + Moon − Sun" | "Asc + Sun − Moon";
  bhavaHouse: number;
}

/**
 * Part of Fortune (Fortuna) in KP/Western hybrid style:
 * day chart Asc + Moon − Sun; night chart Asc + Sun − Moon.
 */
export function computeKpFortuna(
  date: Date,
  latitude: number,
  longitude: number,
  cusps: KpCuspInfo[],
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): KpFortunaInfo | null {
  const resolved = resolveEphemerisSettings(settings);
  const { sunrise, sunset } = getSunriseSunset(date, latitude, longitude);
  if (!sunrise || !sunset) return null;
  const isDayChart = date >= sunrise && date < sunset;
  const asc = getSiderealAscendant(date, latitude, longitude, resolved);
  const lons = getSiderealLongitudes(date, resolved);
  const formula = isDayChart ? ("Asc + Moon − Sun" as const) : ("Asc + Sun − Moon" as const);
  const raw = isDayChart
    ? asc + lons.Moon - lons.Sun
    : asc + lons.Sun - lons.Moon;
  const lon = normalizeDegrees(raw);
  const chain = kpLordChainAtLongitude(lon);
  return {
    ...chain,
    isDayChart,
    formula,
    bhavaHouse: findPlacidusBhavaHouse(lon, cusps),
  };
}

export interface KpNodeDetail {
  planet: "Rahu" | "Ketu";
  chain: KpLordChain;
  bhavaHouse: number;
  isUntenanted: boolean;
  conjoined: Planet[];
  starLord: Planet;
  signLord: Planet;
  agentHouses: number[];
  agentNote: string;
  oppositeNode: "Rahu" | "Ketu";
}

export function buildKpNodeDetails(kp: KpSystemResult): KpNodeDetail[] {
  return (["Rahu", "Ketu"] as const).map((node) => {
    const info = kp.planets[node];
    const row = kp.planetSignificators.find((r) => r.planet === node)!;
    const conjoined = PLANETS.filter(
      (p) => p !== node && kp.planets[p].rasiIndex === info.rasiIndex,
    );
    return {
      planet: node,
      chain: info,
      bhavaHouse: info.bhavaHouse,
      isUntenanted: info.isUntenanted,
      conjoined,
      starLord: info.nakshatraLord as Planet,
      signLord: info.rasiLord as Planet,
      agentHouses: row.allHouses,
      agentNote: row.nodeAgentNote ?? "",
      oppositeNode: node === "Rahu" ? "Ketu" : "Rahu",
    };
  });
}
