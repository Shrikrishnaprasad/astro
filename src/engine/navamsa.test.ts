import { describe, expect, it } from "vitest";
import { longitudeToNavamsa, navamsaStartRasiIndex } from "./navamsa";

describe("navamsaStartRasiIndex", () => {
  it("starts movable signs from the same sign", () => {
    expect(navamsaStartRasiIndex(0)).toBe(0);
    expect(navamsaStartRasiIndex(3)).toBe(3);
  });

  it("starts fixed signs from the 9th sign", () => {
    expect(navamsaStartRasiIndex(1)).toBe(9);
  });

  it("starts dual signs from the 5th sign", () => {
    expect(navamsaStartRasiIndex(2)).toBe(6);
  });
});

describe("longitudeToNavamsa", () => {
  it("maps 15° Mesha to Simha (5th navamsa of Aries)", () => {
    const nav = longitudeToNavamsa(15);
    expect(nav.pada).toBe(5);
    expect(nav.rasiIndex).toBe(4);
  });

  it("maps 0° Vrishabha to Makara (1st navamsa of fixed Taurus)", () => {
    const nav = longitudeToNavamsa(30);
    expect(nav.pada).toBe(1);
    expect(nav.rasiIndex).toBe(9);
  });
});
