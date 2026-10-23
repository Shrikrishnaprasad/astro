import { describe, expect, it } from "vitest";
import { yutiAnswer } from "../data/predictionQa";
import { computeChandraNadi } from "./chandraNadi";
import { computeGkNatalFromLongitudes } from "./gkDegree";
import { buildChandraNadiPredictions, buildDegreeSystemPredictions } from "./predictionResults";
import type { LongitudeMap } from "./types";
import { PLANETS } from "./types";

function longs(partial: Partial<LongitudeMap>): LongitudeMap {
  const base = {} as LongitudeMap;
  for (const planet of PLANETS) base[planet] = planet === "Jupiter" ? 1 : 10;
  return { ...base, ...partial };
}

describe("yutiAnswer", () => {
  it("returns the stored Sun+Mars yoga text either way around", () => {
    const forward = yutiAnswer("Sun", "Mars");
    const reverse = yutiAnswer("Mars", "Sun");
    expect(forward).toMatch(/courage|leadership/i);
    expect(reverse).toBe(forward);
  });
});

describe("prediction builders", () => {
  it("builds degree-system questions for highest and lowest grahas", () => {
    const natal = computeGkNatalFromLongitudes(
      longs({ Mars: 28, Mercury: 2, Jupiter: 10 }),
      13,
    );
    const rows = buildDegreeSystemPredictions(natal, natal.combinations, []);
    expect(rows.some((r) => r.source.includes("Highest degree"))).toBe(true);
    expect(rows.some((r) => r.source.includes("Lowest degree"))).toBe(true);
    expect(rows.some((r) => r.question.toLowerCase().includes("property") || r.question.toLowerCase().includes("job"))).toBe(
      true,
    );
  });

  it("marks Chandra Naadi 6/8/12 answers as strained", () => {
    const nadi = computeChandraNadi(longs({ Sun: 5 }), 152);
    const rows = buildChandraNadiPredictions(nadi);
    expect(rows.some((r) => r.source.startsWith("6/8/12") && r.tone === "strained")).toBe(true);
    expect(rows.some((r) => r.question.toLowerCase().includes("father") || r.question.toLowerCase().includes("boss"))).toBe(
      true,
    );
  });
});
