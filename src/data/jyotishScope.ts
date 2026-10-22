/** Route slug used in `pages/` paths and scope filters. */
export type JyotishPageId =
  | "live-transit"
  | "birth-chart"
  | "divisional-charts"
  | "ashtakavarga"
  | "jamakkol-arudam"
  | "dasa"
  | "panchangam"
  | "muhurta"
  | "porutham"
  | "advanced-jyotish"
  | "kp"
  | "prasna"
  | "ephemeris"
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
    name: "Sidereal birth chart (D1) + Shodashavarga (D1–D60)",
    status: "implemented",
    summary:
      "Lahiri sidereal lagna, graha longitudes, whole-sign houses, all 16 Parashari divisional charts (D1–D60), Vargottama, D60 Shashtiamsa deities, and 20-point Vimshopaka Bala.",
    pages: ["birth-chart", "divisional-charts", "advanced-jyotish"],
  },
  {
    id: "ephemeris-precision",
    name: "Ephemeris precision & options",
    status: "implemented",
    summary: "Optional Lahiri+nutation, Raman, KP ayanamsa; mean or true node; not Swiss Ephemeris.",
    detail:
      "Calculation options on Ephemeris and Ephemeris accuracy pages; charts, panchanga, retrograde, and mandhi use the same settings.",
    pages: [
      "global",
      "ephemeris",
      "birth-chart",
      "live-transit",
      "panchangam",
      "dasa",
      "porutham",
      "jamakkol-arudam",
      "advanced-jyotish",
      "prasna",
    ],
  },
  {
    id: "ephemeris-table",
    name: "Ephemeris table (sidereal positions)",
    status: "implemented",
    summary: "Single-moment graha table with sidereal λ, lagna, ayanamsa; optional daily 0/6/12/18 local sheet.",
    pages: ["ephemeris"],
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
    id: "ashtakavarga-full",
    name: "Ashtakavarga (337-bindu SAV, 8 BAVs, Shodhana, Pinda, Kakshya)",
    status: "implemented",
    summary:
      "Full 337-bindu Sarvashtakavarga, 7 planet BAVs + Lagna BAV, South Indian bindu chart, Trikona & Ekadhipatya Shodhana, Rasi/Graha/Sodhya Pinda, 8×12 Prastara, and Kakshya transit analysis.",
    pages: ["ashtakavarga", "birth-chart", "advanced-jyotish"],
  },
  {
    id: "shadbala",
    name: "Shadbala",
    status: "partial",
    summary: "Sthana/dignity proxy + 20-point Vimshopaka Bala — not full six-fold Shadbala in virupas yet.",
    pages: ["advanced-jyotish", "birth-chart", "divisional-charts"],
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
    name: "KP Astrology System (Placidus Cusps, 4-Step Significators, 1–249 Horary, RP)",
    status: "implemented",
    summary:
      "12 Placidus House Cusps (Sign/Star/Sub/Sub-Sub/Prana), Bhava Chalit, 4-Fold Significators (A/B/C/D + Rahu/Ketu rules), 1–249 Horary Number Chart, Ruling Planets (RP), and 9 Cuspal Sub-Lord Event Promise analyzers.",
    pages: ["kp", "prasna", "advanced-jyotish"],
  },
  {
    id: "muhurta-panchangam",
    name: "Muhurta, Choghadiya, Disha Shool",
    status: "implemented",
    summary: "Daily windows on Panchangam; range search with activity presets on Muhurta picker.",
    pages: ["panchangam", "muhurta"],
  },
  {
    id: "muhurta-picker",
    name: "Muhurta picker (activity search)",
    status: "implemented",
    summary:
      "365-day search across 31 activities; Varjyam & Amrita Kalam, Durmuhurtam, Choghadiya + Tamil Gowri Panchangam, Siddha/Amrita/Marana & Anandadi Yogas, Sarvartha/Amrita Siddhi/Tripushkara/Dagdha/Visha, Mahadoshas (Guru/Shukra Maudhya, Sankranti, Masa Shunya), Lagna Kundali Shuddhi (8th Ashtama, Papa Kartari, Bhrigu Shatka), single & couple Tarabala/Chandrabala.",
    pages: ["muhurta", "panchangam"],
  },
];

export function featuresForPage(pageId: JyotishPageId): JyotishFeature[] {
  return JYOTISH_FEATURES.filter((f) => f.pages.includes(pageId) || f.pages.includes("global"));
}

export function featuresByStatus(status: JyotishFeatureStatus): JyotishFeature[] {
  return JYOTISH_FEATURES.filter((f) => f.status === status);
}
