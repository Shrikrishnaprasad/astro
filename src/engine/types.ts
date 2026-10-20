export type Planet =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Rahu"
  | "Ketu";

export const PLANETS: Planet[] = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Rahu",
  "Ketu",
];

export type LongitudeMap = Record<Planet, number>;

export interface RasiNakshatraInfo {
  longitude: number;
  rasiIndex: number;
  nakshatraIndex: number;
  pada: number;
  degreeInRasi: number;
}

export interface BirthInput {
  date: Date; // JS Date in UTC instant representing the birth moment
  latitude: number;
  longitude: number;
}

export interface ChartResult {
  lagnaRasiIndex: number;
  lagnaLongitude: number;
  lagnaDegreeInRasi: number;
  planetLongitudes: LongitudeMap;
  planetRasi: Record<Planet, RasiNakshatraInfo>;
}
