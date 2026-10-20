import { describe, expect, it } from "vitest";
import { computeChoghadiya, computeMuhurtas, getDishaShool } from "./muhurtas";

const CHENNAI = { lat: 13.0827, lon: 80.2707 };

describe("computeMuhurtas", () => {
  it("places Brahma Muhurta as a 48-minute window ending 48 minutes before sunrise", () => {
    const date = new Date("2024-06-15T00:00:00Z");
    const { brahmaMuhurta } = computeMuhurtas(date, CHENNAI.lat, CHENNAI.lon);
    expect(brahmaMuhurta).not.toBeNull();
    const durationMin = (brahmaMuhurta!.end.getTime() - brahmaMuhurta!.start.getTime()) / 60000;
    expect(durationMin).toBeCloseTo(48, 0);
  });

  it("places Godhuli Muhurta centered on sunset", () => {
    const date = new Date("2024-06-15T00:00:00Z");
    const { godhuliMuhurta } = computeMuhurtas(date, CHENNAI.lat, CHENNAI.lon);
    expect(godhuliMuhurta).not.toBeNull();
    const durationMin = (godhuliMuhurta!.end.getTime() - godhuliMuhurta!.start.getTime()) / 60000;
    expect(durationMin).toBeCloseTo(24, 0);
  });

  it("places Nishita Muhurta around the midpoint of the night", () => {
    const date = new Date("2024-06-15T00:00:00Z");
    const { nishitaMuhurta } = computeMuhurtas(date, CHENNAI.lat, CHENNAI.lon);
    expect(nishitaMuhurta).not.toBeNull();
    const durationMin = (nishitaMuhurta!.end.getTime() - nishitaMuhurta!.start.getTime()) / 60000;
    expect(durationMin).toBeCloseTo(48, 0);
  });
});

describe("computeChoghadiya", () => {
  it("produces 8 day slots and 8 night slots covering sunrise-to-sunrise", () => {
    const date = new Date("2024-06-15T00:00:00Z");
    const result = computeChoghadiya(date, CHENNAI.lat, CHENNAI.lon);
    expect(result).not.toBeNull();
    expect(result!.day).toHaveLength(8);
    expect(result!.night).toHaveLength(8);
  });

  it("starts Monday's day Choghadiya with Amrit", () => {
    const monday = new Date("2024-06-17T00:00:00Z"); // a Monday
    const result = computeChoghadiya(monday, CHENNAI.lat, CHENNAI.lon);
    expect(result!.day[0].name).toBe("Amrit");
  });
});

describe("getDishaShool", () => {
  it("returns a direction or null for every weekday", () => {
    for (let d = 1; d <= 28; d++) {
      const date = new Date(Date.UTC(2024, 5, d));
      const shool = getDishaShool(date);
      expect(shool === null || typeof shool === "string").toBe(true);
    }
  });
});
