import { RASIS } from "../data/rasis";

export interface KavippuInput {
  udhayamRasiIndex: number;
  udhayamDegreeInRasi: number;
  aarudamRasiIndex: number;
  aarudamDegreeInRasi: number;
  suryaVeedhiRasiIndex: number;
}

export interface KavippuResult {
  rasiIndex: number;
  rasiName: string;
  /** Degree-in-sign, when the degree rule is verified; undefined otherwise. */
  degreeInRasi?: number;
  signFormulaVerified: boolean;
  degreeFormulaVerified: boolean;
  calculationTrace: string[];
}

function normalizeRasiIndex(rasiIndex: number): number {
  return ((rasiIndex % 12) + 12) % 12;
}

/**
 * Kavippu (கவிப்பு).
 *
 * Sign rule - VERIFIED against 3 independent worked examples from
 * https://hindupanchangam.in/tools/jamakol-prasannam/ (different Udhayam,
 * Aarudam and counts each time, all matching exactly):
 *   1. Count signs from Aarudam to Surya Veedhi, forward, inclusive of both
 *      ends (the page states this count explicitly, e.g. "கடகம் → ரிஷபம் = 11").
 *   2. Starting from Udhayam, advance by (count - 1) signs forward - i.e. the
 *      same forward/inclusive convention applied a second time.
 *   This reduces to: kavippu = (udhayam + (suryaVeedhi - aarudam)) mod 12.
 *
 * Degree rule - VERIFIED against the same 3 examples:
 *   kavippuDegreeInRasi = 30° - aarudamDegreeInRasi.
 *   When aarudamDegreeInRasi is exactly 0, this yields exactly 30°; the
 *   reference site displays that as "<kavippu sign> 30°00'" rather than
 *   rolling over into the next sign, so this implementation matches that
 *   (does not auto-normalize 30° into the following rasi).
 *
 * Both rules are specific to the Udhayam/Aarudam/Surya-Veedhi inputs already
 * produced by this app's existing calculators - this function does not
 * recompute those with a different tradition.
 */
export function calculateKavippu(input: KavippuInput): KavippuResult {
  const udhayam = normalizeRasiIndex(input.udhayamRasiIndex);
  const aarudam = normalizeRasiIndex(input.aarudamRasiIndex);
  const suryaVeedhi = normalizeRasiIndex(input.suryaVeedhiRasiIndex);

  const delta = normalizeRasiIndex(suryaVeedhi - aarudam);
  const count = delta + 1; // forward, inclusive count from Aarudam to Surya Veedhi
  const rasiIndex = normalizeRasiIndex(udhayam + delta);

  const degreeInRasi = 30 - input.aarudamDegreeInRasi;

  return {
    rasiIndex,
    rasiName: RASIS[rasiIndex].nameEnglish,
    degreeInRasi,
    signFormulaVerified: true,
    degreeFormulaVerified: true,
    calculationTrace: [
      `Aarudam = ${RASIS[aarudam].nameEnglish} (${aarudam})`,
      `Surya Veedhi = ${RASIS[suryaVeedhi].nameEnglish} (${suryaVeedhi})`,
      `Count, forward inclusive, Aarudam -> Surya Veedhi = ${count}`,
      `Udhayam = ${RASIS[udhayam].nameEnglish} (${udhayam})`,
      `Kavippu rasi = Udhayam + (count - 1) = ${udhayam} + ${count - 1} = ${rasiIndex} (${RASIS[rasiIndex].nameEnglish})`,
      `Kavippu degree = 30° - Aarudam degree (${input.aarudamDegreeInRasi.toFixed(2)}°) = ${degreeInRasi.toFixed(2)}°`,
    ],
  };
}
