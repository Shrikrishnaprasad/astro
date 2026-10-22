import type { ChoghadiyaName } from "./muhurtaRules";

export type MuhurtaActivityId =
  // General & Spiritual
  | "general"
  | "spiritual"
  | "ratna-dharana"
  // Marriage & Samskaras (Life Ceremonies)
  | "wedding"
  | "betrothal"
  | "seemantham"
  | "namakarana"
  | "annaprashana"
  | "mundan"
  | "karnavedha"
  | "aksharabhyasam"
  | "upanayanam"
  | "education"
  // Home, Property & Construction
  | "griha-pravesha"
  | "bhoomi-puja"
  | "property"
  | "borewell"
  | "main-door"
  | "renovation"
  | "rented-house"
  // Career, Business, Finance & Legal
  | "business"
  | "job-joining"
  | "machinery-launch"
  | "gold"
  | "loan-finance"
  | "legal-agreement"
  // Travel, Vehicles, Agriculture & Medical
  | "vehicle"
  | "travel"
  | "agriculture"
  | "cattle-pets"
  | "medical";

export type MuhurtaActivityCategory =
  | "General & Spiritual"
  | "Marriage & Life Samskaras"
  | "Home, Property & Construction"
  | "Career, Business & Finance"
  | "Travel, Vehicles, Agriculture & Health";

export type NamedMuhurtaKey = "abhijit" | "brahma" | "vijaya" | "godhuli" | "nishita";

export interface MuhurtaActivityDef {
  id: MuhurtaActivityId;
  category: MuhurtaActivityCategory;
  label: string;
  hint: string;
  preferShukla: boolean;
  /** 0–14 tithi index within paksha (Chaturdashi = 13, Purnima/Amavasya = 14). */
  avoidTithiIndices: number[];
  avoidNakshatraIndices: number[];
  preferredWeekdays: number[];
  /** Choghadiya names treated as favorable for starting this activity. */
  preferredChoghadiya: ChoghadiyaName[];
  allowNeutralChoghadiya: boolean;
  suggestNamedMuhurtas: NamedMuhurtaKey[];
  /** Preferred rising Lagna rasi indices (0=Mesha..11=Meena) for Lagna Shuddhi bonus. */
  preferredLagnaRasis: number[];
  disclaimer?: string;
}

/** Commonly avoided fierce/sharp nakshatras for gentle ceremonies. */
const FIERCE_SHARP_NAK = [1, 2, 5, 8, 9, 15, 17, 18, 19, 24]; // Bharani, Krittika, Ardra, Ashlesha, Magha, Vishakha, Jyeshtha, Mula, Purva Ashadha, Purva Bhadrapada
const WEDDING_AVOID_NAK = [1, 2, 5, 8, 9, 12, 17, 18, 19, 26];

const AVOID_AMAVASYA_CHATURDASHI = [13, 14];
// Richta tithis: Chaturthi (3), Navami (8), Chaturdashi (13) + Amavasya/Purnima (14)
const RICHTA_AND_AMAVASYA = [3, 8, 13, 14];

// Fixed signs (Sthira): Vrishabha (1), Simha (4), Vrischika (7), Kumbha (10)
const FIXED_LAGNAS = [1, 4, 7, 10];
// Benefic / Dual & Fixed lagnas commonly favored for ceremonies: Vrishabha(1), Mithuna(2), Kataka(3), Simha(4), Kanya(5), Thula(6), Dhanu(8), Meena(11)
const SHUBHA_LAGNAS = [1, 2, 3, 4, 5, 6, 8, 11];
// Movable (Chara) + Dual for travel/vehicles: Mesha(0), Mithuna(2), Kataka(3), Kanya(5), Thula(6), Dhanu(8), Makara(9), Meena(11)
const MOVABLE_DUAL_LAGNAS = [0, 2, 3, 5, 6, 8, 9, 11];

export const MUHURTA_ACTIVITIES: MuhurtaActivityDef[] = [
  // 1. General & Spiritual
  {
    id: "general",
    category: "General & Spiritual",
    label: "General / any auspicious start",
    hint: "New work, agreements, ceremonies not listed below.",
    preferShukla: true,
    avoidTithiIndices: AVOID_AMAVASYA_CHATURDASHI,
    avoidNakshatraIndices: [],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
  },
  {
    id: "spiritual",
    category: "General & Spiritual",
    label: "Spiritual / Puja / Homam / Mantra Initiation",
    hint: "Deeksha, homam, temple events, yajna, spiritual sadhana.",
    preferShukla: true,
    avoidTithiIndices: [13],
    avoidNakshatraIndices: [],
    preferredWeekdays: [0, 1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh"],
    allowNeutralChoghadiya: false,
    suggestNamedMuhurtas: ["brahma", "abhijit", "nishita"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
  },
  {
    id: "ratna-dharana",
    category: "General & Spiritual",
    label: "Wearing New Gems / New Clothes (Ratna & Vastra Dharana)",
    hint: "Energizing and wearing astrological gemstones, sacred thread/ornaments, or festive attire.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: [1, 2, 5, 8, 17, 18],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
  },

  // 2. Marriage & Life Samskaras
  {
    id: "wedding",
    category: "Marriage & Life Samskaras",
    label: "Wedding / Vivaha Muhurtham",
    hint: "Classical lists vary; uses conservative avoid-set + Shubha Lagna preference.",
    preferShukla: true,
    avoidTithiIndices: [...RICHTA_AND_AMAVASYA, 5, 7],
    avoidNakshatraIndices: WEDDING_AVOID_NAK,
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: false,
    suggestNamedMuhurtas: ["abhijit", "vijaya", "godhuli"],
    preferredLagnaRasis: [1, 2, 5, 6, 8, 10, 11],
    disclaimer: "Marriage muhurta needs full kundali matching — use as a shortlist only.",
  },
  {
    id: "betrothal",
    category: "Marriage & Life Samskaras",
    label: "Engagement / Betrothal (Nischayathartham)",
    hint: "Ring exchange, lagna patrika writing, and formal alliance confirmation.",
    preferShukla: true,
    avoidTithiIndices: [...RICHTA_AND_AMAVASYA, 7],
    avoidNakshatraIndices: FIERCE_SHARP_NAK,
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: false,
    suggestNamedMuhurtas: ["abhijit", "vijaya"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
  },
  {
    id: "seemantham",
    category: "Marriage & Life Samskaras",
    label: "Baby Shower / Seemantham (Pumsavana)",
    hint: "Blessing ceremony for expectant mother (typically 5th, 7th, or 8th month).",
    preferShukla: true,
    avoidTithiIndices: [...RICHTA_AND_AMAVASYA, 5, 7],
    avoidNakshatraIndices: FIERCE_SHARP_NAK,
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: false,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
  },
  {
    id: "namakarana",
    category: "Marriage & Life Samskaras",
    label: "Naming Ceremony (Namakaranam / Cradle Ceremony)",
    hint: "Child naming and cradle ceremony; favors gentle & benefic nakshatras and lagnas.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: FIERCE_SHARP_NAK,
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: false,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
  },
  {
    id: "annaprashana",
    category: "Marriage & Life Samskaras",
    label: "First Solid Food (Annaprashana)",
    hint: "Child's first rice-feeding ceremony (avoiding Dashami/Dwadashi/Richta).",
    preferShukla: true,
    avoidTithiIndices: [...RICHTA_AND_AMAVASYA, 11],
    avoidNakshatraIndices: [1, 2, 5, 8, 9, 17, 18, 22, 24],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: false,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
  },
  {
    id: "mundan",
    category: "Marriage & Life Samskaras",
    label: "Tonsure / First Haircut (Mundan / Choulam)",
    hint: "Child's first head-shaving ceremony; favors Chara/Dwiswabhava benefic lagnas.",
    preferShukla: true,
    avoidTithiIndices: [...RICHTA_AND_AMAVASYA, 0, 5],
    avoidNakshatraIndices: FIERCE_SHARP_NAK,
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: [1, 2, 3, 5, 6, 8, 11],
  },
  {
    id: "karnavedha",
    category: "Marriage & Life Samskaras",
    label: "Ear Piercing Ceremony (Karnavedha)",
    hint: "Traditional ear-piercing ceremony for children; favors gentle/mrudu and chara stars.",
    preferShukla: true,
    avoidTithiIndices: [...RICHTA_AND_AMAVASYA, 7],
    avoidNakshatraIndices: FIERCE_SHARP_NAK,
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: [1, 2, 3, 5, 6, 8, 11],
  },
  {
    id: "aksharabhyasam",
    category: "Marriage & Life Samskaras",
    label: "First Writing / Vidyarambham (Aksharabhyasam)",
    hint: "Initiating a child into writing alphabets; favors Mercury/Jupiter/Venus weekdays.",
    preferShukla: true,
    avoidTithiIndices: [...RICHTA_AND_AMAVASYA, 0],
    avoidNakshatraIndices: [1, 2, 8, 9, 17, 18, 24],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit", "brahma"],
    preferredLagnaRasis: [1, 2, 3, 5, 6, 8, 11],
  },
  {
    id: "upanayanam",
    category: "Marriage & Life Samskaras",
    label: "Sacred Thread Ceremony (Upanayanam)",
    hint: "Vedic initiation / Brahmopadesham during Uttarayana (recommended) & Shukla Paksha.",
    preferShukla: true,
    avoidTithiIndices: [...RICHTA_AND_AMAVASYA, 0, 5, 7, 11],
    avoidNakshatraIndices: FIERCE_SHARP_NAK,
    preferredWeekdays: [0, 1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh"],
    allowNeutralChoghadiya: false,
    suggestNamedMuhurtas: ["abhijit", "brahma"],
    preferredLagnaRasis: [1, 2, 3, 4, 5, 6, 8, 11],
  },
  {
    id: "education",
    category: "Marriage & Life Samskaras",
    label: "Higher Education / Course / Exam Registration",
    hint: "College admission, learning new skills, submitting thesis or exam applications.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: [1, 8, 9, 18],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit", "brahma"],
    preferredLagnaRasis: [2, 3, 5, 6, 8, 11],
  },

  // 3. Home, Property & Construction
  {
    id: "griha-pravesha",
    category: "Home, Property & Construction",
    label: "Griha Pravesha (Housewarming)",
    hint: "Entering a new home; favors Sthira (fixed) and Dwiswabhava (dual) lagnas.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: WEDDING_AVOID_NAK,
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: false,
    suggestNamedMuhurtas: ["abhijit", "brahma"],
    preferredLagnaRasis: [1, 2, 4, 5, 7, 8, 10, 11],
  },
  {
    id: "bhoomi-puja",
    category: "Home, Property & Construction",
    label: "Bhoomi Puja / Foundation Laying (Shanku Sthapana)",
    hint: "Ground-breaking ceremony and laying foundation stone; strongly favors Sthira (fixed) lagnas.",
    preferShukla: true,
    avoidTithiIndices: [...RICHTA_AND_AMAVASYA, 7],
    avoidNakshatraIndices: [1, 2, 5, 8, 15, 17, 18],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Shubh", "Amrit", "Labh"],
    allowNeutralChoghadiya: false,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: FIXED_LAGNAS,
  },
  {
    id: "property",
    category: "Home, Property & Construction",
    label: "Property / Land Purchase & Registration",
    hint: "Deed registration, buying plot/apartment; favors fixed and benefic lagnas.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: [1, 5, 8, 18],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Shubh", "Labh", "Amrit"],
    allowNeutralChoghadiya: false,
    suggestNamedMuhurtas: ["abhijit", "vijaya"],
    preferredLagnaRasis: [...FIXED_LAGNAS, 2, 5, 8],
  },
  {
    id: "main-door",
    category: "Home, Property & Construction",
    label: "Main Door Frame Fixing (Vasakal Puja)",
    hint: "Installing the main entrance threshold/door frame; favors Sthira (fixed) lagnas.",
    preferShukla: true,
    avoidTithiIndices: [...RICHTA_AND_AMAVASYA, 7],
    avoidNakshatraIndices: FIERCE_SHARP_NAK,
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Shubh", "Amrit", "Labh"],
    allowNeutralChoghadiya: false,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: FIXED_LAGNAS,
  },
  {
    id: "borewell",
    category: "Home, Property & Construction",
    label: "Borewell / Well / Water Tank Digging",
    hint: "Drilling borewell or digging water source; favors Jala (watery) & benefic stars/lagnas.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: [1, 2, 5, 8, 9, 17],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: [1, 3, 6, 7, 9, 10, 11],
  },
  {
    id: "renovation",
    category: "Home, Property & Construction",
    label: "Home Renovation / Repair / Interior Work",
    hint: "Starting remodeling, painting, structural upgrades, or Vastu corrections.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: [1, 2, 8, 17],
    preferredWeekdays: [1, 3, 4, 5, 6],
    preferredChoghadiya: ["Shubh", "Labh", "Amrit", "Char"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
  },
  {
    id: "rented-house",
    category: "Home, Property & Construction",
    label: "Moving into Rented / Leased Home",
    hint: "Shifting household into a rental or leased residence.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: [1, 2, 5, 8, 17, 18],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh", "Char"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
  },

  // 4. Career, Business & Finance
  {
    id: "business",
    category: "Career, Business & Finance",
    label: "Business / Shop / Office Opening",
    hint: "Opening store/office, company incorporation, first sale.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: [1, 5, 8, 17, 18],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Labh", "Shubh", "Amrit"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit", "vijaya"],
    preferredLagnaRasis: [...FIXED_LAGNAS, 2, 5, 6, 8],
  },
  {
    id: "job-joining",
    category: "Career, Business & Finance",
    label: "Joining New Job / Assuming Office / Promotion",
    hint: "Signing offer, first day at work, taking charge of a new role.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: [1, 5, 8, 17, 18],
    preferredWeekdays: [0, 1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit", "vijaya"],
    preferredLagnaRasis: [0, 1, 2, 4, 5, 6, 8, 10],
  },
  {
    id: "machinery-launch",
    category: "Career, Business & Finance",
    label: "Machinery Installation / Factory / Website / App Launch",
    hint: "Commissioning industrial equipment, production start, or software/product release.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: [1, 8, 18],
    preferredWeekdays: [1, 3, 4, 5, 6],
    preferredChoghadiya: ["Labh", "Shubh", "Amrit", "Char"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit", "vijaya"],
    preferredLagnaRasis: [...FIXED_LAGNAS, 2, 5, 6, 8],
  },
  {
    id: "gold",
    category: "Career, Business & Finance",
    label: "Gold / Jewelry / High-Value Asset Purchase",
    hint: "Buying gold, silver, ornaments, or long-term wealth assets.",
    preferShukla: true,
    avoidTithiIndices: [7, 8, 13, 14],
    avoidNakshatraIndices: [1, 5, 8, 18],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Labh", "Amrit", "Shubh"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit", "vijaya"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
  },
  {
    id: "loan-finance",
    category: "Career, Business & Finance",
    label: "Financial Investment / Debt Repayment / Account Opening",
    hint: "Starting deposits/investments or paying off debt (Runa Vimochana).",
    preferShukla: true,
    avoidTithiIndices: [3, 8, 13, 14],
    avoidNakshatraIndices: [1, 8, 17, 18],
    preferredWeekdays: [1, 2, 3, 4, 5],
    preferredChoghadiya: ["Labh", "Amrit", "Shubh", "Char"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: MOVABLE_DUAL_LAGNAS,
  },
  {
    id: "legal-agreement",
    category: "Career, Business & Finance",
    label: "Signing Contracts / Partnership / Legal Filing",
    hint: "Executing MOUs, partnerships, deeds, or initiating legal/arbitration matters.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: [1, 5, 8, 18],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Shubh", "Labh", "Amrit"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit", "vijaya"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
  },

  // 5. Travel, Vehicles, Agriculture & Health
  {
    id: "vehicle",
    category: "Travel, Vehicles, Agriculture & Health",
    label: "Vehicle Purchase / Registration / Delivery",
    hint: "Buying or taking delivery of a car, bike, or commercial vehicle; favors Chara/Dwiswabhava lagna.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: [1, 2, 5, 8, 9, 17, 18],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Char", "Labh", "Shubh", "Amrit"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit", "vijaya"],
    preferredLagnaRasis: MOVABLE_DUAL_LAGNAS,
  },
  {
    id: "travel",
    category: "Travel, Vehicles, Agriculture & Health",
    label: "Travel / Journey / Pilgrimage (Yatra)",
    hint: "Char Choghadiya and movable lagnas are traditionally favored for movement.",
    preferShukla: false,
    avoidTithiIndices: [5, 7, 8, 13, 14],
    avoidNakshatraIndices: [1, 2, 8, 9, 17],
    preferredWeekdays: [1, 3, 4, 5, 6],
    preferredChoghadiya: ["Char", "Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit", "vijaya"],
    preferredLagnaRasis: MOVABLE_DUAL_LAGNAS,
  },
  {
    id: "agriculture",
    category: "Travel, Vehicles, Agriculture & Health",
    label: "Agriculture — Sowing Seeds / Ploughing / Harvest",
    hint: "Starting farm operations, planting orchards, or harvesting crops.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: [1, 2, 5, 8, 17],
    preferredWeekdays: [0, 1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
  },
  {
    id: "cattle-pets",
    category: "Travel, Vehicles, Agriculture & Health",
    label: "Bringing Home Cattle / Livestock / Pets",
    hint: "Purchasing dairy cattle, horses, or adopting pets into the household.",
    preferShukla: true,
    avoidTithiIndices: RICHTA_AND_AMAVASYA,
    avoidNakshatraIndices: [1, 5, 8, 17, 18],
    preferredWeekdays: [1, 3, 4, 5],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh", "Char"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
  },
  {
    id: "medical",
    category: "Travel, Vehicles, Agriculture & Health",
    label: "Medical / Elective Procedure / Therapy Start",
    hint: "Elective timing or starting Ayurvedic/medical regimen — not medical advice.",
    preferShukla: false,
    avoidTithiIndices: [3, 7, 8, 13, 14],
    avoidNakshatraIndices: [1, 2, 8, 17, 18],
    preferredWeekdays: [1, 2, 3, 4, 5, 6],
    preferredChoghadiya: ["Amrit", "Shubh", "Labh"],
    allowNeutralChoghadiya: true,
    suggestNamedMuhurtas: ["abhijit"],
    preferredLagnaRasis: SHUBHA_LAGNAS,
    disclaimer: "For emergencies, do not delay care. This is a traditional calendar hint only.",
  },
];

export const MUHURTA_CATEGORIES: MuhurtaActivityCategory[] = [
  "General & Spiritual",
  "Marriage & Life Samskaras",
  "Home, Property & Construction",
  "Career, Business & Finance",
  "Travel, Vehicles, Agriculture & Health",
];

export function muhurtaActivityById(id: MuhurtaActivityId): MuhurtaActivityDef {
  return MUHURTA_ACTIVITIES.find((a) => a.id === id) ?? MUHURTA_ACTIVITIES[0];
}
