import { NAKSHATRAS } from "../data/nakshatras";
import { RASIS } from "../data/rasis";
import { longitudeToRasiNakshatra } from "./rasiNakshatra";

// ─── Internal helper ──────────────────────────────────────────────────────────

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

// ─── Tradition configuration ──────────────────────────────────────────────────

/**
 * Pluggable Surya Veedhi rule – add new values here to support further
 * traditional lineages without touching the calculation core.
 *
 *   "vaidyanathan" – 8th rasi forward (inclusive) from Sun:
 *                    suryaVeedhi = (sunRasiIndex + 7) % 12
 */
export type SuryaVeedhiStrategy = "vaidyanathan";

export interface KavippuConfig {
  /** Which Surya Veedhi convention to apply. Defaults to "vaidyanathan". */
  suryaVeedhiStrategy?: SuryaVeedhiStrategy;
  /**
   * When supplied, bypasses the strategy formula and uses this index directly.
   * Useful for callers that pre-compute Surya Veedhi from a lookup table or
   * an alternative tradition.
   */
  overrideSuryaVeedhiIndex?: number;
}

// ─── Exported sub-functions ───────────────────────────────────────────────────

/**
 * Vaidyanathan Surya Veedhi: 8th rasi counting inclusively forward from Sun.
 *
 * Formula: (sunRasiIndex + 7) % 12
 *
 * Examples (0-based indices):
 *   Mesha   (0)  → Vrischika (7)
 *   Tula    (6)  → Vrishabha (1)
 *   Meena   (11) → Tula      (6)
 */
export function calculateSuryaVeedhi(sunRasiIndex: number): number {
  return mod12(sunRasiIndex + 7);
}

/**
 * Forward inclusive count from Arudam rasi to Surya Veedhi rasi.
 *
 * Formula: ((suryaVeedhiIndex - arudamRasiIndex + 12) % 12) + 1
 *
 * Same rasi → 1.   Full cycle wraps back to 1, not 13.
 */
export function calculateKavippuCount(
  arudamRasiIndex: number,
  suryaVeedhiIndex: number,
): number {
  return mod12(suryaVeedhiIndex - arudamRasiIndex) + 1;
}

/**
 * Starting from Udhayam, advance (count − 1) signs forward.
 *
 * Equivalent to "count inclusively from Udhayam" using the same count.
 *
 * Formula: (udhayamRasiIndex + count − 1) % 12
 */
export function calculateKavippuRasi(
  udhayamRasiIndex: number,
  count: number,
): number {
  return mod12(udhayamRasiIndex + count - 1);
}

/**
 * Kavippu degree = complement of Arudam degree within its 30° rasi.
 *
 * Formula: 30 − arudamDegree
 *
 * arudamDegree must be in [0, 30).  Returns a value in (0, 30].
 * Callers must normalise an exact 30° result to 0° of the next rasi.
 */
export function calculateKavippuDegree(arudamDegree: number): number {
  return 30 - arudamDegree;
}

// ─── I/O types ────────────────────────────────────────────────────────────────

export interface KavippuInput {
  /** Sun's rasi index (0 = Mesha … 11 = Meena). */
  sunRasiIndex: number;
  /** Udhayam (Ascendant / Lagna) rasi index. */
  udhayamRasiIndex: number;
  /** Udhayam degree within its rasi – stored for the trace only. */
  udhayamDegreeInRasi?: number;
  /** Arudam rasi index. */
  aarudamRasiIndex: number;
  /** Arudam degree within its rasi, must be in [0, 30). */
  aarudamDegreeInRasi: number;
  /** Optional tradition overrides. Defaults to Vaidyanathan. */
  config?: KavippuConfig;
}

export interface KavippuResult {
  // ── Surya Veedhi ─────────────────────────────────────────────────────────
  suryaVeedhiRasiIndex: number;
  suryaVeedhiRasiName: string;
  /** Forward inclusive count from Arudam to Surya Veedhi (= same count used from Udhayam). */
  count: number;
  // ── Kavippu position ──────────────────────────────────────────────────────
  rasiIndex: number;
  rasiName: string;
  rasiNameTamil: string;
  rasiLord: string;
  /** Complementary degree within the kavippu rasi, in [0, 30). */
  degreeInRasi: number;
  /** Ecliptic sidereal longitude, normalised to [0°, 360°). */
  longitude: number;
  // ── Nakshatra ─────────────────────────────────────────────────────────────
  nakshatraIndex: number;
  nakshatraName: string;
  nakshatraNameTamil: string;
  nakshatraLord: string;
  pada: number;
  // ── Audit trail ───────────────────────────────────────────────────────────
  /** Human-readable step-by-step trace for display and debugging. */
  calculationTrace: string[];
}

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Calculate Kavippu (கவிப்பு) per the Vaidyanathan method.
 *
 * Sign rule:
 *   1. Surya Veedhi = 8th rasi from Sun (inclusive forward).
 *   2. Count signs from Arudam to Surya Veedhi (inclusive forward).
 *   3. Starting from Udhayam, advance (count − 1) signs forward.
 *
 * Degree rule:
 *   kavippuDegree = 30° − aarudamDegreeInRasi.
 *   An exact 30° result is normalised to 0° of the following rasi.
 */
export function calculateKavippu(input: KavippuInput): KavippuResult {
  const sunRasi = mod12(input.sunRasiIndex);
  const udhayam = mod12(input.udhayamRasiIndex);
  const aarudam = mod12(input.aarudamRasiIndex);

  // Step 1 – Surya Veedhi
  const suryaVeedhiIndex =
    input.config?.overrideSuryaVeedhiIndex !== undefined
      ? mod12(input.config.overrideSuryaVeedhiIndex)
      : calculateSuryaVeedhi(sunRasi);

  // Step 2 – Count (Arudam → Surya Veedhi, forward inclusive)
  const count = calculateKavippuCount(aarudam, suryaVeedhiIndex);

  // Step 3 – Kavippu rasi
  let kavippuRasiIndex = calculateKavippuRasi(udhayam, count);

  // Step 4 – Kavippu degree (complement)
  let kavippuDegree = calculateKavippuDegree(input.aarudamDegreeInRasi);

  // Normalise exactly 30° → 0° of the next rasi
  if (kavippuDegree >= 30) {
    kavippuDegree = 0;
    kavippuRasiIndex = mod12(kavippuRasiIndex + 1);
  }

  // Step 5 – Sidereal longitude
  const rawLongitude = kavippuRasiIndex * 30 + kavippuDegree;
  const longitude = ((rawLongitude % 360) + 360) % 360;

  // Step 6 – Nakshatra / pada
  const nkInfo = longitudeToRasiNakshatra(longitude);
  const nakshatra = NAKSHATRAS[nkInfo.nakshatraIndex];
  const rasi = RASIS[kavippuRasiIndex];
  const suryaVeedhiRasi = RASIS[suryaVeedhiIndex];

  // Udhayam-to-Kavippu inclusive count (same count, shown explicitly in trace)
  const udhayamToKavippuCount = mod12(kavippuRasiIndex - udhayam) + 1;

  const trace: string[] = [
    `1. Sun = ${RASIS[sunRasi].nameEnglish} (index ${sunRasi})`,
    `2. Surya Veedhi = 8th from Sun (inclusive) = ${suryaVeedhiRasi.nameEnglish} (index ${suryaVeedhiIndex})`,
    `3. Arudam = ${RASIS[aarudam].nameEnglish} (index ${aarudam}), degree = ${input.aarudamDegreeInRasi.toFixed(4)}°`,
    `4. Count, Arudam → Surya Veedhi (forward, inclusive) = ${count}`,
    `5. Udhayam = ${RASIS[udhayam].nameEnglish} (index ${udhayam})`,
    `6. Udhayam → Kavippu inclusive count = ${udhayamToKavippuCount}`,
    `7. Kavippu rasi = Udhayam + (count − 1) = index ${udhayam} + ${count - 1} = ${kavippuRasiIndex} (${rasi.nameEnglish})`,
    `8. Arudam degree = ${input.aarudamDegreeInRasi.toFixed(4)}°; complementary = 30° − ${input.aarudamDegreeInRasi.toFixed(4)}° = ${kavippuDegree.toFixed(4)}°`,
    `9. Final: ${rasi.nameEnglish} ${kavippuDegree.toFixed(2)}° | ${nakshatra.nameEnglish} pada ${nkInfo.pada} | λ = ${longitude.toFixed(4)}°`,
  ];

  return {
    suryaVeedhiRasiIndex: suryaVeedhiIndex,
    suryaVeedhiRasiName: suryaVeedhiRasi.nameEnglish,
    count,
    rasiIndex: kavippuRasiIndex,
    rasiName: rasi.nameEnglish,
    rasiNameTamil: rasi.nameTamil,
    rasiLord: rasi.lord,
    degreeInRasi: kavippuDegree,
    longitude,
    nakshatraIndex: nkInfo.nakshatraIndex,
    nakshatraName: nakshatra.nameEnglish,
    nakshatraNameTamil: nakshatra.nameTamil,
    nakshatraLord: nakshatra.lord,
    pada: nkInfo.pada,
    calculationTrace: trace,
  };
}
