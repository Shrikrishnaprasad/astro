export type KarakaSectionId = "rasi" | "bhava" | "graha" | "nakshatra" | "special";

export type KarakaLanguage = "bi" | "ta" | "en";

export interface KarakaAttribute {
  label: string;
  value: string;
  valueTa?: string;
}

export interface KarakaCategoryGroup {
  category: string;
  categoryTamil: string;
  /** Full Tamil heading for Tamil-only mode, when the English heading has no Tamil in parentheses. */
  categoryTa?: string;
  items: string[];
  itemsTa?: string[];
}

export interface KarakaEntry {
  id: string;
  index: number;
  section: KarakaSectionId;
  titleEnglish: string;
  titleTamil: string;
  subtitle: string;
  subtitleTa?: string;
  badge?: string;
  badgeTa?: string;
  attributes: KarakaAttribute[];
  categories: KarakaCategoryGroup[];
}

/** Positional Tamil translation of an entry: arrays follow the order of the source entry. */
export interface KarakaEntryTamil {
  subtitle?: string;
  badge?: string;
  attributes?: string[];
  categories?: string[][];
}
