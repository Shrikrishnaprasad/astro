import { describe, expect, it } from "vitest";
import { getAyanamsa } from "./ayanamsa";
import { getMeanRahuKetuTropical, getTrueRahuKetuTropical } from "./lunarNodes";

describe("ephemeris options", () => {
  const date = new Date("2000-06-15T12:00:00Z");

  it("lahiri-true ayanamsa differs from mean by nutation scale", () => {
    const mean = getAyanamsa(date, "lahiri-mean");
    const tru = getAyanamsa(date, "lahiri-true");
    expect(Math.abs(tru - mean)).toBeLessThan(0.05);
    expect(tru).not.toBeCloseTo(mean, 5);
  });

  it("true node differs from mean node", () => {
    const mean = getMeanRahuKetuTropical(date);
    const tru = getTrueRahuKetuTropical(date);
    expect(Math.abs(tru.rahu - mean.rahu)).toBeGreaterThan(0);
    expect(Math.abs(tru.rahu - mean.rahu)).toBeLessThan(2.5);
  });
});
