import { describe, expect, it } from "vitest";
import { computeFullKpSystem } from "./kp";
import { searchKpMuhurta } from "./kpMuhurta";

describe("searchKpMuhurta", () => {
  it("only returns slots whose RP include the natal sub-lord", () => {
    const birth = new Date("1990-05-15T04:30:00Z");
    const natal = computeFullKpSystem(birth, 13.08, 80.27);
    const result = searchKpMuhurta({
      natal,
      topicId: "career",
      latitude: 13.08,
      longitude: 80.27,
      from: new Date("2026-01-01T00:00:00Z"),
      days: 3,
      stepMinutes: 180,
      limit: 20,
    });
    expect(result.natalSubLord).toBeTruthy();
    for (const s of result.slots) {
      expect(s.rulingPlanets).toContain(result.natalSubLord);
      expect(s.score).toBeGreaterThanOrEqual(4);
    }
  });
});
