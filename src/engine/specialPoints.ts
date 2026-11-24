import { GULIKA_KALAM_SLOT, GULIKA_NIGHT_SLOT } from "../data/panchangaRules";
import { JAMAGRAHAM_PERIOD_HOURS, JAMAGRAHAM_SEQUENCE, WEEKDAY_LORD } from "../data/jamagraham";
import { getSiderealAscendant } from "./ascendant";
import {
  DEFAULT_EPHEMERIS_SETTINGS,
  type EphemerisSettings,
} from "./ephemerisSettings";
import { dividedWindow } from "./panchanga";
import { getMostRecentSunrise, getSunriseSunset } from "./sunTimes";
import type { Planet } from "./types";

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export type UpagrahaPoint = {
  longitude: number;
  rasiIndex: number;
  /** Instant whose sidereal lagna defines this point. */
  moment: Date;
};

export type GulikaMandhiResult = {
  /** Lagna at the start of Saturn's day/night eighth — classical Gulika (BPHS). */
  gulika: UpagrahaPoint;
  /** Lagna at the middle of that same eighth — Mandhi / Maandi (JHora convention). */
  mandhi: UpagrahaPoint;
  /** Start of Saturn's portion (same as Gulika Kalam start). */
  windowStart: Date;
  windowEnd: Date;
};

/**
 * Saturn's eighth of the current day (sunrise–sunset) or night
 * (sunset–next sunrise), using the classical weekday slot tables.
 */
function saturnPortionWindow(
  date: Date,
  latitude: number,
  longitude: number,
): { start: Date; end: Date } | null {
  const { sunrise, sunset } = getSunriseSunset(date, latitude, longitude);
  if (!sunrise || !sunset || sunset <= sunrise) return null;

  let windowStartBound: Date;
  let windowEndBound: Date;
  let weekday: number;
  let slotTable: number[];

  if (date < sunrise) {
    // Before today's sunrise: still last night — yesterday's sunset → today's
    // sunrise, yesterday's weekday for the night table.
    const prevDay = addDays(date, -1);
    const prev = getSunriseSunset(prevDay, latitude, longitude);
    if (!prev.sunset) return null;
    windowStartBound = prev.sunset;
    windowEndBound = sunrise;
    weekday = prev.sunset.getUTCDay();
    slotTable = GULIKA_NIGHT_SLOT;
  } else if (date >= sunset) {
    // After today's sunset: tonight — today's sunset → tomorrow's sunrise.
    const next = getSunriseSunset(addDays(date, 1), latitude, longitude);
    if (!next.sunrise) return null;
    windowStartBound = sunset;
    windowEndBound = next.sunrise;
    weekday = sunset.getUTCDay();
    slotTable = GULIKA_NIGHT_SLOT;
  } else {
    windowStartBound = sunrise;
    windowEndBound = sunset;
    weekday = sunrise.getUTCDay();
    slotTable = GULIKA_KALAM_SLOT;
  }

  return dividedWindow(windowStartBound, windowEndBound, 8, slotTable[weekday]);
}

function pointAt(
  moment: Date,
  latitude: number,
  longitude: number,
  settings: EphemerisSettings,
): UpagrahaPoint {
  const lon = getSiderealAscendant(moment, latitude, longitude, settings);
  return {
    longitude: lon,
    rasiIndex: Math.floor(lon / 30),
    moment,
  };
}

/**
 * Gulika (portion start) and Mandhi (portion mid) for the day or night that
 * contains `date`. Same Saturn eighth; only the lagna instant differs.
 */
export function computeGulikaMandhi(
  date: Date,
  latitude: number,
  longitude: number,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): GulikaMandhiResult | null {
  const window = saturnPortionWindow(date, latitude, longitude);
  if (!window) return null;

  const mid = new Date((window.start.getTime() + window.end.getTime()) / 2);
  return {
    gulika: pointAt(window.start, latitude, longitude, settings),
    mandhi: pointAt(mid, latitude, longitude, settings),
    windowStart: window.start,
    windowEnd: window.end,
  };
}

/**
 * Mandhi alone (mid of Saturn's eighth). Prefer `computeGulikaMandhi` when
 * both points are needed on a chart.
 */
export function computeMandhi(
  date: Date,
  latitude: number,
  longitude: number,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): { longitude: number; rasiIndex: number; windowStart: Date } | null {
  const both = computeGulikaMandhi(date, latitude, longitude, settings);
  if (!both) return null;
  return {
    longitude: both.mandhi.longitude,
    rasiIndex: both.mandhi.rasiIndex,
    windowStart: both.windowStart,
  };
}

/**
 * Jamagraham: the graha "ruling" the current 1.5-hour period since sunrise,
 * per a fixed 8-graha cycle whose starting point for the day is the weekday
 * lord. Returns the active graha plus the current period's time window.
 */
export function computeJamagraham(
  date: Date,
  latitude: number,
  longitude: number,
): { graha: Planet; periodStart: Date; periodEnd: Date } | null {
  const sunrise = getMostRecentSunrise(date, latitude, longitude);
  if (!sunrise) return null;

  const weekday = sunrise.getUTCDay();
  const startIndex = JAMAGRAHAM_SEQUENCE.indexOf(WEEKDAY_LORD[weekday]);

  const elapsedHours = (date.getTime() - sunrise.getTime()) / (1000 * 60 * 60);
  const periodNumber = Math.floor(elapsedHours / JAMAGRAHAM_PERIOD_HOURS);
  const graha = JAMAGRAHAM_SEQUENCE[(startIndex + periodNumber) % JAMAGRAHAM_SEQUENCE.length];

  const periodStart = new Date(
    sunrise.getTime() + periodNumber * JAMAGRAHAM_PERIOD_HOURS * 60 * 60 * 1000,
  );
  const periodEnd = new Date(periodStart.getTime() + JAMAGRAHAM_PERIOD_HOURS * 60 * 60 * 1000);

  return { graha, periodStart, periodEnd };
}
