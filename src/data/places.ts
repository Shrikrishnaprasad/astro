import { COUNTRIES_DATA } from "./placesData";

export interface PlaceCity {
  name: string;
  lat: number;
  lon: number;
  tzOffsetHours: number;
}

export interface PlaceState {
  name: string;
  cities: PlaceCity[];
}

export interface PlaceCountry {
  name: string;
  states: PlaceState[];
}

/** Country → state → city list (see placesData.ts). Manual lat/lon/UTC still available in forms. */
export const COUNTRIES: PlaceCountry[] = COUNTRIES_DATA;

export const DEFAULT_COUNTRY_NAME = "India";
export const DEFAULT_STATE_NAME = "Tamil Nadu";
export const DEFAULT_CITY_NAME = "Coimbatore";

export interface ResolvedPlace extends PlaceCity {
  countryName: string;
  stateName: string;
}

// Flattened list, used for nearest-city geolocation matching.
export const ALL_PLACES: ResolvedPlace[] = COUNTRIES.flatMap((country) =>
  country.states.flatMap((state) =>
    state.cities.map((city) => ({ ...city, countryName: country.name, stateName: state.name })),
  ),
);

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function nearestPlace(lat: number, lon: number): ResolvedPlace {
  let best = ALL_PLACES[0];
  let bestDist = Infinity;
  for (const place of ALL_PLACES) {
    const dist = haversineKm(lat, lon, place.lat, place.lon);
    if (dist < bestDist) {
      bestDist = dist;
      best = place;
    }
  }
  return best;
}

export function defaultPlace(): ResolvedPlace {
  return (
    ALL_PLACES.find(
      (p) => p.countryName === DEFAULT_COUNTRY_NAME && p.name === DEFAULT_CITY_NAME,
    ) ?? ALL_PLACES[0]
  );
}
