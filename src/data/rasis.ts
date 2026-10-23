export interface Rasi {
  index: number;
  nameEnglish: string;
  nameTamil: string;
  lord: string;
  element: "Fire" | "Earth" | "Air" | "Water";
}

export const RASIS: Rasi[] = [
  { index: 0, nameEnglish: "Mesha", nameTamil: "மே", lord: "Mars", element: "Fire" },
  { index: 1, nameEnglish: "Vrishabha", nameTamil: "ரி", lord: "Venus", element: "Earth" },
  { index: 2, nameEnglish: "Mithuna", nameTamil: "மி", lord: "Mercury", element: "Air" },
  { index: 3, nameEnglish: "Kataka", nameTamil: "கட", lord: "Moon", element: "Water" },
  { index: 4, nameEnglish: "Simha", nameTamil: "சிம்", lord: "Sun", element: "Fire" },
  { index: 5, nameEnglish: "Kanni", nameTamil: "கன்", lord: "Mercury", element: "Earth" },
  { index: 6, nameEnglish: "Tula", nameTamil: "து", lord: "Venus", element: "Air" },
  { index: 7, nameEnglish: "Vrischika", nameTamil: "வி", lord: "Mars", element: "Water" },
  { index: 8, nameEnglish: "Dhanu", nameTamil: "தனு", lord: "Jupiter", element: "Fire" },
  { index: 9, nameEnglish: "Makara", nameTamil: "மக", lord: "Saturn", element: "Earth" },
  { index: 10, nameEnglish: "Kumbha", nameTamil: "கும்", lord: "Saturn", element: "Air" },
  { index: 11, nameEnglish: "Meena", nameTamil: "மீ", lord: "Jupiter", element: "Water" },
];

export function rasiLord(rasiIndex: number): string {
  return RASIS[((rasiIndex % 12) + 12) % 12].lord;
}
