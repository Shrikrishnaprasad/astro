// Surya Veedhi: maps the Sun's rasi to a reference "path" rasi, used as an
// input to the Kavippu calculation.
//
// VERIFIED empirically: reproduced from https://hindupanchangam.in/tools/jamakol-prasannam/
// by querying all 12 Sun-rasi cases directly (not inferred/guessed) and
// reading the page's own "சூரி X → Y" line for each. Confirmed
// independent of weekday (same Sun rasi on two different weekdays gave the
// same veedhi). No closed-form rule or textual source was found to explain
// *why* the table has this shape (it is not a simple offset or trine
// grouping), so it's stored as a verified lookup table rather than a
// formula - do not "simplify" this into an equation without re-deriving it.
export const SURYA_VEEDHI_RASI: Record<number, number> = {
  0: 1, // Mesha -> Vrishabha
  1: 0, // Vrishabha -> Mesha
  2: 0, // Mithuna -> Mesha
  3: 0, // Kataka -> Mesha
  4: 0, // Simha -> Mesha
  5: 1, // Kanni -> Vrishabha
  6: 1, // Tula -> Vrishabha
  7: 2, // Vrischika -> Mithuna
  8: 2, // Dhanu -> Mithuna
  9: 2, // Makara -> Mithuna
  10: 2, // Kumbha -> Mithuna
  11: 1, // Meena -> Vrishabha
};

export function suryaVeedhiRasiIndex(sunRasiIndex: number): number {
  return SURYA_VEEDHI_RASI[((sunRasiIndex % 12) + 12) % 12];
}
