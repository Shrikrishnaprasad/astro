import { describe, expect, it } from "vitest";
import { computeSamvatsara } from "./samvatsara";

describe("computeSamvatsara", () => {
  it("computes Shaka and Vikram year numbers after the approximate new year", () => {
    const date = new Date("2024-06-15T00:00:00Z");
    const result = computeSamvatsara(date);
    expect(result.shaka).toBe(2024 - 78);
    expect(result.vikram).toBe(2024 + 57);
  });

  it("computes one year earlier before the approximate new year", () => {
    const date = new Date("2024-02-15T00:00:00Z");
    const result = computeSamvatsara(date);
    expect(result.shaka).toBe(2024 - 79);
    expect(result.vikram).toBe(2024 + 56);
  });
});
