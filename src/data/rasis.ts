export interface Rasi {
  index: number;
  nameEnglish: string;
  nameTamil: string;
  lord: string;
  element: "Fire" | "Earth" | "Air" | "Water";
}

export const RASIS: Rasi[] = [
  { index: 0, nameEnglish: "Mesha", nameTamil: "மேஷம்", lord: "Mars", element: "Fire" },
  { index: 1, nameEnglish: "Vrishabha", nameTamil: "ரிஷபம்", lord: "Venus", element: "Earth" },
  { index: 2, nameEnglish: "Mithuna", nameTamil: "மிதுனம்", lord: "Mercury", element: "Air" },
  { index: 3, nameEnglish: "Kataka", nameTamil: "கடகம்", lord: "Moon", element: "Water" },
  { index: 4, nameEnglish: "Simha", nameTamil: "சிம்மம்", lord: "Sun", element: "Fire" },
  { index: 5, nameEnglish: "Kanni", nameTamil: "கன்னி", lord: "Mercury", element: "Earth" },
  { index: 6, nameEnglish: "Tula", nameTamil: "துலாம்", lord: "Venus", element: "Air" },
  { index: 7, nameEnglish: "Vrischika", nameTamil: "விருச்சிகம்", lord: "Mars", element: "Water" },
  { index: 8, nameEnglish: "Dhanu", nameTamil: "தனுசு", lord: "Jupiter", element: "Fire" },
  { index: 9, nameEnglish: "Makara", nameTamil: "மகரம்", lord: "Saturn", element: "Earth" },
  { index: 10, nameEnglish: "Kumbha", nameTamil: "கும்பம்", lord: "Saturn", element: "Air" },
  { index: 11, nameEnglish: "Meena", nameTamil: "மீனம்", lord: "Jupiter", element: "Water" },
];

export function rasiLord(rasiIndex: number): string {
  return RASIS[((rasiIndex % 12) + 12) % 12].lord;
}
