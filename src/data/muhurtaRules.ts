// Disha Shool: traditional direction to avoid travelling toward on each
// weekday (0=Sunday..6=Saturday). Sources vary on some days (Tue/Wed/Fri/Sat);
// this follows the commonly-cited Dekhopanchang table.
export const DISHA_SHOOL: (string | null)[] = [
  "West", // Sunday
  "East", // Monday
  "North", // Tuesday
  null, // Wednesday - no direction considered inauspicious
  "South", // Thursday
  "West", // Friday
  "East", // Saturday
];

export type ChoghadiyaName = "Udveg" | "Char" | "Labh" | "Amrit" | "Kaal" | "Shubh" | "Rog";

export const CHOGHADIYA_NATURE: Record<ChoghadiyaName, "auspicious" | "inauspicious" | "neutral"> = {
  Amrit: "auspicious",
  Shubh: "auspicious",
  Labh: "auspicious",
  Char: "neutral",
  Udveg: "inauspicious",
  Kaal: "inauspicious",
  Rog: "inauspicious",
};

// Fixed 7-item cycle that both day and night Choghadiya step through.
export const CHOGHADIYA_CYCLE: ChoghadiyaName[] = [
  "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog",
];

// The day's first Choghadiya slot, by weekday (0=Sunday..6=Saturday).
export const CHOGHADIYA_DAY_OPENER: ChoghadiyaName[] = [
  "Udveg", // Sunday
  "Amrit", // Monday
  "Rog", // Tuesday
  "Labh", // Wednesday
  "Shubh", // Thursday
  "Char", // Friday
  "Kaal", // Saturday
];
