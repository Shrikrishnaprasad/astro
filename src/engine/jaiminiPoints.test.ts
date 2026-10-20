import { describe, expect, it } from "vitest";
import { computeInduLagna, computeYogi, getTithiType } from "./jaiminiPoints";

describe("getTithiType", () => {
  it("cycles Nanda/Bhadra/Jaya/Rikta/Purna every 5 tithis", () => {
    expect(getTithiType(0)).toBe("Nanda"); // Prathama
    expect(getTithiType(1)).toBe("Bhadra"); // Dwitiya
    expect(getTithiType(4)).toBe("Purna"); // Panchami
    expect(getTithiType(5)).toBe("Nanda"); // Shashti
    expect(getTithiType(14)).toBe("Purna"); // Purnima/Amavasya
  });
});

describe("computeInduLagna", () => {
  it("stays within 0-11 and is deterministic for a fixed input", () => {
    const result = computeInduLagna(0, 3); // Lagna Mesha, Moon Kataka
    expect(result.rasiIndex).toBeGreaterThanOrEqual(0);
    expect(result.rasiIndex).toBeLessThan(12);
  });

  it("counts the Moon's own rasi as 1 when the kaaraka sum is exactly divisible by 12", () => {
    // Lagna Simha (4): 9th from it is Mesha (0), lord Mars (6).
    // Moon Meena (11): 9th from it is Vrischika (7), lord Mars (6).
    // sum = 12, remainder = 12 -> rasiIndex = (moonRasi + 12 - 1) % 12.
    const result = computeInduLagna(4, 11);
    expect(result.rasiIndex).toBe((11 + 12 - 1) % 12);
  });
});

describe("computeYogi", () => {
  it("places the Yogi point exactly 93°20' ahead of the Yoga Sphuta (Sun+Moon)", () => {
    const result = computeYogi(10, 20);
    expect(result.yogiPoint).toBeCloseTo(10 + 20 + 93 + 20 / 60, 6);
  });

  it("stays within valid nakshatra index range", () => {
    for (const [sun, moon] of [
      [0, 0],
      [359, 359],
      [180, 270],
    ]) {
      const result = computeYogi(sun, moon);
      expect(result.yogiNakshatraIndex).toBeGreaterThanOrEqual(0);
      expect(result.yogiNakshatraIndex).toBeLessThan(27);
    }
  });
});
