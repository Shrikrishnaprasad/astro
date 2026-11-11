import { describe, expect, it } from "vitest";
import {
  calculateKavippu,
  calculateKavippuCount,
  calculateKavippuDegree,
  calculateKavippuRasi,
  calculateSuryaVeedhi,
} from "./kavippu";

// ─── Rasi index quick-reference ───────────────────────────────────────────────
// 0=Mesha  1=Vrishabha  2=Mithuna  3=Kataka   4=Simha    5=Kanni
// 6=Tula   7=Vrischika  8=Dhanu    9=Makara  10=Kumbha  11=Meena

// ─── calculateSuryaVeedhi – all 12 Sun positions ─────────────────────────────

describe("calculateSuryaVeedhi", () => {
  const EXPECTED: [number, number][] = [
    [0, 7],   // Mesha   → Vrischika
    [1, 8],   // Vrishabha → Dhanu
    [2, 9],   // Mithuna → Makara
    [3, 10],  // Kataka  → Kumbha
    [4, 11],  // Simha   → Meena
    [5, 0],   // Kanni   → Mesha
    [6, 1],   // Tula    → Vrishabha
    [7, 2],   // Vrischika → Mithuna
    [8, 3],   // Dhanu   → Kataka
    [9, 4],   // Makara  → Simha
    [10, 5],  // Kumbha  → Kanni
    [11, 6],  // Meena   → Tula
  ];

  it.each(EXPECTED)(
    "Sun index %i → Surya Veedhi index %i",
    (sun, expected) => {
      expect(calculateSuryaVeedhi(sun)).toBe(expected);
    },
  );

  it("normalises out-of-range positive input", () => {
    // index 6 + 12 = 18 should behave the same as index 6
    expect(calculateSuryaVeedhi(6 + 12)).toBe(calculateSuryaVeedhi(6));
  });

  it("normalises negative input", () => {
    // index -1 ≡ 11 (Meena) → Tula (6)
    expect(calculateSuryaVeedhi(-1)).toBe(6);
  });
});

// ─── calculateKavippuCount ────────────────────────────────────────────────────

describe("calculateKavippuCount", () => {
  it("same rasi → count 1", () => {
    for (let r = 0; r < 12; r++) {
      expect(calculateKavippuCount(r, r)).toBe(1);
    }
  });

  it("Makara (9) → Mesha (0): count 4", () => {
    expect(calculateKavippuCount(9, 0)).toBe(4);
  });

  it("Makara (9) → Vrishabha (1): count 5", () => {
    expect(calculateKavippuCount(9, 1)).toBe(5);
  });

  it("Meena (11) → Vrishabha (1): count 3", () => {
    expect(calculateKavippuCount(11, 1)).toBe(3);
  });

  it("Vrischika (7) → Vrishabha (1): count 7", () => {
    expect(calculateKavippuCount(7, 1)).toBe(7);
  });

  it("wraps correctly when SuryaVeedhi is earlier in the zodiac", () => {
    // Dhanu (8) → Vrishabha (1): count = (1−8+12)%12 + 1 = 5 + 1 = 6
    expect(calculateKavippuCount(8, 1)).toBe(6);
  });

  it("covers all 12×12 (arudam, suryaVeedhi) pairs without crashing", () => {
    for (let a = 0; a < 12; a++) {
      for (let sv = 0; sv < 12; sv++) {
        const c = calculateKavippuCount(a, sv);
        expect(c).toBeGreaterThanOrEqual(1);
        expect(c).toBeLessThanOrEqual(12);
      }
    }
  });
});

// ─── calculateKavippuRasi ─────────────────────────────────────────────────────

describe("calculateKavippuRasi", () => {
  it("count 1 returns Udhayam itself", () => {
    for (let u = 0; u < 12; u++) {
      expect(calculateKavippuRasi(u, 1)).toBe(u);
    }
  });

  it("Tula (6) + count 5 → Kumbha (10)", () => {
    expect(calculateKavippuRasi(6, 5)).toBe(10);
  });

  it("wraps past Meena back to Mesha", () => {
    // Meena (11) + count 2 = (11+1)%12 = 0 = Mesha
    expect(calculateKavippuRasi(11, 2)).toBe(0);
  });

  it("Makara (9) + count 7 → Kataka (3)", () => {
    // (9 + 7 − 1) % 12 = 15 % 12 = 3
    expect(calculateKavippuRasi(9, 7)).toBe(3);
  });
});

// ─── calculateKavippuDegree ───────────────────────────────────────────────────

describe("calculateKavippuDegree", () => {
  it("28° → 2°", () => {
    expect(calculateKavippuDegree(28)).toBe(2);
  });

  it("20° → 10°", () => {
    expect(calculateKavippuDegree(20)).toBe(10);
  });

  it("16°42′ → 13°18′", () => {
    const arudam = 16 + 42 / 60;
    const result = calculateKavippuDegree(arudam);
    const expected = 13 + 18 / 60;
    expect(result).toBeCloseTo(expected, 8);
  });

  it("0° → 30° (exact; caller must normalise)", () => {
    expect(calculateKavippuDegree(0)).toBe(30);
  });

  it("29°59′59″ → ~0°00′01″", () => {
    const arudam = 29 + 59 / 60 + 59 / 3600;
    const result = calculateKavippuDegree(arudam);
    expect(result).toBeCloseTo(1 / 3600, 8);
  });
});

// ─── calculateKavippu – reference test cases from spec ───────────────────────

describe("calculateKavippu – Vaidyanathan method reference examples", () => {
  /**
   * Test Case 1 (from spec §7):
   *   Sun = Tula (6), Arudam = Makara (9) 28°, Udhayam = Tula (6)
   *   → Kavippu = Kumbha (10) 2°
   */
  it("Test Case 1: Sun=Tula, Arudam=Makara 28°, Udhayam=Tula → Kumbha 2°", () => {
    const result = calculateKavippu({
      sunRasiIndex: 6,        // Tula
      udhayamRasiIndex: 6,   // Tula
      aarudamRasiIndex: 9,   // Makara
      aarudamDegreeInRasi: 28,
    });

    expect(result.suryaVeedhiRasiIndex).toBe(1);  // Vrishabha
    expect(result.count).toBe(5);
    expect(result.rasiIndex).toBe(10);            // Kumbha
    expect(result.degreeInRasi).toBeCloseTo(2, 8);
  });

  /**
   * Test Case 2 (from spec §7):
   *   Sun = Tula (6), Arudam = Meena (11) 20°, Udhayam = Tula (6)
   *   → Kavippu = Dhanu (8) 10°
   */
  it("Test Case 2: Sun=Tula, Arudam=Meena 20°, Udhayam=Tula → Dhanu 10°", () => {
    const result = calculateKavippu({
      sunRasiIndex: 6,
      udhayamRasiIndex: 6,
      aarudamRasiIndex: 11,  // Meena
      aarudamDegreeInRasi: 20,
    });

    expect(result.suryaVeedhiRasiIndex).toBe(1);  // Vrishabha
    expect(result.count).toBe(3);
    expect(result.rasiIndex).toBe(8);             // Dhanu
    expect(result.degreeInRasi).toBeCloseTo(10, 8);
  });

  /**
   * Test Case 3 (from spec §7):
   *   Sun = Tula (6), Arudam = Vrischika (7) 16°42′, Udhayam = Makara (9)
   *   → Kavippu = Kataka (3) 13°18′
   */
  it("Test Case 3: Sun=Tula, Arudam=Vrischika 16°42′, Udhayam=Makara → Kataka 13°18′", () => {
    const result = calculateKavippu({
      sunRasiIndex: 6,
      udhayamRasiIndex: 9,   // Makara
      aarudamRasiIndex: 7,   // Vrischika
      aarudamDegreeInRasi: 16 + 42 / 60,
    });

    expect(result.suryaVeedhiRasiIndex).toBe(1);  // Vrishabha
    expect(result.count).toBe(7);
    expect(result.rasiIndex).toBe(3);             // Kataka
    expect(result.degreeInRasi).toBeCloseTo(13 + 18 / 60, 5);
  });
});

// ─── calculateKavippu – Surya Veedhi for all 12 Sun positions ─────────────────

describe("calculateKavippu – Surya Veedhi for all 12 Sun positions", () => {
  // Use fixed Arudam = Mesha (0) 15°, Udhayam = Mesha (0) as a neutral base
  const EXPECTED_SV: [number, number][] = [
    [0, 7],   // Sun=Mesha   → SV=Vrischika
    [1, 8],   // Sun=Vrishabha → SV=Dhanu
    [2, 9],   // Sun=Mithuna → SV=Makara
    [3, 10],  // Sun=Kataka  → SV=Kumbha
    [4, 11],  // Sun=Simha   → SV=Meena
    [5, 0],   // Sun=Kanni   → SV=Mesha
    [6, 1],   // Sun=Tula    → SV=Vrishabha
    [7, 2],   // Sun=Vrischika → SV=Mithuna
    [8, 3],   // Sun=Dhanu   → SV=Kataka
    [9, 4],   // Sun=Makara  → SV=Simha
    [10, 5],  // Sun=Kumbha  → SV=Kanni
    [11, 6],  // Sun=Meena   → SV=Tula
  ];

  it.each(EXPECTED_SV)(
    "Sun index %i → suryaVeedhiRasiIndex %i",
    (sun, expectedSV) => {
      const result = calculateKavippu({
        sunRasiIndex: sun,
        udhayamRasiIndex: 0,
        aarudamRasiIndex: 0,
        aarudamDegreeInRasi: 15,
      });
      expect(result.suryaVeedhiRasiIndex).toBe(expectedSV);
    },
  );
});

// ─── Boundary cases ───────────────────────────────────────────────────────────

describe("calculateKavippu – boundary cases", () => {
  it("Arudam degree 0° → kavippuDegree 30° normalises to 0° of next rasi", () => {
    // Arudam = Tula (6) 0°, Udhayam = Tula (6), Sun = Tula (6)
    // count = ((1−6+12)%12)+1 = 7+1 = 8 (wait, SV=1 for Sun=6, arudam=6: count=((1-6+12)%12)+1=7+1=8? No:
    // Actually SV = (6+7)%12 = 1; count = ((1-6+12)%12)+1 = (7)+1 = 8
    // KavippuRasi = (6+8-1)%12 = 13%12 = 1
    // KavippuDegree = 30-0 = 30 → normalise to 0°, rasi += 1 → rasi = 2 (Mithuna)
    const result = calculateKavippu({
      sunRasiIndex: 6,
      udhayamRasiIndex: 6,
      aarudamRasiIndex: 6,   // Tula
      aarudamDegreeInRasi: 0,
    });
    expect(result.degreeInRasi).toBe(0);
    // rasiIndex should be Mithuna (1+1=2)
    expect(result.rasiIndex).toBe(2);
    expect(result.longitude).toBeGreaterThanOrEqual(0);
    expect(result.longitude).toBeLessThan(360);
  });

  it("Arudam degree 29°59′59″ produces a tiny positive kavippu degree", () => {
    const arudam = 29 + 59 / 60 + 59 / 3600;
    const result = calculateKavippu({
      sunRasiIndex: 6,
      udhayamRasiIndex: 6,
      aarudamRasiIndex: 9,
      aarudamDegreeInRasi: arudam,
    });
    expect(result.degreeInRasi).toBeCloseTo(1 / 3600, 8);
    expect(result.longitude).toBeGreaterThanOrEqual(0);
    expect(result.longitude).toBeLessThan(360);
  });

  it("Arudam = Surya Veedhi (count 1) keeps Kavippu at Udhayam", () => {
    // Sun=Kanni(5) → SV=Mesha(0); set Arudam=Mesha(0) so count=1
    // Kavippu rasi = Udhayam (count=1 means advance 0)
    const result = calculateKavippu({
      sunRasiIndex: 5,
      udhayamRasiIndex: 3,   // Kataka
      aarudamRasiIndex: 0,   // Mesha = same as SV
      aarudamDegreeInRasi: 10,
    });
    expect(result.count).toBe(1);
    expect(result.rasiIndex).toBe(3); // stays at Udhayam (Kataka)
    expect(result.degreeInRasi).toBe(20);
  });

  it("normalises out-of-range rasi indices (negative and > 11)", () => {
    const base = calculateKavippu({
      sunRasiIndex: 6,
      udhayamRasiIndex: 9,
      aarudamRasiIndex: 7,
      aarudamDegreeInRasi: 16 + 42 / 60,
    });
    const outOfRange = calculateKavippu({
      sunRasiIndex: 6 + 12,
      udhayamRasiIndex: 9 - 12,
      aarudamRasiIndex: 7 + 24,
      aarudamDegreeInRasi: 16 + 42 / 60,
    });
    expect(outOfRange.rasiIndex).toBe(base.rasiIndex);
    expect(outOfRange.degreeInRasi).toBeCloseTo(base.degreeInRasi, 8);
    expect(outOfRange.suryaVeedhiRasiIndex).toBe(base.suryaVeedhiRasiIndex);
  });

  it("longitude is always in [0, 360)", () => {
    // Run over all 12 Sun × 12 Arudam combinations with Udhayam=Meena (11)
    for (let sun = 0; sun < 12; sun++) {
      for (let a = 0; a < 12; a++) {
        const r = calculateKavippu({
          sunRasiIndex: sun,
          udhayamRasiIndex: 11,
          aarudamRasiIndex: a,
          aarudamDegreeInRasi: 15,
        });
        expect(r.longitude).toBeGreaterThanOrEqual(0);
        expect(r.longitude).toBeLessThan(360);
      }
    }
  });

  it("result includes nakshatra (0–26) and pada (1–4) for all combinations", () => {
    for (let sun = 0; sun < 12; sun++) {
      for (let a = 0; a < 12; a++) {
        const r = calculateKavippu({
          sunRasiIndex: sun,
          udhayamRasiIndex: 0,
          aarudamRasiIndex: a,
          aarudamDegreeInRasi: 10,
        });
        expect(r.nakshatraIndex).toBeGreaterThanOrEqual(0);
        expect(r.nakshatraIndex).toBeLessThanOrEqual(26);
        expect(r.pada).toBeGreaterThanOrEqual(1);
        expect(r.pada).toBeLessThanOrEqual(4);
      }
    }
  });

  it("overrideSuryaVeedhiIndex bypasses the Vaidyanathan formula", () => {
    // With Sun=Tula (normal SV=1), override SV to Kataka (3)
    const result = calculateKavippu({
      sunRasiIndex: 6,
      udhayamRasiIndex: 6,
      aarudamRasiIndex: 9,
      aarudamDegreeInRasi: 28,
      config: { overrideSuryaVeedhiIndex: 3 }, // Kataka
    });
    expect(result.suryaVeedhiRasiIndex).toBe(3);
    // count = ((3−9+12)%12)+1 = 6+1 = 7
    expect(result.count).toBe(7);
  });
});
