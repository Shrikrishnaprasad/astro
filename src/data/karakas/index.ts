import { BHAVA_KARAKAS } from "./bhavaKarakas";
import { GRAHA_KARAKAS } from "./grahaKarakas";
import { MODERN_CATEGORY_TITLE, MODERN_KARAKAS } from "./modernKarakas";
import { NAKSHATRA_KARAKAS } from "./nakshatraKarakas";
import { RASI_KARAKAS } from "./rasiKarakas";
import { SPECIAL_KARAKAS } from "./specialKarakas";
import type { KarakaEntry, KarakaSectionId } from "./types";

export type { KarakaEntry, KarakaSectionId } from "./types";

export interface KarakaSection {
  id: KarakaSectionId;
  label: string;
  labelTamil: string;
  entries: KarakaEntry[];
}

function withModern(entries: KarakaEntry[]): KarakaEntry[] {
  return entries.map((entry) => {
    const items = MODERN_KARAKAS[entry.id];
    if (!items) return entry;
    return {
      ...entry,
      categories: [...entry.categories, { category: MODERN_CATEGORY_TITLE, categoryTamil: "நவீன காலம்", items }],
    };
  });
}

export const KARAKA_SECTIONS: KarakaSection[] = [
  { id: "graha", label: "Graha", labelTamil: "கிரக காரகம்", entries: withModern(GRAHA_KARAKAS) },
  { id: "bhava", label: "Bhava", labelTamil: "பாவ காரகம்", entries: withModern(BHAVA_KARAKAS) },
  { id: "rasi", label: "Rasi", labelTamil: "ராசி காரகம்", entries: withModern(RASI_KARAKAS) },
  { id: "nakshatra", label: "Nakshatra", labelTamil: "நட்சத்திர காரகம்", entries: withModern(NAKSHATRA_KARAKAS) },
  { id: "special", label: "Special", labelTamil: "சிறப்பு காரகங்கள்", entries: SPECIAL_KARAKAS },
];

export function karakaEntryMatches(entry: KarakaEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    entry.titleEnglish,
    entry.titleTamil,
    entry.subtitle,
    entry.badge ?? "",
    ...entry.attributes.flatMap((a) => [a.label, a.value]),
    ...entry.categories.flatMap((c) => [c.category, ...c.items]),
  ]
    .join("\n")
    .toLowerCase();
  return haystack.includes(q);
}
