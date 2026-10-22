import { describe, expect, it } from "vitest";
import { computeAshtakavarga, evaluateKakshyaPlacements } from "./ashtakavarga";
import { computeAvayogi, computeYogi } from "./jaiminiPoints";
import { kpLordChainAtLongitude } from "./kp";
import { computeTithiShunya } from "./tithiShunya";
import {
  computeAllShodashavarga,
  computeVargaPlacement,
  computeVimshopakaBala,
  SHODASHAVARGA_DEFS,
} from "./vargas";

describe("computeAvayogi", () => {
  it("yields a different graha than Yogi for the IndiaDivine-style example (Sun 293°, Moon 44°)", () => {
    const yogi = computeYogi(293, 44);
    const avayogi = computeAvayogi(293, 44);
    expect(yogi.yogiGraha).not.toBe(avayogi.avayogiGraha);
    expect(avayogi.avayogiGraha).toBe("Venus");
  });
});

describe("computeTithiShunya", () => {
  it("flags Rohini on shashthi tithi (tithiIndex 5)", () => {
    const r = computeTithiShunya(5, 3);
    expect(r.moonIsShunya).toBe(true);
  });

  it("has no shunya list on chaturthi (tithiIndex 3)", () => {
    const r = computeTithiShunya(3, 3);
    expect(r.hasShunyaList).toBe(false);
    expect(r.moonIsShunya).toBe(false);
  });
});

describe("kpLordChainAtLongitude", () => {
  it("returns star, sub, and sub-sub lords", () => {
    const chain = kpLordChainAtLongitude(100);
    expect(chain.nakshatraLord).toBeTruthy();
    expect(chain.subLord).toBeTruthy();
    expect(chain.subSubLord).toBeTruthy();
  });
});

describe("computeAshtakavarga", () => {
  it("produces exact 337-bindu Sarvashtakavarga and classical BAV totals", () => {
    const av = computeAshtakavarga(
      {
        Sun: 0,
        Moon: 1,
        Mars: 2,
        Mercury: 3,
        Jupiter: 4,
        Venus: 5,
        Saturn: 6,
        Rahu: 7,
        Ketu: 1,
      },
      0,
    );
    expect(av.sarvaTotal).toBe(337);
    const totals = Object.fromEntries(av.bhinna.map((b) => [b.planet, b.total]));
    expect(totals).toEqual({
      Sun: 48,
      Moon: 49,
      Mars: 39,
      Mercury: 54,
      Jupiter: 56,
      Venus: 52,
      Saturn: 39,
    });
    expect(av.lagnaBav.total).toBe(49);
    expect(av.bhinna[0].sodhyaPinda).toBeGreaterThan(0);

    const kakshyas = evaluateKakshyaPlacements(
      {
        Sun: 5,
        Moon: 35,
        Mars: 70,
        Mercury: 100,
        Jupiter: 130,
        Venus: 160,
        Saturn: 190,
        Rahu: 220,
        Ketu: 40,
      },
      av,
    );
    expect(kakshyas).toHaveLength(7);
  });
});

describe("Shodashavarga (D1–D60) & Vimshopaka Bala", () => {
  it("computes all 16 divisional charts and 20-point Vimshopaka Bala", () => {
    expect(SHODASHAVARGA_DEFS).toHaveLength(16);
    const vargas = computeAllShodashavarga(
      {
        Sun: 1,
        Moon: 45,
        Mars: 72,
        Mercury: 105,
        Jupiter: 138,
        Venus: 170,
        Saturn: 205,
        Rahu: 250,
        Ketu: 70,
      },
      15,
    );
    expect(Object.keys(vargas)).toHaveLength(16);
    expect(vargas.D60.planets.Sun.deityName).toBeTruthy();

    // At 1° Mesha (rasi 0), D9 Navamsa is also Mesha (0) -> Vargottama!
    const d9Sun = computeVargaPlacement(1, "D9");
    expect(d9Sun.rasiIndex).toBe(0);
    expect(d9Sun.isVargottama).toBe(true);

    const vimshopaka = computeVimshopakaBala(vargas);
    expect(vimshopaka).toHaveLength(9);
    for (const row of vimshopaka) {
      expect(row.shodashavarga).toBeGreaterThanOrEqual(5);
      expect(row.shodashavarga).toBeLessThanOrEqual(20);
    }
  });
});
