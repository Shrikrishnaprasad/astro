import {
  ASHTAKAVARGA_BINDU_HOUSES,
  ASHTAKAVARGA_CONTRIBUTORS,
  ASHTAKAVARGA_PLANETS,
  GRAHA_GUNAKARA,
  KAKSHYA_LORDS,
  RASI_GUNAKARA,
  type AshtakavargaContributor,
  type AshtakavargaPlanet,
} from "../data/ashtakavargaTables";
import { normalizeDegrees } from "./constants";
import type { LongitudeMap, Planet } from "./types";

export interface Bhinnashtakavarga {
  planet: AshtakavargaContributor;
  /** Bindus in Rasis 0=Mesha .. 11=Meena. */
  bindusByRasi: number[];
  /** Bindus in Houses 1–12 counted from Lagna (backwards-compatible `bindus`). */
  bindus: number[];
  /** 8 contributors × 12 rasis matrix (1 if contributor gives a bindu in that rasi, else 0). */
  prastara: Record<AshtakavargaContributor, number[]>;
  total: number;
  /** Bindus by Rasi after Trikona Shodhana (trinal reduction). */
  trikonaReducedByRasi: number[];
  /** Bindus by Rasi after both Trikona & Ekadhipatya Shodhana. */
  ekadhipatyaReducedByRasi: number[];
  /** Rasi Pinda, Graha Pinda, and total Sodhya Pinda after reductions. */
  rasiPinda: number;
  grahaPinda: number;
  sodhyaPinda: number;
}

export interface KakshyaPlacement {
  planet: AshtakavargaPlanet;
  rasiIndex: number;
  degreeInRasi: number;
  kakshyaNumber: number; // 1..8
  kakshyaLord: AshtakavargaContributor;
  hasBindu: boolean; // true if kakshyaLord contributes 1 bindu in this rasi for this planet's BAV
  bavBindusInRasi: number;
  savBindusInRasi: number;
}

export interface AshtakavargaResult {
  /** The 7 planetary Bhinnashtakavargas (Sun..Saturn) whose sum is the 337-bindu SAV. */
  bhinna: Bhinnashtakavarga[];
  /** The 8th BAV for Lagna (49 bindus). */
  lagnaBav: Bhinnashtakavarga;
  /** Sarvashtakavarga bindus in Houses 1–12 counted from Lagna. */
  sarva: number[];
  /** Sarvashtakavarga bindus in Rasis 0=Mesha .. 11=Meena. */
  sarvaByRasi: number[];
  /** Sarvashtakavarga after Trikona & Ekadhipatya Shodhana by Rasi (0..11). */
  sarvaReducedByRasi: number[];
  /** Total SAV bindus (always 337 in classical Parashara). */
  sarvaTotal: number;
}

/**
 * Classical Trikona Shodhana (Trinal Reduction):
 * For each of the 4 elemental trikonas ([0,4,8], [1,5,9], [2,6,10], [3,7,11]),
 * subtract the minimum of the 3 signs from all 3 signs.
 */
export function applyTrikonaShodhana(bindusByRasi: number[]): number[] {
  const out = [...bindusByRasi];
  const trikonas = [
    [0, 4, 8],
    [1, 5, 9],
    [2, 6, 10],
    [3, 7, 11],
  ];
  for (const [a, b, c] of trikonas) {
    const minVal = Math.min(out[a], out[b], out[c]);
    out[a] -= minVal;
    out[b] -= minVal;
    out[c] -= minVal;
  }
  return out;
}

/**
 * Classical Ekadhipatya Shodhana (Dual-Lordship Reduction) for the 5 non-luminary planets
 * owning two signs each: Mars [0,7], Venus [1,6], Mercury [2,5], Jupiter [8,11], Saturn [9,10].
 */
export function applyEkadhipatyaShodhana(
  trikonaReduced: number[],
  occupiedRasis: Set<number>,
): number[] {
  const out = [...trikonaReduced];
  const pairs: [number, number][] = [
    [0, 7],   // Mars: Mesha, Vrischika
    [1, 6],   // Venus: Vrishabha, Thula
    [2, 5],   // Mercury: Mithuna, Kanya
    [8, 11],  // Jupiter: Dhanu, Meena
    [9, 10],  // Saturn: Makara, Kumbha
  ];

  for (const [s1, s2] of pairs) {
    const v1 = out[s1];
    const v2 = out[s2];
    if (v1 === 0 || v2 === 0) continue;

    const occ1 = occupiedRasis.has(s1);
    const occ2 = occupiedRasis.has(s2);

    if (occ1 && occ2) {
      // Both occupied: no reduction
      continue;
    } else if (!occ1 && !occ2) {
      // Neither occupied: if equal, both become 0; otherwise both become the smaller value
      if (v1 === v2) {
        out[s1] = 0;
        out[s2] = 0;
      } else {
        const smaller = Math.min(v1, v2);
        out[s1] = smaller;
        out[s2] = smaller;
      }
    } else if (occ1 && !occ2) {
      // s1 occupied, s2 unoccupied
      if (v2 <= v1) {
        out[s2] = 0;
      } else {
        out[s2] = v1;
      }
    } else {
      // s2 occupied, s1 unoccupied
      if (v1 <= v2) {
        out[s1] = 0;
      } else {
        out[s1] = v2;
      }
    }
  }

  return out;
}

function buildBav(
  bavTarget: AshtakavargaContributor,
  contributorRasi: Record<AshtakavargaContributor, number>,
  lagnaRasiIndex: number,
  occupiedPlanetRasis: Set<number>,
): Bhinnashtakavarga {
  const bindusByRasi = Array.from({ length: 12 }, () => 0);
  const prastara = {} as Record<AshtakavargaContributor, number[]>;

  for (const contributor of ASHTAKAVARGA_CONTRIBUTORS) {
    const row = Array.from({ length: 12 }, () => 0);
    const baseSign = contributorRasi[contributor];
    const houses = ASHTAKAVARGA_BINDU_HOUSES[bavTarget][contributor];
    for (const h of houses) {
      const targetRasi = (baseSign + h - 1) % 12;
      row[targetRasi] = 1;
      bindusByRasi[targetRasi] += 1;
    }
    prastara[contributor] = row;
  }

  const bindus = Array.from(
    { length: 12 },
    (_, i) => bindusByRasi[(lagnaRasiIndex + i) % 12],
  );
  const total = bindusByRasi.reduce((a, b) => a + b, 0);

  const trikonaReducedByRasi = applyTrikonaShodhana(bindusByRasi);
  const ekadhipatyaReducedByRasi = applyEkadhipatyaShodhana(
    trikonaReducedByRasi,
    occupiedPlanetRasis,
  );

  // Rasi Pinda = sum of (reduced bindus in rasi * Rasi Gunakara)
  let rasiPinda = 0;
  for (let r = 0; r < 12; r++) {
    rasiPinda += ekadhipatyaReducedByRasi[r] * RASI_GUNAKARA[r];
  }

  // Graha Pinda = sum over 7 planets of (reduced bindus in planet's rasi * Graha Gunakara)
  let grahaPinda = 0;
  for (const p of ASHTAKAVARGA_PLANETS) {
    const pSign = contributorRasi[p];
    grahaPinda += ekadhipatyaReducedByRasi[pSign] * GRAHA_GUNAKARA[p];
  }

  return {
    planet: bavTarget,
    bindusByRasi,
    bindus,
    prastara,
    total,
    trikonaReducedByRasi,
    ekadhipatyaReducedByRasi,
    rasiPinda,
    grahaPinda,
    sodhyaPinda: rasiPinda + grahaPinda,
  };
}

export function computeAshtakavarga(
  planetRasiIndex: Record<Planet, number>,
  lagnaRasiIndex: number,
): AshtakavargaResult {
  const contributorRasi = {
    Sun: planetRasiIndex.Sun,
    Moon: planetRasiIndex.Moon,
    Mars: planetRasiIndex.Mars,
    Mercury: planetRasiIndex.Mercury,
    Jupiter: planetRasiIndex.Jupiter,
    Venus: planetRasiIndex.Venus,
    Saturn: planetRasiIndex.Saturn,
    Lagna: lagnaRasiIndex,
  };

  const occupiedPlanetRasis = new Set<number>(
    ASHTAKAVARGA_PLANETS.map((p) => planetRasiIndex[p]),
  );

  const bhinna = ASHTAKAVARGA_PLANETS.map((p) =>
    buildBav(p, contributorRasi, lagnaRasiIndex, occupiedPlanetRasis),
  );
  const lagnaBav = buildBav(
    "Lagna",
    contributorRasi,
    lagnaRasiIndex,
    occupiedPlanetRasis,
  );

  const sarvaByRasi = Array.from({ length: 12 }, (_, r) =>
    bhinna.reduce((sum, bav) => sum + bav.bindusByRasi[r], 0),
  );

  const sarva = Array.from(
    { length: 12 },
    (_, i) => sarvaByRasi[(lagnaRasiIndex + i) % 12],
  );

  const sarvaReducedByRasi = Array.from({ length: 12 }, (_, r) =>
    bhinna.reduce((sum, bav) => sum + bav.ekadhipatyaReducedByRasi[r], 0),
  );

  return {
    bhinna,
    lagnaBav,
    sarva,
    sarvaByRasi,
    sarvaReducedByRasi,
    sarvaTotal: sarvaByRasi.reduce((a, b) => a + b, 0),
  };
}

/**
 * Evaluate Kakshya (8 sub-divisions of 3°45' each within every Rasi) for any set of
 * planetary longitudes (either Natal or Gochara/Transit) against a chart's Ashtakavarga.
 */
export function evaluateKakshyaPlacements(
  longitudes: LongitudeMap,
  av: AshtakavargaResult,
): KakshyaPlacement[] {
  return ASHTAKAVARGA_PLANETS.map((planet) => {
    const lon = normalizeDegrees(longitudes[planet]);
    const rasiIndex = Math.floor(lon / 30) % 12;
    const degreeInRasi = lon - rasiIndex * 30;
    const kakshyaIdx = Math.min(7, Math.max(0, Math.floor(degreeInRasi / 3.75)));
    const kakshyaLord = KAKSHYA_LORDS[kakshyaIdx];
    const bav = av.bhinna.find((b) => b.planet === planet)!;
    const hasBindu = bav.prastara[kakshyaLord][rasiIndex] === 1;

    return {
      planet,
      rasiIndex,
      degreeInRasi,
      kakshyaNumber: kakshyaIdx + 1,
      kakshyaLord,
      hasBindu,
      bavBindusInRasi: bav.bindusByRasi[rasiIndex],
      savBindusInRasi: av.sarvaByRasi[rasiIndex],
    };
  });
}
