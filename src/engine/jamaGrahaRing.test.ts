/**
 * Eight Jama Grahas — 45-degree ring calculation tests.
 *
 * Tests cover the five specified cases (A–F from the feature spec) plus:
 *   • Midnight / date transitions
 *   • Different timezones (IST, EST, UTC, Nepal +5:45, DST transitions)
 *   • Seconds-level precision
 *   • Leap-day handling
 *   • Full angular-separation verification for all results
 */

import { describe, expect, it } from "vitest";
import {
  calculateAllJamaGrahas,
  calculateEightJamaGrahas,
  calculateEightJamaGrahasFromUTC,
  calculateElapsedSeconds,
  calculateStartingLongitudeArcsec,
  DEFAULT_JAMA_GRAHA_CONFIG,
  getReferenceSixAmUTC,
  JAMA_GRAHA_RING,
} from "./jamaGrahaRing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize an angle to [0, 360). */
function norm(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Build a UTC Date from IST local date + time (UTC+5:30). */
function ist(date: string, time: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, m, s = 0] = time.split(":").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, m, s) - 5.5 * 3600_000);
}

/** Build a UTC Date treating the input as literal UTC. */
function utcAt(date: string, time: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, m, s = 0] = time.split(":").map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, m, s));
}

const IST_OFFSET = 5.5;

// ─── Test A: At reference time (06:00 AM) ────────────────────────────────────

describe("Test A – at reference time 06:00 AM (elapsed = 0)", () => {
  const queryUtc = ist("2024-06-15", "06:00:00");
  const result = calculateEightJamaGrahasFromUTC(queryUtc, IST_OFFSET);

  it("elapsed seconds is 0", () => {
    expect(result.reference.elapsedSeconds).toBe(0);
  });

  it("starting longitude θ = 45°", () => {
    expect(result.startingLongitude.totalLongitude).toBeCloseTo(45, 6);
  });

  it("Surya = 45°", () => {
    expect(result.jamaGrahas[0].longitude).toBeCloseTo(45, 6);
  });

  it("Rahu = 90°", () => {
    expect(result.jamaGrahas[1].longitude).toBeCloseTo(90, 6);
  });

  it("Chandra = 135°", () => {
    expect(result.jamaGrahas[2].longitude).toBeCloseTo(135, 6);
  });

  it("Sani = 180°", () => {
    expect(result.jamaGrahas[3].longitude).toBeCloseTo(180, 6);
  });

  it("Sukran = 225°", () => {
    expect(result.jamaGrahas[4].longitude).toBeCloseTo(225, 6);
  });

  it("Budhan = 270°", () => {
    expect(result.jamaGrahas[5].longitude).toBeCloseTo(270, 6);
  });

  it("Guru = 315°", () => {
    expect(result.jamaGrahas[6].longitude).toBeCloseTo(315, 6);
  });

  it("Sevvai = 0° (360° normalised)", () => {
    expect(norm(result.jamaGrahas[7].longitude)).toBeCloseTo(0, 6);
  });
});

// ─── Test B: One minute after reference (06:01 AM) ───────────────────────────

describe("Test B – 06:01:00 AM (1 minute after reference)", () => {
  const queryUtc = ist("2024-06-15", "06:01:00");
  const result = calculateEightJamaGrahasFromUTC(queryUtc, IST_OFFSET);

  it("elapsed seconds is 60", () => {
    expect(result.reference.elapsedSeconds).toBe(60);
  });

  it("Surya = 44.5° total; within Vrishabha (30-60°): 14°30′", () => {
    // 0.5°/min retrograde → 45° − 0.5° = 44.5° (Vrishabha, index 1)
    // degree/minute/second are within the rasi, not absolute ecliptic
    expect(result.jamaGrahas[0].longitude).toBeCloseTo(44.5, 6);
    expect(result.jamaGrahas[0].rasi).toBe("Vrishabha");
    // 44.5° − 30° (Vrishabha start) = 14°30′ within rasi
    expect(result.jamaGrahas[0].degree).toBe(14);
    expect(result.jamaGrahas[0].minute).toBe(30);
    expect(result.jamaGrahas[0].second).toBe(0);
  });
});

// ─── Test C: Two hours after reference (08:00 AM) ────────────────────────────

describe("Test C – 08:00:00 AM (2 hours = 120 minutes after reference)", () => {
  const queryUtc = ist("2024-06-15", "08:00:00");
  const result = calculateEightJamaGrahasFromUTC(queryUtc, IST_OFFSET);

  it("elapsed seconds is 7200", () => {
    expect(result.reference.elapsedSeconds).toBe(7200);
  });

  it("Surya = 345° (45° − 120×0.5° = 345°)", () => {
    expect(result.jamaGrahas[0].longitude).toBeCloseTo(345, 6);
  });

  it("Rahu = 30° (345° + 45° = 390° → 30°)", () => {
    expect(result.jamaGrahas[1].longitude).toBeCloseTo(30, 6);
  });
});

// ─── Test D: Before reference (05:58:20 AM → previous day's 06:00 AM) ────────

describe("Test D – 05:58:20 AM (before reference, uses previous day's 06:00 AM)", () => {
  const queryUtc = ist("2024-06-15", "05:58:20");
  const result = calculateEightJamaGrahasFromUTC(queryUtc, IST_OFFSET);

  // Elapsed = 23h 58m 20s = 86300 s
  it("elapsed seconds is 86300", () => {
    expect(result.reference.elapsedSeconds).toBe(86300);
  });

  it("reference UTC falls on the previous day's 06:00 AM local", () => {
    const refLocal = new Date(result.reference.referenceUtc.getTime() + IST_OFFSET * 3_600_000);
    expect(refLocal.getUTCHours()).toBe(6);
    expect(refLocal.getUTCMinutes()).toBe(0);
    // The reference date must be the day before the query date
    const queryLocal = new Date(queryUtc.getTime() + IST_OFFSET * 3_600_000);
    expect(refLocal.getUTCDate()).toBe(queryLocal.getUTCDate() - 1);
  });

  it("Surya = 45°50′ total (45.8333°); within Vrishabha: 15°50′", () => {
    // thetaArcsec = 162000 − 86300×30 → normalised = 165000 arcsec = 45°50′
    // 45°50′ is in Vrishabha (30–60°); degree within rasi = 15°50′
    expect(result.jamaGrahas[0].longitude).toBeCloseTo(45 + 50 / 60, 4);
    expect(result.jamaGrahas[0].rasi).toBe("Vrishabha");
    expect(result.jamaGrahas[0].degree).toBe(15);
    expect(result.jamaGrahas[0].minute).toBe(50);
    expect(result.jamaGrahas[0].second).toBe(0);
  });

  it("Rahu = 90°50′", () => {
    expect(result.jamaGrahas[1].longitude).toBeCloseTo(90 + 50 / 60, 4);
  });

  it("Chandra = 135°50′", () => {
    expect(result.jamaGrahas[2].longitude).toBeCloseTo(135 + 50 / 60, 4);
  });
});

// ─── Test E: Full zodiac wraparound ──────────────────────────────────────────

describe("Test E – zodiac wraparound", () => {
  it("Sevvai (offset 315°) wraps through 360° when θ is large", () => {
    // θ = 90°: Sevvai = (90 + 315) % 360 = 45°
    const grahas = calculateAllJamaGrahas(90);
    expect(norm(grahas[7].longitude)).toBeCloseTo(45, 6);
  });

  it("all longitudes stay in [0, 360) regardless of θ", () => {
    for (let theta = 0; theta < 360; theta += 7.5) {
      const grahas = calculateAllJamaGrahas(theta);
      for (const g of grahas) {
        expect(g.longitude).toBeGreaterThanOrEqual(0);
        expect(g.longitude).toBeLessThan(360);
      }
    }
  });

  it("Guru wraps at θ = 90° (90 + 270 = 360 → 0°)", () => {
    const grahas = calculateAllJamaGrahas(90);
    expect(norm(grahas[6].longitude)).toBeCloseTo(0, 6);
  });

  it("handles θ = 0°", () => {
    const grahas = calculateAllJamaGrahas(0);
    expect(grahas[0].longitude).toBeCloseTo(0, 6);  // Surya
    expect(grahas[7].longitude).toBeCloseTo(315, 6); // Sevvai
  });

  it("handles θ = 359.9°", () => {
    const grahas = calculateAllJamaGrahas(359.9);
    expect(grahas[0].longitude).toBeCloseTo(359.9, 3);
    // All should be valid
    for (const g of grahas) {
      expect(g.longitude).toBeGreaterThanOrEqual(0);
      expect(g.longitude).toBeLessThan(360);
    }
  });
});

// ─── Test F: Angular separation always 45° ────────────────────────────────────

describe("Test F – angular separation between consecutive grahas is always 45°", () => {
  const TEST_THETAS = [0, 15, 30, 45, 90, 180, 270, 315, 350, 359.9];

  it.each(TEST_THETAS)("θ = %d° → every consecutive pair is 45° apart", (theta) => {
    const grahas = calculateAllJamaGrahas(theta);
    for (let i = 0; i < 7; i++) {
      const diff = norm(grahas[i + 1].longitude - grahas[i].longitude);
      expect(diff).toBeCloseTo(45, 4);
    }
    // Also Sevvai back to Surya wraps 360° - 315° = 45° measured forward
    const wrapDiff = norm(grahas[0].longitude + 360 - grahas[7].longitude);
    expect(wrapDiff).toBeCloseTo(45, 4);
  });

  it("holds for every integer θ from 0 to 359", () => {
    for (let theta = 0; theta < 360; theta++) {
      const grahas = calculateAllJamaGrahas(theta);
      for (let i = 0; i < 7; i++) {
        expect(norm(grahas[i + 1].longitude - grahas[i].longitude)).toBeCloseTo(45, 4);
      }
    }
  });
});

// ─── calculateStartingLongitudeArcsec ─────────────────────────────────────────

describe("calculateStartingLongitudeArcsec", () => {
  const cfg = DEFAULT_JAMA_GRAHA_CONFIG;

  it("0 elapsed seconds → reference longitude (162000 arcsec = 45°)", () => {
    expect(calculateStartingLongitudeArcsec(0, cfg)).toBe(162000);
  });

  it("60 elapsed seconds → 160200 arcsec (44°30′)", () => {
    expect(calculateStartingLongitudeArcsec(60, cfg)).toBe(160200);
  });

  it("7200 elapsed seconds (2h) → 1242000 arcsec (345°)", () => {
    expect(calculateStartingLongitudeArcsec(7200, cfg)).toBe(1242000);
  });

  it("86300 elapsed seconds → 165000 arcsec (45°50′)", () => {
    expect(calculateStartingLongitudeArcsec(86300, cfg)).toBe(165000);
  });

  it("result is always in [0, 1296000)", () => {
    for (let s = 0; s <= 172800; s += 3601) {
      const r = calculateStartingLongitudeArcsec(s, cfg);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(1_296_000);
    }
  });
});

// ─── Midnight / UTC date transitions ─────────────────────────────────────────

describe("Midnight and UTC date boundary", () => {
  it("midnight UTC → valid result", () => {
    const r = calculateEightJamaGrahasFromUTC(utcAt("2024-01-01", "00:00:00"), 5.5);
    expect(r.jamaGrahas).toHaveLength(8);
    for (const g of r.jamaGrahas) {
      expect(g.longitude).toBeGreaterThanOrEqual(0);
      expect(g.longitude).toBeLessThan(360);
    }
  });

  it("00:30 IST (previous evening UTC) uses previous day's 06:00 AM reference", () => {
    // 00:30 AM IST = 2023-12-31T19:00:00Z, before 06:00 AM on 2024-01-01
    const queryUtc = ist("2024-01-01", "00:30:00");
    const r = calculateEightJamaGrahasFromUTC(queryUtc, IST_OFFSET);
    // Reference should be 2023-12-31 06:00 AM IST
    const refLocal = new Date(r.reference.referenceUtc.getTime() + IST_OFFSET * 3_600_000);
    expect(refLocal.getUTCHours()).toBe(6);
    expect(refLocal.getUTCDate()).toBe(31);
    expect(refLocal.getUTCMonth()).toBe(11); // December
  });
});

// ─── Different timezones ─────────────────────────────────────────────────────

describe("Different timezones via calculateEightJamaGrahas (IANA)", () => {
  it("UTC timezone – exact reference", () => {
    const r = calculateEightJamaGrahas({
      date: "2024-06-15",
      time: "06:00:00",
      timezone: "UTC",
    });
    expect(r.reference.elapsedSeconds).toBe(0);
    expect(r.jamaGrahas[0].longitude).toBeCloseTo(45, 6);
  });

  it("Asia/Kolkata – 2 hours after reference", () => {
    const r = calculateEightJamaGrahas({
      date: "2024-06-15",
      time: "08:00:00",
      timezone: "Asia/Kolkata",
    });
    expect(r.reference.elapsedSeconds).toBe(7200);
    expect(r.jamaGrahas[0].longitude).toBeCloseTo(345, 6);
  });

  it("America/New_York (EDT = UTC−4) – before 06:00 uses previous day", () => {
    // 05:00 AM EDT is before 06:00 AM, so reference = previous day's 06:00 EDT
    const r = calculateEightJamaGrahas({
      date: "2024-07-15",
      time: "05:00:00",
      timezone: "America/New_York",
    });
    // Elapsed = 23h = 82800s
    expect(r.reference.elapsedSeconds).toBe(82800);
  });

  it("Asia/Kathmandu (UTC+5:45) – at reference", () => {
    const r = calculateEightJamaGrahas({
      date: "2024-06-15",
      time: "06:00:00",
      timezone: "Asia/Kathmandu",
    });
    expect(r.reference.elapsedSeconds).toBe(0);
    expect(r.jamaGrahas[0].longitude).toBeCloseTo(45, 6);
  });
});

// ─── Seconds precision ────────────────────────────────────────────────────────

describe("Seconds precision", () => {
  it("06:00:01 → elapsed 1s → θ moves 30 arcsec (0.5° per minute = 30″/s)", () => {
    const queryUtc = ist("2024-06-15", "06:00:01");
    const r = calculateEightJamaGrahasFromUTC(queryUtc, IST_OFFSET);
    expect(r.reference.elapsedSeconds).toBe(1);
    // θ = 45° − 30arcsec = 44°59′30″
    const arcsec = calculateStartingLongitudeArcsec(1, DEFAULT_JAMA_GRAHA_CONFIG);
    expect(arcsec).toBe(162000 - 30);
    expect(r.startingLongitude.degree).toBe(44);
    expect(r.startingLongitude.minute).toBe(59);
    expect(r.startingLongitude.second).toBe(30);
  });

  it("06:00:30 → elapsed 30s → θ = 44°45′00″", () => {
    const queryUtc = ist("2024-06-15", "06:00:30");
    const r = calculateEightJamaGrahasFromUTC(queryUtc, IST_OFFSET);
    expect(r.reference.elapsedSeconds).toBe(30);
    // θ = 45° − 30×30arcsec = 162000 − 900 = 161100 arcsec = 44°45′00″
    expect(r.startingLongitude.degree).toBe(44);
    expect(r.startingLongitude.minute).toBe(45);
    expect(r.startingLongitude.second).toBe(0);
  });
});

// ─── Leap day ─────────────────────────────────────────────────────────────────

describe("Leap day (Feb 29)", () => {
  it("calculates correctly on 2024-02-29 after reference", () => {
    const r = calculateEightJamaGrahas({
      date: "2024-02-29",
      time: "09:00:00",
      timezone: "UTC",
    });
    // 3 hours after 06:00 = 10800 s
    expect(r.reference.elapsedSeconds).toBe(10800);
    // θ = 45 − 90 = −45 → normalised → 315°
    expect(r.jamaGrahas[0].longitude).toBeCloseTo(315, 6);
  });

  it("calculates correctly on 2024-02-29 before reference (uses Feb 28's 06:00)", () => {
    const r = calculateEightJamaGrahas({
      date: "2024-02-29",
      time: "04:00:00",
      timezone: "UTC",
    });
    // Elapsed from 2024-02-28 06:00:00 UTC to 2024-02-29 04:00:00 UTC = 22h = 79200s
    expect(r.reference.elapsedSeconds).toBe(79200);
  });
});

// ─── DST transition ────────────────────────────────────────────────────────────

describe("DST transition (America/New_York, clocks spring forward)", () => {
  it("2024-03-10 07:00 EDT is valid (clocks skipped 2→3 AM on this day)", () => {
    // After DST: UTC−4
    const r = calculateEightJamaGrahas({
      date: "2024-03-10",
      time: "07:00:00",
      timezone: "America/New_York",
    });
    // 1h after the 06:00 AM reference = 3600s
    expect(r.reference.elapsedSeconds).toBe(3600);
    expect(r.jamaGrahas).toHaveLength(8);
  });
});

// ─── Result structure ─────────────────────────────────────────────────────────

describe("Result structure completeness", () => {
  const r = calculateEightJamaGrahasFromUTC(ist("2024-06-15", "10:00:00"), IST_OFFSET);

  it("has 8 Jama Grahas", () => {
    expect(r.jamaGrahas).toHaveLength(8);
  });

  it("graha ids match JAMA_GRAHA_RING sequence", () => {
    expect(r.jamaGrahas.map((g) => g.id)).toEqual(JAMA_GRAHA_RING.map((d) => d.id));
  });

  it("all grahas have valid rasi index (0–11)", () => {
    for (const g of r.jamaGrahas) {
      expect(g.rasiIndex).toBeGreaterThanOrEqual(0);
      expect(g.rasiIndex).toBeLessThanOrEqual(11);
    }
  });

  it("all grahas have valid nakshatra index (0–26)", () => {
    for (const g of r.jamaGrahas) {
      expect(g.nakshatraIndex).toBeGreaterThanOrEqual(0);
      expect(g.nakshatraIndex).toBeLessThanOrEqual(26);
    }
  });

  it("all grahas have valid pada (1–4)", () => {
    for (const g of r.jamaGrahas) {
      expect(g.pada).toBeGreaterThanOrEqual(1);
      expect(g.pada).toBeLessThanOrEqual(4);
    }
  });

  it("calculationMethod is VAIDYANATHAN_45_DEGREE_RING", () => {
    expect(r.calculationMethod).toBe("VAIDYANATHAN_45_DEGREE_RING");
  });

  it("reference UTC is before the query UTC", () => {
    const queryUtc = ist("2024-06-15", "10:00:00");
    expect(r.reference.referenceUtc.getTime()).toBeLessThanOrEqual(queryUtc.getTime());
  });
});

// ─── getReferenceSixAmUTC ─────────────────────────────────────────────────────

describe("getReferenceSixAmUTC", () => {
  it("query at 06:00 AM local → same-day reference", () => {
    const query = ist("2024-06-15", "06:00:00");
    const ref = getReferenceSixAmUTC(query, IST_OFFSET);
    expect(ref.getTime()).toBe(query.getTime());
  });

  it("query at 06:00:01 AM → same-day reference", () => {
    const query = ist("2024-06-15", "06:00:01");
    const ref = getReferenceSixAmUTC(query, IST_OFFSET);
    expect(query.getTime() - ref.getTime()).toBe(1000);
  });

  it("query at 05:59:59 AM → previous-day reference", () => {
    const query = ist("2024-06-15", "05:59:59");
    const ref = getReferenceSixAmUTC(query, IST_OFFSET);
    const refLocal = new Date(ref.getTime() + IST_OFFSET * 3_600_000);
    expect(refLocal.getUTCDate()).toBe(14); // 2024-06-14
    expect(refLocal.getUTCHours()).toBe(6);
  });

  it("query at midnight UTC (after 06:00 AM IST) → same-day reference", () => {
    // midnight UTC = 05:30 AM IST, before 06:00 AM → previous day's reference
    const query = utcAt("2024-06-15", "00:00:00");
    const ref = getReferenceSixAmUTC(query, IST_OFFSET);
    const refLocal = new Date(ref.getTime() + IST_OFFSET * 3_600_000);
    expect(refLocal.getUTCDate()).toBe(14); // previous day
    expect(refLocal.getUTCHours()).toBe(6);
  });
});

// ─── Configurable parameters ──────────────────────────────────────────────────

describe("Custom config", () => {
  it("different reference longitude → Surya starts at that longitude at t=0", () => {
    const queryUtc = ist("2024-06-15", "06:00:00");
    const r = calculateEightJamaGrahasFromUTC(queryUtc, IST_OFFSET, {
      referenceLongitudeDeg: 90,
    });
    expect(r.jamaGrahas[0].longitude).toBeCloseTo(90, 6);
  });

  it("PROGRADE direction moves forward", () => {
    const queryUtc = ist("2024-06-15", "06:01:00");
    const r = calculateEightJamaGrahasFromUTC(queryUtc, IST_OFFSET, {
      direction: "PROGRADE",
    });
    // θ = 45 + 0.5 = 45.5°
    expect(r.jamaGrahas[0].longitude).toBeCloseTo(45.5, 4);
  });

  it("different movement rate → proportionally different θ", () => {
    const queryUtc = ist("2024-06-15", "07:00:00"); // 1h = 60min after ref
    const r1 = calculateEightJamaGrahasFromUTC(queryUtc, IST_OFFSET, {
      movementRateDegPerMin: 1.0, // 1°/min
    });
    // θ = 45 − 60×1 = −15 → 345°
    expect(r1.jamaGrahas[0].longitude).toBeCloseTo(345, 4);
  });
});
