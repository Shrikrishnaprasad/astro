import { describe, expect, it } from "vitest";
import { computeChart } from "../hooks/useBirthChart";
import { computePoruthamMatchReport } from "./poruthamMatch";

describe("computePoruthamMatchReport", () => {
  it("returns a full report with dasakoota and extensions", () => {
    const bride = computeChart({
      date: new Date("1995-03-10T06:30:00Z"),
      latitude: 13.08,
      longitude: 80.27,
    });
    const groom = computeChart({
      date: new Date("1993-11-22T14:00:00Z"),
      latitude: 11.0,
      longitude: 76.96,
    });
    const report = computePoruthamMatchReport(bride, groom, 6);
    expect(report.dasakoota.total).toBe(10);
    expect(report.summary.length).toBeGreaterThan(20);
    expect(["favorable", "review", "not_favorable"]).toContain(report.recommendation);
  });
});
