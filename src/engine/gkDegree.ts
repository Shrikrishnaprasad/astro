import { normalizeDegrees } from "./constants";
import type { ChartResult, LongitudeMap, Planet } from "./types";
import { PLANETS } from "./types";

/** Public GK பாகை முறை orb: planets within ±3° of degree-in-sign act as a yoga. */
export const GK_DEGREE_ORB = 3;

/** Treat as exact when degree-in-sign difference is under 1 arcminute. */
export const GK_EXACT_ORB = 1 / 60;

export type GkPointId = Planet | "Lagna";

export interface GkDegreePoint {
  id: GkPointId;
  longitude: number;
  rasiIndex: number;
  degreeInRasi: number;
}

export interface GkDegreePair {
  a: GkPointId;
  b: GkPointId;
  degreeDelta: number;
  houseCount: number;
  isSixthOrEighth: boolean;
}

export type GkTransitStatus = "approaching" | "exact" | "passed";

export interface GkTransitHit {
  natal: GkPointId;
  transit: GkPointId;
  natalDegree: number;
  transitDegree: number;
  degreeDelta: number;
  status: GkTransitStatus;
}

export interface GkSensitiveHit {
  label: "Bhrigu Bindu" | "Rahu-Ketu midpoint";
  targetLongitude: number;
  transit: GkPointId;
  transitLongitude: number;
  eclipticDelta: number;
}

export interface GkNatalAnalysis {
  points: GkDegreePoint[];
  rankedPlanets: GkDegreePoint[];
  highest: GkDegreePoint;
  lowest: GkDegreePoint;
  tiesHighest: GkDegreePoint[];
  tiesLowest: GkDegreePoint[];
  combinations: GkDegreePair[];
  nearJupiter: GkPointId[];
  nearRahuKetu: GkPointId[];
  rahuKetuAxisMidpoints: [number, number];
  planetsOnRkMidpoint: GkPointId[];
  bhriguBindu: number;
  planetsOnBhriguBindu: GkPointId[];
}

export function degreeInRasi(longitude: number): number {
  return normalizeDegrees(longitude) % 30;
}

export function degreeDeltaInRasi(aLongitude: number, bLongitude: number): number {
  return Math.abs(degreeInRasi(aLongitude) - degreeInRasi(bLongitude));
}

export function shortestEclipticDelta(a: number, b: number): number {
  return Math.abs(((normalizeDegrees(b) - normalizeDegrees(a) + 540) % 360) - 180);
}

/** Midpoint along the shorter ecliptic arc from `a` to `b`. */
export function shorterArcMidpoint(a: number, b: number): number {
  const signed = ((normalizeDegrees(b) - normalizeDegrees(a) + 540) % 360) - 180;
  return normalizeDegrees(a + signed / 2);
}

export function houseCountFrom(aRasi: number, bRasi: number): number {
  return (((bRasi - aRasi) % 12) + 12) % 12 + 1;
}

export function makeGkPoint(id: GkPointId, longitude: number): GkDegreePoint {
  const lon = normalizeDegrees(longitude);
  const rasiIndex = Math.floor(lon / 30);
  return {
    id,
    longitude: lon,
    rasiIndex,
    degreeInRasi: lon - rasiIndex * 30,
  };
}

export function gkPointsFromLongitudes(
  planetLongitudes: LongitudeMap,
  lagnaLongitude: number,
): GkDegreePoint[] {
  return [
    ...PLANETS.map((planet) => makeGkPoint(planet, planetLongitudes[planet])),
    makeGkPoint("Lagna", lagnaLongitude),
  ];
}

function pairKey(a: GkPointId, b: GkPointId): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function findDegreeCombinations(
  left: GkDegreePoint[],
  right: GkDegreePoint[] = left,
  orb = GK_DEGREE_ORB,
): GkDegreePair[] {
  const sameSet = left === right;
  const seen = new Set<string>();
  const pairs: GkDegreePair[] = [];

  for (const a of left) {
    for (const b of right) {
      if (sameSet && a.id === b.id) continue;
      const key = sameSet ? pairKey(a.id, b.id) : `${a.id}>${b.id}`;
      if (seen.has(key)) continue;
      const degreeDelta = Math.abs(a.degreeInRasi - b.degreeInRasi);
      if (degreeDelta > orb) continue;
      seen.add(key);
      const houseCount = houseCountFrom(a.rasiIndex, b.rasiIndex);
      pairs.push({
        a: a.id,
        b: b.id,
        degreeDelta,
        houseCount,
        isSixthOrEighth: houseCount === 6 || houseCount === 8,
      });
    }
  }

  return pairs.sort((x, y) => x.degreeDelta - y.degreeDelta);
}

export function computeGkNatalFromLongitudes(
  planetLongitudes: LongitudeMap,
  lagnaLongitude: number,
  orb = GK_DEGREE_ORB,
): GkNatalAnalysis {
  const points = gkPointsFromLongitudes(planetLongitudes, lagnaLongitude);
  const rankedPlanets = points
    .filter((p) => p.id !== "Lagna")
    .slice()
    .sort((a, b) => b.degreeInRasi - a.degreeInRasi);

  const highest = rankedPlanets[0];
  const lowest = rankedPlanets[rankedPlanets.length - 1];
  const tiesHighest = rankedPlanets.filter((p) => p.degreeInRasi === highest.degreeInRasi);
  const tiesLowest = rankedPlanets.filter((p) => p.degreeInRasi === lowest.degreeInRasi);

  const jupiter = points.find((p) => p.id === "Jupiter")!;
  const rahu = points.find((p) => p.id === "Rahu")!;
  const ketu = points.find((p) => p.id === "Ketu")!;
  const moon = points.find((p) => p.id === "Moon")!;

  const nearJupiter = points
    .filter((p) => p.id !== "Jupiter" && Math.abs(p.degreeInRasi - jupiter.degreeInRasi) <= orb)
    .map((p) => p.id);
  const nearRahuKetu = points
    .filter(
      (p) =>
        p.id !== "Rahu" &&
        p.id !== "Ketu" &&
        (Math.abs(p.degreeInRasi - rahu.degreeInRasi) <= orb ||
          Math.abs(p.degreeInRasi - ketu.degreeInRasi) <= orb),
    )
    .map((p) => p.id);

  const mid1 = shorterArcMidpoint(rahu.longitude, ketu.longitude);
  const mid2 = normalizeDegrees(mid1 + 180);
  const rahuKetuAxisMidpoints: [number, number] = [mid1, mid2];
  const bhriguBindu = shorterArcMidpoint(moon.longitude, rahu.longitude);

  const planetsOnRkMidpoint = points
    .filter(
      (p) =>
        p.id !== "Rahu" &&
        p.id !== "Ketu" &&
        rahuKetuAxisMidpoints.some((mid) => shortestEclipticDelta(p.longitude, mid) <= orb),
    )
    .map((p) => p.id);
  const planetsOnBhriguBindu = points
    .filter((p) => p.id !== "Moon" && p.id !== "Rahu" && shortestEclipticDelta(p.longitude, bhriguBindu) <= orb)
    .map((p) => p.id);

  return {
    points,
    rankedPlanets,
    highest,
    lowest,
    tiesHighest,
    tiesLowest,
    combinations: findDegreeCombinations(points, points, orb),
    nearJupiter,
    nearRahuKetu,
    rahuKetuAxisMidpoints,
    planetsOnRkMidpoint,
    bhriguBindu,
    planetsOnBhriguBindu,
  };
}

export function computeGkNatal(chart: ChartResult, orb = GK_DEGREE_ORB): GkNatalAnalysis {
  return computeGkNatalFromLongitudes(chart.planetLongitudes, chart.lagnaLongitude, orb);
}

export function transitDegreeStatus(
  natalDegree: number,
  transitDegree: number,
  retrograde: boolean,
): GkTransitStatus {
  const delta = transitDegree - natalDegree;
  if (Math.abs(delta) <= GK_EXACT_ORB) return "exact";
  if (retrograde) return delta > 0 ? "approaching" : "passed";
  return delta < 0 ? "approaching" : "passed";
}

export function computeGkTransitHits(
  natal: GkNatalAnalysis,
  transitLongitudes: LongitudeMap,
  transitLagnaLongitude: number,
  retrograde: Partial<Record<Planet, boolean>> = {},
  orb = GK_DEGREE_ORB,
): GkTransitHit[] {
  const transitPoints = gkPointsFromLongitudes(transitLongitudes, transitLagnaLongitude);
  const hits: GkTransitHit[] = [];

  for (const natalPoint of natal.points) {
    for (const transitPoint of transitPoints) {
      const degreeDelta = Math.abs(natalPoint.degreeInRasi - transitPoint.degreeInRasi);
      if (degreeDelta > orb) continue;
      const isRetrograde =
        transitPoint.id !== "Lagna" && Boolean(retrograde[transitPoint.id as Planet]);
      hits.push({
        natal: natalPoint.id,
        transit: transitPoint.id,
        natalDegree: natalPoint.degreeInRasi,
        transitDegree: transitPoint.degreeInRasi,
        degreeDelta,
        status: transitDegreeStatus(natalPoint.degreeInRasi, transitPoint.degreeInRasi, isRetrograde),
      });
    }
  }

  return hits.sort((a, b) => a.degreeDelta - b.degreeDelta);
}

export function computeGkSensitiveTransitHits(
  natal: GkNatalAnalysis,
  transitLongitudes: LongitudeMap,
  transitLagnaLongitude: number,
  orb = GK_DEGREE_ORB,
): GkSensitiveHit[] {
  const transitPoints = gkPointsFromLongitudes(transitLongitudes, transitLagnaLongitude);
  const targets: Array<{ label: GkSensitiveHit["label"]; longitude: number }> = [
    { label: "Bhrigu Bindu", longitude: natal.bhriguBindu },
    { label: "Rahu-Ketu midpoint", longitude: natal.rahuKetuAxisMidpoints[0] },
    { label: "Rahu-Ketu midpoint", longitude: natal.rahuKetuAxisMidpoints[1] },
  ];
  const hits: GkSensitiveHit[] = [];
  for (const target of targets) {
    for (const transitPoint of transitPoints) {
      const eclipticDelta = shortestEclipticDelta(transitPoint.longitude, target.longitude);
      if (eclipticDelta > orb) continue;
      hits.push({
        label: target.label,
        targetLongitude: target.longitude,
        transit: transitPoint.id,
        transitLongitude: transitPoint.longitude,
        eclipticDelta,
      });
    }
  }
  return hits.sort((a, b) => a.eclipticDelta - b.eclipticDelta);
}

export function computeGkSynastry(
  native: GkNatalAnalysis,
  other: GkNatalAnalysis,
  orb = GK_DEGREE_ORB,
): GkDegreePair[] {
  return findDegreeCombinations(native.points, other.points, orb);
}

export function isGkHealthDasaLord(analysis: GkNatalAnalysis, lord: string): boolean {
  return analysis.highest.id === lord || analysis.lowest.id === lord;
}

export function pairInvolvesLords(pair: GkDegreePair, lords: string[]): boolean {
  return lords.includes(pair.a) && lords.includes(pair.b);
}
