import { describe, expect, it } from "vitest";
import { JAMAGRAHAM_SEQUENCE, WEEKDAY_LORD } from "../data/jamagraham";
import { computeGulikaMandhi, computeJamagraham, computeMandhi } from "./specialPoints";
import { computePanchangam } from "./panchanga";
import { getSunriseSunset } from "./sunTimes";

const CHENNAI = { lat: 13.0827, lon: 80.2707 };

describe("computeGulikaMandhi", () => {
  it("Gulika matches Gulika Kalam start; Mandhi is the mid of that same portion", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const both = computeGulikaMandhi(date, CHENNAI.lat, CHENNAI.lon);
    const panchangam = computePanchangam(date, CHENNAI.lat, CHENNAI.lon);

    expect(both).not.toBeNull();
    expect(both!.windowStart.getTime()).toBe(panchangam.gulikaKalam!.start.getTime());
    expect(both!.windowEnd.getTime()).toBe(panchangam.gulikaKalam!.end.getTime());
    expect(both!.gulika.moment.getTime()).toBe(both!.windowStart.getTime());

    const midMs = (both!.windowStart.getTime() + both!.windowEnd.getTime()) / 2;
    expect(both!.mandhi.moment.getTime()).toBe(midMs);

    expect(both!.gulika.rasiIndex).toBeGreaterThanOrEqual(0);
    expect(both!.gulika.rasiIndex).toBeLessThan(12);
    expect(both!.mandhi.rasiIndex).toBeGreaterThanOrEqual(0);
    expect(both!.mandhi.rasiIndex).toBeLessThan(12);
  });

  it("uses the night window/table (not the stale daytime one) once past sunset", () => {
    // 2024-06-15 is a Saturday in Chennai; sunset ~13:06 UTC.
    const afterSunset = new Date("2024-06-15T15:00:00Z");
    const both = computeGulikaMandhi(afterSunset, CHENNAI.lat, CHENNAI.lon);
    const { sunset } = getSunriseSunset(afterSunset, CHENNAI.lat, CHENNAI.lon);

    expect(both).not.toBeNull();
    expect(both!.windowStart.getTime()).toBeGreaterThanOrEqual(sunset!.getTime());
  });

  it("uses yesterday's night window/table for a moment before today's sunrise", () => {
    const LONDON = { lat: 51.5074, lon: -0.1278 };
    const beforeSunrise = new Date("2024-06-15T02:00:00Z");
    const both = computeGulikaMandhi(beforeSunrise, LONDON.lat, LONDON.lon);
    const { sunrise } = getSunriseSunset(beforeSunrise, LONDON.lat, LONDON.lon);

    expect(both).not.toBeNull();
    expect(beforeSunrise.getTime()).toBeLessThan(sunrise!.getTime());
    expect(both!.windowStart.getTime()).toBeLessThan(sunrise!.getTime());
  });

  it("gives a different portion for a night moment than for daytime", () => {
    const daytime = new Date("2024-06-15T08:00:00Z");
    const night = new Date("2024-06-15T16:00:00Z");
    const dayBoth = computeGulikaMandhi(daytime, CHENNAI.lat, CHENNAI.lon)!;
    const nightBoth = computeGulikaMandhi(night, CHENNAI.lat, CHENNAI.lon)!;
    expect(nightBoth.windowStart.getTime()).not.toBe(dayBoth.windowStart.getTime());
  });
});

describe("computeMandhi", () => {
  it("returns the mid-portion Mandhi from computeGulikaMandhi", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const mandhi = computeMandhi(date, CHENNAI.lat, CHENNAI.lon);
    const both = computeGulikaMandhi(date, CHENNAI.lat, CHENNAI.lon);

    expect(mandhi).not.toBeNull();
    expect(both).not.toBeNull();
    expect(mandhi!.longitude).toBe(both!.mandhi.longitude);
    expect(mandhi!.rasiIndex).toBe(both!.mandhi.rasiIndex);
    expect(mandhi!.windowStart.getTime()).toBe(both!.windowStart.getTime());
  });
});

describe("computeJamagraham", () => {
  it("returns a graha from the fixed 8-item sequence, with now inside its period window", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const result = computeJamagraham(date, CHENNAI.lat, CHENNAI.lon);

    expect(result).not.toBeNull();
    expect(JAMAGRAHAM_SEQUENCE).toContain(result!.graha);
    expect(result!.periodStart.getTime()).toBeLessThanOrEqual(date.getTime());
    expect(result!.periodEnd.getTime()).toBeGreaterThan(date.getTime());
    expect(result!.periodEnd.getTime() - result!.periodStart.getTime()).toBeCloseTo(
      1.5 * 60 * 60 * 1000,
      -2,
    );
  });

  it("starts the first period of the day with that weekday's lord", () => {
    // A moment a few minutes after sunrise should report the weekday's lord
    // as the active graha (period 0).
    const date = new Date("2024-06-16T00:20:00Z"); // shortly after Chennai sunrise on 2024-06-16 (Sunday)
    const result = computeJamagraham(date, CHENNAI.lat, CHENNAI.lon);
    expect(result).not.toBeNull();

    const weekday = result!.periodStart.getUTCDay();
    expect(result!.graha).toBe(WEEKDAY_LORD[weekday]);
  });
});
