import { describe, expect, it } from "vitest";
import {
  DNA_KARMA_PLANETS,
  DNA_NAKSHATRA_KARMA,
  DNA_PILLAR_WEIGHTS,
  DNA_PLANET_CARRIES_KARMA,
} from "../data/dnaAstrology";
import { NAKSHATRA_SPAN_DEGREES } from "../data/nakshatras";
import { rasiLord } from "../data/rasis";
import {
  computeDnaCore,
  dnaKarmaForNakshatra,
  inferDnaTopicPattern,
  nakshatrasForKarma,
  oppositeNakshatraIndices,
  scoreDnaMatch,
} from "./dnaAstrology";
import type { ChartResult, Planet, RasiNakshatraInfo } from "./types";
import { PLANETS } from "./types";
import { longitudeToRasiNakshatra } from "./rasiNakshatra";

function infoAt(longitude: number): RasiNakshatraInfo {
  return longitudeToRasiNakshatra(longitude);
}

/** Build a minimal chart from longitudes + lagna. */
function makeChart(
  lagnaLongitude: number,
  planetLongitudes: Partial<Record<Planet, number>>,
): ChartResult {
  const defaults: Record<Planet, number> = {
    Sun: 10,
    Moon: 40,
    Mars: 70,
    Mercury: 100,
    Jupiter: 130,
    Venus: 160,
    Saturn: 190,
    Rahu: 220,
    Ketu: 40, // will overwrite
  };
  const longs = { ...defaults, ...planetLongitudes } as Record<Planet, number>;
  longs.Ketu = (longs.Rahu + 180) % 360;
  const planetRasi = {} as ChartResult["planetRasi"];
  for (const p of PLANETS) {
    planetRasi[p] = infoAt(longs[p]);
  }
  const lagna = infoAt(lagnaLongitude);
  return {
    lagnaLongitude,
    lagnaRasiIndex: lagna.rasiIndex,
    lagnaDegreeInRasi: lagna.degreeInRasi,
    planetLongitudes: longs,
    planetRasi,
  };
}

describe("DNA registry tables", () => {
  it("maps all 27 nakshatras; Ketu never appears as nakshatra karma", () => {
    expect(DNA_NAKSHATRA_KARMA).toHaveLength(27);
    for (let i = 0; i < 27; i++) {
      const k = DNA_NAKSHATRA_KARMA[i];
      expect(k === null || DNA_KARMA_PLANETS.includes(k)).toBe(true);
      expect(k).not.toBe("Ketu");
    }
  });

  it("assigns Sun/Moon/Mars four nakshatras each; others three", () => {
    expect(nakshatrasForKarma("Sun")).toHaveLength(4);
    expect(nakshatrasForKarma("Moon")).toHaveLength(4);
    expect(nakshatrasForKarma("Mars")).toHaveLength(4);
    expect(nakshatrasForKarma("Mercury")).toHaveLength(3);
    expect(nakshatrasForKarma("Rahu")).toHaveLength(3);
  });
});

describe("computeDnaCore", () => {
  it("matches the public writeup: Punarvasu Lagna + Mercury in Revati + Moon Purva Ashadha → Saturn, Mars, Mercury", () => {
    // Punarvasu = index 6 → starts at 6 * 13°20' = 80°
    const lagnaLon = 6 * NAKSHATRA_SPAN_DEGREES + 1; // Gemini / Punarvasu
    // Revati = 26 → Mercury (Lagna lord of Gemini)
    const mercuryLon = 26 * NAKSHATRA_SPAN_DEGREES + 1;
    // Purva Ashadha = 19
    const moonLon = 19 * NAKSHATRA_SPAN_DEGREES + 1;

    const chart = makeChart(lagnaLon, { Mercury: mercuryLon, Moon: moonLon });
    expect(chart.lagnaRasiIndex).toBe(2); // Mithuna
    expect(rasiLord(chart.lagnaRasiIndex)).toBe("Mercury");

    const core = computeDnaCore(chart);
    expect(core.pillars[0].karmaPlanet).toBe("Saturn"); // Punarvasu
    expect(core.pillars[1].karmaPlanet).toBe("Mars"); // Revati
    expect(core.pillars[2].karmaPlanet).toBe("Mercury"); // Purva Ashadha

    const planets = core.rankedKarmas.map((k) => k.planet).sort();
    expect(planets).toEqual(["Mars", "Mercury", "Saturn"]);
    expect(core.rankedKarmas.find((k) => k.planet === "Saturn")!.weight).toBe(
      DNA_PILLAR_WEIGHTS.lagnaNakshatra,
    );
    expect(core.rankedKarmas.find((k) => k.planet === "Mercury")!.weight).toBe(
      DNA_PILLAR_WEIGHTS.moonNakshatra,
    );
  });

  it("stacks weights when all three pillars share one karma planet", () => {
    // Krittika (2)=Mars, Anuradha(16)=Sun — use all Sun: Ashwini(0), Anuradha(16), Ashlesha(8)
    const lagnaLon = 0 * NAKSHATRA_SPAN_DEGREES + 1; // Ashwini → Sun; Mesha, lord Mars
    // Put Mars (lagna lord) in Anuradha (Sun)
    const marsLon = 16 * NAKSHATRA_SPAN_DEGREES + 1;
    // Moon in Ashlesha (Sun)
    const moonLon = 8 * NAKSHATRA_SPAN_DEGREES + 1;
    const chart = makeChart(lagnaLon, { Mars: marsLon, Moon: moonLon });
    const core = computeDnaCore(chart);
    expect(core.rankedKarmas).toHaveLength(1);
    expect(core.rankedKarmas[0].planet).toBe("Sun");
    expect(core.rankedKarmas[0].weight).toBe(
      DNA_PILLAR_WEIGHTS.lagnaNakshatra +
        DNA_PILLAR_WEIGHTS.lagnaLordNakshatra +
        DNA_PILLAR_WEIGHTS.moonNakshatra,
    );
    expect(core.rankedKarmas[0].percent).toBe(100);
  });
});

describe("oppositeNakshatraIndices", () => {
  it("returns the two-nakshatra opposition band used in spouse examples", () => {
    // Shatabhisha = 23 → +13=9 Magha, +14=10 Purva Phalguni
    expect(oppositeNakshatraIndices(23)).toEqual([9, 10]);
    // Ardra = 5 → +13=18 Mula, +14=19 Purva Ashadha
    expect(oppositeNakshatraIndices(5)).toEqual([18, 19]);
  });
});

describe("inferDnaTopicPattern spouse", () => {
  it("expands opposition karmas for Shatabhisha Lagna + Ardra Moon", () => {
    const lagnaLon = 23 * NAKSHATRA_SPAN_DEGREES + 1; // Shatabhisha (Kumbha)
    const moonLon = 5 * NAKSHATRA_SPAN_DEGREES + 1; // Ardra
    const chart = makeChart(lagnaLon, { Moon: moonLon });
    const pattern = inferDnaTopicPattern(chart, "spouse");

    expect(pattern.oppositeNakshatraIndices).toEqual(
      expect.arrayContaining([9, 10, 18, 19]),
    );
    // Magha→Moon, Purva Phalguni→Mars, Mula→Mars, Purva Ashadha→Mercury
    expect(pattern.karmaPlanets.sort()).toEqual(["Mars", "Mercury", "Moon"]);
    expect(pattern.expectedNakshatraIndices).toEqual(
      expect.arrayContaining(nakshatrasForKarma("Moon")),
    );
    expect(pattern.expectedCarrierPlanets).toEqual(
      expect.arrayContaining(["Venus", "Rahu", "Saturn"]),
    );
  });
});

describe("scoreDnaMatch", () => {
  it("scores high when Chart B hits all checklist items", () => {
    const chartA = makeChart(23 * NAKSHATRA_SPAN_DEGREES + 1, {
      Moon: 5 * NAKSHATRA_SPAN_DEGREES + 1,
    });
    const pattern = inferDnaTopicPattern(chartA, "spouse");

    // Magha Lagna (Moon karma nak), Venus (Moon carrier) in Lagna, Lagna in Magha
    // Magha starts at 9 * 13.333 = 120° (Simha). Put Venus there too.
    // Magha → expected Moon karma houses 6,7 — put Lagna lord Sun in 7th = Kumbha
    const maghaLon = 9 * NAKSHATRA_SPAN_DEGREES + 2;
    const chartB = makeChart(maghaLon, {
      Venus: maghaLon,
      Sun: houseLon(maghaLon, 6), // 7th from Simha = Kumbha ≈ house 7
      Moon: maghaLon,
    });

    const result = scoreDnaMatch(pattern, chartB);
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.matchedCount).toBeGreaterThanOrEqual(3);
  });

  it("scores low when Chart B misses the expected pattern", () => {
    const chartA = makeChart(23 * NAKSHATRA_SPAN_DEGREES + 1, {
      Moon: 5 * NAKSHATRA_SPAN_DEGREES + 1,
    });
    const pattern = inferDnaTopicPattern(chartA, "spouse");

    // Meena Lagna Revati (Mars nak — may match Mars list) is risky; use Pushya
    // in Kataka with no Venus/Rahu/Saturn near Lagna or lord.
    // Pushya = 7 → Rahu karma nakshatra (not Moon/Mars/Mercury).
    // Kataka Lagna lord = Moon. Put Moon in Pushya too. Keep carriers far away.
    const pushyaLon = 7 * NAKSHATRA_SPAN_DEGREES + 2; // Kataka / Pushya
    const chartB = makeChart(pushyaLon, {
      Moon: pushyaLon,
      Venus: 300,
      Rahu: 310,
      Saturn: 320,
      Jupiter: 330,
      Mercury: 200,
      Mars: 210,
      Sun: 220,
    });
    const result = scoreDnaMatch(pattern, chartB);
    expect(result.matchedCount).toBeLessThanOrEqual(1);
    expect(result.score).toBeLessThanOrEqual(25);
  });
});

function houseLon(lagnaLon: number, housesAheadZeroBased: number): number {
  const lagnaRasi = Math.floor(lagnaLon / 30);
  const targetRasi = (lagnaRasi + housesAheadZeroBased) % 12;
  return targetRasi * 30 + 5;
}

describe("planet birth-star carriers", () => {
  it("Sun/Moon/Mars carry Jupiter karma; Ketu carries Sun", () => {
    expect(DNA_PLANET_CARRIES_KARMA.Sun).toBe("Jupiter");
    expect(DNA_PLANET_CARRIES_KARMA.Moon).toBe("Jupiter");
    expect(DNA_PLANET_CARRIES_KARMA.Mars).toBe("Jupiter");
    expect(DNA_PLANET_CARRIES_KARMA.Ketu).toBe("Sun");
    expect(dnaKarmaForNakshatra(12)).toBe("Jupiter"); // Hasta
  });
});
