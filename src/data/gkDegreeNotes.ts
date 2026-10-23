import type { Planet } from "../engine/types";

/** Standard graha themes already used in this app — not GK book result tables. */
export const GK_POINT_THEMES: Record<Planet, { en: string; ta: string }> = {
  Sun: { en: "Self, father, authority, vitality", ta: "ஆன்மா, தந்தை, அதிகாரம், உயிர்ச்சக்தி" },
  Moon: { en: "Mind, mother, emotions, public", ta: "மனம், தாய், உணர்ச்சி, பொதுமக்கள்" },
  Mars: { en: "Courage, siblings, land, energy", ta: "தைரியம், உடன்பிறப்பு, நிலம், சக்தி" },
  Mercury: { en: "Speech, trade, friends, intellect", ta: "பேச்சு, வியாபாரம், நட்பு, அறிவு" },
  Jupiter: { en: "Wisdom, children, dharma, growth", ta: "ஞானம், பிள்ளைகள், தர்மம், வளர்ச்சி" },
  Venus: { en: "Spouse, arts, comforts, vehicles", ta: "துணைவர், கலை, சுகம், வாகனம்" },
  Saturn: { en: "Work, delay, service, longevity", ta: "வேலை, தாமதம், சேவை, ஆயுள்" },
  Rahu: { en: "Foreign, sudden rise, desire, illusion", ta: "வெளிநாடு, திடீர் உயர்வு, ஆசை, மாயை" },
  Ketu: { en: "Detachment, research, moksha, past", ta: "துறவு, ஆராய்ச்சி, மோட்சம், கர்மம்" },
};

export const GK_RULE_NOTES = {
  source:
    "Degree System (பாகை முறை). Computational rules from published descriptions; not a reprint of any book.",
  orb: "Planets within ±3° of degree-in-sign (0°–30°) act as one yoga, even in different rasis — including 6/8 from each other.",
  highLow:
    "Highest-degree and lowest-degree grahas key the native's character, energy and preferences. Their Dasa/Bhukti can strain health.",
  jupiter: "A graha within 3° of Jupiter's degree has its karakas strengthened.",
  rahuKetu: "A graha within 3° of Rahu or Ketu's degree has its karakas weakened.",
  transitLagna: "Transit Lagna degree near a natal graha: the related event tends to occur (hard to stop).",
  transitMoon: "Transit Moon degree near a natal graha: the situation around the event (can be avoided).",
  approaching: "Transit degree still short of the natal degree (by motion) = upcoming; already crossed = done.",
  synastry: "Another person's graha at a similar degree acts as a combination between the two charts.",
  bhrigu: "Bhrigu Bindu is the shorter-arc midpoint of Moon and Rahu. Natal or transit grahas on it mark a sensitive event point.",
} as const;

export const CHANDRA_NADI_NOTES = {
  intro:
    "Chandra Naadi (சந்திர நாடி): transit Moon is the center. Natal grahas that conjoin or aspect it show the query and the likely answer. No varga charts.",
  past: "Natal grahas the transit Moon has just crossed = past events.",
  next: "Natal grahas the transit Moon will touch next = upcoming events.",
  dusthana: "Transit Moon in the 6th, 8th or 12th from a natal graha = unfavourable for that graha's karaka.",
} as const;
