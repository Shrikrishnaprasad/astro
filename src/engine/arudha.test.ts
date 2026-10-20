import { describe, expect, it } from "vitest";
import type { Planet } from "./types";
import { computeArudhaPada } from "./arudha";

function planetRasis(overrides: Partial<Record<Planet, number>>): Record<Planet, number> {
  const base: Record<Planet, number> = {
    Sun: 0,
    Moon: 0,
    Mercury: 0,
    Venus: 0,
    Mars: 0,
    Jupiter: 0,
    Saturn: 0,
    Rahu: 0,
    Ketu: 0,
  };
  return { ...base, ...overrides };
}

describe("computeArudhaPada", () => {
  it("counts the lord's distance forward from the lord's own sign (no exception)", () => {
    // Lagna = Mesha (0). House 1 lord = Mars. Put Mars in Simha (4).
    // n = distance from house rasi (0, Mesha) to lord rasi (4, Simha) = 5 (inclusive count).
    // candidate = (2*4 - 0) % 12 = 8 (Dhanu) -> not same/7th from Mesha (0, 6) -> no exception.
    const lagnaRasi = 0;
    const rasis = planetRasis({ Mars: 4 });
    const arudha = computeArudhaPada(1, lagnaRasi, rasis);
    expect(arudha).toBe(8);
  });

  it("applies the 10th-sign exception when the candidate lands on the house itself", () => {
    // Lagna = Mesha (0). House 1 lord = Mars. Put Mars in Mesha (0) itself.
    // candidate = (2*0 - 0) % 12 = 0 === houseRasi -> exception: (0+9)%12 = 9.
    const lagnaRasi = 0;
    const rasis = planetRasis({ Mars: 0 });
    const arudha = computeArudhaPada(1, lagnaRasi, rasis);
    expect(arudha).toBe(9);
  });

  it("applies the 10th-sign exception when the candidate lands on the 7th from the house", () => {
    // Lagna = Mesha (0). House 1 lord = Mars. Put Mars in Tula (6), the 7th from Mesha.
    // candidate = (2*6 - 0) % 12 = 0. Wait: need candidate to equal 7th-from-house (6), not 0.
    // Choose Mars rasi = 3 (Kataka): candidate = (2*3 - 0) % 12 = 6 = 7th from house (0+6=6) -> exception.
    const lagnaRasi = 0;
    const rasis = planetRasis({ Mars: 3 });
    const arudha = computeArudhaPada(1, lagnaRasi, rasis);
    expect(arudha).toBe((6 + 9) % 12);
  });

  it("computes a non-first-house Arudha Pada (A7 / Dara Pada) correctly", () => {
    // Lagna = Mesha (0). House 7 occupies Tula (6), lord = Venus. Put Venus in Kataka (3).
    // candidate = (2*3 - 6) % 12 = 0 -> equals 7th-from-house(house=6, 7th=0) -> exception.
    const lagnaRasi = 0;
    const rasis = planetRasis({ Venus: 3 });
    const arudha = computeArudhaPada(7, lagnaRasi, rasis);
    expect(arudha).toBe((0 + 9) % 12);
  });
});
