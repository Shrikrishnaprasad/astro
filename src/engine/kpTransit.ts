import type { EphemerisSettings } from "./ephemerisSettings";
import { kpLordChainAtLongitude } from "./kp";
import { getSiderealLongitudes } from "./planetaryPositions";
import type { LongitudeMap, Planet } from "./types";

const DAY_MS = 86400000;
/** Slow/medium transit planets used as triggers. Moon is too fast for window-level scanning. */
export const KP_TRIGGER_PLANETS: Planet[] = ["Sun", "Jupiter", "Saturn"];

export interface KpTransitTrigger {
  start: Date;
  end: Date;
  /** Transiting planets (in the star of an event planet) during this range. */
  planets: Planet[];
  /** Extra detail, e.g. "Jupiter in Rohini (Moon star), sub Venus". */
  details: string[];
  /** Number of trigger planets active together. */
  count: number;
}

export type TransitLongitudeCache = Map<number, LongitudeMap>;

function lonsOnDay(
  dayIndex: number,
  settings: EphemerisSettings,
  cache: TransitLongitudeCache,
): LongitudeMap {
  let v = cache.get(dayIndex);
  if (!v) {
    v = getSiderealLongitudes(new Date(dayIndex * DAY_MS + DAY_MS / 2), settings);
    cache.set(dayIndex, v);
  }
  return v;
}

/**
 * Find dates inside [start, end] when transiting Sun/Jupiter/Saturn sit in the star of an
 * event planet (and, to be stricter, whose sub-lord is also an event or connected planet).
 * Ranges where several triggers act together are ranked first.
 */
export function findKpTransitTriggers(
  start: Date,
  end: Date,
  eventPlanets: Set<Planet>,
  connectedPlanets: Set<Planet>,
  settings: EphemerisSettings,
  cache: TransitLongitudeCache = new Map(),
  limit = 3,
  maxDays = 500,
): KpTransitTrigger[] {
  const first = Math.floor(start.getTime() / DAY_MS);
  const last = Math.min(Math.floor(end.getTime() / DAY_MS), first + maxDays);

  const days: { day: number; planets: Planet[]; details: string[] }[] = [];
  for (let d = first; d <= last; d++) {
    const lons = lonsOnDay(d, settings, cache);
    const planets: Planet[] = [];
    const details: string[] = [];
    for (const p of KP_TRIGGER_PLANETS) {
      const chain = kpLordChainAtLongitude(lons[p]);
      const starOk = eventPlanets.has(chain.nakshatraLord as Planet);
      const subOk =
        eventPlanets.has(chain.subLord as Planet) || connectedPlanets.has(chain.subLord as Planet);
      if (starOk && subOk) {
        planets.push(p);
        details.push(
          `${p} in ${chain.nakshatraName} (star ${chain.nakshatraLord}, sub ${chain.subLord})`,
        );
      }
    }
    days.push({ day: d, planets, details });
  }

  const runs: KpTransitTrigger[] = [];
  let cur: { startDay: number; endDay: number; planets: Set<Planet>; details: Set<string> } | null =
    null;
  const flush = () => {
    if (!cur) return;
    runs.push({
      start: new Date(cur.startDay * DAY_MS),
      end: new Date((cur.endDay + 1) * DAY_MS),
      planets: Array.from(cur.planets),
      details: Array.from(cur.details),
      count: cur.planets.size,
    });
    cur = null;
  };
  for (const d of days) {
    // A run continues while at least two triggers act together (or one if it is Jupiter/Saturn).
    const qualifies =
      d.planets.length >= 2 || d.planets.includes("Jupiter") || d.planets.includes("Saturn");
    if (!qualifies) {
      flush();
      continue;
    }
    if (!cur) {
      cur = { startDay: d.day, endDay: d.day, planets: new Set(), details: new Set() };
    }
    cur.endDay = d.day;
    d.planets.forEach((p) => cur!.planets.add(p));
    d.details.forEach((x) => cur!.details.add(x));
  }
  flush();

  return runs
    .sort((a, b) => b.count - a.count || a.start.getTime() - b.start.getTime())
    .slice(0, limit)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}
