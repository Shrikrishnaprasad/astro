import { describe, expect, it } from "vitest";
import { calculateKavippu } from "./kavippu";

describe("calculateKavippu", () => {
  it("matches reference example 1: Udhayam Tula, Aarudam Kanni, Surya Veedhi Vrishabha -> Mithuna", () => {
    // https://hindupanchangam.in/tools/jamakol-prasannam/, 2026-10-20 ~sunset:
    // "கன் → ரி = 9, உதயத்திலிருந்து → மி"
    const result = calculateKavippu({
      udhayamRasiIndex: 6, // Tula
      udhayamDegreeInRasi: 21 + 20 / 60,
      aarudamRasiIndex: 5, // Kanni
      aarudamDegreeInRasi: 7 + 54 / 60,
      suryaVeedhiRasiIndex: 1, // Vrishabha
    });
    expect(result.rasiIndex).toBe(2); // Mithuna
    expect(result.degreeInRasi).toBeCloseTo(22.1, 1); // 22°06'
  });

  it("matches reference example 2: Udhayam Dhanu, Aarudam Kataka, Surya Veedhi Vrishabha -> Tula", () => {
    // 2026-10-20 20:15: "கட → ரி = 11, உதயத்திலிருந்து → து 30°00'"
    const result = calculateKavippu({
      udhayamRasiIndex: 8, // Dhanu
      udhayamDegreeInRasi: 14 + 47 / 60,
      aarudamRasiIndex: 3, // Kataka
      aarudamDegreeInRasi: 0,
      suryaVeedhiRasiIndex: 1, // Vrishabha
    });
    expect(result.rasiIndex).toBe(6); // Tula
    expect(result.degreeInRasi).toBe(30);
  });

  it("matches reference example 3: Udhayam Kumbha, Aarudam Dhanu, Surya Veedhi Vrishabha -> Kataka", () => {
    // 2026-10-20 22:40: "தனு → ரி = 6, உதயத்திலிருந்து → கட 30°00'"
    const result = calculateKavippu({
      udhayamRasiIndex: 10, // Kumbha
      udhayamDegreeInRasi: 26 + 5 / 60,
      aarudamRasiIndex: 8, // Dhanu
      aarudamDegreeInRasi: 0,
      suryaVeedhiRasiIndex: 1, // Vrishabha
    });
    expect(result.rasiIndex).toBe(3); // Kataka
    expect(result.degreeInRasi).toBe(30);
  });

  it("wraps forward across Meena -> Mesha when counting from Aarudam to Surya Veedhi", () => {
    // Aarudam = Meena (11), Surya Veedhi = Mesha (0): forward count wraps 11->0, delta=1.
    const result = calculateKavippu({
      udhayamRasiIndex: 0,
      udhayamDegreeInRasi: 0,
      aarudamRasiIndex: 11,
      aarudamDegreeInRasi: 10,
      suryaVeedhiRasiIndex: 0,
    });
    expect(result.rasiIndex).toBe(1); // Mesha + delta(1) = Vrishabha
    expect(result.degreeInRasi).toBe(20);
  });

  it("wraps the resulting Kavippu rasi past Meena back to Mesha", () => {
    // delta large enough that udhayam + delta overflows past 11.
    const result = calculateKavippu({
      udhayamRasiIndex: 11, // Meena
      udhayamDegreeInRasi: 0,
      aarudamRasiIndex: 0, // Mesha
      aarudamDegreeInRasi: 0,
      suryaVeedhiRasiIndex: 2, // Mithuna, delta = 2
    });
    expect(result.rasiIndex).toBe(1); // (11 + 2) mod 12 = 1, Vrishabha
  });

  it("is a no-op shift when Aarudam already equals Surya Veedhi (count = 1)", () => {
    const result = calculateKavippu({
      udhayamRasiIndex: 4,
      udhayamDegreeInRasi: 15,
      aarudamRasiIndex: 7,
      aarudamDegreeInRasi: 7,
      suryaVeedhiRasiIndex: 7,
    });
    expect(result.rasiIndex).toBe(4); // udhayam + 0
    expect(result.degreeInRasi).toBe(23);
  });

  it("normalizes out-of-range rasi indices the same way as in-range ones", () => {
    const inRange = calculateKavippu({
      udhayamRasiIndex: 2,
      udhayamDegreeInRasi: 0,
      aarudamRasiIndex: 5,
      aarudamDegreeInRasi: 10,
      suryaVeedhiRasiIndex: 9,
    });
    const outOfRange = calculateKavippu({
      udhayamRasiIndex: 2 + 24, // two full cycles over
      udhayamDegreeInRasi: 0,
      aarudamRasiIndex: 5 - 12,
      aarudamDegreeInRasi: 10,
      suryaVeedhiRasiIndex: 9 + 12,
    });
    expect(outOfRange.rasiIndex).toBe(inRange.rasiIndex);
    expect(outOfRange.degreeInRasi).toBe(inRange.degreeInRasi);
  });
});
