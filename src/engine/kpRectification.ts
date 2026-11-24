import {
  DEFAULT_EPHEMERIS_SETTINGS,
  resolveEphemerisSettings,
  type EphemerisSettings,
} from "./ephemerisSettings";
import { computeVimshottariDasa, findActiveMahadasaAndBhukti } from "./dasa";
import { computeFullKpSystem, type KpEventPromise, type KpSystemResult } from "./kp";
import type { Planet } from "./types";

export interface KpLifeEvent {
  /** Stable id for UI keys. */
  id: string;
  /** Must match a KP_EVENT_TOPICS id (marriage, career, …). */
  topicId: string;
  /** Known event date (local calendar day is enough; time noon UTC is fine). */
  date: Date;
  label?: string;
}

export interface KpRectificationOptions {
  /** Half-width of the search around the given birth time (minutes). Default 30. */
  windowMinutes?: number;
  /** Step between candidate birth times (minutes). Default 2. */
  stepMinutes?: number;
  settings?: EphemerisSettings;
  latitude: number;
  longitude: number;
  /** Nominal birth instant (center of the search). */
  birthDate: Date;
}

export interface KpEventFit {
  topicId: string;
  label: string;
  eventDate: Date;
  verdict: KpEventPromise["verdict"];
  score: number;
  noteEn: string;
  noteTa: string;
  dasaLord: Planet | null;
  bhuktiLord: Planet | null;
}

export interface KpRectificationCandidate {
  birthDate: Date;
  offsetMinutes: number;
  totalScore: number;
  lagnaSignLord: Planet;
  lagnaStarLord: Planet;
  lagnaSubLord: Planet;
  eventFits: KpEventFit[];
  summaryEn: string;
  summaryTa: string;
}

export interface KpRectificationResult {
  center: Date;
  windowMinutes: number;
  stepMinutes: number;
  candidates: KpRectificationCandidate[];
  /** Best score among candidates. */
  bestScore: number;
}

function topicEventPlanets(promise: KpEventPromise, kp: KpSystemResult): Set<Planet> {
  const set = new Set<Planet>();
  for (const row of kp.planetSignificators) {
    const houses = new Set(row.allHouses);
    const fav = promise.favorableHouses.filter((h) => houses.has(h)).length;
    const neg = promise.negatingHouses.filter((h) => houses.has(h)).length;
    if ((fav >= 2 && fav > neg) || row.planet === promise.cuspSubLord) set.add(row.planet);
  }
  return set;
}

function scoreEventAtBirth(
  kp: KpSystemResult,
  birthDate: Date,
  event: KpLifeEvent,
): KpEventFit {
  const promise = kp.eventPromises.find((p) => p.id === event.topicId);
  const label = event.label ?? promise?.topic ?? event.topicId;
  if (!promise) {
    return {
      topicId: event.topicId,
      label,
      eventDate: event.date,
      verdict: "Denied / Unfavorable",
      score: 0,
      noteEn: `Unknown topic "${event.topicId}".`,
      noteTa: `தெரியாத தலைப்பு "${event.topicId}".`,
      dasaLord: null,
      bhuktiLord: null,
    };
  }

  let score = 0;
  if (promise.verdict === "Promised (Strong)") score += 3;
  else if (promise.verdict === "Promised with Delay / Mixed") score += 1;
  else score -= 2;

  const dasas = computeVimshottariDasa(kp.planets.Moon.longitude, birthDate, 1, 2);
  const { mahadasa, bhukti } = findActiveMahadasaAndBhukti(dasas, event.date);
  const dasaLord = (mahadasa?.lord as Planet) ?? null;
  const bhuktiLord = (bhukti?.lord as Planet) ?? null;
  const carriers = topicEventPlanets(promise, kp);

  const partsEn: string[] = [`Verdict: ${promise.verdict}`];
  const partsTa: string[] = [`தீர்ப்பு: ${promise.verdict}`];

  if (dasaLord && bhuktiLord) {
    partsEn.push(`At event: Dasa ${dasaLord} · Bhukti ${bhuktiLord}`);
    partsTa.push(`நிகழ்வில்: தசை ${dasaLord} · புக்தி ${bhuktiLord}`);
    const both = carriers.has(dasaLord) && carriers.has(bhuktiLord);
    const one = carriers.has(dasaLord) || carriers.has(bhuktiLord);
    if (both) {
      score += 4;
      partsEn.push("Both dasa & bhukti carry the matter.");
      partsTa.push("தசை & புக்தி இருவரும் பொருளைச் சுமக்கின்றனர்.");
    } else if (one) {
      score += 2;
      partsEn.push("One of dasa/bhukti carries the matter.");
      partsTa.push("தசை/புக்தியில் ஒருவர் பொருளைச் சுமக்கிறார்.");
    } else {
      score -= 1;
      partsEn.push("Running lords do not carry the matter.");
      partsTa.push("நடப்பு அதிபதிகள் பொருளைச் சுமக்கவில்லை.");
    }
  }

  // Sub-lord of the primary cusp should be among running lords or their chain for a good fit.
  const sub = promise.cuspSubLord;
  if (dasaLord === sub || bhuktiLord === sub) {
    score += 2;
    partsEn.push(`Cusp Sub-Lord ${sub} is a running lord.`);
    partsTa.push(`பாவ உப-அதிபதி ${sub} நடப்பு அதிபதி.`);
  }

  return {
    topicId: event.topicId,
    label,
    eventDate: event.date,
    verdict: promise.verdict,
    score,
    noteEn: partsEn.join(" "),
    noteTa: partsTa.join(" "),
    dasaLord,
    bhuktiLord,
  };
}

/**
 * Scan birth times around a nominal instant and rank candidates by how well
 * known life events fit KP promise + dasa–bhukti significators.
 */
export function rectifyKpBirthTime(
  events: KpLifeEvent[],
  options: KpRectificationOptions,
): KpRectificationResult {
  const windowMinutes = options.windowMinutes ?? 30;
  const stepMinutes = Math.max(1, options.stepMinutes ?? 2);
  const settings = resolveEphemerisSettings(options.settings ?? DEFAULT_EPHEMERIS_SETTINGS);
  const center = options.birthDate;
  const candidates: KpRectificationCandidate[] = [];

  for (let offset = -windowMinutes; offset <= windowMinutes; offset += stepMinutes) {
    const birthDate = new Date(center.getTime() + offset * 60_000);
    const kp = computeFullKpSystem(
      birthDate,
      options.latitude,
      options.longitude,
      settings,
    );
    const eventFits = events.map((e) => scoreEventAtBirth(kp, birthDate, e));
    const totalScore = eventFits.reduce((s, f) => s + f.score, 0);
    const lagna = kp.cusps[0];
    candidates.push({
      birthDate,
      offsetMinutes: offset,
      totalScore,
      lagnaSignLord: lagna.rasiLord as Planet,
      lagnaStarLord: lagna.nakshatraLord as Planet,
      lagnaSubLord: lagna.subLord as Planet,
      eventFits,
      summaryEn: `Offset ${offset >= 0 ? "+" : ""}${offset} min · Lagna Sub ${lagna.subLord} · score ${totalScore}`,
      summaryTa: `மாற்றம் ${offset >= 0 ? "+" : ""}${offset} நிமி · லக்ன உப ${lagna.subLord} · மதிப்பெண் ${totalScore}`,
    });
  }

  candidates.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return Math.abs(a.offsetMinutes) - Math.abs(b.offsetMinutes);
  });

  return {
    center,
    windowMinutes,
    stepMinutes,
    candidates,
    bestScore: candidates[0]?.totalScore ?? 0,
  };
}
