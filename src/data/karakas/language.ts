import type { KarakaCategoryGroup, KarakaEntry, KarakaEntryTamil, KarakaLanguage } from "./types";

const TAMIL_CHAR = /[\u0B80-\u0BFF]/;
const TAMIL_PAREN = /\s*\(([^()]*[\u0B80-\u0BFF][^()]*)\)/g;
const TAMIL_RUN = /[\u0B80-\u0BFF][\u0B80-\u0BFF\s/,&.-]*/g;

export function stripTamil(text: string): string {
  return text
    .replace(TAMIL_PAREN, "")
    .replace(TAMIL_RUN, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([,.:;])/g, "$1")
    .replace(/(\s*[—/•]\s*)+$/g, "")
    .replace(/^\s*[—/•:]\s*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Tamil inside the first parenthesis, e.g. "Lord (அதிபதி)" → "அதிபதி". */
export function tamilFromParen(text: string): string | undefined {
  const match = /\(([^()]*[\u0B80-\u0BFF][^()]*)\)/.exec(text);
  return match ? match[1].trim() : undefined;
}

const LABEL_TA: Record<string, string> = {
  "Exaltation / Debilitation": "உச்சம் / நீசம்",
  Moolatrikona: "மூலத்திரிகோணம்",
  "Symbol & Rising": "சின்னம் & உதயம்",
  "Varna & Guna": "வர்ணம் & குணம்",
  "Kalapurusha Anga": "காலபுருஷ அங்கம்",
  "Gender & Polarity": "பால் & தன்மை",
  "Sanskrit Name": "சமஸ்கிருதப் பெயர்",
  "Natural Sign & Lord": "இயற்கை ராசி & அதிபதி",
  "Naisargika Karaka": "நைசர்கிக காரகன்",
  "House Classification": "பாவ வகை",
  "Body Part (Anga)": "உடல் உறுப்பு (அங்கம்)",
  Relatives: "உறவினர்கள்",
  "Own Sign & Moolatrikona": "சொந்த வீடு & மூலத்திரிகோணம்",
  "Friends / Enemies / Neutral": "நட்பு / பகை / சமம்",
  "Digbala & Direction": "திக்பலம் & திசை",
  "Element, Guna & Dosha": "பூதம், குணம் & தோஷம்",
  "Gender, Caste & Cabinet": "பால், வர்ணம் & பதவி",
  "Dhatu / Moola / Jeeva": "தாது / மூலம் / ஜீவன்",
  "Deity & Pratyadhidevata": "அதிதேவதை & பிரத்யதிதேவதை",
  "Gem, Metal & Grain": "ரத்தினம், உலோகம் & தானியம்",
  "Color, Taste & Season": "நிறம், சுவை & பருவம்",
  "Rasi & Rasi Lord": "ராசி & ராசி அதிபதி",
  Span: "பாகை எல்லை",
  "Pada Navamsas": "பாத நவாம்சங்கள்",
  Purushartha: "புருஷார்த்தம்",
  "How to rank": "வரிசைப்படுத்தும் முறை",
  Ties: "சம பாகை",
  "7-karaka scheme": "7-காரக முறை",
  Usage: "பயன்பாடு",
  Rule: "விதி",
  "How to read": "படிக்கும் முறை",
  Activation: "செயல்படும் காலம்",
  "How to judge": "கணிக்கும் முறை",
  Combustion: "அஸ்தங்கம்",
  "Rahu–Ketu": "ராகு–கேது",
};

export function labelText(label: string, lang: KarakaLanguage): string {
  if (lang === "bi") return label;
  if (lang === "en") return stripTamil(label) || label;
  return LABEL_TA[label] ?? tamilFromParen(label) ?? label;
}

export function categoryText(group: KarakaCategoryGroup, lang: KarakaLanguage): string {
  if (lang === "bi") return group.category;
  if (lang === "en") return stripTamil(group.category) || group.category;
  return group.categoryTa ?? tamilFromParen(group.category) ?? group.categoryTamil;
}

/** Bilingual source text with an optional full Tamil translation. */
export function contentText(text: string, ta: string | undefined, lang: KarakaLanguage): string {
  if (lang === "bi") return text;
  if (lang === "en") return stripTamil(text) || text;
  return ta ?? text;
}

export function titleText(entry: KarakaEntry, lang: KarakaLanguage): string | undefined {
  if (lang === "en") return stripTamil(entry.titleEnglish);
  if (lang === "ta") return undefined;
  return entry.titleEnglish;
}

export function hasTamil(text: string): boolean {
  return TAMIL_CHAR.test(text);
}

export function applyTamil(entries: KarakaEntry[], tamil: Record<string, KarakaEntryTamil>): KarakaEntry[] {
  return entries.map((entry) => {
    const ta = tamil[entry.id];
    if (!ta) return entry;
    return {
      ...entry,
      subtitleTa: ta.subtitle ?? entry.subtitleTa,
      badgeTa: ta.badge ?? entry.badgeTa,
      attributes: entry.attributes.map((attr, i) => ({ ...attr, valueTa: ta.attributes?.[i] ?? attr.valueTa })),
      categories: entry.categories.map((group, i) => ({ ...group, itemsTa: ta.categories?.[i] ?? group.itemsTa })),
    };
  });
}

export const UI_TEXT: Record<KarakaLanguage, {
  hint: string;
  searchPlaceholder: string;
  matches: (n: number) => string;
  noMatch: (q: string) => string;
  close: string;
  languageLabel: string;
}> = {
  bi: {
    hint: "Significations of Graha, Bhava, Rasi and Nakshatra • கிரக, பாவ, ராசி, நட்சத்திர காரகங்கள்",
    searchPlaceholder: "Search / தேடு (e.g. kidney, mother, தங்கம், surgeon)",
    matches: (n) => `${n} match${n === 1 ? "" : "es"} across all sections • ${n} முடிவுகள்`,
    noMatch: (q) => `No karakas match “${q}” • பொருத்தம் இல்லை`,
    close: "Close Karakam reference",
    languageLabel: "Language / மொழி",
  },
  ta: {
    hint: "கிரக, பாவ, ராசி, நட்சத்திர காரகங்கள்",
    searchPlaceholder: "காரகங்களைத் தேடுக (எ.கா. தாய், தங்கம், சிறுநீரகம்)",
    matches: (n) => `அனைத்துப் பகுதிகளிலும் ${n} முடிவுகள்`,
    noMatch: (q) => `“${q}” க்கு பொருத்தமான காரகம் இல்லை`,
    close: "காரகம் சாளரத்தை மூடு",
    languageLabel: "மொழி",
  },
  en: {
    hint: "Significations of Graha, Bhava, Rasi and Nakshatra",
    searchPlaceholder: "Search all karakas (e.g. kidney, mother, gold, surgeon)",
    matches: (n) => `${n} match${n === 1 ? "" : "es"} across all sections`,
    noMatch: (q) => `No karakas match “${q}”.`,
    close: "Close Karakam reference",
    languageLabel: "Language",
  },
};
