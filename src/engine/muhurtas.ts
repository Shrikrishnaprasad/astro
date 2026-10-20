import { CHOGHADIYA_CYCLE, CHOGHADIYA_DAY_OPENER, DISHA_SHOOL, type ChoghadiyaName } from "../data/muhurtaRules";
import type { TimeWindow } from "./panchanga";
import { getSunriseSunset } from "./sunTimes";

const MIN_MS = 60 * 1000;

function minutesBefore(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * MIN_MS);
}

function minutesAfter(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MIN_MS);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export interface MuhurtaWindow extends TimeWindow {
  name: string;
  nature: "auspicious" | "inauspicious";
}

export interface MuhurtaResult {
  brahmaMuhurta: MuhurtaWindow | null;
  nishitaMuhurta: MuhurtaWindow | null;
  vijayaMuhurta: MuhurtaWindow | null;
  godhuliMuhurta: MuhurtaWindow | null;
}

/**
 * A small set of commonly-cited daily muhurtas, derived from sunrise/sunset.
 * Exact classical boundaries vary somewhat by text/tradition - these use the
 * most commonly repeated figures (see in-app disclaimer).
 */
export function computeMuhurtas(date: Date, latitude: number, longitude: number): MuhurtaResult {
  const { sunrise, sunset } = getSunriseSunset(date, latitude, longitude);
  const nextDay = getSunriseSunset(addDays(date, 1), latitude, longitude);

  let brahmaMuhurta: MuhurtaWindow | null = null;
  if (sunrise) {
    brahmaMuhurta = {
      name: "Brahma Muhurta",
      nature: "auspicious",
      start: minutesBefore(sunrise, 96),
      end: minutesBefore(sunrise, 48),
    };
  }

  let nishitaMuhurta: MuhurtaWindow | null = null;
  if (sunset && nextDay.sunrise) {
    const midpoint = new Date((sunset.getTime() + nextDay.sunrise.getTime()) / 2);
    nishitaMuhurta = {
      name: "Nishita Muhurta",
      nature: "auspicious",
      start: minutesBefore(midpoint, 24),
      end: minutesAfter(midpoint, 24),
    };
  }

  let vijayaMuhurta: MuhurtaWindow | null = null;
  if (sunset) {
    vijayaMuhurta = {
      name: "Vijaya Muhurta",
      nature: "auspicious",
      start: minutesBefore(sunset, 144),
      end: minutesBefore(sunset, 96),
    };
  }

  let godhuliMuhurta: MuhurtaWindow | null = null;
  if (sunset) {
    godhuliMuhurta = {
      name: "Godhuli Muhurta",
      nature: "auspicious",
      start: minutesBefore(sunset, 12),
      end: minutesAfter(sunset, 12),
    };
  }

  return { brahmaMuhurta, nishitaMuhurta, vijayaMuhurta, godhuliMuhurta };
}

export interface ChoghadiyaSlot extends TimeWindow {
  name: ChoghadiyaName;
}

function buildChoghadiyaSlots(
  periodStart: Date,
  periodEnd: Date,
  openerIndex: number,
): ChoghadiyaSlot[] {
  const totalMs = periodEnd.getTime() - periodStart.getTime();
  const slotMs = totalMs / 8;
  const slots: ChoghadiyaSlot[] = [];
  for (let i = 0; i < 8; i++) {
    const name = CHOGHADIYA_CYCLE[(openerIndex + i) % CHOGHADIYA_CYCLE.length];
    const start = new Date(periodStart.getTime() + i * slotMs);
    const end = new Date(periodStart.getTime() + (i + 1) * slotMs);
    slots.push({ name, start, end });
  }
  return slots;
}

export function computeChoghadiya(
  date: Date,
  latitude: number,
  longitude: number,
): { day: ChoghadiyaSlot[]; night: ChoghadiyaSlot[] } | null {
  const { sunrise, sunset } = getSunriseSunset(date, latitude, longitude);
  const nextDay = getSunriseSunset(addDays(date, 1), latitude, longitude);
  if (!sunrise || !sunset || !nextDay.sunrise) return null;

  const weekday = date.getUTCDay();
  const dayOpenerIndex = CHOGHADIYA_CYCLE.indexOf(CHOGHADIYA_DAY_OPENER[weekday]);
  const nightOpenerIndex = CHOGHADIYA_CYCLE.indexOf(CHOGHADIYA_DAY_OPENER[(weekday + 4) % 7]);

  return {
    day: buildChoghadiyaSlots(sunrise, sunset, dayOpenerIndex),
    night: buildChoghadiyaSlots(sunset, nextDay.sunrise, nightOpenerIndex),
  };
}

export function getDishaShool(date: Date): string | null {
  return DISHA_SHOOL[date.getUTCDay()];
}
