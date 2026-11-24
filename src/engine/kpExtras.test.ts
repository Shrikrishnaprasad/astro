import { describe, expect, it } from "vitest";
import { computeFullKpSystem } from "./kp";
import { buildKpNodeDetails, computeKpFortuna } from "./kpExtras";

const birth = new Date("1990-05-15T04:30:00Z");

describe("kpExtras", () => {
  it("computes Fortuna and Rahu/Ketu agent rows", () => {
    const kp = computeFullKpSystem(birth, 13.08, 80.27);
    const fortuna = computeKpFortuna(birth, 13.08, 80.27, kp.cusps);
    expect(fortuna).not.toBeNull();
    expect(fortuna!.longitude).toBeGreaterThanOrEqual(0);
    expect(fortuna!.bhavaHouse).toBeGreaterThanOrEqual(1);
    const nodes = buildKpNodeDetails(kp);
    expect(nodes).toHaveLength(2);
    expect(nodes[0].agentHouses.length).toBeGreaterThan(0);
  });
});
