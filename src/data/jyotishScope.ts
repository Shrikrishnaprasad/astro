/** Route slug used in `pages/` paths and scope filters. */
export type JyotishPageId =
  | "live-transit"
  | "birth-chart"
  | "jamakkol-arudam"
  | "dasa"
  | "panchangam"
  | "porutham"
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
    name: "Indu Lagna & Yogi point",
    status: "partial",
    summary: "Commonly cited Jaimini-style formulas; treat as indicative.",
    detail: "Formulas vary between texts. Shown on the birth chart when calculated.",
    pages: ["birth-chart"],
  },
  {
    id: "avayogi",
    name: "Avayogi",
    status: "not-planned",
    summary: "Not computed — no verified formula in this codebase.",
    pages: ["birth-chart", "global"],
  },
  {
    id: "tithi-shunya",
    name: "Tithi Shunya Nakshatra",
    status: "not-planned",
    summary: "Not computed — no verified regional lookup table.",
    pages: ["birth-chart", "global"],
  },
  {
    id: "pushkara",
    name: "Pushkara Navamsa / Bhaga",
    status: "partial",
    summary: "Moon on birth chart; full-day windows on Panchangam for all bodies.",
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
    name: "Porutham (10 kootas)",
    status: "partial",
    summary: "Dasakoota from both charts' Moon nakshatra, pada display, and Moon rasi.",
    detail:
      "Simplified rule tables — not a full traditional match workflow (no papasamya, kuja dosha, lagna matching, community minimums, or astrologer review checklist).",
    pages: ["porutham"],
  },
  {
    id: "shadbala",
    name: "Shadbala / Ashtakavarga",
    status: "not-planned",
    summary: "Strength points and bindu charts are not implemented.",
    pages: ["global"],
  },
  {
    id: "yoga-dosha-packs",
    name: "Yoga & dosha packs (e.g. Mangal dosha)",
    status: "not-planned",
    summary: "No automated dosha/yoga rule packs or cancellation logic.",
    pages: ["global", "birth-chart", "porutham"],
  },
  {
    id: "kp-prasna",
    name: "KP sublords & Prasna",
    status: "not-planned",
    summary: "No Krishnamurti Paddhati or horary Prasna module.",
    pages: ["global"],
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
