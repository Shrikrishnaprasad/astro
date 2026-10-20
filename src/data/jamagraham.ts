import type { Planet } from "../engine/types";

// Fixed 8-graha cycle for Jamagraham (user-specified tradition): each 1.5-hour
// period from sunrise steps to the next graha in this order.
// Tamil: guru, budhan, sukran, sani, chandran, ragu, suriyan, chevai.
export const JAMAGRAHAM_SEQUENCE: Planet[] = [
  "Jupiter", // guru
  "Mercury", // budhan
  "Venus", // sukran
  "Saturn", // sani
  "Moon", // chandran
  "Rahu", // ragu
  "Sun", // suriyan
  "Mars", // chevai
];

export const JAMAGRAHAM_PERIOD_HOURS = 1.5;

// Weekday lord (0=Sunday..6=Saturday) — determines which graha starts the
// first 1.5-hour period after sunrise on that day.
export const WEEKDAY_LORD: Planet[] = [
  "Sun", // Sunday
  "Moon", // Monday
  "Mars", // Tuesday
  "Mercury", // Wednesday
  "Jupiter", // Thursday
  "Venus", // Friday
  "Saturn", // Saturday
];
