import { computeFullKpSystem, type KpSystemResult } from "./kp";
import type { EphemerisSettings } from "./ephemerisSettings";
import { DEFAULT_EPHEMERIS_SETTINGS } from "./ephemerisSettings";
import type { Planet } from "./types";

export interface KpMatchPerson {
  label: string;
  date: Date;
  latitude: number;
  longitude: number;
}

export interface KpMatchFactor {
  id: string;
  titleEn: string;
  titleTa: string;
  score: number;
  maxScore: number;
  noteEn: string;
  noteTa: string;
}

export interface KpMatchReport {
  a: { label: string; kp: KpSystemResult };
  b: { label: string; kp: KpSystemResult };
  factors: KpMatchFactor[];
  totalScore: number;
  maxScore: number;
  verdictEn: string;
  verdictTa: string;
}

function housesOf(kp: KpSystemResult, planet: Planet): number[] {
  return kp.planetSignificators.find((r) => r.planet === planet)?.allHouses ?? [];
}

function overlap(a: number[], b: number[]): number[] {
  const set = new Set(b);
  return a.filter((h) => set.has(h));
}

/**
 * Simplified KP-style matching for marriage/partnership:
 * 7th cusp sub-lords, common 2/7/11 significators, and mutual dasa-lord style links via star/sub.
 */
export function compareKpCharts(
  personA: KpMatchPerson,
  personB: KpMatchPerson,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): KpMatchReport {
  const kpA = computeFullKpSystem(personA.date, personA.latitude, personA.longitude, settings);
  const kpB = computeFullKpSystem(personB.date, personB.latitude, personB.longitude, settings);

  const factors: KpMatchFactor[] = [];

  const subA = kpA.cusps[6].subLord as Planet;
  const subB = kpB.cusps[6].subLord as Planet;
  const fav = [2, 7, 11];
  const aHouses = housesOf(kpA, subA);
  const bHouses = housesOf(kpB, subB);
  const aFav = overlap(aHouses, fav);
  const bFav = overlap(bHouses, fav);

  let f7 = 0;
  if (aFav.length >= 2) f7 += 2;
  else if (aFav.length === 1) f7 += 1;
  if (bFav.length >= 2) f7 += 2;
  else if (bFav.length === 1) f7 += 1;
  factors.push({
    id: "7th-sub",
    titleEn: "7th Cusp Sub-Lords vs 2/7/11",
    titleTa: "7-ஆம் பாவ உப vs 2/7/11",
    score: f7,
    maxScore: 4,
    noteEn: `A Sub ${subA} → [${aHouses.join(", ")}] fav ${aFav.join(",") || "—"}; B Sub ${subB} → [${bHouses.join(", ")}] fav ${bFav.join(",") || "—"}.`,
    noteTa: `அ உப ${subA}; ஆ உப ${subB}.`,
  });

  // Common significators for house 7
  const sigA7 = new Set(kpA.houseSignificators[6].allSignificators);
  const sigB7 = new Set(kpB.houseSignificators[6].allSignificators);
  const common7 = [...sigA7].filter((p) => sigB7.has(p));
  const cScore = Math.min(4, common7.length);
  factors.push({
    id: "common-7",
    titleEn: "Common significators of 7th",
    titleTa: "7-ஆம் பாவ பொதுவான குறிப்பான்கள்",
    score: cScore,
    maxScore: 4,
    noteEn: common7.length ? `Common: ${common7.join(", ")}` : "No common 7th significators.",
    noteTa: common7.length ? `பொது: ${common7.join(", ")}` : "பொதுவான குறிப்பான்கள் இல்லை.",
  });

  // A's planets in B's stars of 2/7/11 significators (mutual link)
  const bFavSigs = new Set(
    [2, 7, 11].flatMap((h) => kpB.houseSignificators[h - 1].allSignificators),
  );
  const aInBStars = Object.values(kpA.planets).filter((p) =>
    bFavSigs.has(p.nakshatraLord as Planet),
  ).length;
  const aLink = Math.min(3, aInBStars);
  factors.push({
    id: "a-in-b-stars",
    titleEn: "A planets in stars of B's 2/7/11 significators",
    titleTa: "அ கிரகங்கள் ஆ-வின் 2/7/11 நட்சத்திரங்களில்",
    score: aLink,
    maxScore: 3,
    noteEn: `${aInBStars} planet(s) of A sit in stars ruled by B's marriage significators.`,
    noteTa: `அ-வின் ${aInBStars} கிரகம்(கள்) ஆ-வின் திருமண குறிப்பான நட்சத்திரங்களில்.`,
  });

  const aFavSigs = new Set(
    [2, 7, 11].flatMap((h) => kpA.houseSignificators[h - 1].allSignificators),
  );
  const bInAStars = Object.values(kpB.planets).filter((p) =>
    aFavSigs.has(p.nakshatraLord as Planet),
  ).length;
  const bLink = Math.min(3, bInAStars);
  factors.push({
    id: "b-in-a-stars",
    titleEn: "B planets in stars of A's 2/7/11 significators",
    titleTa: "ஆ கிரகங்கள் அ-வின் 2/7/11 நட்சத்திரங்களில்",
    score: bLink,
    maxScore: 3,
    noteEn: `${bInAStars} planet(s) of B sit in stars ruled by A's marriage significators.`,
    noteTa: `ஆ-வின் ${bInAStars} கிரகம்(கள்) அ-வின் திருமண குறிப்பான நட்சத்திரங்களில்.`,
  });

  // Moon star harmony (same star lord)
  const moonStarSame = kpA.planets.Moon.nakshatraLord === kpB.planets.Moon.nakshatraLord;
  factors.push({
    id: "moon-star",
    titleEn: "Moon star lords",
    titleTa: "சந்திர நட்சத்திர அதிபதிகள்",
    score: moonStarSame ? 2 : 0,
    maxScore: 2,
    noteEn: moonStarSame
      ? `Both Moon stars ruled by ${kpA.planets.Moon.nakshatraLord}.`
      : `A Moon star ${kpA.planets.Moon.nakshatraLord} vs B ${kpB.planets.Moon.nakshatraLord}.`,
    noteTa: moonStarSame
      ? `இரு சந்திர நட்சத்திரங்களும் ${kpA.planets.Moon.nakshatraLord}.`
      : `அ ${kpA.planets.Moon.nakshatraLord} / ஆ ${kpB.planets.Moon.nakshatraLord}.`,
  });

  const totalScore = factors.reduce((s, f) => s + f.score, 0);
  const maxScore = factors.reduce((s, f) => s + f.maxScore, 0);
  const pct = maxScore ? totalScore / maxScore : 0;
  let verdictEn: string;
  let verdictTa: string;
  if (pct >= 0.7) {
    verdictEn = "Strong KP agreement for partnership.";
    verdictTa = "கூட்டாண்மைக்கு வலுவான கேபி ஒற்றுமை.";
  } else if (pct >= 0.45) {
    verdictEn = "Moderate KP agreement — workable with care.";
    verdictTa = "மிதமான ஒற்றுமை — கவனத்துடன் சாத்தியம்.";
  } else {
    verdictEn = "Weak KP agreement — friction likely on 2/7/11 matters.";
    verdictTa = "பலவீன ஒற்றுமை — 2/7/11 விஷயங்களில் சிரமம்.";
  }

  return {
    a: { label: personA.label, kp: kpA },
    b: { label: personB.label, kp: kpB },
    factors,
    totalScore,
    maxScore,
    verdictEn,
    verdictTa,
  };
}
