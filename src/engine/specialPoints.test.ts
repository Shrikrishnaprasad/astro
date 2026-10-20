import { describe, expect, it } from "vitest";
import { JAMAGRAHAM_SEQUENCE, WEEKDAY_LORD } from "../data/jamagraham";
import { computeJamagraham, computeMandhi } from "./specialPoints";
import { computePanchangam } from "./panchanga";
import { getSunriseSunset } from "./sunTimes";

const CHENNAI = { lat: 13.0827, lon: 80.2707 };

describe("computeMandhi", () => {
  it("returns a valid rasi and matches the Gulika Kalam window start during the day", () => {
    const date = new Date("2024-06-15T12:00:00Z");
    const mandhi = computeMandhi(date, CHENNAI.lat, CHENNAI.lon);
    const panchangam = computePanchangam(date, CHENNAI.lat, CHENNAI.lon);

    expect(mandhi).not.toBeNull();
    expect(mandhi!.rasiIndex).toBeGreaterThanOrEqual(0);
    expect(mandhi!.rasiIndex).toBeLessThan(12);
    expect(mandhi!.windowStart.getTime()).toBe(panchangam.gulikaKalam!.start.getTime());
  });

  it("uses the night window/table (not the stale daytime one) once past sunset", () => {
    // 2024-06-15 is a Saturday in Chennai; sunset ~13:06 UTC.
    const afterSunset = new Date("2024-06-15T15:00:00Z");
    const mandhi = computeMandhi(afterSunset, CHENNAI.lat, CHENNAI.lon);
    const { sunset } = getSunriseSunset(afterSunset, CHENNAI.lat, CHENNAI.lon);

    expect(mandhi).not.toBeNull();
    // The window the moment falls in must start at/after today's sunset -
    // a bug that kept using the daytime window would put it before sunset.
    expect(mandhi!.windowStart.getTime()).toBeGreaterThanOrEqual(sunset!.getTime());
  });

  it("uses yesterday's night window/table for a moment before today's sunrise", () => {
    // London, June: sunrise is mid-UTC-morning (~04:40 UTC) rather than
    // right at the UTC day boundary, so "02:00 UTC same calendar day" is
    // unambiguously before that day's own sunrise.
    const LONDON = { lat: 51.5074, lon: -0.1278 };
    const beforeSunrise = new Date("2024-06-15T02:00:00Z");
    const mandhi = computeMandhi(beforeSunrise, LONDON.lat, LONDON.lon);
    const { sunrise } = getSunriseSunset(beforeSunrise, LONDON.lat, LONDON.lon);

    expect(mandhi).not.toBeNull();
    expect(beforeSunrise.getTime()).toBeLessThan(sunrise!.getTime()); // confirms the test setup itself
    expect(mandhi!.windowStart.getTime()).toBeLessThan(sunrise!.getTime());
  });

  it("gives a different Mandhi position for a night moment than naively reusing the day's point", () => {
    // Sanity check that night-mode actually changes the computed window
    // instead of silently falling back to the day calculation.
    const daytime = new Date("2024-06-15T08:00:00Z");
    const night = new Date("2024-06-15T16:00:00Z");
    const dayMandhi = computeMandhi(daytime, CHENNAI.lat, CHENNAI.lon)!;
    const nightMandhi = computeMandhi(night, CHENNAI.lat, CHENNAI.lon)!;
    expect(nightMandhi.windowStart.getTime()).not.toBe(dayMandhi.windowStart.getTime());
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
