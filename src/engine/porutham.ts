import { RASIS, rasiLord } from "../data/rasis";
import {
  GANA,
  NADI,
  RAJJU,
  VASYA_GROUP,
  YONI,
  YONI_COMPATIBLE_PAIRS,
} from "../data/poruthamRules";

export interface PoruthamCheck {
  name: string;
  pass: boolean;
  note: string;
}

export interface PoruthamResult {
  checks: PoruthamCheck[];
  score: number; // number of checks passed
  total: number;
}

const PLANET_FRIENDS: Record<string, string[]> = {
  Sun: ["Sun", "Moon", "Mars", "Jupiter"],
  Moon: ["Moon", "Sun", "Mercury"],
  Mars: ["Mars", "Sun", "Moon", "Jupiter"],
  Mercury: ["Mercury", "Sun", "Venus"],
  Jupiter: ["Jupiter", "Sun", "Moon", "Mars"],
  Venus: ["Venus", "Mercury", "Saturn"],
  Saturn: ["Saturn", "Mercury", "Venus"],
};

function nakshatraToRasi27(nakshatraIndex: number): number {
  // used only as a rough fallback; real rasi should come from the actual chart.
  return Math.floor((nakshatraIndex * (360 / 27)) / 30);
}

/**
 * Standard Tamil "10 porutham" (Dasakoota) compatibility check between two
 * nakshatras. This is a simplified, best-effort v1 implementation of
 * traditionally taught counting/lookup rules — treat results as indicative,
 * not a substitute for a qualified astrologer's review.
 */
export function computePorutham(
  brideNakshatraIndex: number,
  groomNakshatraIndex: number,
  brideRasiIndex?: number,
  groomRasiIndex?: number,
): PoruthamResult {
  const checks: PoruthamCheck[] = [];
  const bRasi = brideRasiIndex ?? nakshatraToRasi27(brideNakshatraIndex);
  const gRasi = groomRasiIndex ?? nakshatraToRasi27(groomNakshatraIndex);

  // 1. Dina (Tara) Porutham: count from bride's star to groom's star; counts
  // whose position-in-9 is 3, 5, 7 (i.e. remainder 3,5,7 of count-mod-9) are
  // considered inauspicious ("Vipat", "Pratyak", "Vadha" taras).
  const dinaCount = (((groomNakshatraIndex - brideNakshatraIndex + 27) % 27) + 1) % 9 || 9;
  const dinaPass = ![3, 5, 7].includes(dinaCount);
  checks.push({
    name: "Dina (Tara)",
    pass: dinaPass,
    note: `Star count position ${dinaCount} of 9`,
  });

  // 2. Gana Porutham: Deva-Deva/Manushya-Manushya/Rakshasa-Rakshasa best;
  // Deva-Manushya and Manushya-Rakshasa acceptable; Deva-Rakshasa worst.
  const bGana = GANA[brideNakshatraIndex];
  const gGana = GANA[groomNakshatraIndex];
  const ganaPass = !(
    (bGana === "Deva" && gGana === "Rakshasa") ||
    (bGana === "Rakshasa" && gGana === "Deva")
  );
  checks.push({ name: "Gana", pass: ganaPass, note: `${bGana} / ${gGana}` });

  // 3. Mahendra Porutham: count from groom's star to bride's star; auspicious
  // if the count falls on 1, 4, 7, 10, 13, 16, 19, 22 or 25.
  const mahendraCount = ((brideNakshatraIndex - groomNakshatraIndex + 27) % 27) + 1;
  const mahendraPass = (mahendraCount - 1) % 3 === 0;
  checks.push({
    name: "Mahendra",
    pass: mahendraPass,
    note: `Star count ${mahendraCount} from groom to bride`,
  });

  // 4. Sthree Dheergam: count from bride's star to groom's star should be
  // comfortably large (>= 13) so the bride's star "precedes" favorably.
  const dheerghamCount = ((groomNakshatraIndex - brideNakshatraIndex + 27) % 27) + 1;
  const dheerghamPass = dheerghamCount >= 13;
  checks.push({
    name: "Sthree Dheergam",
    pass: dheerghamPass,
    note: `Star count ${dheerghamCount} from bride to groom`,
  });

  // 5. Yoni Porutham: animal-symbol compatibility/enmity between nakshatras.
  const bYoni = YONI[brideNakshatraIndex];
  const gYoni = YONI[groomNakshatraIndex];
  const yoniPass = (YONI_COMPATIBLE_PAIRS[bYoni] ?? []).includes(gYoni);
  checks.push({ name: "Yoni", pass: yoniPass, note: `${bYoni} / ${gYoni}` });

  // 6. Rasyadhipathi (Graha Maitri): friendship between the two rasi lords.
  const bLord = rasiLord(bRasi);
  const gLord = rasiLord(gRasi);
  const maitriPass =
    bLord === gLord ||
    (PLANET_FRIENDS[bLord] ?? []).includes(gLord) ||
    (PLANET_FRIENDS[gLord] ?? []).includes(bLord);
  checks.push({ name: "Rasyadhipathi (Graha Maitri)", pass: maitriPass, note: `${bLord} / ${gLord}` });

  // 7. Rasi (Bhakoot): sign-distance of 6 or 8 between the two rasis is
  // considered inauspicious (Shadashtaka dosha).
  const rasiDistance = (((gRasi - bRasi + 12) % 12) + 1);
  const rasiPass = rasiDistance !== 6 && rasiDistance !== 8;
  checks.push({ name: "Rasi (Bhakoot)", pass: rasiPass, note: `Sign distance ${rasiDistance}` });

  // 8. Vasiya: rasi vasya-group compatibility.
  const bVasya = VASYA_GROUP[bRasi];
  const gVasya = VASYA_GROUP[gRasi];
  const vasiyaPass = bVasya === gVasya || RASIS[bRasi].element === RASIS[gRasi].element;
  checks.push({ name: "Vasiya", pass: vasiyaPass, note: `${bVasya} / ${gVasya}` });

  // 9. Rajju: matching Rajju group between the two nakshatras is inauspicious.
  const bRajju = RAJJU[brideNakshatraIndex];
  const gRajju = RAJJU[groomNakshatraIndex];
  const rajjuPass = bRajju !== gRajju;
  checks.push({ name: "Rajju", pass: rajjuPass, note: `${bRajju} / ${gRajju}` });

  // 10. Nadi: same Nadi (especially Antya-Antya, Madhya-Madhya, Aadi-Aadi) is
  // considered inauspicious (Nadi dosha).
  const bNadi = NADI[brideNakshatraIndex];
  const gNadi = NADI[groomNakshatraIndex];
  const nadiPass = bNadi !== gNadi;
  checks.push({ name: "Nadi", pass: nadiPass, note: `${bNadi} / ${gNadi}` });

  const score = checks.filter((c) => c.pass).length;
  return { checks, score, total: checks.length };
}
