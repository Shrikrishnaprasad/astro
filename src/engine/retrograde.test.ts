import { describe, expect, it } from "vitest";
import { getRetrogradeStatus } from "./retrograde";

describe("getRetrogradeStatus", () => {
  it("Sun and Moon are never retrograde", () => {
    const status = getRetrogradeStatus(new Date("2024-04-10T00:00:00Z"));
    expect(status.Sun).toBe(false);
    expect(status.Moon).toBe(false);
  });

  it("Rahu and Ketu (mean nodes) are always retrograde", () => {
    const status = getRetrogradeStatus(new Date("2024-04-10T00:00:00Z"));
    expect(status.Rahu).toBe(true);
    expect(status.Ketu).toBe(true);
  });

  it("detects a known Mercury retrograde window (~Apr 1 - Apr 25, 2024)", () => {
    const inWindow = getRetrogradeStatus(new Date("2024-04-10T00:00:00Z"));
    const outsideWindow = getRetrogradeStatus(new Date("2024-06-01T00:00:00Z"));
    expect(inWindow.Mercury).toBe(true);
    expect(outsideWindow.Mercury).toBe(false);
  });
});
