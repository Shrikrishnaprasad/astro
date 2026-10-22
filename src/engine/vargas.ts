import { RASIS, rasiLord } from "../data/rasis";
import { normalizeDegrees } from "./constants";
import { PLANETS, type LongitudeMap, type Planet } from "./types";

export type VargaId =
  | "D1"
  | "D2"
  | "D3"
  | "D4"
  | "D7"
  | "D9"
  | "D10"
  | "D12"
  | "D16"
  | "D20"
  | "D24"
  | "D27"
  | "D30"
  | "D40"
  | "D45"
  | "D60";

export interface VargaDefinition {
  id: VargaId;
  division: number;
  nameSanskrit: string;
  nameEnglish: string;
  signification: string;
}

export const SHODASHAVARGA_DEFS: VargaDefinition[] = [
  { id: "D1", division: 1, nameSanskrit: "Rasi", nameEnglish: "Natal Chart", signification: "Physical body, general fortune, identity" },
  { id: "D2", division: 2, nameSanskrit: "Hora", nameEnglish: "Wealth & Sustenance", signification: "Financial prosperity, family resources, speech" },
  { id: "D3", division: 3, nameSanskrit: "Drekkana", nameEnglish: "Siblings & Courage", signification: "Co-borns, valor, enterprise, stamina" },
  { id: "D4", division: 4, nameSanskrit: "Chaturthamsa", nameEnglish: "Property & Fortune", signification: "Real estate, residence, fixed assets, bhagya" },
  { id: "D7", division: 7, nameSanskrit: "Saptamsa", nameEnglish: "Children & Progeny", signification: "Offspring, grandchildren, creative legacy" },
  { id: "D9", division: 9, nameSanskrit: "Navamsa", nameEnglish: "Marriage & Dharma", signification: "Spouse, inner strength of grahas, spiritual fruit" },
  { id: "D10", division: 10, nameSanskrit: "Dasamsa", nameEnglish: "Career & Profession", signification: "Occupation, status, authority, karma phala" },
  { id: "D12", division: 12, nameSanskrit: "Dwadasamsa", nameEnglish: "Parents & Ancestry", signification: "Mother, father, hereditary lineage" },
  { id: "D16", division: 16, nameSanskrit: "Shodasamsa", nameEnglish: "Vehicles & Comforts", signification: "Conveyances, luxury, mental happiness" },
  { id: "D20", division: 20, nameSanskrit: "Vimsamsa", nameEnglish: "Spiritual Progress", signification: "Upasana, devotion, meditation, deity grace" },
  { id: "D24", division: 24, nameSanskrit: "Chaturvimsamsa", nameEnglish: "Education & Vidya", signification: "Higher learning, scholarship, siddhi" },
  { id: "D27", division: 27, nameSanskrit: "Saptavimsamsa", nameEnglish: "Strengths & Stamina", signification: "Innate vitality, subtle strengths & weaknesses" },
  { id: "D30", division: 30, nameSanskrit: "Trimsamsa", nameEnglish: "Arishta & Challenges", signification: "Adversities, karmic vulnerabilities, sub-nature" },
  { id: "D40", division: 40, nameSanskrit: "Khavedamsa", nameEnglish: "Maternal Lineage & Auspiciousness", signification: "Matrilineal karma, emotional habits" },
  { id: "D45", division: 45, nameSanskrit: "Akshavedamsa", nameEnglish: "Paternal Lineage & Character", signification: "Patrilineal karma, ethics, high distinction" },
  { id: "D60", division: 60, nameSanskrit: "Shashtiamsa", nameEnglish: "Past-Life Karma & Root Destiny", signification: "Subtle past-life imprints, twin differentiation" },
];

export const SHASHTIAMSA_DEITIES: { name: string; nature: "benefic" | "malefic" }[] = [
  { name: "1. Ghora", nature: "malefic" },
  { name: "2. Rakshasa", nature: "malefic" },
  { name: "3. Deva", nature: "benefic" },
  { name: "4. Kubera", nature: "benefic" },
  { name: "5. Yaksha", nature: "benefic" },
  { name: "6. Kinnara", nature: "benefic" },
  { name: "7. Bhrashta", nature: "malefic" },
  { name: "8. Kulaghna", nature: "malefic" },
  { name: "9. Garala", nature: "malefic" },
  { name: "10. Vahni (Agni)", nature: "malefic" },
  { name: "11. Maya", nature: "malefic" },
  { name: "12. Purishaka", nature: "malefic" },
  { name: "13. Apampati (Varuna)", nature: "benefic" },
  { name: "14. Marutwan", nature: "benefic" },
  { name: "15. Kala", nature: "malefic" },
  { name: "16. Sarpa", nature: "malefic" },
  { name: "17. Amrita", nature: "benefic" },
  { name: "18. Indu (Chandra)", nature: "benefic" },
  { name: "19. Mridu", nature: "benefic" },
  { name: "20. Komala", nature: "benefic" },
  { name: "21. Heramba", nature: "benefic" },
  { name: "22. Brahma", nature: "benefic" },
  { name: "23. Vishnu", nature: "benefic" },
  { name: "24. Maheshwara", nature: "benefic" },
  { name: "25. Deva", nature: "benefic" },
  { name: "26. Ardra", nature: "benefic" },
  { name: "27. Kalinasa", nature: "benefic" },
  { name: "28. Kshitishwara", nature: "benefic" },
  { name: "29. Kamalakara", nature: "benefic" },
  { name: "30. Mandagni", nature: "malefic" },
  { name: "31. Mrityu", nature: "malefic" },
  { name: "32. Kaala", nature: "malefic" },
  { name: "33. Davagni", nature: "malefic" },
  { name: "34. Ghora", nature: "malefic" },
  { name: "35. Yama", nature: "malefic" },
  { name: "36. Kantaka", nature: "malefic" },
  { name: "37. Sudha", nature: "benefic" },
  { name: "38. Amrita", nature: "benefic" },
  { name: "39. PurnaChandra", nature: "benefic" },
  { name: "40. Vishadagdha", nature: "malefic" },
  { name: "41. Kulanasa", nature: "malefic" },
  { name: "42. Vamshakshaya", nature: "malefic" },
  { name: "43. Utpata", nature: "malefic" },
  { name: "44. Kaala", nature: "malefic" },
  { name: "45. Saumya", nature: "benefic" },
  { name: "46. Komala", nature: "benefic" },
  { name: "47. Sheethala", nature: "benefic" },
  { name: "48. Karaladamshtra", nature: "malefic" },
  { name: "49. Chandramukhi", nature: "benefic" },
  { name: "50. Praveena", nature: "benefic" },
  { name: "51. Kalapavaka", nature: "malefic" },
  { name: "52. Dandayudha", nature: "malefic" },
  { name: "53. Nirmala", nature: "benefic" },
  { name: "54. Saumya", nature: "benefic" },
  { name: "55. Krura", nature: "malefic" },
  { name: "56. Atisheethala", nature: "benefic" },
  { name: "57. Amrita", nature: "benefic" },
  { name: "58. Payodhi", nature: "benefic" },
  { name: "59. Bhramana", nature: "malefic" },
  { name: "60. Chandrarekha", nature: "benefic" },
];

export interface VargaPlacement {
  rasiIndex: number;
  partNumber: number; // 1..N
  isVargottama: boolean;
  deityName?: string;
  deityNature?: "benefic" | "malefic";
}

export interface VargaChart {
  def: VargaDefinition;
  lagnaRasiIndex: number;
  lagnaPart: number;
  planets: Record<Planet, VargaPlacement>;
}

export interface VimshopakaPlanetRow {
  planet: Planet;
  shadvarga: number;      // out of 20
  saptavarga: number;     // out of 20
  dasavarga: number;      // out of 20
  shodashavarga: number;  // out of 20
  vargottamaCount: number;
}

/**
 * Compute the Varga sign (0=Mesha..11=Meena) and 1-indexed division part for any
 * sidereal longitude in any of the 16 Parashari Shodashavarga charts (D1–D60).
 */
export function computeVargaPlacement(
  siderealLongitude: number,
  vargaId: VargaId,
): VargaPlacement {
  const lon = normalizeDegrees(siderealLongitude);
  const r = Math.floor(lon / 30) % 12;
  let deg = lon - r * 30;
  if (deg >= 30 || deg < 0) deg = 0;
  const isOddSign = r % 2 === 0; // 0=Mesha (1st sign = odd), 1=Vrishabha (2nd sign = even)
  const modality = r % 3; // 0=Movable (Chara), 1=Fixed (Sthira), 2=Dual (Dwiswabhava)

  if (vargaId === "D1") {
    return { rasiIndex: r, partNumber: 1, isVargottama: true };
  }

  if (vargaId === "D2") {
    const part = deg < 15 ? 0 : 1;
    // Odd sign: 0–15° = Sun (Simha=4), 15–30° = Moon (Kataka=3)
    // Even sign: 0–15° = Moon (Kataka=3), 15–30° = Sun (Simha=4)
    const rasiIndex = isOddSign ? (part === 0 ? 4 : 3) : part === 0 ? 3 : 4;
    return { rasiIndex, partNumber: part + 1, isVargottama: rasiIndex === r };
  }

  if (vargaId === "D3") {
    const part = Math.min(2, Math.floor(deg / 10));
    const rasiIndex = (r + part * 4) % 12;
    return { rasiIndex, partNumber: part + 1, isVargottama: rasiIndex === r };
  }

  if (vargaId === "D4") {
    const part = Math.min(3, Math.floor(deg / 7.5));
    const rasiIndex = (r + part * 3) % 12;
    return { rasiIndex, partNumber: part + 1, isVargottama: rasiIndex === r };
  }

  if (vargaId === "D7") {
    const part = Math.min(6, Math.floor((deg * 7) / 30));
    const start = isOddSign ? r : (r + 6) % 12;
    const rasiIndex = (start + part) % 12;
    return { rasiIndex, partNumber: part + 1, isVargottama: rasiIndex === r };
  }

  if (vargaId === "D9") {
    const part = Math.min(8, Math.floor((deg * 9) / 30));
    const start = modality === 0 ? r : modality === 1 ? (r + 8) % 12 : (r + 4) % 12;
    const rasiIndex = (start + part) % 12;
    return { rasiIndex, partNumber: part + 1, isVargottama: rasiIndex === r };
  }

  if (vargaId === "D10") {
    const part = Math.min(9, Math.floor((deg * 10) / 30));
    const start = isOddSign ? r : (r + 8) % 12;
    const rasiIndex = (start + part) % 12;
    return { rasiIndex, partNumber: part + 1, isVargottama: rasiIndex === r };
  }

  if (vargaId === "D12") {
    const part = Math.min(11, Math.floor((deg * 12) / 30));
    const rasiIndex = (r + part) % 12;
    return { rasiIndex, partNumber: part + 1, isVargottama: rasiIndex === r };
  }

  if (vargaId === "D16") {
    const part = Math.min(15, Math.floor((deg * 16) / 30));
    const start = modality === 0 ? 0 : modality === 1 ? 4 : 8;
    const rasiIndex = (start + part) % 12;
    return { rasiIndex, partNumber: part + 1, isVargottama: rasiIndex === r };
  }

  if (vargaId === "D20") {
    const part = Math.min(19, Math.floor((deg * 20) / 30));
    const start = modality === 0 ? 0 : modality === 1 ? 8 : 4;
    const rasiIndex = (start + part) % 12;
    return { rasiIndex, partNumber: part + 1, isVargottama: rasiIndex === r };
  }

  if (vargaId === "D24") {
    const part = Math.min(23, Math.floor((deg * 24) / 30));
    const start = isOddSign ? 4 : 3;
    const rasiIndex = (start + part) % 12;
    return { rasiIndex, partNumber: part + 1, isVargottama: rasiIndex === r };
  }

  if (vargaId === "D27") {
    const part = Math.min(26, Math.floor((deg * 27) / 30));
    const element = r % 4; // 0=Fire(0), 1=Earth(3), 2=Air(6), 3=Water(9)
    const start = element * 3;
    const rasiIndex = (start + part) % 12;
    return { rasiIndex, partNumber: part + 1, isVargottama: rasiIndex === r };
  }

  if (vargaId === "D30") {
    let rasiIndex: number;
    let partNumber: number;
    if (isOddSign) {
      if (deg < 5) {
        rasiIndex = 0; // Mars (Mesha)
        partNumber = 1;
      } else if (deg < 10) {
        rasiIndex = 10; // Saturn (Kumbha)
        partNumber = 2;
      } else if (deg < 18) {
        rasiIndex = 8; // Jupiter (Dhanu)
        partNumber = 3;
      } else if (deg < 25) {
        rasiIndex = 2; // Mercury (Mithuna)
        partNumber = 4;
      } else {
        rasiIndex = 6; // Venus (Thula)
        partNumber = 5;
      }
    } else {
      if (deg < 5) {
        rasiIndex = 1; // Venus (Vrishabha)
        partNumber = 1;
      } else if (deg < 12) {
        rasiIndex = 5; // Mercury (Kanya)
        partNumber = 2;
      } else if (deg < 20) {
        rasiIndex = 11; // Jupiter (Meena)
        partNumber = 3;
      } else if (deg < 25) {
        rasiIndex = 9; // Saturn (Makara)
        partNumber = 4;
      } else {
        rasiIndex = 7; // Mars (Vrischika)
        partNumber = 5;
      }
    }
    return { rasiIndex, partNumber, isVargottama: rasiIndex === r };
  }

  if (vargaId === "D40") {
    const part = Math.min(39, Math.floor((deg * 40) / 30));
    const start = isOddSign ? 0 : 6;
    const rasiIndex = (start + part) % 12;
    return { rasiIndex, partNumber: part + 1, isVargottama: rasiIndex === r };
  }

  if (vargaId === "D45") {
    const part = Math.min(44, Math.floor((deg * 45) / 30));
    const start = modality === 0 ? 0 : modality === 1 ? 4 : 8;
    const rasiIndex = (start + part) % 12;
    return { rasiIndex, partNumber: part + 1, isVargottama: rasiIndex === r };
  }

  // D60 (Shashtiamsa)
  const part = Math.min(59, Math.floor(deg * 2));
  const rasiIndex = (r + part) % 12;
  const deityIdx = isOddSign ? part : 59 - part;
  const deity = SHASHTIAMSA_DEITIES[deityIdx];
  return {
    rasiIndex,
    partNumber: part + 1,
    isVargottama: rasiIndex === r,
    deityName: deity.name,
    deityNature: deity.nature,
  };
}

export function computeAllShodashavarga(
  planetLongitudes: LongitudeMap,
  lagnaLongitude: number,
): Record<VargaId, VargaChart> {
  const out = {} as Record<VargaId, VargaChart>;

  for (const def of SHODASHAVARGA_DEFS) {
    const lagnaPlace = computeVargaPlacement(lagnaLongitude, def.id);
    const planets = {} as Record<Planet, VargaPlacement>;
    for (const p of PLANETS) {
      planets[p] = computeVargaPlacement(planetLongitudes[p], def.id);
    }
    out[def.id] = {
      def,
      lagnaRasiIndex: lagnaPlace.rasiIndex,
      lagnaPart: lagnaPlace.partNumber,
      planets,
    };
  }

  return out;
}

const EXALTATION_RASI: Record<Planet, number> = {
  Sun: 0,
  Moon: 1,
  Mars: 9,
  Mercury: 5,
  Jupiter: 3,
  Venus: 11,
  Saturn: 6,
  Rahu: 1,
  Ketu: 7,
};

const DEBILITATION_RASI: Record<Planet, number> = {
  Sun: 6,
  Moon: 7,
  Mars: 3,
  Mercury: 11,
  Jupiter: 9,
  Venus: 5,
  Saturn: 0,
  Rahu: 7,
  Ketu: 1,
};

const NATURAL_FRIENDS: Record<string, string[]> = {
  Sun: ["Moon", "Mars", "Jupiter"],
  Moon: ["Sun", "Mercury"],
  Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"],
  Jupiter: ["Sun", "Moon", "Mars"],
  Venus: ["Mercury", "Saturn"],
  Saturn: ["Mercury", "Venus"],
};

const NATURAL_ENEMIES: Record<string, string[]> = {
  Sun: ["Venus", "Saturn"],
  Moon: [],
  Mars: ["Mercury"],
  Mercury: ["Moon"],
  Jupiter: ["Mercury", "Venus"],
  Venus: ["Sun", "Moon"],
  Saturn: ["Sun", "Moon", "Mars"],
};

/**
 * Return BPHS Vimshopaka dignity multiplier (out of 20) for `planet` in `rasiIndex`.
 * Own/Exalted = 20, Friend = 15, Neutral = 10, Enemy = 7, Debilitated = 5.
 */
function vimshopakaDignityFactor(planet: Planet, rasiIndex: number): number {
  const lord = rasiLord(rasiIndex);
  const pName = planet === "Rahu" ? "Saturn" : planet === "Ketu" ? "Mars" : planet;
  if (lord === pName || EXALTATION_RASI[planet] === rasiIndex) return 20;
  if (DEBILITATION_RASI[planet] === rasiIndex) return 5;
  if (NATURAL_FRIENDS[pName]?.includes(lord)) return 15;
  if (NATURAL_ENEMIES[pName]?.includes(lord)) return 7;
  return 10;
}

const SHADVARGA_WEIGHTS: Partial<Record<VargaId, number>> = {
  D1: 6,
  D2: 2,
  D3: 4,
  D9: 5,
  D12: 2,
  D30: 1,
};

const SAPTAVARGA_WEIGHTS: Partial<Record<VargaId, number>> = {
  D1: 5,
  D2: 2,
  D3: 3,
  D7: 2.5,
  D9: 4.5,
  D12: 2,
  D30: 1,
};

const DASAVARGA_WEIGHTS: Partial<Record<VargaId, number>> = {
  D1: 3,
  D2: 1.5,
  D3: 1.5,
  D7: 1.5,
  D9: 1.5,
  D10: 1.5,
  D12: 1.5,
  D16: 1.5,
  D30: 1.5,
  D60: 5,
};

const SHODASHAVARGA_WEIGHTS: Record<VargaId, number> = {
  D1: 3.5,
  D2: 1,
  D3: 1,
  D4: 0.5,
  D7: 0.5,
  D9: 3,
  D10: 0.5,
  D12: 0.5,
  D16: 2,
  D20: 0.5,
  D24: 0.5,
  D27: 0.5,
  D30: 1,
  D40: 0.5,
  D45: 0.5,
  D60: 4,
};

function weightedScore(
  planet: Planet,
  vargas: Record<VargaId, VargaChart>,
  weights: Partial<Record<VargaId, number>>,
): number {
  let sum = 0;
  for (const [vid, w] of Object.entries(weights) as [VargaId, number][]) {
    const rasi = vargas[vid].planets[planet].rasiIndex;
    sum += (w * vimshopakaDignityFactor(planet, rasi)) / 20;
  }
  return Number(sum.toFixed(2));
}

export function computeVimshopakaBala(
  vargas: Record<VargaId, VargaChart>,
): VimshopakaPlanetRow[] {
  return PLANETS.map((planet) => {
    let vargottamaCount = 0;
    for (const def of SHODASHAVARGA_DEFS) {
      if (def.id !== "D1" && vargas[def.id].planets[planet].isVargottama) {
        vargottamaCount += 1;
      }
    }
    return {
      planet,
      shadvarga: weightedScore(planet, vargas, SHADVARGA_WEIGHTS),
      saptavarga: weightedScore(planet, vargas, SAPTAVARGA_WEIGHTS),
      dasavarga: weightedScore(planet, vargas, DASAVARGA_WEIGHTS),
      shodashavarga: weightedScore(planet, vargas, SHODASHAVARGA_WEIGHTS),
      vargottamaCount,
    };
  });
}

export function rasiNameWithTamil(rasiIndex: number): string {
  const r = RASIS[rasiIndex];
  return `${r.nameEnglish} (${r.nameTamil})`;
}
