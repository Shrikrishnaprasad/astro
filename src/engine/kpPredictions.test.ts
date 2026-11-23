import { describe, expect, it } from "vitest";
import { computeFullKpSystem } from "./kp";
import { buildKpPredictionReport, matchKpTopicFromQuestion } from "./kpPredictions";

const birth = new Date("1990-05-15T04:30:00Z");
const kp = computeFullKpSystem(birth, 13.08, 80.27);

describe("buildKpPredictionReport", () => {
  it("builds a prediction with remedies for every KP topic (natal)", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const report = buildKpPredictionReport(kp, birth, now, "natal");
    expect(report.topics).toHaveLength(kp.eventPromises.length);
    expect(report.currentDasa).not.toBeNull();
    for (const t of report.topics) {
      expect(t.predictionEn.length).toBeGreaterThan(20);
      expect(t.predictionTa.length).toBeGreaterThan(5);
      expect(t.remedies.length).toBeGreaterThan(0);
      expect(t.remedies[0].planet).toBe(t.promise.cuspSubLord);
      for (const w of t.windows) {
        expect(w.end.getTime()).toBeGreaterThan(w.start.getTime());
      }
      if (t.verdict === "Denied / Unfavorable") expect(t.windows).toHaveLength(0);
    }
  });

  it("skips dasa timing in horary mode and maps the question to a topic", () => {
    const report = buildKpPredictionReport(kp, birth, birth, "horary249", "Will I get a job?");
    expect(report.currentDasa).toBeNull();
    expect(report.questionTopicId).toBe("career");
    expect(report.topics.every((t) => t.windows.length === 0)).toBe(true);
  });
});

describe("matchKpTopicFromQuestion", () => {
  it("matches keywords and returns null for unknown text", () => {
    expect(matchKpTopicFromQuestion("When will my marriage happen?")).toBe("marriage");
    expect(matchKpTopicFromQuestion("xyz")).toBeNull();
  });
});

describe("KP verdict scoring, sookshma and transit triggers", () => {
  it("exposes star-lord-first scores and multi-cusp contributions", () => {
    for (const p of kp.eventPromises) {
      expect(p.contributions[0].cusp).toBe(p.primaryCusp);
      expect(p.contributions[0].weight).toBe(1);
      expect(p.contributions.length).toBeGreaterThan(1);
      const expected = p.contributions.reduce((s, c) => s + c.weight * c.score, 0);
      expect(p.combinedScore).toBeCloseTo(expected, 6);
      if (p.verdict === "Promised (Strong)") {
        expect(p.starLordFavorable.length).toBeGreaterThan(0);
        expect(p.starLordNegating).toHaveLength(0);
      }
    }
  });

  it("attaches sookshma and in-window transit dates to strong windows", () => {
    const report = buildKpPredictionReport(kp, birth, new Date("2026-01-01T00:00:00Z"), "natal");
    for (const t of report.topics) {
      for (const w of t.windows) {
        if (w.strength !== "strong") {
          for (const a of w.antaras) expect(a.sookshmas).toHaveLength(0);
        }
      }
      for (const tr of t.triggers) {
        for (const d of tr.dates) {
          expect(d.start.getTime()).toBeGreaterThanOrEqual(tr.window.start.getTime() - 86400000);
          expect(d.end.getTime()).toBeLessThanOrEqual(tr.window.end.getTime() + 2 * 86400000);
          expect(d.planets.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("KP verdict scoring, sookshma and transit triggers", () => {
  it("exposes star-lord-first scores and multi-cusp contributions", () => {
    for (const p of kp.eventPromises) {
      expect(p.contributions[0].cusp).toBe(p.primaryCusp);
      expect(p.contributions[0].weight).toBe(1);
      expect(p.contributions.length).toBeGreaterThan(1);
      const expected = p.contributions.reduce((s, c) => s + c.weight * c.score, 0);
      expect(p.combinedScore).toBeCloseTo(expected, 6);
      if (p.verdict === "Promised (Strong)") {
        expect(p.starLordFavorable.length).toBeGreaterThan(0);
        expect(p.starLordNegating).toHaveLength(0);
      }
    }
  });

  it("attaches sookshma and in-window transit dates to strong windows", () => {
    const report = buildKpPredictionReport(kp, birth, new Date("2026-01-01T00:00:00Z"), "natal");
    for (const t of report.topics) {
      for (const w of t.windows) {
        if (w.strength !== "strong") {
          for (const a of w.antaras) expect(a.sookshmas).toHaveLength(0);
        }
      }
      for (const tr of t.triggers) {
        for (const d of tr.dates) {
          expect(d.start.getTime()).toBeGreaterThanOrEqual(tr.window.start.getTime() - 86400000);
          expect(d.end.getTime()).toBeLessThanOrEqual(tr.window.end.getTime() + 2 * 86400000);
          expect(d.planets.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
