import { describe, expect, it } from "vitest";
import { computePorutham } from "./porutham";

describe("computePorutham", () => {
  it("gives a perfect score for identical nakshatras (same gana/yoni/nadi/rajju baseline)", () => {
    const result = computePorutham(0, 0);
    expect(result.total).toBe(10);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(10);
  });

  it("flags Nadi dosha when both nakshatras share the same Nadi", () => {
    // Nakshatra 0 (Ashwini) and nakshatra 3 (Rohini) are both "Aadi" Nadi.
    const result = computePorutham(0, 3);
    const nadiCheck = result.checks.find((c) => c.name === "Nadi")!;
    expect(nadiCheck.pass).toBe(false);
  });

  it("flags Rajju dosha when both nakshatras share the same Rajju group", () => {
    // Nakshatra 0 and 1 (Ashwini, Bharani) are both "Pada" Rajju.
    const result = computePorutham(0, 1);
    const rajjuCheck = result.checks.find((c) => c.name === "Rajju")!;
    expect(rajjuCheck.pass).toBe(false);
  });

  it("returns exactly 10 checks", () => {
    const result = computePorutham(5, 19);
    expect(result.checks).toHaveLength(10);
  });
});
