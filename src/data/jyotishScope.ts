/** Route slug used in `pages/` paths and scope filters. */
export type JyotishPageId =
  | "live-transit"
  | "birth-chart"
  | "jamakkol-arudam"
  | "dasa"
  | "panchangam"
  | "porutham"
  | "advanced-jyotish"
  | "prasna"
  | "global";

export type JyotishFeatureStatus = "implemented" | "partial" | "not-planned";

export interface JyotishFeature {
  id: string;
  name: string;
  status: JyotishFeatureStatus;
  summary: string;
  detail?: string;
  pages: JyotishPageId[];
}

export const JYOTISH_FEATURES: JyotishFeature[] = [
  {
    id: "sidereal-chart",
    name: "Sidereal birth chart (D1) + Navamsa (D9)",
    status: "implemented",
    summary: "Lahiri sidereal lagna, graha longitudes, whole-sign houses, Navamsa chart.",
    pages: ["birth-chart"],
  },
  {
    id: "ephemeris-precision",
    name: "Ephemeris precision & options",
    status: "partial",
    summary: "Optional Lahiri+nutation, Raman, KP ayanamsa; mean or true node; not Swiss Ephemeris.",
    detail: "Use Ephemeris accuracy → Calculation options. Ascendant formula unchanged.",
    pages: ["global", "birth-chart", "live-transit", "panchangam", "dasa", "porutham", "jamakkol-arudam"],
  },
  {
    id: "planet-houses",
    name: "Whole-sign house placement per graha",
    status: "implemented",
    summary: "House numbers from lagna rasi (engine + birth chart planet table).",
    pages: ["birth-chart"],
  },
  {
    id: "gochara-ring",
    name: "Live Gochara overlay",
    status: "implemented",
    summary: "Current transits at birth location on the D1 chart.",
    pages: ["birth-chart", "live-transit"],
  },
  {
    id: "panchanga-birth",
    name: "Panchanga at birth",
    status: "implemented",
    summary: "Vara, tithi (+ type), nakshatra, yoga, karana, masa, ritu, ayana, samvatsara.",
    pages: ["birth-chart", "panchangam"],
  },
  {
    id: "indu-yogi",
    name: "Indu Lagna, Yogi & Duplicate Yogi",
    status: "partial",
    summary: "Yoga Sphuta + 93°20′; duplicate Yogi = sign lord of Yogi point.",
    pages: ["birth-chart", "advanced-jyotish"],
  },
  {
    id: "avayogi",
    name: "Avayogi",
    status: "partial",
    summary: "Yogi point + 186°40′ sphuta rule (not the degenerate 10th-nakshatra count).",
    pages: ["birth-chart", "advanced-jyotish"],
  },
  {
    id: "tithi-shunya",
    name: "Tithi Shunya Nakshatra",
    status: "partial",
    summary: "Published tithi 1–15 ↔ shunya nakshatra table; regional variants may differ.",
    pages: ["birth-chart", "advanced-jyotish"],
  },
  {
    id: "pushkara",
    name: "Pushkara Navamsa / Bhaga",
    status: "implemented",
    summary: "All grahas + lagna at birth; full-day windows on Panchangam.",
    pages: ["birth-chart", "panchangam"],
  },
  {
    id: "arudha-pada",
    name: "Classical Arudha Pada (A1–A12)",
    status: "implemented",
    summary: "Jaimini Arudha table from lagna and graha rasis.",
    pages: ["jamakkol-arudam"],
  },
  {
    id: "jamakkol-arudam",
    name: "Jamakkol Aaru, Mandhi, Kavippu, Jamagraham",
    status: "partial",
    summary: "Tamil Jamakkol workflow with timed Aaru rotation and verified Kavippu trace.",
    pages: ["jamakkol-arudam"],
  },
  {
    id: "vimshottari-dasa",
    name: "Vimshottari Dasa–Bhukti–Antara–Sukshma",
    status: "partial",
    summary: "Four nested levels from Moon nakshatra; highlights current Maha/Bhukti.",
    detail: "Default timeline covers one 120-year cycle from birth.",
    pages: ["dasa"],
  },
  {
    id: "porutham-dasakoota",
    name: "Porutham match report",
    status: "partial",
    summary: "Dasakoota + Papa samyam, Kuja dosha, lagna porutham, minimum score, narrative summary.",
    detail: "Papa/Kuja rules are simplified; astrologer review still advised for final marriage decision.",
    pages: ["porutham"],
  },
  {
    id: "shadbala",
    name: "Shadbala / Ashtakavarga",
    status: "partial",
    summary: "Parashari Ashtakavarga (SAV/BAV) + Sthana/dignity proxy only — not full six-fold Shadbala.",
    pages: ["advanced-jyotish", "birth-chart"],
  },
  {
    id: "yoga-dosha-packs",
    name: "Yoga & dosha packs (e.g. Mangal dosha)",
    status: "partial",
    summary: "Mangal dosha from Lagna/Moon/Venus with common cancellations; other yogas not packed yet.",
    pages: ["advanced-jyotish", "birth-chart", "porutham"],
  },
  {
    id: "kp-prasna",
    name: "KP sublords & Prasna",
    status: "partial",
    summary: "Vimshottari-proportional star/sub/sub-sub lords; basic Prasna page with lagna/Moon hints.",
    pages: ["advanced-jyotish", "prasna"],
  },
  {
    id: "muhurta-panchangam",
    name: "Muhurta, Choghadiya, Disha Shool",
    status: "implemented",
    summary: "Daily auspicious/inauspicious windows on the Panchangam page.",
    pages: ["panchangam"],
  },
];

export function featuresForPage(pageId: JyotishPageId): JyotishFeature[] {
  return JYOTISH_FEATURES.filter((f) => f.pages.includes(pageId) || f.pages.includes("global"));
}

export function featuresByStatus(status: JyotishFeatureStatus): JyotishFeature[] {
  return JYOTISH_FEATURES.filter((f) => f.status === status);
}
