import { describe, expect, it } from "vitest";
import { VIMSHOTTARI_SEQUENCE, VIMSHOTTARI_TOTAL_YEARS } from "../data/dasaSequence";
import { NAKSHATRA_SPAN_DEGREES } from "../data/nakshatras";
import { computeVimshottariDasa } from "./dasa";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

describe("computeVimshottariDasa", () => {
  it("starts with the nakshatra lord and balance proportional to elapsed fraction", () => {
    // Nakshatra 0 = Ashwini, lord Ketu (7 years). Put Moon exactly halfway through it.
    const halfwayLongitude = NAKSHATRA_SPAN_DEGREES * 0.5;
    const birth = new Date("2000-01-01T00:00:00Z");
    const periods = computeVimshottariDasa(halfwayLongitude, birth);

    expect(periods[0].lord).toBe("Ketu");
    const balanceYears = (periods[0].end.getTime() - periods[0].start.getTime()) / MS_PER_YEAR;
    expect(balanceYears).toBeCloseTo(3.5, 1);
  });

  it("gives the full duration for a Mahadasa starting exactly at the nakshatra boundary", () => {
    const birth = new Date("2000-01-01T00:00:00Z");
    const periods = computeVimshottariDasa(0, birth); // longitude 0 -> Ashwini, lord Ketu
    const years = (periods[0].end.getTime() - periods[0].start.getTime()) / MS_PER_YEAR;
    expect(years).toBeCloseTo(7, 1);
  });

  it("cycles through all 9 lords in the fixed Vimshottari order", () => {
    const birth = new Date("2000-01-01T00:00:00Z");
    const periods = computeVimshottariDasa(0, birth);
    const lords = periods.map((p) => p.lord);
    expect(lords).toEqual(VIMSHOTTARI_SEQUENCE.map((s) => s.lord));
  });

  it("sizes Bhukti sub-periods proportionally and sums back to the Mahadasa duration", () => {
    const birth = new Date("2000-01-01T00:00:00Z");
    const periods = computeVimshottariDasa(0, birth);
    const venusMaha = periods.find((p) => p.lord === "Venus")!;
    const mahaYears =
      (venusMaha.end.getTime() - venusMaha.start.getTime()) / MS_PER_YEAR;
    const bhuktiYearsSum = venusMaha.bhuktis.reduce(
      (sum, b) => sum + (b.end.getTime() - b.start.getTime()) / MS_PER_YEAR,
      0,
    );
    expect(bhuktiYearsSum).toBeCloseTo(mahaYears, 3);
    expect(mahaYears).toBeCloseTo(20, 1);
  });

  it("totals one full cycle to 120 years", () => {
    expect(VIMSHOTTARI_TOTAL_YEARS).toBe(120);
  });

  it("generates Antara and Sukshma levels by default, each with 9 sub-periods", () => {
    const birth = new Date("2000-01-01T00:00:00Z");
    const periods = computeVimshottariDasa(0, birth);
    const venusMaha = periods.find((p) => p.lord === "Venus")!;

    expect(venusMaha.bhuktis).toHaveLength(9); // Bhukti
    const firstBhukti = venusMaha.bhuktis[0];
    expect(firstBhukti.bhuktis).toHaveLength(9); // Antara
    const firstAntara = firstBhukti.bhuktis[0];
    expect(firstAntara.bhuktis).toHaveLength(9); // Sukshma
    expect(firstAntara.bhuktis[0].bhuktis).toHaveLength(0); // no 5th level by default
  });

  it("sizes Antara sub-periods proportionally and sums back to the Bhukti duration", () => {
    const birth = new Date("2000-01-01T00:00:00Z");
    const periods = computeVimshottariDasa(0, birth);
    const venusMaha = periods.find((p) => p.lord === "Venus")!;
    const bhukti = venusMaha.bhuktis[0];
    const bhuktiYears = (bhukti.end.getTime() - bhukti.start.getTime()) / MS_PER_YEAR;
    const antaraYearsSum = bhukti.bhuktis.reduce(
      (sum, a) => sum + (a.end.getTime() - a.start.getTime()) / MS_PER_YEAR,
      0,
    );
    expect(antaraYearsSum).toBeCloseTo(bhuktiYears, 3);
  });

  it("sizes Sukshma sub-periods proportionally and sums back to the Antara duration", () => {
    const birth = new Date("2000-01-01T00:00:00Z");
    const periods = computeVimshottariDasa(0, birth);
    const antara = periods.find((p) => p.lord === "Venus")!.bhuktis[0].bhuktis[0];
    const antaraYears = (antara.end.getTime() - antara.start.getTime()) / MS_PER_YEAR;
    const sukshmaYearsSum = antara.bhuktis.reduce(
      (sum, s) => sum + (s.end.getTime() - s.start.getTime()) / MS_PER_YEAR,
      0,
    );
    expect(sukshmaYearsSum).toBeCloseTo(antaraYears, 3);
  });

  it("respects a custom subLevels argument", () => {
    const birth = new Date("2000-01-01T00:00:00Z");
    const periods = computeVimshottariDasa(0, birth, 1, 1);
    expect(periods[0].bhuktis).toHaveLength(9); // Bhukti
    expect(periods[0].bhuktis[0].bhuktis).toHaveLength(0); // no Antara
  });
});
