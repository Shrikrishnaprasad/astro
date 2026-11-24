import type { Planet } from "../engine/types";

/** Short Tamil graha labels used everywhere in the UI. */
export const PLANET_TAMIL_ABBR: Record<Planet, string> = {
  Sun: "சூரி",
  Moon: "சந்",
  Mars: "செவ்",
  Mercury: "புத",
  Jupiter: "குரு",
  Venus: "சுக்",
  Saturn: "சனி",
  Rahu: "ராகு",
  Ketu: "கேது",
};

export const PLANET_TAMIL_NAME = PLANET_TAMIL_ABBR;

export const LAGNA_TAMIL = "ல";
/** Mandhi / Maandi — lagna at mid of Saturn's eighth. */
export const MANDHI_TAMIL = "மாந்";
/** Gulika — lagna at start of Saturn's eighth (Gulika Kalam start). */
export const GULIKA_TAMIL = "குளி";
