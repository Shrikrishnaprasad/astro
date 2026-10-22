// Classical Muhurta Shastra tables (Kalamrita, Muhurta Chintamani, and South Indian Vakya/Drik Panchangam conventions).

/**
 * Varjyam (Vishaghati) start ghati (out of 60 ghatis of the Nakshatra span) for each of the 27 Nakshatras (0=Ashwini..26=Revati).
 * Duration is 4 ghatis (4/60 = 1/15th of the Nakshatra's total duration).
 */
export const VARJYAM_START_GHATI: number[] = [
  50, // 0 Ashwini
  24, // 1 Bharani
  30, // 2 Krittika
  40, // 3 Rohini
  14, // 4 Mrigashirsha
  21, // 5 Ardra
  30, // 6 Punarvasu
  20, // 7 Pushya
  32, // 8 Ashlesha
  30, // 9 Magha
  20, // 10 Purva Phalguni
  18, // 11 Uttara Phalguni
  21, // 12 Hasta
  20, // 13 Chitra
  14, // 14 Swati
  14, // 15 Vishakha
  10, // 16 Anuradha
  14, // 17 Jyeshtha
  20, // 18 Mula
  24, // 19 Purva Ashadha
  20, // 20 Uttara Ashadha
  10, // 21 Shravana
  10, // 22 Dhanishta
  18, // 23 Shatabhisha
  16, // 24 Purva Bhadrapada
  24, // 25 Uttara Bhadrapada
  30, // 26 Revati
];

/**
 * Amrita Kalam (Amritaghati) start ghati (out of 60 ghatis of the Nakshatra span) for each of the 27 Nakshatras.
 * Duration is 4 ghatis (1/15th of the Nakshatra's total duration).
 * Classical rule: (Varjyam start + 24 ghatis) mod 60 for most stars, using standard Panchangam table.
 */
export const AMRITA_START_GHATI: number[] = [
  42, // 0 Ashwini
  48, // 1 Bharani
  54, // 2 Krittika
  52, // 3 Rohini
  38, // 4 Mrigashirsha
  35, // 5 Ardra
  54, // 6 Punarvasu
  44, // 7 Pushya
  56, // 8 Ashlesha
  54, // 9 Magha
  44, // 10 Purva Phalguni
  42, // 11 Uttara Phalguni
  45, // 12 Hasta
  44, // 13 Chitra
  38, // 14 Swati
  38, // 15 Vishakha
  34, // 16 Anuradha
  38, // 17 Jyeshtha
  44, // 18 Mula
  48, // 19 Purva Ashadha
  44, // 20 Uttara Ashadha
  34, // 21 Shravana
  34, // 22 Dhanishta
  42, // 23 Shatabhisha
  40, // 24 Purva Bhadrapada
  48, // 25 Uttara Bhadrapada
  54, // 26 Revati
];

/**
 * Durmuhurtam daytime slots (1-indexed out of 15 Muhurtas between sunrise and sunset)
 * by weekday (0=Sunday..6=Saturday).
 * Note: Tuesday has 1 daytime Durmuhurtam (4th) and 1 nighttime (7th of night);
 * Monday, Wednesday (8th), Thursday, Friday, Saturday have 1 or 2 daytime slots.
 */
export const DAY_DURMUHURTAM_SLOTS: number[][] = [
  [14],     // Sunday: 14th muhurta (just before sunset)
  [9, 12],  // Monday: 9th and 12th muhurtas
  [4],      // Tuesday: 4th muhurta of day (plus 7th of night)
  [8],      // Wednesday: 8th muhurta (midday)
  [6, 12],  // Thursday: 6th and 12th muhurtas
  [4, 9],   // Friday: 4th and 9th muhurtas
  [1, 2],   // Saturday: 1st and 2nd muhurtas after sunrise
];

export type GowriName =
  | "Uthi"
  | "Amirtham"
  | "Rogam"
  | "Labham"
  | "Dhanam"
  | "Sugam"
  | "Visham"
  | "Soram";

export const GOWRI_NATURE: Record<GowriName, "auspicious" | "inauspicious"> = {
  Uthi: "auspicious",
  Amirtham: "auspicious",
  Labham: "auspicious",
  Dhanam: "auspicious",
  Sugam: "auspicious",
  Rogam: "inauspicious",
  Visham: "inauspicious",
  Soram: "inauspicious",
};

/**
 * Tamil Gowri Panchangam 8-part daytime sequences for each weekday (0=Sun..6=Sat).
 */
export const GOWRI_DAY_TABLE: GowriName[][] = [
  // Sunday
  ["Uthi", "Amirtham", "Rogam", "Labham", "Dhanam", "Sugam", "Visham", "Soram"],
  // Monday
  ["Amirtham", "Rogam", "Uthi", "Dhanam", "Rogam", "Labham", "Sugam", "Visham"],
  // Tuesday
  ["Rogam", "Uthi", "Visham", "Labham", "Amirtham", "Soram", "Dhanam", "Sugam"],
  // Wednesday
  ["Labham", "Dhanam", "Uthi", "Visham", "Amirtham", "Sugam", "Soram", "Rogam"],
  // Thursday
  ["Dhanam", "Sugam", "Visham", "Uthi", "Labham", "Rogam", "Amirtham", "Soram"],
  // Friday
  ["Sugam", "Visham", "Amirtham", "Soram", "Uthi", "Labham", "Rogam", "Dhanam"],
  // Saturday
  ["Visham", "Amirtham", "Soram", "Uthi", "Dhanam", "Labham", "Rogam", "Sugam"],
];

/**
 * Tamil Gowri Panchangam 8-part nighttime sequences for each weekday (0=Sun..6=Sat).
 */
export const GOWRI_NIGHT_TABLE: GowriName[][] = [
  // Sunday
  ["Sugam", "Amirtham", "Soram", "Dhanam", "Uthi", "Visham", "Labham", "Rogam"],
  // Monday
  ["Labham", "Sugam", "Rogam", "Uthi", "Visham", "Amirtham", "Soram", "Dhanam"],
  // Tuesday
  ["Visham", "Labham", "Sugam", "Amirtham", "Rogam", "Dhanam", "Uthi", "Soram"],
  // Wednesday
  ["Rogam", "Dhanam", "Amirtham", "Labham", "Sugam", "Soram", "Visham", "Uthi"],
  // Thursday
  ["Amirtham", "Visham", "Dhanam", "Soram", "Sugam", "Uthi", "Labham", "Rogam"],
  // Friday
  ["Dhanam", "Labham", "Visham", "Sugam", "Amirtham", "Soram", "Rogam", "Uthi"],
  // Saturday
  ["Labham", "Uthi", "Sugam", "Rogam", "Amirtham", "Dhanam", "Visham", "Soram"],
];

/**
 * 28 Anandadi Yogas: Starting from a reference star on each weekday across the 27-star cycle.
 * Standard 27-star projection of Anandadi Yoga names and their nature.
 */
export const ANANDADI_YOGAS: { name: string; nature: "auspicious" | "inauspicious" | "neutral" }[] = [
  { name: "Ananda", nature: "auspicious" },
  { name: "Kaladanda", nature: "inauspicious" },
  { name: "Dhumra", nature: "inauspicious" },
  { name: "Prajapati (Dhata)", nature: "auspicious" },
  { name: "Saumya", nature: "auspicious" },
  { name: "Dhwanksha", nature: "inauspicious" },
  { name: "Dhwaja", nature: "auspicious" },
  { name: "Srivatsa", nature: "auspicious" },
  { name: "Vajra", nature: "inauspicious" },
  { name: "Mudgara", nature: "inauspicious" },
  { name: "Chhatra", nature: "auspicious" },
  { name: "Mitra", nature: "auspicious" },
  { name: "Manasa", nature: "auspicious" },
  { name: "Padma", nature: "auspicious" },
  { name: "Lumbaka", nature: "inauspicious" },
  { name: "Utpata", nature: "inauspicious" },
  { name: "Mrityu", nature: "inauspicious" },
  { name: "Kana", nature: "inauspicious" },
  { name: "Siddhi", nature: "auspicious" },
  { name: "Shubha", nature: "auspicious" },
  { name: "Amrita", nature: "auspicious" },
  { name: "Musala", nature: "inauspicious" },
  { name: "Gada", nature: "inauspicious" },
  { name: "Matanga", nature: "auspicious" },
  { name: "Rakshasa", nature: "inauspicious" },
  { name: "Chara", nature: "neutral" },
  { name: "Sthira", nature: "auspicious" },
];

/**
 * Starting Nakshatra index (0=Ashwini..26=Revati) for Ananda Yoga on each weekday (0=Sun..6=Sat).
 * Sun=Ashwini(0), Mon=Mrigashirsha(4), Tue=Ashlesha(8), Wed=Hasta(12), Thu=Anuradha(16), Fri=Uttara Ashadha(20), Sat=Shatabhisha(23).
 */
export const ANANDADI_START_NAK: number[] = [0, 4, 8, 12, 16, 20, 23];

/**
 * Tamil Panchangam Siddha / Amrita / Marana Yoga classification by Weekday (0=Sun..6=Sat) and Nakshatra (0..26).
 * Nakshatras in AMRITA_YOGA_BY_VARA -> Amrita Yoga (Highly Auspicious)
 * Nakshatras in MARANA_YOGA_BY_VARA -> Marana Yoga (Inauspicious — avoid for शुभ कार्य)
 * All other Nakshatras -> Siddha Yoga (Auspicious)
 */
export const TAMIL_AMRITA_NAK_BY_VARA: number[][] = [
  [12, 20, 3, 21, 0, 6],   // Sunday: Hasta, U.Ashadha, Rohini, Shravana, Ashwini, Punarvasu
  [4, 21, 3, 6, 13, 14],   // Monday: Mrigashirsha, Shravana, Rohini, Punarvasu, Chitra, Swati
  [0, 25, 3, 18],          // Tuesday: Ashwini, U.Bhadrapada, Rohini, Mula
  [19, 16, 10, 11, 2],     // Wednesday: P.Ashadha, Anuradha, P.Phalguni, U.Phalguni, Krittika
  [14, 7, 6, 9],           // Thursday: Swati, Pushya, Punarvasu, Magha
  [26, 0, 12, 16, 21],     // Friday: Revati, Ashwini, Hasta, Anuradha, Shravana
  [3, 14, 9],              // Saturday: Rohini, Swati, Magha
];

export const TAMIL_MARANA_NAK_BY_VARA: number[][] = [
  [9, 15, 16, 22, 4, 13],      // Sunday
  [2, 8, 11, 15, 24, 1],       // Monday
  [5, 14, 23, 20, 13],         // Tuesday
  [0, 9, 17, 21, 22],          // Wednesday
  [3, 5, 17, 23, 1],           // Thursday
  [9, 15, 17, 18, 20, 3],      // Friday
  [6, 7, 11, 12, 13, 26, 5],   // Saturday
];

/**
 * Sarvartha Siddhi Yoga (Vara + Nakshatra combinations).
 */
export const SARVARTHA_SIDDHI_BY_VARA: number[][] = [
  [0, 7, 11, 12, 18, 20, 25], // Sunday: Ashwini, Pushya, U.Phalguni, Hasta, Mula, U.Ashadha, U.Bhadrapada
  [3, 4, 7, 16, 21],          // Monday: Rohini, Mrigashirsha, Pushya, Anuradha, Shravana
  [0, 2, 8, 20],              // Tuesday: Ashwini, Krittika, Ashlesha, U.Ashadha
  [3, 4, 2, 12, 16],          // Wednesday: Rohini, Mrigashirsha, Krittika, Hasta, Anuradha
  [0, 6, 7, 16, 26],          // Thursday: Ashwini, Punarvasu, Pushya, Anuradha, Revati
  [0, 6, 16, 21, 26],         // Friday: Ashwini, Punarvasu, Anuradha, Shravana, Revati
  [3, 14, 21],                // Saturday: Rohini, Swati, Shravana
];

/**
 * Amrita Siddhi Yoga (Vara + Nakshatra).
 */
export const AMRITA_SIDDHI_BY_VARA: number[] = [
  12, // Sunday + Hasta
  4,  // Monday + Mrigashirsha
  0,  // Tuesday + Ashwini
  16, // Wednesday + Anuradha
  7,  // Thursday + Pushya
  26, // Friday + Revati
  3,  // Saturday + Rohini
];

/**
 * Dagdha Tithi (0-indexed within Paksha: 0=Prathama..14=Purnima/Amavasya) by weekday (0=Sun..6=Sat).
 * Sun=Dwadashi(11), Mon=Ekadashi(10), Tue=Panchami(4), Wed=Tritiya(2), Thu=Shashti(5), Fri=Ashtami(7), Sat=Navami(8).
 */
export const DAGDHA_TITHI_BY_VARA: number[] = [11, 10, 4, 2, 5, 7, 8];

/**
 * Visha Tithi (0-indexed within Paksha) by weekday (0=Sun..6=Sat).
 * Sun=Chaturthi(3), Mon=Shashti(5), Tue=Saptami(6), Wed=Dwitiya(1), Thu=Ashtami(7), Fri=Navami(8), Sat=Saptami(6).
 */
export const VISHA_TITHI_BY_VARA: number[] = [3, 5, 6, 1, 7, 8, 6];

/**
 * Masa Shunya Tithis (0-indexed within Paksha) by Solar Rasi index (0=Mesha..11=Meena).
 */
export const MASA_SHUNYA_TITHIS_BY_SUN_RASI: number[][] = [
  [5, 7],   // 0 Mesha (Chithirai): Shashti, Ashtami
  [3, 11],  // 1 Vrishabha (Vaigasi): Chaturthi, Dwadashi
  [4, 6],   // 2 Mithuna (Aani): Panchami, Saptami
  [1, 5],   // 3 Kataka (Aadi): Dwitiya, Shashti
  [6, 7],   // 4 Simha (Aavani): Saptami, Ashtami
  [7, 8],   // 5 Kanya (Purattasi): Ashtami, Navami
  [3, 11],  // 6 Thula (Aippasi): Chaturthi, Dwadashi
  [4, 9],   // 7 Vrischika (Karthigai): Panchami, Dashami
  [7, 8],   // 8 Dhanu (Margazhi): Ashtami, Navami
  [1, 2],   // 9 Makara (Thai): Dwitiya, Tritiya
  [2, 11],  // 10 Kumbha (Maasi): Tritiya, Dwadashi
  [5, 11],  // 11 Meena (Panguni): Shashti, Dwadashi
];
