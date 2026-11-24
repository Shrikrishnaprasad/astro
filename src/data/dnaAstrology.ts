import type { Planet } from "../engine/types";

/** Planets that carry DNA nakshatra karma (Ketu has none). */
export type DnaKarmaPlanet = Exclude<Planet, "Ketu">;

export const DNA_KARMA_PLANETS: DnaKarmaPlanet[] = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
];

/**
 * Nakshatra index (0=Ashwini … 26=Revati) → DNA karma planet.
 * Weekday-cycle mapping used by public DNA Astrology writeups; Ketu has no registry.
 */
export const DNA_NAKSHATRA_KARMA: Array<DnaKarmaPlanet | null> = [
  "Sun", // 0 Ashwini
  "Moon", // 1 Bharani
  "Mars", // 2 Krittika
  "Mercury", // 3 Rohini
  "Jupiter", // 4 Mrigashira
  "Venus", // 5 Ardra
  "Saturn", // 6 Punarvasu
  "Rahu", // 7 Pushya
  "Sun", // 8 Ashlesha
  "Moon", // 9 Magha
  "Mars", // 10 Purva Phalguni
  "Mercury", // 11 Uttara Phalguni
  "Jupiter", // 12 Hasta
  "Venus", // 13 Chitra
  "Saturn", // 14 Swati
  "Rahu", // 15 Vishakha
  "Sun", // 16 Anuradha
  "Moon", // 17 Jyeshtha
  "Mars", // 18 Mula
  "Mercury", // 19 Purva Ashadha
  "Jupiter", // 20 Uttara Ashadha
  "Venus", // 21 Shravana
  "Saturn", // 22 Dhanishta
  "Rahu", // 23 Shatabhisha
  "Sun", // 24 Purva Bhadrapada
  "Moon", // 25 Uttara Bhadrapada
  "Mars", // 26 Revati
];

/** Pillar weights for core DNA karma (public Karumbu-style importance). */
export const DNA_PILLAR_WEIGHTS = {
  lagnaNakshatra: 100,
  lagnaLordNakshatra: 100,
  moonNakshatra: 50,
} as const;

/**
 * Birth nakshatra of each planet (Vichitra Jothidam set used by DNA writeups).
 * Index into NAKSHATRAS.
 */
export const DNA_PLANET_BIRTH_NAKSHATRA: Record<Planet, number> = {
  Sun: 12, // Hasta
  Moon: 4, // Mrigashira
  Mars: 20, // Uttara Ashadha
  Mercury: 22, // Dhanishta
  Jupiter: 7, // Pushya
  Venus: 9, // Magha
  Saturn: 26, // Revati
  Rahu: 1, // Bharani
  Ketu: 8, // Ashlesha
};

/**
 * DNA karma each natal planet carries (via its birth star's registry).
 * Derived from DNA_PLANET_BIRTH_NAKSHATRA + DNA_NAKSHATRA_KARMA.
 */
export const DNA_PLANET_CARRIES_KARMA: Record<Planet, DnaKarmaPlanet | null> = {
  Sun: "Jupiter", // Hasta
  Moon: "Jupiter", // Mrigashira
  Mars: "Jupiter", // Uttara Ashadha
  Mercury: "Saturn", // Dhanishta
  Jupiter: "Rahu", // Pushya
  Venus: "Moon", // Magha
  Saturn: "Mars", // Revati
  Rahu: "Moon", // Bharani
  Ketu: "Sun", // Ashlesha
};

/**
 * Planets that exhibit a given DNA karma when placed in the chart
 * (inverse of DNA_PLANET_CARRIES_KARMA).
 */
export const DNA_KARMA_CARRIER_PLANETS: Record<DnaKarmaPlanet, Planet[]> = {
  Sun: ["Ketu"],
  Moon: ["Venus", "Rahu"],
  Mars: ["Saturn"],
  Mercury: [],
  Jupiter: ["Sun", "Moon", "Mars"],
  Venus: [],
  Saturn: ["Mercury"],
  Rahu: ["Jupiter"],
};

/**
 * Rasi indices (0=Mesha…) that carry each DNA karma
 * (moolatrikona-based + Gemini→Venus, Cancer→Mercury).
 */
export const DNA_KARMA_SIGNS: Record<DnaKarmaPlanet, number[]> = {
  Sun: [11], // Meena (Ketu MT → Sun karma)
  Moon: [5, 6], // Kanni (Rahu MT), Tula (Venus MT)
  Mars: [10], // Kumbha (Saturn MT)
  Mercury: [3], // Kataka (natural 4th)
  Jupiter: [0, 1, 4], // Mesha, Vrishabha, Simha
  Venus: [2], // Mithuna (natural 3rd)
  Saturn: [5], // Kanni (Mercury MT)
  Rahu: [8], // Dhanu (Jupiter MT)
};

/** House numbers (1–12) carrying each DNA karma. */
export const DNA_KARMA_HOUSES: Record<DnaKarmaPlanet, number[]> = {
  Sun: [12],
  Moon: [6, 7],
  Mars: [11],
  Mercury: [4],
  Jupiter: [1, 2, 5],
  Venus: [3],
  Saturn: [6],
  Rahu: [9],
};

/** Inverse: house → DNA karma planet(s). */
export const DNA_HOUSE_KARMA: Array<DnaKarmaPlanet[]> = [
  [], // unused index 0
  ["Jupiter"], // 1
  ["Jupiter"], // 2
  ["Venus"], // 3
  ["Mercury"], // 4
  ["Jupiter"], // 5
  ["Moon", "Saturn"], // 6
  ["Moon"], // 7
  [], // 8
  ["Rahu"], // 9
  [], // 10
  ["Mars"], // 11
  ["Sun"], // 12
];

/** Inverse: rasi index → DNA karma planet(s). */
export function dnaKarmaForRasi(rasiIndex: number): DnaKarmaPlanet[] {
  const out: DnaKarmaPlanet[] = [];
  for (const p of DNA_KARMA_PLANETS) {
    if (DNA_KARMA_SIGNS[p].includes(((rasiIndex % 12) + 12) % 12)) out.push(p);
  }
  return out;
}

export interface DnaGuidance {
  english: string;
  tamil: string;
  familyProfessions: string;
  caution: string;
}

/** Condensed public-methodology guidance per DNA karma planet. */
export const DNA_KARMA_GUIDANCE: Record<DnaKarmaPlanet, DnaGuidance> = {
  Sun: {
    english:
      "Authority, ego, leadership, father, government, healing/admin. Family often in HR, admin, principals, officials. Sun shows direction but rarely yields the result itself; arrogance in the occupied house amplifies negative karma.",
    tamil:
      "அதிகாரம், அகங்காரம், தலைமை, தந்தை, அரசு, நிர்வாகம்/மருத்துவம். குடும்பத்தில் நிர்வாகம், அதிகாரிகள் அடிக்கடி. சூரியன் வழியைக் காட்டும்; அதிக அகங்காரம் எதிர்மறை கர்மத்தை வளர்க்கும்.",
    familyProfessions: "HR, admin, principal, team lead, government, medical authority",
    caution: "Control show-off and refusal to listen in the house Sun occupies.",
  },
  Moon: {
    english:
      "Mind, mother, public image, food/liquids, travel. Family often in hotels, catering, groceries, agriculture. Results of the Moon’s house swing up and down; strong concern about what others say.",
    tamil:
      "மனம், தாய், பொதுமக்கள் பார்வை, உணவு/நீர், பயணம். குடும்பத்தில் உணவு, விவசாயம் அடிக்கடி. சந்திரன் வீட்டுப் பலன் ஏற்ற இறக்கமாகும்; பிறர் கருத்து மிகுந்த கவலை.",
    familyProfessions: "Hotel, catering, groceries, agriculture, rice mill, psychology",
    caution: "Avoid living only by others’ opinions; steady the house Moon occupies.",
  },
  Mars: {
    english:
      "Courage, siblings, land, construction, uniformed work, marriage initiation. Family often in police, army, civil eng, sports. Desire of birth shows in Mars’s house; land/property disputes are sensitive.",
    tamil:
      "வீரம், சகோதரர், நிலம், கட்டுமானம், சீருடைத் தொழில். குடும்பத்தில் போலீஸ், இராணுவம், சிவில் பொறியியல் அடிக்கடி. செவ்வாய் வீடு பிறப்பு ஆசையைக் காட்டும்; நிலத் தகராறுகளில் எச்சரிக்கை.",
    familyProfessions: "Police, army, construction, civil engineering, sports",
    caution: "Temper stubbornness; be careful with land, partition, and property deals.",
  },
  Mercury: {
    english:
      "Communication, education, documents, analysis, friends, inter-community ties. Family often in finance, teaching, banking, writing, astrology. Decisions oscillate; extremes of brilliance and dullness appear in the lineage.",
    tamil:
      "பேச்சு, கல்வி, ஆவணம், பகுப்பாய்வு, நண்பர். குடும்பத்தில் நிதி, கல்வி, வங்கி, எழுத்து அடிக்கடி. முடிவுகள் அலைபாயும்; அறிவின் இரு முனைகளும் குடும்பத்தில் காணலாம்.",
    familyProfessions: "Finance, education, banking, journalism, printing, astrology",
    caution: "Seek clear decisions; do not stall forever waiting for perfect assurance.",
  },
  Jupiter: {
    english:
      "Children, teaching, dharma, wisdom, finance ethics. Family often teachers, bankers, judges, gold, temple priests. Guru shows the path but may not follow it; first child / delivery can be sensitive.",
    tamil:
      "பிள்ளை, கற்பித்தல், தர்மம், அறிவு, நிதி நெறி. குடும்பத்தில் ஆசிரியர், வங்கி, நீதிபதி, தங்கம், கோயில் பூசாரி அடிக்கடி. குரு வழி காட்டும்; முதல் பிள்ளை/பிரசவத்தில் கவனம்.",
    familyProfessions: "Teaching, banking, finance, judge, gold, temple priesthood",
    caution: "Practice what is preached; mind fund ethics and first-child matters.",
  },
  Venus: {
    english:
      "Spouse, beauty, arts, luxuries, pleasure. Family often cosmetics, fine arts, entertainment. High expectations and emotional flow over logic; Venus house also hints at kula deivam karma and Moon-type affliction to that house.",
    tamil:
      "துணைவர், அழகு, கலை, ஆடம்பரம். குடும்பத்தில் அழகுசாதனம், இசை/திரை/நடனம் அடிக்கடி. எதிர்பார்ப்பு அதிகம்; சுக்ரன் வீடு குல தெய்வக் கர்மத்தையும் காட்டலாம்.",
    familyProfessions: "Cosmetics, makeup, costumes, music/film/dance/drama, luxuries",
    caution: "Temper romantic idealism; reduce Moon-type emotional dosha in Venus’s house.",
  },
  Saturn: {
    english:
      "Profession, longevity, labour, delays, elder siblings. Family often labour, hospitals, oil/iron/steel, law, mining. Hard-working yet casual; extremes of workaholic vs stagnation and of lifespan appear.",
    tamil:
      "தொழில், ஆயுள், உழைப்பு, தாமதம், மூத்த சகோதரர். குடும்பத்தில் உழைப்பு, மருத்துவமனை, இரும்பு/எண்ணெய், சட்டம் அடிக்கடி. உழைப்பும் சோம்பலும் இரு முனையாகும்.",
    familyProfessions: "Labour, hospitals, oil mills, iron/steel, law, mining, marketing",
    caution: "Keep Saturn significations private; pride about them backfires.",
  },
  Rahu: {
    english:
      "Unconventional, foreign, electronics, logistics, sudden events, grandfather. Unquenchable desire in Rahu’s house; satisfaction rarely arrives even when goals are met.",
    tamil:
      "புதுமை, வெளிநாடு, மின்/எலக்ட்ரானிக்ஸ், போக்குவரத்து, திடீர் நிகழ்வு, தாத்தா. ராகு வீட்டில் ஆசை அடங்காது; கிடைத்தும் திருப்தி குறைவு.",
    familyProfessions: "Electricity, electronics, chemicals, logistics, transport contracts",
    caution: "Cap unrealistic expectations in Rahu’s house and with conjunct planets.",
  },
};

export interface DnaSignGuidance {
  english: string;
  tamil: string;
}

/** Condensed public-methodology guidance per rasi as a house of the chart. */
export const DNA_SIGN_GUIDANCE: DnaSignGuidance[] = [
  {
    // Mesha
    english:
      "Hard to enjoy fruits of this house; better results often come when matters are not held only in one’s own name.",
    tamil: "இந்த வீட்டின் பலனை அனுபவிப்பது கடினம்; சொந்தப் பெயரில் மட்டும் வைக்காமல் நடத்துவது உதவும்.",
  },
  {
    // Vrishabha
    english: "Virtues and money-linked benefits flow through this house significations.",
    tamil: "இந்த வீட்டின் காரியங்களில் செல்வம் மற்றும் நற்குணப் பலன் கிடைக்கும்.",
  },
  {
    // Mithuna
    english: "Secrets of this house spread quickly; speak carefully about its topics.",
    tamil: "இந்த வீட்டின் ரகசியங்கள் விரைவில் பரவும்; பேச்சில் எச்சரிக்கை.",
  },
  {
    // Kataka
    english: "Floating/unstable results; seize openings quickly or wait long for the next chance.",
    tamil: "ஏற்ற இறக்கமான பலன்; வாய்ப்பை உடனே பயன்படுத்தாவிட்டால் நீண்ட காத்திருப்பு.",
  },
  {
    // Simha
    english: "Shows direction and dreams but does not itself complete the help.",
    tamil: "வழிகாட்டும், கனவு காட்டும்; நேரடி உதவி குறைவு.",
  },
  {
    // Kanni
    english: "Competition, jealousy, and fights around this house; eventual success after friction.",
    tamil: "போட்டி, பொறாமை, சண்டை; உரசலுக்குப் பின் வெற்றி வரலாம்.",
  },
  {
    // Tula
    english: "Give-and-take / exchange house; something must be released to gain something else.",
    tamil: "கொடுத்து வாங்கும் இடம்; ஒன்றை விட்டு மற்றொன்றைப் பெற வேண்டும்.",
  },
  {
    // Vrischika
    english: "Can lure into mistakes; advice that looks good may backfire — proceed carefully.",
    tamil: "தவறுக்கு இழுக்கும்; நல்ல ஆலோசனை போல் தோன்றினாலும் பின்னடைவு வரலாம்.",
  },
  {
    // Dhanu
    english: "Transformation through this house; major life shifts when its events activate.",
    tamil: "மாற்றத்தின் வீடு; நிகழ்வுகள் வாழ்க்கையைத் திருப்பும்.",
  },
  {
    // Makara
    english: "Endless workload with gradual development in this area.",
    tamil: "வேலை ஓயாது; படிப்படியான வளர்ச்சியும் உண்டு.",
  },
  {
    // Kumbha
    english: "Hidden treasures and desire fulfilment when duties are done; detached tone possible.",
    tamil: "மறைந்த பொக்கிஷம்; கடமை செய்யும்போது ஆசை நிறைவேறும்; விலகிய மனப்பான்மை.",
  },
  {
    // Meena
    english: "Losses/expenses through this house, yet useful information and openings also arrive.",
    tamil: "செலவு/இழப்பு உண்டு; அதே சமயம் முக்கியத் தகவலும் வாய்ப்பும் வரும்.",
  },
];

export type DnaTopicRole = "spouse" | "mother" | "father" | "child" | "career";

/** Whole-sign house used for topic pattern inference from Lagna (and Moon for spouse). */
export const DNA_TOPIC_HOUSES: Record<DnaTopicRole, number> = {
  spouse: 7,
  mother: 4,
  father: 9,
  child: 5,
  career: 10,
};

export const DNA_TOPIC_LABELS: Record<DnaTopicRole, { english: string; tamil: string }> = {
  spouse: { english: "Spouse", tamil: "துணைவர்" },
  mother: { english: "Mother", tamil: "தாய்" },
  father: { english: "Father", tamil: "தந்தை" },
  child: { english: "First child", tamil: "முதல் பிள்ளை" },
  career: { english: "Career / profession", tamil: "தொழில்" },
};
