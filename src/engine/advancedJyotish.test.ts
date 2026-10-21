import { describe, expect, it } from "vitest";
import { computeAvayogi, computeYogi } from "./jaiminiPoints";
import { kpLordChainAtLongitude } from "./kp";
import { computeTithiShunya } from "./tithiShunya";

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
