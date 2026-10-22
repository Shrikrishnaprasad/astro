import { describe, expect, it } from "vitest";
import { MUHURTA_ACTIVITIES, muhurtaActivityById } from "../data/muhurtaActivities";
import {
  computeDurmuhurtam,
  computeGowriPanchangam,
  computeMahadoshas,
  computeSpecialDayYogas,
  computeVarjyamAndAmrita,
  evaluateMuhurtaKundali,
} from "./classicalMuhurta";
import {
  chandrabalaHouse,
  computePanchaka,
  MAX_MUHURTA_RANGE_DAYS,
  searchMuhurtaDays,
  subtractTimeWindows,
} from "./muhurtaPicker";

const CHENNAI = { lat: 13.0827, lon: 80.2707 };

describe("searchMuhurtaDays & classicalMuhurta", () => {
  it("returns ranked days with enriched Lagna, Kundali Shuddhi, Hora, Gowri, and Panchaka slots", () => {
    const rows = searchMuhurtaDays({
      startDateStr: "2026-06-01",
      rangeDays: 7,
      latitude: CHENNAI.lat,
      longitude: CHENNAI.lon,
      activity: muhurtaActivityById("vehicle"),
    });
    expect(rows.length).toBeGreaterThan(0);
    const firstSlot = rows[0].slots[0];
    expect(firstSlot).toBeDefined();
    expect(firstSlot.lagnaName.length).toBeGreaterThan(0);
    expect(firstSlot.horaPlanet.length).toBeGreaterThan(0);
    expect(firstSlot.panchaka.name.length).toBeGreaterThan(0);
    expect(typeof firstSlot.kundali.isAshtamaShuddhi).toBe("boolean");
  });

  it("evaluates couple / dual-person Tarabala and Chandrabala simultaneously", () => {
    const withCouple = searchMuhurtaDays({
      startDateStr: "2026-06-01",
      rangeDays: 5,
      latitude: CHENNAI.lat,
      longitude: CHENNAI.lon,
      activity: muhurtaActivityById("wedding"),
      birthNakshatraIndex: 0,
      birthRasiIndex: 0,
      secondBirthNakshatraIndex: 12,
      secondBirthRasiIndex: 5,
    });
    expect(withCouple.some((r) => r.tarabalaLabel !== null)).toBe(true);
    expect(withCouple.some((r) => r.secondTarabalaLabel !== null)).toBe(true);
    expect(withCouple.some((r) => r.secondChandrabalaLabel !== null)).toBe(true);
  });

  it("computes Varjyam, Amrita Kalam, Durmuhurtam, and Tamil Gowri Panchangam", () => {
    const date = new Date("2026-06-01T12:00:00Z");
    const va = computeVarjyamAndAmrita(date);
    expect(va.varjyam.end.getTime()).toBeGreaterThan(va.varjyam.start.getTime());
    expect(va.amritaKalam.end.getTime()).toBeGreaterThan(va.amritaKalam.start.getTime());

    const dur = computeDurmuhurtam(date, CHENNAI.lat, CHENNAI.lon);
    expect(dur.length).toBeGreaterThanOrEqual(1);

    const gowri = computeGowriPanchangam(date, CHENNAI.lat, CHENNAI.lon);
    expect(gowri).not.toBeNull();
    expect(gowri!.day).toHaveLength(8);
    expect(gowri!.night).toHaveLength(8);
  });

  it("computes Siddha/Amrita/Marana, Anandadi, Special Yogas, Mahadoshas, and Kundali Shuddhi", () => {
    // Sunday (0) + Hasta (12) + Dwitiya (1) -> Amrita Yoga + Sarvartha Siddhi + Amrita Siddhi
    const yogas = computeSpecialDayYogas(0, 1, 12);
    expect(yogas.siddhaYoga).toBe("Amrita Yoga");
    expect(yogas.specialYogas.some((y) => y.name === "Sarvartha Siddhi Yoga")).toBe(true);
    expect(yogas.specialYogas.some((y) => y.name === "Amrita Siddhi Yoga")).toBe(true);

    const maha = computeMahadoshas(new Date("2026-06-01T12:00:00Z"), 1);
    expect(Array.isArray(maha.activeDoshas)).toBe(true);

    // Put Mars in 8th house from Mesha Lagna (Vrischika = 7 -> 215°)
    const kundali = evaluateMuhurtaKundali(0, {
      Sun: 10,
      Moon: 40,
      Mars: 215,
      Mercury: 15,
      Jupiter: 95,
      Venus: 155, // Kanya = 5 -> 6th house -> Bhrigu Shatka!
      Saturn: 300,
      Rahu: 45,  // Vrishabha = 1 -> 2nd house
      Ketu: 345, // Meena = 11 -> 12th house -> Papa Kartari!
    });
    expect(kundali.isAshtamaShuddhi).toBe(false);
    expect(kundali.planetsIn8th).toContain("Mars");
    expect(kundali.hasBhriguShatka).toBe(true);
    expect(kundali.hasPapaKartari).toBe(true);
  });

  it("slices out Rahu/Yama/Gulika overlaps cleanly in subtractTimeWindows", () => {
    const base = {
      start: new Date("2026-06-01T09:00:00Z"),
      end: new Date("2026-06-01T11:00:00Z"),
    };
    const exclusion = {
      start: new Date("2026-06-01T09:30:00Z"),
      end: new Date("2026-06-01T10:15:00Z"),
    };
    const pieces = subtractTimeWindows(base, [exclusion], 15);
    expect(pieces).toHaveLength(2);
  });

  it("supports 365-day range and 31 activity presets", () => {
    expect(MAX_MUHURTA_RANGE_DAYS).toBe(365);
    expect(MUHURTA_ACTIVITIES.length).toBeGreaterThanOrEqual(30);
    const rows = searchMuhurtaDays({
      startDateStr: "2026-01-01",
      rangeDays: 365,
      maxResults: 40,
      latitude: CHENNAI.lat,
      longitude: CHENNAI.lon,
      activity: muhurtaActivityById("bhoomi-puja"),
    });
    expect(rows.length).toBe(40);
  });
});
