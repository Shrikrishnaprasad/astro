export interface Nakshatra {
  index: number;
  nameEnglish: string;
  nameTamil: string;
  lord: string;
}

// 27 nakshatras, 13°20' each, starting at sidereal 0° (Mesha 0°).
// Lords repeat the 9-planet Vimshottari cycle: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury.
const VIMSHOTTARI_LORD_CYCLE = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
];

const NAMES: Array<[string, string]> = [
  ["Ashwini", "அசுவினி"],
  ["Bharani", "பரணி"],
  ["Krittika", "கார்த்திகை"],
  ["Rohini", "ரோகிணி"],
  ["Mrigashira", "மிருகசீரிடம்"],
  ["Ardra", "திருவாதிரை"],
  ["Punarvasu", "புனர்பூசம்"],
  ["Pushya", "பூசம்"],
  ["Ashlesha", "ஆயில்யம்"],
  ["Magha", "மகம்"],
  ["Purva Phalguni", "பூரம்"],
  ["Uttara Phalguni", "உத்திரம்"],
  ["Hasta", "அஸ்தம்"],
  ["Chitra", "சித்திரை"],
  ["Swati", "சுவாதி"],
  ["Vishakha", "விசாகம்"],
  ["Anuradha", "அனுஷம்"],
  ["Jyeshtha", "கேட்டை"],
  ["Mula", "மூலம்"],
  ["Purva Ashadha", "பூராடம்"],
  ["Uttara Ashadha", "உத்திராடம்"],
  ["Shravana", "திருவோணம்"],
  ["Dhanishta", "அவிட்டம்"],
  ["Shatabhisha", "சதயம்"],
  ["Purva Bhadrapada", "பூரட்டாதி"],
  ["Uttara Bhadrapada", "உத்திரட்டாதி"],
  ["Revati", "ரேவதி"],
];

export const NAKSHATRAS: Nakshatra[] = NAMES.map(([nameEnglish, nameTamil], index) => ({
  index,
  nameEnglish,
  nameTamil,
  lord: VIMSHOTTARI_LORD_CYCLE[index % 9],
}));

export const NAKSHATRA_SPAN_DEGREES = 360 / 27; // 13°20'
export const PADA_SPAN_DEGREES = NAKSHATRA_SPAN_DEGREES / 4; // 3°20'
