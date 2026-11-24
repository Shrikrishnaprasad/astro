import { describe, expect, it } from "vitest";
import { computeFullKpSystem } from "./kp";
import { rectifyKpBirthTime } from "./kpRectification";

const birth = new Date("1990-05-15T04:30:00Z");

describe("rectifyKpBirthTime", () => {
  it("returns ranked candidates within the search window", () => {
    const kp = computeFullKpSystem(birth, 13.08, 80.27);
    const topicId = kp.eventPromises.find((p) => p.verdict !== "Denied / Unfavorable")?.id ?? "career";
    const result = rectifyKpBirthTime(
      [{ id: "1", topicId, date: new Date("2015-06-01T12:00:00Z"), label: "Test event" }],
      {
        birthDate: birth,
        latitude: 13.08,
        longitude: 80.27,
        windowMinutes: 10,
        stepMinutes: 5,
      },
    );
    expect(result.candidates.length).toBe(5); // -10,-5,0,5,10
    expect(result.candidates[0].totalScore).toBeGreaterThanOrEqual(
      result.candidates[result.candidates.length - 1].totalScore,
    );
    expect(result.candidates.every((c) => Math.abs(c.offsetMinutes) <= 10)).toBe(true);
    expect(result.candidates[0].eventFits[0].topicId).toBe(topicId);
  });
});
