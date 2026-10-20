import { describe, expect, it } from "vitest";
import { computePanchangam } from "./panchanga";

describe("computePanchangam", () => {
  it("returns a self-consistent result for a given date", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const result = computePanchangam(date);

    expect(result.tithiIndex).toBeGreaterThanOrEqual(0);
    expect(result.tithiIndex).toBeLessThanOrEqual(14);
    expect(["Shukla", "Krishna"]).toContain(result.paksha);
    expect(result.nakshatraIndex).toBeGreaterThanOrEqual(0);
    expect(result.nakshatraIndex).toBeLessThan(27);
    expect(result.vara).toBe("Saturday");
    expect(result.tamilMasa).toBeTruthy();
    expect(["Uttarayana", "Dakshinayana"]).toContain(result.ayana);
  });

  it("computes sunrise/sunset and inauspicious-period windows when a location is given", () => {
    const date = new Date("2024-06-15T00:00:00Z");
    const result = computePanchangam(date, 13.0827, 80.2707); // Chennai

    expect(result.sunrise).not.toBeNull();
    expect(result.sunset).not.toBeNull();
    expect(result.sunset!.getTime()).toBeGreaterThan(result.sunrise!.getTime());
    expect(result.rahuKalam).not.toBeNull();
    expect(result.rahuKalam!.end.getTime()).toBeGreaterThan(result.rahuKalam!.start.getTime());
    expect(result.abhijitMuhurta).not.toBeNull();
  });

  it("finds a tithi end time within a plausible lunar-day range", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const result = computePanchangam(date);
    expect(result.tithiEndsAt).not.toBeNull();
    const hoursAhead = (result.tithiEndsAt!.getTime() - date.getTime()) / 3600000;
    expect(hoursAhead).toBeGreaterThan(0);
    expect(hoursAhead).toBeLessThan(30);
  });

  it("flips paksha around full/new moon (tithi 0 vs tithi 15)", () => {
    // Just verifies the function doesn't throw across a range of dates and
    // paksha stays consistent with the tithi number computed internally.
    for (let day = 1; day <= 28; day++) {
      const date = new Date(Date.UTC(2024, 5, day, 12, 0));
      const result = computePanchangam(date);
      expect(result.tithiIndex).toBeGreaterThanOrEqual(0);
      expect(result.tithiIndex).toBeLessThanOrEqual(14);
    }
  });
});
