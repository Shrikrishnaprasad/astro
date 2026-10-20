import { describe, expect, it } from "vitest";
import { getLahiriAyanamsa } from "./ayanamsa";

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
