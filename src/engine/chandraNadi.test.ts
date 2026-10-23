import { describe, expect, it } from "vitest";
import type { LongitudeMap } from "./types";
import { PLANETS } from "./types";
import { computeChandraNadi, parasharaAspectHouses } from "./chandraNadi";

function longs(partial: Partial<LongitudeMap>): LongitudeMap {
  const base = {} as LongitudeMap;
  for (const planet of PLANETS) base[planet] = 200;
  return { ...base, ...partial };
}

describe("parasharaAspectHouses", () => {
  it("gives special aspects to Mars, Jupiter and Saturn", () => {
    expect(parasharaAspectHouses("Mars")).toEqual([4, 7, 8]);
    expect(parasharaAspectHouses("Jupiter")).toEqual([5, 7, 9]);
    expect(parasharaAspectHouses("Saturn")).toEqual([3, 7, 10]);
    expect(parasharaAspectHouses("Sun")).toEqual([7]);
  });
});

describe("computeChandraNadi", () => {
  it("splits grahas in the Moon's rasi into just-crossed and next-touch", () => {
    const result = computeChandraNadi(
      longs({
        Sun: 5, // Mesha 5°
        Mars: 20, // Mesha 20°
        Jupiter: 200,
      }),
      10, // transit Moon Mesha 10°
    );
    expect(result.transitMoonRasiName).toBe("Mesha");
    expect(result.justCrossed.map((p) => p.planet)).toContain("Sun");
    expect(result.nextTouch.map((p) => p.planet)).toContain("Mars");
    expect(result.querySignificators.some((l) => l.planet === "Sun" && l.relation === "conjunction")).toBe(
      true,
    );
  });

  it("counts Jupiter in Simha as aspecting transit Moon in Mesha (9th)", () => {
    const result = computeChandraNadi(longs({ Jupiter: 120 + 5 }), 10);
    const jup = result.querySignificators.find((l) => l.planet === "Jupiter");
    expect(jup?.relation).toBe("aspect");
    expect(jup?.aspectHouse).toBe(9);
  });

  it("flags natal grahas with transit Moon in 6/8/12", () => {
    // Sun Mesha, Moon in Kanni = 6th, Vrischika = 8th, Meena = 12th
    expect(computeChandraNadi(longs({ Sun: 5 }), 150 + 2).unfavourable.some((u) => u.planet === "Sun")).toBe(
      true,
    );
    expect(computeChandraNadi(longs({ Sun: 5 }), 210 + 2).unfavourable.some((u) => u.planet === "Sun")).toBe(
      true,
    );
    expect(computeChandraNadi(longs({ Sun: 5 }), 330 + 2).unfavourable.some((u) => u.planet === "Sun")).toBe(
      true,
    );
    expect(computeChandraNadi(longs({ Sun: 5 }), 30 + 2).unfavourable.some((u) => u.planet === "Sun")).toBe(
      false,
    );
  });
});
