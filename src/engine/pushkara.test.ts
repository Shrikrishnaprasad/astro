import { describe, expect, it } from "vitest";
import { computePushkara, computePushkaraNavamsaWindows } from "./pushkara";

describe("computePushkara", () => {
  it("flags a fire-sign degree in pada 7 as Pushkara Navamsa", () => {
    // Aries (fire), pada 7 spans 20°-23°20'.
    const result = computePushkara(0, 21);
    expect(result.navamsaPada).toBe(7);
    expect(result.isPushkaraNavamsa).toBe(true);
  });

  it("does not flag a fire-sign degree in pada 1 as Pushkara Navamsa", () => {
    const result = computePushkara(0, 1);
    expect(result.navamsaPada).toBe(1);
    expect(result.isPushkaraNavamsa).toBe(false);
  });

  it("flags being within orb of the Pushkara Bhaga degree for the sign's element", () => {
    // Aries (fire) Pushkara Bhaga = 21 degrees.
    const atBhaga = computePushkara(0, 21);
    expect(atBhaga.pushkaraBhagaDegree).toBe(21);
    expect(atBhaga.isNearPushkaraBhaga).toBe(true);

    const farFromBhaga = computePushkara(0, 5);
    expect(farFromBhaga.isNearPushkaraBhaga).toBe(false);
  });

  it("uses the correct pada set for each element", () => {
    // Taurus (earth): pushkara padas 3 and 5 -> 6°40'-10° and 13°20'-16°40'.
    expect(computePushkara(1, 7).isPushkaraNavamsa).toBe(true); // pada 3
    expect(computePushkara(1, 14).isPushkaraNavamsa).toBe(true); // pada 5
    expect(computePushkara(1, 1).isPushkaraNavamsa).toBe(false); // pada 1
  });
});

describe("computePushkaraNavamsaWindows", () => {
  // The Moon moves ~13.2°/day; each Pushkara Navamsa pada is 3°20' wide, so
  // on any given calendar day the Moon can pass through 0 (when it's
  // transiting a non-Pushkara pada all day), up to about 3 separate windows
  // (when a sign change lines up two padas' worth of Pushkara crossings into
  // one day) - never more than that, and windows never overlap.
  it("returns between 0 and 3 non-overlapping windows for any given day", () => {
    const dayStart = new Date("2026-10-20T00:30:00Z");
    for (let i = 0; i < 20; i++) {
      const start = new Date(dayStart.getTime() + i * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      const windows = computePushkaraNavamsaWindows(start, end);

      expect(windows.length).toBeGreaterThanOrEqual(0);
      expect(windows.length).toBeLessThanOrEqual(3);
      for (let j = 1; j < windows.length; j++) {
        expect(windows[j].start.getTime()).toBeGreaterThanOrEqual(windows[j - 1].end.getTime());
      }
      for (const w of windows) {
        expect(w.end.getTime()).toBeGreaterThan(w.start.getTime());
      }
    }
  });

  it("finds at least one day with zero windows and at least one day with one or more, within a typical month", () => {
    const dayStart = new Date("2026-10-20T00:30:00Z");
    const counts = Array.from({ length: 30 }, (_, i) => {
      const start = new Date(dayStart.getTime() + i * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      return computePushkaraNavamsaWindows(start, end).length;
    });
    expect(counts.some((c) => c === 0)).toBe(true);
    expect(counts.some((c) => c > 0)).toBe(true);
  });
});
