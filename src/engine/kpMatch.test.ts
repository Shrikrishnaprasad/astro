import { describe, expect, it } from "vitest";
import { compareKpCharts } from "./kpMatch";

describe("compareKpCharts", () => {
  it("returns scored factors between two charts", () => {
    const report = compareKpCharts(
      { label: "A", date: new Date("1990-05-15T04:30:00Z"), latitude: 13.08, longitude: 80.27 },
      { label: "B", date: new Date("1992-08-20T10:00:00Z"), latitude: 13.08, longitude: 80.27 },
    );
    expect(report.factors.length).toBeGreaterThanOrEqual(4);
    expect(report.maxScore).toBeGreaterThan(0);
    expect(report.totalScore).toBeGreaterThanOrEqual(0);
    expect(report.verdictEn.length).toBeGreaterThan(5);
  });
});
