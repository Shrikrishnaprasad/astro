import { describe, expect, it } from "vitest";
import {
  kp249NumberAtLongitude,
  matchKpTopicDetailed,
  pickKpHoraryFromMoon,
  pickKpHoraryTyped,
} from "./kpHorary";
import { getKp249Table } from "./kp";

describe("kpHorary number picks", () => {
  it("maps every 249 span start to its own number", () => {
    const table = getKp249Table();
    for (const e of table) {
      const mid = (e.startLongitude + e.endLongitude) / 2;
      expect(kp249NumberAtLongitude(mid).number).toBe(e.number);
    }
  });

  it("derives a typed number from trailing digits", () => {
    expect(pickKpHoraryTyped("108")?.number).toBe(108);
    expect(pickKpHoraryTyped("abc") ).toBeNull();
    const phone = pickKpHoraryTyped("9876543210");
    expect(phone?.number).toBeGreaterThanOrEqual(1);
    expect(phone?.number).toBeLessThanOrEqual(249);
  });

  it("picks a moon-sub number in range", () => {
    const pick = pickKpHoraryFromMoon(new Date("2024-01-01T00:00:00Z"));
    expect(pick.number).toBeGreaterThanOrEqual(1);
    expect(pick.number).toBeLessThanOrEqual(249);
    expect(pick.source).toBe("moonSub");
  });
});

describe("matchKpTopicDetailed", () => {
  it("matches Tamil and English keywords", () => {
    expect(matchKpTopicDetailed("என் திருமணம் எப்போது?").topicId).toBe("marriage");
    expect(matchKpTopicDetailed("Will I get a visa abroad?").topicId).toBe("foreign");
  });
});
