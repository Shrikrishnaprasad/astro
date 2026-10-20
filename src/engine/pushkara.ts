import { NAVAMSA_SPAN_DEGREES, PUSHKARA_BHAGA_DEGREE, PUSHKARA_NAVAMSA_PADAS } from "../data/pushkaraRules";
import { RASIS } from "../data/rasis";
import { normalizeDegrees } from "./constants";
import { getSiderealLongitudes } from "./planetaryPositions";

export interface PushkaraResult {
  navamsaPada: number; // 1-9
  isPushkaraNavamsa: boolean;
  pushkaraBhagaDegree: number;
  degreeFromBhaga: number; // signed difference, degreeInRasi - bhagaDegree
  isNearPushkaraBhaga: boolean; // within orb of the Pushkara Bhaga point
}

const PUSHKARA_BHAGA_ORB_DEGREES = 1;

export function computePushkara(rasiIndex: number, degreeInRasi: number): PushkaraResult {
  const element = RASIS[rasiIndex].element;
  const navamsaPada = Math.floor(degreeInRasi / NAVAMSA_SPAN_DEGREES) + 1;
  const [padaA, padaB] = PUSHKARA_NAVAMSA_PADAS[element];
  const isPushkaraNavamsa = navamsaPada === padaA || navamsaPada === padaB;

  const bhagaDegree = PUSHKARA_BHAGA_DEGREE[element];
  const degreeFromBhaga = degreeInRasi - bhagaDegree;
  const isNearPushkaraBhaga = Math.abs(degreeFromBhaga) <= PUSHKARA_BHAGA_ORB_DEGREES;

  return {
    navamsaPada,
    isPushkaraNavamsa,
    pushkaraBhagaDegree: bhagaDegree,
    degreeFromBhaga,
    isNearPushkaraBhaga,
  };
}

/** Pushkara status for a body sitting at the given ecliptic longitude. */
export function computePushkaraForLongitude(longitude: number): PushkaraResult {
  const norm = normalizeDegrees(longitude);
  const rasiIndex = Math.floor(norm / 30);
  const degreeInRasi = norm - rasiIndex * 30;
  return computePushkara(rasiIndex, degreeInRasi);
}

export interface PushkaraWindow {
  start: Date;
  end: Date;
}

/**
 * Finds every window within [dayStart, dayEnd) during which a body (given by
 * `longitudeAt`, its sidereal ecliptic longitude at a moment in time) is
 * transiting a Pushkara Navamsa pada, by sampling coarsely then bisecting
 * across each step where the in/out state flips (same technique as the
 * tithi/nakshatra boundary search in panchanga.ts, generalized to booleans
 * and bounded to a span instead of searching for a single next crossing).
 *
 * Works for the Moon, any other graha, or the Lagna (pass a longitude
 * function that re-resolves the ascendant for the time being sampled) — but
 * callers should pick `stepMinutes` small enough that the window (navamsa
 * span / the body's speed) can't be skipped between samples; the Lagna moves
 * ~360°/day so needs a much finer step than a slow outer planet.
 */
export function computePushkaraNavamsaWindowsFor(
  longitudeAt: (date: Date) => number,
  dayStart: Date,
  dayEnd: Date,
  stepMinutes = 10,
): PushkaraWindow[] {
  const isActiveAt = (date: Date) => computePushkaraForLongitude(longitudeAt(date)).isPushkaraNavamsa;

  const windows: PushkaraWindow[] = [];
  const endTime = dayEnd.getTime();
  let t = dayStart.getTime();
  let active = isActiveAt(dayStart);
  let windowStart = active ? dayStart : null;

  while (t < endTime) {
    const nextT = Math.min(t + stepMinutes * 60 * 1000, endTime);
    const state = isActiveAt(new Date(nextT));
    if (state !== active) {
      let lo = t;
      let hi = nextT;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        if (isActiveAt(new Date(mid)) === active) lo = mid;
        else hi = mid;
      }
      const crossing = new Date(hi);
      if (active) {
        windows.push({ start: windowStart ?? dayStart, end: crossing });
        windowStart = null;
      } else {
        windowStart = crossing;
      }
      active = state;
    }
    t = nextT;
  }

  if (active) {
    windows.push({ start: windowStart ?? dayStart, end: dayEnd });
  }

  return windows;
}

export function computePushkaraNavamsaWindows(
  dayStart: Date,
  dayEnd: Date,
  stepMinutes = 10,
): PushkaraWindow[] {
  return computePushkaraNavamsaWindowsFor(
    (d) => getSiderealLongitudes(d).Moon,
    dayStart,
    dayEnd,
    stepMinutes,
  );
}
