import { BHAVA_KARAKAS } from "./bhavaKarakas";
import { EXTRA_CLASSICAL, EXTRA_MODERN_GROUPS, MODERN_EXTRA_ITEMS } from "./extraKarakas";
import { GRAHA_KARAKAS } from "./grahaKarakas";
import { applyTamil } from "./language";
import { MODERN_CATEGORY_TITLE, MODERN_KARAKAS } from "./modernKarakas";
import { NAKSHATRA_KARAKAS } from "./nakshatraKarakas";
import { RASI_KARAKAS } from "./rasiKarakas";
import { MODERN_SITUATIONS_MORE, SPECIAL_EXTRA_KARAKAS } from "./specialExtraKarakas";
import { SPECIAL_KARAKAS } from "./specialKarakas";
import { BHAVA_TA } from "./ta/bhavaTa";
import { BHAVA_CLASSICAL_TA, BHAVA_MODERN_LIST_TA } from "./ta/bhavaExtraTa";
import { GRAHA_CLASSICAL_TA, GRAHA_MODERN_LIST_TA, GRAHA_MODERN_TA } from "./ta/grahaExtraTa";
import { GRAHA_TA } from "./ta/grahaTa";
import { NAKSHATRA_MODERN_LIST_TA } from "./ta/nakshatraExtraTa";
import { RASI_CLASSICAL_TA, RASI_MODERN_LIST_TA } from "./ta/rasiExtraTa";
import { RASI_TA } from "./ta/rasiTa";
import { SPECIAL_TA } from "./ta/specialTa";
import type { KarakaCategoryGroup, KarakaEntry, KarakaSectionId } from "./types";

export type { KarakaEntry, KarakaLanguage, KarakaSectionId } from "./types";

export interface KarakaSection {
  id: KarakaSectionId;
  label: string;
  labelTamil: string;
  entries: KarakaEntry[];
}

const CLASSICAL_TA: Record<string, string[][]> = { ...GRAHA_CLASSICAL_TA, ...BHAVA_CLASSICAL_TA, ...RASI_CLASSICAL_TA };

const MODERN_LIST_TA: Record<string, string[]> = {
  ...GRAHA_MODERN_LIST_TA,
  ...BHAVA_MODERN_LIST_TA,
  ...RASI_MODERN_LIST_TA,
  ...Object.fromEntries(NAKSHATRA_MODERN_LIST_TA.map((items, i) => [`nakshatra-${i + 1}`, items])),
};

function withTamilItems(groups: KarakaCategoryGroup[] | undefined, tamil: string[][] | undefined): KarakaCategoryGroup[] {
  return (groups ?? []).map((group, i) => ({ ...group, itemsTa: tamil?.[i] ?? group.itemsTa }));
}

function withExtras(entries: KarakaEntry[]): KarakaEntry[] {
  return entries.map((entry) => {
    const modernItems = [...(MODERN_KARAKAS[entry.id] ?? []), ...(MODERN_EXTRA_ITEMS[entry.id] ?? [])];
    return {
      ...entry,
      categories: [
        ...entry.categories,
        ...withTamilItems(EXTRA_CLASSICAL[entry.id], CLASSICAL_TA[entry.id]),
        ...withTamilItems(EXTRA_MODERN_GROUPS[entry.id], GRAHA_MODERN_TA[entry.id]),
        ...(modernItems.length > 0
          ? [{ category: MODERN_CATEGORY_TITLE, categoryTamil: "நவீன காலம்", items: modernItems, itemsTa: MODERN_LIST_TA[entry.id] }]
          : []),
      ],
    };
  });
}

export const KARAKA_SECTIONS: KarakaSection[] = [
  { id: "graha", label: "Graha", labelTamil: "கிரக காரகம்", entries: withExtras(applyTamil(GRAHA_KARAKAS, GRAHA_TA)) },
  { id: "bhava", label: "Bhava", labelTamil: "பாவ காரகம்", entries: withExtras(applyTamil(BHAVA_KARAKAS, BHAVA_TA)) },
  { id: "rasi", label: "Rasi", labelTamil: "ராசி காரகம்", entries: withExtras(applyTamil(RASI_KARAKAS, RASI_TA)) },
  { id: "nakshatra", label: "Nakshatra", labelTamil: "நட்சத்திர காரகம்", entries: withExtras(NAKSHATRA_KARAKAS) },
  { id: "special", label: "Special", labelTamil: "சிறப்பு காரகங்கள்", entries: specialEntries() },
];

function specialEntries(): KarakaEntry[] {
  const base = applyTamil(SPECIAL_KARAKAS, SPECIAL_TA).map((entry) =>
    entry.id === "special-modern-situations"
      ? { ...entry, categories: [...entry.categories, ...MODERN_SITUATIONS_MORE] }
      : entry,
  );
  return [...base, ...SPECIAL_EXTRA_KARAKAS].sort((a, b) => a.index - b.index);
}

export function karakaEntryMatches(entry: KarakaEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    entry.titleEnglish,
    entry.titleTamil,
    entry.subtitle,
    entry.subtitleTa ?? "",
    entry.badge ?? "",
    entry.badgeTa ?? "",
    ...entry.attributes.flatMap((a) => [a.label, a.value, a.valueTa ?? ""]),
    ...entry.categories.flatMap((c) => [c.category, c.categoryTa ?? "", ...c.items, ...(c.itemsTa ?? [])]),
  ]
    .join("\n")
    .toLowerCase();
  return haystack.includes(q);
}
