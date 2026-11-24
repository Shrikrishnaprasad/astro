import { describe, expect, it } from "vitest";
import { computeFullKpSystem } from "./kp";
import { buildKpInterlinks } from "./kpInterlinks";
import { PLANETS } from "./types";

const birth = new Date("1990-05-15T04:30:00Z");
const kp = computeFullKpSystem(birth, 13.08, 80.27);

describe("buildKpInterlinks", () => {
  it("builds 12 cusp rows and 9 planet rows with a full matrix", () => {
    const links = buildKpInterlinks(kp);
    expect(links.byCusp).toHaveLength(12);
    expect(links.byPlanet).toHaveLength(9);
    for (const c of links.byCusp) {
      expect(c.subLord).toBeTruthy();
      expect(c.linkedHouses).toEqual(
        kp.planetSignificators.find((r) => r.planet === c.subLord)!.allHouses,
      );
    }
    for (const p of PLANETS) {
      const cells = Object.keys(links.matrix[p]).map(Number);
      expect(cells.every((h) => h >= 1 && h <= 12)).toBe(true);
    }
  });
});
