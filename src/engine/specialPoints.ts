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

/**
 * Mandhi (Mandi/Gulika): the shadow point that "rises" at a specific
 * eighth-part of either the day (sunrise-sunset) or the night
 * (sunset-next sunrise), per the classical day/night upagraha rule - these
 * use different weekday-to-part tables, so a moment after sunset (or before
 * sunrise) must use the night table and the night's own window, not the
 * daytime one. Its zodiacal position is the sidereal ascendant at that
 * exact moment.
 */
export function computeMandhi(
  date: Date,
  latitude: number,
  longitude: number,
  settings: EphemerisSettings = DEFAULT_EPHEMERIS_SETTINGS,
): { longitude: number; rasiIndex: number; windowStart: Date } | null {
  const { sunrise, sunset } = getSunriseSunset(date, latitude, longitude);
  if (!sunrise || !sunset || sunset <= sunrise) return null;

  let windowStartBound: Date;
  let windowEndBound: Date;
  let weekday: number;
  let slotTable: number[];

  if (date < sunrise) {
    // Before today's sunrise: still last night - use yesterday's sunset to
    // today's sunrise, and yesterday's weekday for the night table.
    const prevDay = addDays(date, -1);
    const prev = getSunriseSunset(prevDay, latitude, longitude);
    if (!prev.sunset) return null;
    windowStartBound = prev.sunset;
    windowEndBound = sunrise;
    weekday = prev.sunset.getUTCDay();
    slotTable = GULIKA_NIGHT_SLOT;
  } else if (date >= sunset) {
    // After today's sunset: tonight - use today's sunset to tomorrow's
    // sunrise, and today's weekday for the night table.
    const next = getSunriseSunset(addDays(date, 1), latitude, longitude);
    if (!next.sunrise) return null;
    windowStartBound = sunset;
    windowEndBound = next.sunrise;
    weekday = sunset.getUTCDay();
    slotTable = GULIKA_NIGHT_SLOT;
  } else {
    // Daytime.
    windowStartBound = sunrise;
    windowEndBound = sunset;
    weekday = sunrise.getUTCDay();
    slotTable = GULIKA_KALAM_SLOT;
  }

  const window = dividedWindow(windowStartBound, windowEndBound, 8, slotTable[weekday]);
  const mandhiLongitude = getSiderealAscendant(window.start, latitude, longitude, settings);

  return {
    longitude: mandhiLongitude,
    rasiIndex: Math.floor(mandhiLongitude / 30),
    windowStart: window.start,
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
