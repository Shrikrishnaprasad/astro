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

// A small bundled country -> state -> city hierarchy covering major Tamil
// Nadu / Indian / world cities. Users can also enter latitude/longitude/UTC
// offset manually wherever that option is offered.
export const COUNTRIES: PlaceCountry[] = [
  {
    name: "India",
    states: [
      {
        name: "Tamil Nadu",
        cities: [
          { name: "Coimbatore", lat: 11.0168, lon: 76.9558, tzOffsetHours: 5.5 },
          { name: "Chennai", lat: 13.0827, lon: 80.2707, tzOffsetHours: 5.5 },
          { name: "Madurai", lat: 9.9252, lon: 78.1198, tzOffsetHours: 5.5 },
          { name: "Tiruchirappalli", lat: 10.7905, lon: 78.7047, tzOffsetHours: 5.5 },
          { name: "Salem", lat: 11.6643, lon: 78.146, tzOffsetHours: 5.5 },
        ],
      },
      {
        name: "Karnataka",
        cities: [{ name: "Bengaluru", lat: 12.9716, lon: 77.5946, tzOffsetHours: 5.5 }],
      },
      {
        name: "Maharashtra",
        cities: [{ name: "Mumbai", lat: 19.076, lon: 72.8777, tzOffsetHours: 5.5 }],
      },
      {
        name: "Delhi",
        cities: [{ name: "Delhi", lat: 28.7041, lon: 77.1025, tzOffsetHours: 5.5 }],
      },
      {
        name: "West Bengal",
        cities: [{ name: "Kolkata", lat: 22.5726, lon: 88.3639, tzOffsetHours: 5.5 }],
      },
      {
        name: "Telangana",
        cities: [{ name: "Hyderabad", lat: 17.385, lon: 78.4867, tzOffsetHours: 5.5 }],
      },
    ],
  },
  {
    name: "Sri Lanka",
    states: [
      {
        name: "Western Province",
        cities: [{ name: "Colombo", lat: 6.9271, lon: 79.8612, tzOffsetHours: 5.5 }],
      },
    ],
  },
  {
    name: "Singapore",
    states: [
      {
        name: "Singapore",
        cities: [{ name: "Singapore", lat: 1.3521, lon: 103.8198, tzOffsetHours: 8 }],
      },
    ],
  },
  {
    name: "Malaysia",
    states: [
      {
        name: "Kuala Lumpur",
        cities: [{ name: "Kuala Lumpur", lat: 3.139, lon: 101.6869, tzOffsetHours: 8 }],
      },
    ],
  },
  {
    name: "UAE",
    states: [
      {
        name: "Dubai",
        cities: [{ name: "Dubai", lat: 25.2048, lon: 55.2708, tzOffsetHours: 4 }],
      },
    ],
  },
  {
    name: "UK",
    states: [
      {
        name: "England",
        cities: [{ name: "London", lat: 51.5074, lon: -0.1278, tzOffsetHours: 0 }],
      },
    ],
  },
  {
    name: "USA",
    states: [
      {
        name: "New York",
        cities: [{ name: "New York", lat: 40.7128, lon: -74.006, tzOffsetHours: -5 }],
      },
    ],
  },
  {
    name: "Canada",
    states: [
      {
        name: "Ontario",
        cities: [{ name: "Toronto", lat: 43.6532, lon: -79.3832, tzOffsetHours: -5 }],
      },
    ],
  },
  {
    name: "Australia",
    states: [
      {
        name: "New South Wales",
        cities: [{ name: "Sydney", lat: -33.8688, lon: 151.2093, tzOffsetHours: 11 }],
      },
    ],
  },
];

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
