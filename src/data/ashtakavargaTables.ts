import type { Planet } from "../engine/types";

/** The 7 planets whose BAVs sum to the 337-bindu Sarvashtakavarga. */
export type AshtakavargaPlanet = Exclude<Planet, "Rahu" | "Ketu">;

/** The 8 contributors (7 planets + Lagna) that donate bindus in Ashtakavarga and rule the 8 Kakshyas. */
export type AshtakavargaContributor = AshtakavargaPlanet | "Lagna";

export const ASHTAKAVARGA_PLANETS: AshtakavargaPlanet[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
];

export const ASHTAKAVARGA_CONTRIBUTORS: AshtakavargaContributor[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Lagna",
];

/**
 * Kakshya order within every 30° Rasi (each Kakshya spans 3°45' = 3.75°):
 * 1st: Saturn (0°–3°45'), 2nd: Jupiter (3°45'–7°30'), 3rd: Mars (7°30'–11°15'),
 * 4th: Sun (11°15'–15°00'), 5th: Venus (15°00'–18°45'), 6th: Mercury (18°45'–22°30'),
 * 7th: Moon (22°30'–26°15'), 8th: Lagna (26°15'–30°00').
 */
export const KAKSHYA_LORDS: AshtakavargaContributor[] = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sun",
  "Venus",
  "Mercury",
  "Moon",
  "Lagna",
];

/**
 * Classical Parashari Ashtakavarga benefic houses (1–12 counted from each `contributor`'s rasi).
 * Totals: Sun 48, Moon 49, Mars 39, Mercury 54, Jupiter 56, Venus 52, Saturn 39 = 337 SAV bindus.
 * Plus Lagna BAV = 49 bindus.
 */
export const ASHTAKAVARGA_BINDU_HOUSES: Record<
  AshtakavargaContributor,
  Record<AshtakavargaContributor, number[]>
> = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],     // 8
    Moon: [3, 6, 10, 11],                // 4
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],    // 8
    Mercury: [3, 5, 6, 9, 10, 11, 12],   // 7
    Jupiter: [5, 6, 9, 11],              // 4
    Venus: [6, 7, 12],                   // 3
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],  // 8
    Lagna: [3, 4, 6, 10, 11, 12],        // 6 -> Total 48
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11],           // 6
    Moon: [1, 3, 6, 7, 10, 11],          // 6
    Mars: [2, 3, 5, 6, 9, 10, 11],       // 7
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11], // 8
    Jupiter: [1, 4, 7, 8, 10, 11, 12],   // 7
    Venus: [3, 4, 5, 7, 9, 10, 11],      // 7
    Saturn: [3, 5, 6, 11],               // 4
    Lagna: [3, 6, 10, 11],               // 4 -> Total 49
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11],              // 5
    Moon: [3, 6, 11],                    // 3
    Mars: [1, 2, 4, 7, 8, 10, 11],       // 7
    Mercury: [3, 5, 6, 11],              // 4
    Jupiter: [6, 10, 11, 12],            // 4
    Venus: [6, 8, 11, 12],               // 4
    Saturn: [1, 4, 7, 8, 9, 10, 11],     // 7
    Lagna: [1, 3, 6, 10, 11],            // 5 -> Total 39
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12],              // 5
    Moon: [2, 4, 6, 8, 10, 11],          // 6
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],    // 8
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],// 8
    Jupiter: [6, 8, 11, 12],             // 4
    Venus: [1, 2, 3, 4, 5, 8, 9, 11],    // 8
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],  // 8
    Lagna: [1, 2, 4, 6, 8, 10, 11],      // 7 -> Total 54
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],  // 9
    Moon: [2, 5, 7, 9, 11],              // 5
    Mars: [1, 2, 4, 7, 8, 10, 11],       // 7
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11], // 8
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11], // 8
    Venus: [2, 5, 6, 9, 10, 11],         // 6
    Saturn: [3, 5, 6, 12],               // 4
    Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11],// 9 -> Total 56
  },
  Venus: {
    Sun: [8, 11, 12],                    // 3
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12], // 9
    Mars: [3, 5, 6, 9, 11, 12],          // 6
    Mercury: [3, 5, 6, 9, 11],           // 5
    Jupiter: [5, 8, 9, 10, 11],          // 5
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],// 9
    Saturn: [3, 4, 5, 8, 9, 10, 11],     // 7
    Lagna: [1, 2, 3, 4, 5, 8, 9, 11],    // 8 -> Total 52
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11],        // 7
    Moon: [3, 6, 11],                    // 3
    Mars: [3, 5, 6, 10, 11, 12],         // 6
    Mercury: [6, 8, 9, 10, 11, 12],      // 6
    Jupiter: [5, 6, 11, 12],             // 4
    Venus: [6, 11, 12],                  // 3
    Saturn: [3, 5, 6, 11],               // 4
    Lagna: [1, 3, 4, 6, 10, 11],         // 6 -> Total 39
  },
  Lagna: {
    Sun: [3, 4, 6, 10, 11, 12],          // 6
    Moon: [3, 4, 6, 10, 11, 12],         // 6
    Mars: [1, 3, 6, 10, 11],             // 5
    Mercury: [1, 2, 4, 6, 8, 10, 11],    // 7
    Jupiter: [1, 2, 4, 5, 6, 7, 9, 10, 11], // 9
    Venus: [1, 2, 3, 4, 5, 8],           // 6
    Saturn: [1, 3, 4, 6, 10, 11],        // 6
    Lagna: [3, 6, 10, 11],               // 4 -> Total 49
  },
};

/** Rasi Gunakara (Zodiacal Multipliers) for Rasi Pinda (Mesha=0 .. Meena=11). */
export const RASI_GUNAKARA = [7, 10, 8, 4, 10, 5, 7, 8, 9, 5, 11, 12];

/** Graha Gunakara (Planetary Multipliers) for Graha Pinda. */
export const GRAHA_GUNAKARA: Record<AshtakavargaPlanet, number> = {
  Sun: 5,
  Moon: 5,
  Mars: 8,
  Mercury: 5,
  Jupiter: 10,
  Venus: 7,
  Saturn: 5,
};
