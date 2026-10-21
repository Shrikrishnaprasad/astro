import { describe, expect, it } from "vitest";
import { getAyanamsa, getKpAyanamsa, getLahiriAyanamsa, KP_AYANAMSA_AT_EPOCH_DEGREES } from "./ayanamsa";

describe("getLahiriAyanamsa", () => {
  it("matches the known J2000.0 reference value", () => {
    const j2000 = new Date("2000-01-01T12:00:00Z");
    expect(getLahiriAyanamsa(j2000)).toBeCloseTo(23.8531, 3);
  });

  it("increases over time at roughly the precession rate", () => {
    const y2000 = getLahiriAyanamsa(new Date("2000-01-01T12:00:00Z"));
    const y2024 = getLahiriAyanamsa(new Date("2024-01-01T12:00:00Z"));
    const driftPerYear = (y2024 - y2000) / 24;
    expect(driftPerYear).toBeCloseTo(50.2877 / 3600, 4);
  });
});

describe("getKpAyanamsa", () => {
  it("matches 22°27′37″ at the start of calendar year 1900", () => {
    const epoch = new Date("1900-01-01T00:00:00Z");
    expect(getKpAyanamsa(epoch)).toBeCloseTo(KP_AYANAMSA_AT_EPOCH_DEGREES, 6);
  });

  it("matches published example for calendar year 2025 (≈ 24°12′08″)", () => {
    const y2025 = new Date("2025-01-01T12:00:00Z");
    // 22°27′37″ + 125 × 50.2388475″
    expect(getKpAyanamsa(y2025)).toBeCloseTo(24 + 12 / 60 + 8.28 / 3600, 2);
  });

  it("is wired through getAyanamsa(kp)", () => {
    const d = new Date("2010-06-01T00:00:00Z");
    expect(getAyanamsa(d, "kp")).toBe(getKpAyanamsa(d));
  });
});
