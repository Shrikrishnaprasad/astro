import { getKp249Entry, getKp249Table, kpLordChainAtLongitude, type Kp249Entry } from "./kp";
import type { EphemerisSettings } from "./ephemerisSettings";
import { DEFAULT_EPHEMERIS_SETTINGS, resolveEphemerisSettings } from "./ephemerisSettings";
import { getSiderealAscendant } from "./ascendant";
import { getSiderealLongitudes } from "./planetaryPositions";
import type { Planet } from "./types";
import type { KpSystemResult } from "./kp";

export type KpHoraryNumberSource = "manual" | "random" | "moonSub" | "lagnaSub" | "typed";

export interface KpHoraryNumberPick {
  number: number;
  entry: Kp249Entry;
  source: KpHoraryNumberSource;
  noteEn: string;
  noteTa: string;
}

/** Find the 1–249 entry whose span contains a sidereal longitude. */
export function kp249NumberAtLongitude(siderealLongitude: number): Kp249Entry {
  const table = getKp249Table();
  const lon = ((siderealLongitude % 360) + 360) % 360;
  for (const e of table) {
    if (e.startLongitude <= e.endLongitude) {
      if (lon >= e.startLongitude && lon < e.endLongitude - 1e-12) return e;
    } else {
      // Should not wrap for KP subs, but be safe
      if (lon >= e.startLongitude || lon < e.endLongitude) return e;
    }
  }
  return table[table.length - 1];
}

export function pickKpHoraryFromMoon(
  date: Date,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): KpHoraryNumberPick {
  const resolved = resolveEphemerisSettings(settings);
  const moon = getSiderealLongitudes(date, resolved).Moon;
  const entry = kp249NumberAtLongitude(moon);
  return {
    number: entry.number,
    entry,
    source: "moonSub",
    noteEn: `From Moon's KP Sub at judgment (${entry.nakshatraName}, Sub ${entry.subLord}).`,
    noteTa: `தீர்ப்பு நேர சந்திர உப (#${entry.number}, ${entry.nakshatraName}, உப ${entry.subLord}).`,
  };
}

export function pickKpHoraryFromLagna(
  date: Date,
  latitude: number,
  longitude: number,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): KpHoraryNumberPick {
  const resolved = resolveEphemerisSettings(settings);
  const asc = getSiderealAscendant(date, latitude, longitude, resolved);
  const entry = kp249NumberAtLongitude(asc);
  return {
    number: entry.number,
    entry,
    source: "lagnaSub",
    noteEn: `From Lagna's KP Sub at judgment (${entry.nakshatraName}, Sub ${entry.subLord}).`,
    noteTa: `தீர்ப்பு நேர லக்ன உப (#${entry.number}, ${entry.nakshatraName}, உப ${entry.subLord}).`,
  };
}

export function pickKpHoraryRandom(): KpHoraryNumberPick {
  const number = Math.floor(Math.random() * 249) + 1;
  const entry = getKp249Entry(number);
  return {
    number,
    entry,
    source: "random",
    noteEn: `Random KP number #${number}.`,
    noteTa: `சீரற்ற கேபி எண் #${number}.`,
  };
}

export function pickKpHoraryTyped(raw: string): KpHoraryNumberPick | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  // Classic: take last 3 digits mod 249, map 0 → 249
  const n = Number(digits.slice(-3));
  const number = n === 0 ? 249 : ((n - 1) % 249) + 1;
  const entry = getKp249Entry(number);
  return {
    number,
    entry,
    source: "typed",
    noteEn: `From typed digits "${digits}" → KP #${number}.`,
    noteTa: `உள்ளிட்ட எண்கள் "${digits}" → கேபி #${number}.`,
  };
}

export interface KpHoraryJudgment {
  moonSubLord: Planet;
  moonStarLord: Planet;
  dayLord: Planet;
  moonRetroNoteEn: string;
  moonRetroNoteTa: string;
  nodeNotes: string[];
  /** True when Moon Sub is among Ruling Planets (strong confirmation). */
  moonSubIsRuling: boolean;
  /** True when cusp-1 Sub is among Ruling Planets. */
  lagnaSubIsRuling: boolean;
  summaryEn: string;
  summaryTa: string;
}

/**
 * Extra KP horary checks: Moon sub, day lord, RP overlap, Rahu/Ketu & retrograde notes.
 */
export function judgeKpHoraryExtras(kp: KpSystemResult): KpHoraryJudgment {
  const moon = kp.planets.Moon;
  const rp = new Set(kp.rulingPlanets.rankedUnique.map((r) => r.planet));
  const moonSub = moon.subLord as Planet;
  const moonStar = moon.nakshatraLord as Planet;
  const dayLord = kp.rulingPlanets.dayLord;
  const lagnaSub = kp.rulingPlanets.lagnaSubLord;

  const nodeNotes: string[] = [];
  for (const node of ["Rahu", "Ketu"] as const) {
    const row = kp.planetSignificators.find((r) => r.planet === node);
    if (row?.nodeAgentNote) nodeNotes.push(`${node}: ${row.nodeAgentNote}`);
    if (kp.planets[node].isRetrograde) {
      /* nodes are always retrograde in tropical mean; still note if flagged */
    }
  }
  for (const p of Object.values(kp.planets)) {
    if (p.isRetrograde && p.planet !== "Rahu" && p.planet !== "Ketu") {
      nodeNotes.push(`${p.planet} is retrograde — expect revision/delay in matters it rules.`);
    }
  }

  const moonSubIsRuling = rp.has(moonSub);
  const lagnaSubIsRuling = rp.has(lagnaSub);

  const summaryEn =
    `Moon Star ${moonStar} · Moon Sub ${moonSub}${moonSubIsRuling ? " (also Ruling Planet)" : ""}; ` +
    `Day Lord ${dayLord}; Lagna Sub ${lagnaSub}${lagnaSubIsRuling ? " (also RP)" : ""}. ` +
    (moonSubIsRuling && lagnaSubIsRuling
      ? "Strong RP confirmation for the judgment moment."
      : moonSubIsRuling || lagnaSubIsRuling
        ? "Partial RP confirmation."
        : "Weak RP confirmation — prefer a later judgment time if possible.");

  const summaryTa =
    `சந்திர நட்சத்திரம் ${moonStar} · உப ${moonSub}${moonSubIsRuling ? " (ஆளும் கிரகமும்)" : ""}; ` +
    `வார அதிபதி ${dayLord}; லக்ன உப ${lagnaSub}${lagnaSubIsRuling ? " (ஆளும்)" : ""}.`;

  return {
    moonSubLord: moonSub,
    moonStarLord: moonStar,
    dayLord,
    moonRetroNoteEn: moon.isRetrograde
      ? "Moon retrograde is rare in tropical; treat as unstable mind of querent."
      : "Moon is direct.",
    moonRetroNoteTa: moon.isRetrograde ? "சந்திரன் வக்ரம் — கேள்வியாளர் மனம் அலையும்." : "சந்திரன் நேர்.",
    nodeNotes,
    moonSubIsRuling,
    lagnaSubIsRuling,
    summaryEn,
    summaryTa,
  };
}

/** Expanded topic keywords (EN + TA) for question matching. */
export const KP_QUESTION_KEYWORDS: Record<string, string[]> = {
  marriage: [
    "marriage", "marry", "wedding", "spouse", "husband", "wife", "partner", "divorce", "love",
    "engagement", "alliance", "kalyanam", "திருமண", "கல்யாண", "கணவன்", "மனைவி", "விவாக", "காதல்",
  ],
  career: [
    "job", "career", "promotion", "profession", "work", "business", "employ", "transfer", "office",
    "interview", "வேலை", "தொழில்", "பதவி", "வணிகம்", "அலுவலகம்", "நியமனம்",
  ],
  finance: [
    "money", "wealth", "income", "profit", "gain", "finance", "salary", "lottery", "debt", "loan recovery",
    "பணம்", "வருமான", "செல்வம்", "லாபம்", "சம்பளம்", "கடன்",
  ],
  childbirth: [
    "child", "baby", "pregnan", "progeny", "son", "daughter", "conceive", "delivery",
    "குழந்தை", "கர்ப்பம்", "பிறப்பு", "மகன்", "மகள்", "சந்ததி",
  ],
  property: [
    "house", "home", "property", "land", "flat", "vehicle", "car", "plot", "real estate", "bike",
    "வீடு", "நிலம்", "சொத்து", "வாகனம்", "கார்", "பிளாட்",
  ],
  education: [
    "exam", "study", "education", "degree", "college", "admission", "result", "course", "school",
    "படிப்பு", "தேர்வு", "கல்வி", "பள்ளி", "கல்லூரி", "சேர்க்கை",
  ],
  foreign: [
    "abroad", "foreign", "visa", "immigr", "overseas", "settle", "travel", "passport", "green card",
    "வெளிநாடு", "விசா", "குடியேற்றம்", "பயணம்",
  ],
  litigation: [
    "court", "case", "litigation", "lawsuit", "loan", "dispute", "compet", "enemy", "contest",
    "வழக்கு", "கடன்", "போட்டி", "எதிரி", "நீதிமன்றம்",
  ],
  health: [
    "health", "disease", "illness", "recover", "surgery", "operation", "sick", "medical", "hospital",
    "ஆரோக்கிய", "நோய்", "அறுவை", "மருத்துவ", "சுகம்",
  ],
};

export function matchKpTopicDetailed(question: string): {
  topicId: string | null;
  score: number;
  matchedWords: string[];
} {
  const q = question.trim().toLowerCase();
  if (!q) return { topicId: null, score: 0, matchedWords: [] };
  let best: { id: string; score: number; words: string[] } | null = null;
  for (const [id, words] of Object.entries(KP_QUESTION_KEYWORDS)) {
    const hit = words.filter((w) => q.includes(w.toLowerCase()));
    if (hit.length > 0 && (!best || hit.length > best.score)) {
      best = { id, score: hit.length, words: hit };
    }
  }
  return best
    ? { topicId: best.id, score: best.score, matchedWords: best.words }
    : { topicId: null, score: 0, matchedWords: [] };
}

/** Keep chain helper available for other modules without circular imports. */
export function moonChainAt(date: Date, settings?: EphemerisSettings) {
  const resolved = resolveEphemerisSettings(settings ?? DEFAULT_EPHEMERIS_SETTINGS);
  return kpLordChainAtLongitude(getSiderealLongitudes(date, resolved).Moon);
}
