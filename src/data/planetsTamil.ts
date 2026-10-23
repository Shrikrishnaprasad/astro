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
export const MANDHI_TAMIL = "மாந்";
