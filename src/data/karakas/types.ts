export type KarakaSectionId = "rasi" | "bhava" | "graha" | "nakshatra" | "special";

export interface KarakaAttribute {
  label: string;
  value: string;
}

export interface KarakaCategoryGroup {
  category: string;
  categoryTamil: string;
  items: string[];
}

export interface KarakaEntry {
  id: string;
  index: number;
  section: KarakaSectionId;
  titleEnglish: string;
  titleTamil: string;
  subtitle: string;
  badge?: string;
  attributes: KarakaAttribute[];
  categories: KarakaCategoryGroup[];
}
