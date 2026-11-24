import {
  computeFullKpSystem,
  computeKpRulingPlanets,
  KP_EVENT_TOPICS,
  type KpSystemResult,
} from "./kp";
import type { EphemerisSettings } from "./ephemerisSettings";
import { DEFAULT_EPHEMERIS_SETTINGS, resolveEphemerisSettings } from "./ephemerisSettings";
import type { Planet } from "./types";

export interface KpMuhurtaSlot {
  start: Date;
  score: number;
  lagnaSubLord: Planet;
  moonSubLord: Planet;
  dayLord: Planet;
  rulingPlanets: Planet[];
  hits: string[];
  noteEn: string;
  noteTa: string;
}

export interface KpMuhurtaSearchResult {
  topicId: string;
  topic: string;
  natalSubLord: Planet;
  favorableHouses: number[];
  slots: KpMuhurtaSlot[];
  scannedFrom: Date;
  scannedTo: Date;
  stepMinutes: number;
}

export interface KpMuhurtaSearchOptions {
  natal: KpSystemResult;
  topicId: string;
  /** Search start (default: now). */
  from?: Date;
  /** Days to scan (default 14). */
  days?: number;
  /** Sampling step in minutes (default 60). */
  stepMinutes?: number;
  latitude: number;
  longitude: number;
  settings?: EphemerisSettings;
  /** Max slots to return (default 12). */
  limit?: number;
}

/**
 * KP election: sample moments where Ruling Planets include the natal topic's
 * cusp Sub-Lord (and ideally Moon/Lagna subs that signify favorable houses).
 */
export function searchKpMuhurta(options: KpMuhurtaSearchOptions): KpMuhurtaSearchResult {
  const topic = KP_EVENT_TOPICS.find((t) => t.id === options.topicId) ?? KP_EVENT_TOPICS[0];
  const promise = options.natal.eventPromises.find((p) => p.id === topic.id);
  const natalSub = (promise?.cuspSubLord ?? options.natal.cusps[topic.primaryCusp - 1].subLord) as Planet;
  const favorable = topic.favorableHouses;
  const settings = resolveEphemerisSettings(options.settings ?? DEFAULT_EPHEMERIS_SETTINGS);

  const from = options.from ?? new Date();
  const days = Math.min(60, Math.max(1, options.days ?? 14));
  const stepMinutes = Math.max(15, options.stepMinutes ?? 60);
  const limit = options.limit ?? 12;
  const to = new Date(from.getTime() + days * 86400000);

  // Houses each planet signifies in the natal chart (for Moon/Lagna sub scoring).
  const natalHouses = Object.fromEntries(
    options.natal.planetSignificators.map((r) => [r.planet, new Set(r.allHouses)]),
  ) as Record<Planet, Set<number>>;

  const slots: KpMuhurtaSlot[] = [];
  for (let t = from.getTime(); t <= to.getTime(); t += stepMinutes * 60_000) {
    const instant = new Date(t);
    const rp = computeKpRulingPlanets(instant, options.latitude, options.longitude, settings);
    const rpSet = new Set(rp.rankedUnique.map((r) => r.planet));
    const hits: string[] = [];
    let score = 0;

    if (rpSet.has(natalSub)) {
      score += 4;
      hits.push(`RP includes natal cusp Sub-Lord ${natalSub}`);
    } else {
      continue; // hard filter: must include natal sub-lord
    }

    if (rp.moonSubLord === natalSub || rp.lagnaSubLord === natalSub) {
      score += 2;
      hits.push("Moon or Lagna Sub equals natal Sub-Lord");
    }

    const moonFav = favorable.filter((h) => natalHouses[rp.moonSubLord]?.has(h)).length;
    const lagnaFav = favorable.filter((h) => natalHouses[rp.lagnaSubLord]?.has(h)).length;
    if (moonFav > 0) {
      score += moonFav;
      hits.push(`Moon Sub ${rp.moonSubLord} touches fav houses`);
    }
    if (lagnaFav > 0) {
      score += lagnaFav;
      hits.push(`Lagna Sub ${rp.lagnaSubLord} touches fav houses`);
    }

    // Day lord among natal significators of favorable houses
    const dayOk = favorable.some((h) =>
      options.natal.houseSignificators[h - 1].allSignificators.includes(rp.dayLord),
    );
    if (dayOk) {
      score += 1;
      hits.push(`Day Lord ${rp.dayLord} is a fav-house significator`);
    }

    slots.push({
      start: instant,
      score,
      lagnaSubLord: rp.lagnaSubLord,
      moonSubLord: rp.moonSubLord,
      dayLord: rp.dayLord,
      rulingPlanets: rp.rankedUnique.map((r) => r.planet),
      hits,
      noteEn: hits.join("; "),
      noteTa: `ஆளும்: ${rp.rankedUnique
        .slice(0, 4)
        .map((r) => r.planet)
        .join(", ")} · மதிப்பெண் ${score}`,
    });
  }

  slots.sort((a, b) => b.score - a.score || a.start.getTime() - b.start.getTime());

  return {
    topicId: topic.id,
    topic: topic.topic,
    natalSubLord: natalSub,
    favorableHouses: favorable,
    slots: slots.slice(0, limit),
    scannedFrom: from,
    scannedTo: to,
    stepMinutes,
  };
}

/** Convenience: build natal KP then search. */
export function searchKpMuhurtaForBirth(
  birthDate: Date,
  latitude: number,
  longitude: number,
  topicId: string,
  settings?: EphemerisSettings,
  search?: Partial<KpMuhurtaSearchOptions>,
): KpMuhurtaSearchResult {
  const natal = computeFullKpSystem(birthDate, latitude, longitude, settings);
  return searchKpMuhurta({
    natal,
    topicId,
    latitude,
    longitude,
    settings,
    ...search,
  });
}
