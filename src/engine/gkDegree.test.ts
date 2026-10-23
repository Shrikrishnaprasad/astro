import { describe, expect, it } from "vitest";
import type { LongitudeMap } from "./types";
import { PLANETS } from "./types";
import {
  computeGkNatalFromLongitudes,
  computeGkSynastry,
  computeGkTransitHits,
  degreeDeltaInRasi,
  degreeInRasi,
  findDegreeCombinations,
  gkPointsFromLongitudes,
  houseCountFrom,
  shorterArcMidpoint,
  shortestEclipticDelta,
  transitDegreeStatus,
} from "./gkDegree";

function longs(partial: Partial<LongitudeMap>): LongitudeMap {
  const base = {} as LongitudeMap;
  for (const planet of PLANETS) base[planet] = 0;
  return { ...base, ...partial };
}

describe("degree helpers", () => {
  it("reads degree-in-sign without wrapping 29° vs 1° as close", () => {
    expect(degreeInRasi(29)).toBeCloseTo(29);
    expect(degreeInRasi(31)).toBeCloseTo(1);
    expect(degreeDeltaInRasi(29, 31)).toBeCloseTo(28);
  });

  it("counts Vedic houses inclusively (6th / 8th are complements)", () => {
    expect(houseCountFrom(1, 1)).toBe(1);
    expect(houseCountFrom(1, 6)).toBe(6);
    expect(houseCountFrom(1, 8)).toBe(8);
    expect(houseCountFrom(1, 6)).toBe(6);
    expect(houseCountFrom(6, 1)).toBe(8);
  });

  it("takes the shorter-arc midpoint", () => {
    expect(shorterArcMidpoint(0, 20)).toBeCloseTo(10);
    expect(shorterArcMidpoint(350, 10)).toBeCloseTo(0);
    expect(shortestEclipticDelta(0, 350)).toBeCloseTo(10);
  });
});

describe("GK பாகை combinations", () => {
  it("joins planets within 3° even across 6/8 rasis", () => {
    // Mars Vrishabha 15°, Venus Tula 12° — 6th from each other, 3° apart.
    const mars = 30 + 15;
    const venus = 180 + 12;
    const points = gkPointsFromLongitudes(
      longs({ Mars: mars, Venus: venus }),
      0,
    );
    const pairs = findDegreeCombinations(
      points.filter((p) => p.id === "Mars" || p.id === "Venus"),
    );
    expect(pairs).toHaveLength(1);
    expect(pairs[0].degreeDelta).toBeCloseTo(3);
    expect(pairs[0].isSixthOrEighth).toBe(true);
  });

  it("still joins close degrees in unrelated signs (Taurus / Kumbha)", () => {
    const points = gkPointsFromLongitudes(longs({ Mars: 30 + 15, Venus: 300 + 12 }), 0);
    const pairs = findDegreeCombinations(points.filter((p) => p.id === "Mars" || p.id === "Venus"));
    expect(pairs).toHaveLength(1);
    expect(pairs[0].isSixthOrEighth).toBe(false);
  });

  it("does not join 29° and 1° in different signs", () => {
    const points = gkPointsFromLongitudes(longs({ Sun: 29, Moon: 30 + 1 }), 0);
    const pairs = findDegreeCombinations(points.filter((p) => p.id === "Sun" || p.id === "Moon"));
    expect(pairs).toHaveLength(0);
  });
});

describe("computeGkNatalFromLongitudes", () => {
  it("ranks highest and lowest by degree-in-sign", () => {
    const result = computeGkNatalFromLongitudes(
      longs({
        Sun: 10,
        Moon: 40, // 10° in Taurus
        Mars: 28,
        Mercury: 2,
        Jupiter: 100, // Kataka 10° — same degree-in-sign as Sun/Moon
        Venus: 200,
        Saturn: 15,
        Rahu: 188,
        Ketu: 8,
      }),
      13, // Lagna 13°
    );
    expect(result.highest.id).toBe("Mars");
    expect(result.lowest.id).toBe("Mercury");
    expect(result.nearJupiter).toContain("Moon"); // both 10°
    expect(result.nearRahuKetu).toContain("Sun"); // Sun 10°, Ketu 8°
    expect(result.combinations.some((p) => p.a === "Lagna" || p.b === "Lagna")).toBe(true);
  });
});

describe("transit degree status", () => {
  it("marks direct motion as approaching before the natal degree and passed after", () => {
    expect(transitDegreeStatus(15, 13, false)).toBe("approaching");
    expect(transitDegreeStatus(15, 15, false)).toBe("exact");
    expect(transitDegreeStatus(15, 16, false)).toBe("passed");
  });

  it("reverses approaching/passed when the transit graha is retrograde", () => {
    expect(transitDegreeStatus(15, 16, true)).toBe("approaching");
    expect(transitDegreeStatus(15, 14, true)).toBe("passed");
  });

  it("lists transit Lagna near a natal planet", () => {
    const natal = computeGkNatalFromLongitudes(longs({ Saturn: 15 }), 0);
    const hits = computeGkTransitHits(natal, longs({}), 14.2);
    const lagnaHit = hits.find((h) => h.transit === "Lagna" && h.natal === "Saturn");
    expect(lagnaHit).toBeTruthy();
    expect(lagnaHit!.status).toBe("approaching");
  });
});

describe("synastry overlay", () => {
  it("treats the other chart's matching degree as a combination", () => {
    const native = computeGkNatalFromLongitudes(longs({ Saturn: 18 }), 0);
    const other = computeGkNatalFromLongitudes(longs({ Jupiter: 16.5 }), 5);
    const pairs = computeGkSynastry(native, other);
    expect(pairs.some((p) => p.a === "Saturn" && p.b === "Jupiter")).toBe(true);
  });
});
