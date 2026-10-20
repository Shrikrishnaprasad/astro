import type { Rasi } from "./rasis";

// Pushkara Navamsa: within each rasi, the navamsa pada (1-9, each 3°20')
// considered auspicious depends on the rasi's element. Pada numbers are
// cross-confirmed from multiple secondary sources (sign-name labels in some
// of those sources were inconsistent/garbled, so only the pada numbers are
// used here) - treat as commonly-cited, not verified against a primary text.
export const PUSHKARA_NAVAMSA_PADAS: Record<Rasi["element"], [number, number]> = {
  Fire: [7, 9],
  Earth: [3, 5],
  Air: [6, 8],
  Water: [1, 3],
};

// Pushkara Bhaga: a single specific degree within each rasi considered
// highly auspicious (per C.S. Patel's commonly-cited table), grouped by element.
export const PUSHKARA_BHAGA_DEGREE: Record<Rasi["element"], number> = {
  Fire: 21,
  Earth: 14,
  Air: 24,
  Water: 7,
};

export const NAVAMSA_SPAN_DEGREES = 30 / 9; // 3°20'
