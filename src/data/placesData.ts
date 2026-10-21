import type { PlaceCity, PlaceCountry } from "./places";
import { INDIA_STATES } from "./placesIndia";

/** India Standard Time — fixed offset (no DST). */
const IST = 5.5;

function city(name: string, lat: number, lon: number, tzOffsetHours = IST): PlaceCity {
  return { name, lat, lon, tzOffsetHours };
}

/** Bundled locations. tz offsets are fixed (no daylight saving). */
export const COUNTRIES_DATA: PlaceCountry[] = [
  {
    name: "India",
    states: INDIA_STATES,
  },
  {
    name: "Sri Lanka",
    states: [
      {
        name: "Western Province",
        cities: [
          city("Colombo", 6.9271, 79.8612),
          city("Negombo", 7.2088, 79.8358),
          city("Gampaha", 7.0873, 80.0144),
        ],
      },
      {
        name: "Central Province",
        cities: [
          city("Kandy", 7.2906, 80.6337),
          city("Matale", 7.4675, 80.6234),
        ],
      },
      {
        name: "Southern Province",
        cities: [
          city("Galle", 6.0535, 80.221),
          city("Matara", 5.9549, 80.555),
        ],
      },
      {
        name: "Northern Province",
        cities: [
          city("Jaffna", 9.6615, 80.0255),
          city("Vavuniya", 8.7514, 80.4971),
        ],
      },
      {
        name: "Eastern Province",
        cities: [
          city("Batticaloa", 7.7102, 81.6924),
          city("Trincomalee", 8.5874, 81.2152),
        ],
      },
      {
        name: "North Western Province",
        cities: [city("Kurunegala", 7.4863, 80.3647)],
      },
      {
        name: "Sabaragamuwa Province",
        cities: [city("Ratnapura", 6.6828, 80.3992)],
      },
    ],
  },
  {
    name: "Nepal",
    states: [
      {
        name: "Bagmati Province",
        cities: [city("Kathmandu", 27.7172, 85.324, 5.75)],
      },
      {
        name: "Gandaki Province",
        cities: [city("Pokhara", 28.2096, 83.9856, 5.75)],
      },
    ],
  },
  {
    name: "Bangladesh",
    states: [
      {
        name: "Dhaka Division",
        cities: [city("Dhaka", 23.8103, 90.4125, 6)],
      },
      {
        name: "Chittagong Division",
        cities: [city("Chittagong", 22.3569, 91.7832, 6)],
      },
    ],
  },
  {
    name: "Maldives",
    states: [
      {
        name: "Malé",
        cities: [city("Malé", 4.1755, 73.5093, 5)],
      },
    ],
  },
  {
    name: "Singapore",
    states: [
      {
        name: "Singapore",
        cities: [city("Singapore", 1.3521, 103.8198, 8)],
      },
    ],
  },
  {
    name: "Malaysia",
    states: [
      {
        name: "Kuala Lumpur",
        cities: [city("Kuala Lumpur", 3.139, 101.6869, 8)],
      },
      {
        name: "Selangor",
        cities: [
          city("Petaling Jaya", 3.1073, 101.6067, 8),
          city("Shah Alam", 3.0733, 101.5185, 8),
          city("Klang", 3.0449, 101.4456, 8),
        ],
      },
      {
        name: "Penang",
        cities: [city("George Town", 5.4141, 100.3288, 8)],
      },
      {
        name: "Johor",
        cities: [city("Johor Bahru", 1.4927, 103.7414, 8)],
      },
      {
        name: "Perak",
        cities: [city("Ipoh", 4.5975, 101.0901, 8)],
      },
    ],
  },
  {
    name: "UAE",
    states: [
      {
        name: "Dubai",
        cities: [city("Dubai", 25.2048, 55.2708, 4)],
      },
      {
        name: "Abu Dhabi",
        cities: [city("Abu Dhabi", 24.4539, 54.3773, 4)],
      },
      {
        name: "Sharjah",
        cities: [city("Sharjah", 25.3463, 55.4209, 4)],
      },
    ],
  },
  {
    name: "Qatar",
    states: [
      {
        name: "Doha",
        cities: [city("Doha", 25.2854, 51.531, 3)],
      },
    ],
  },
  {
    name: "Saudi Arabia",
    states: [
      {
        name: "Riyadh Province",
        cities: [city("Riyadh", 24.7136, 46.6753, 3)],
      },
      {
        name: "Makkah Province",
        cities: [
          city("Jeddah", 21.4858, 39.1925, 3),
          city("Makkah", 21.3891, 39.8579, 3),
        ],
      },
      {
        name: "Eastern Province",
        cities: [city("Dammam", 26.3927, 49.9777, 3)],
      },
    ],
  },
  {
    name: "Kuwait",
    states: [
      {
        name: "Al Asimah",
        cities: [city("Kuwait City", 29.3759, 47.9774, 3)],
      },
    ],
  },
  {
    name: "Oman",
    states: [
      {
        name: "Muscat",
        cities: [city("Muscat", 23.588, 58.3829, 4)],
      },
    ],
  },
  {
    name: "Bahrain",
    states: [
      {
        name: "Capital Governorate",
        cities: [city("Manama", 26.2285, 50.586, 3)],
      },
    ],
  },
  {
    name: "UK",
    states: [
      {
        name: "England",
        cities: [
          city("London", 51.5074, -0.1278, 0),
          city("Manchester", 53.4808, -2.2426, 0),
          city("Birmingham", 52.4862, -1.8904, 0),
          city("Leicester", 52.6369, -1.1398, 0),
          city("Coventry", 52.4068, -1.5197, 0),
          city("Bradford", 53.796, -1.7594, 0),
        ],
      },
      {
        name: "Scotland",
        cities: [
          city("Edinburgh", 55.9533, -3.1883, 0),
          city("Glasgow", 55.8642, -4.2518, 0),
        ],
      },
      {
        name: "Wales",
        cities: [city("Cardiff", 51.4816, -3.1791, 0)],
      },
      {
        name: "Northern Ireland",
        cities: [city("Belfast", 54.5973, -5.9301, 0)],
      },
    ],
  },
  {
    name: "Ireland",
    states: [
      {
        name: "Leinster",
        cities: [city("Dublin", 53.3498, -6.2603, 0)],
      },
    ],
  },
  {
    name: "France",
    states: [
      {
        name: "Île-de-France",
        cities: [city("Paris", 48.8566, 2.3522, 1)],
      },
    ],
  },
  {
    name: "Germany",
    states: [
      {
        name: "Berlin",
        cities: [city("Berlin", 52.52, 13.405, 1)],
      },
      {
        name: "Bavaria",
        cities: [city("Munich", 48.1351, 11.582, 1)],
      },
    ],
  },
  {
    name: "Netherlands",
    states: [
      {
        name: "North Holland",
        cities: [city("Amsterdam", 52.3676, 4.9041, 1)],
      },
    ],
  },
  {
    name: "Switzerland",
    states: [
      {
        name: "Zürich",
        cities: [city("Zürich", 47.3769, 8.5417, 1)],
      },
    ],
  },
  {
    name: "USA",
    states: [
      {
        name: "California",
        cities: [
          city("Los Angeles", 34.0522, -118.2437, -8),
          city("San Francisco", 37.7749, -122.4194, -8),
          city("San Jose", 37.3382, -121.8863, -8),
          city("San Diego", 32.7157, -117.1611, -8),
        ],
      },
      {
        name: "New York",
        cities: [
          city("New York City", 40.7128, -74.006, -5),
          city("Buffalo", 42.8864, -78.8784, -5),
        ],
      },
      {
        name: "New Jersey",
        cities: [
          city("Jersey City", 40.7178, -74.0431, -5),
          city("Edison", 40.5187, -74.4121, -5),
        ],
      },
      {
        name: "Texas",
        cities: [
          city("Houston", 29.7604, -95.3698, -6),
          city("Dallas", 32.7767, -96.797, -6),
          city("Austin", 30.2672, -97.7431, -6),
        ],
      },
      {
        name: "Illinois",
        cities: [city("Chicago", 41.8781, -87.6298, -6)],
      },
      {
        name: "Georgia",
        cities: [city("Atlanta", 33.749, -84.388, -5)],
      },
      {
        name: "Virginia",
        cities: [city("Virginia Beach", 36.8529, -75.978, -5)],
      },
      {
        name: "Washington",
        cities: [
          city("Seattle", 47.6062, -122.3321, -8),
          city("Bellevue", 47.6101, -122.2015, -8),
        ],
      },
      {
        name: "Massachusetts",
        cities: [city("Boston", 42.3601, -71.0589, -5)],
      },
      {
        name: "Florida",
        cities: [
          city("Miami", 25.7617, -80.1918, -5),
          city("Orlando", 28.5383, -81.3792, -5),
        ],
      },
      {
        name: "Maryland",
        cities: [city("Baltimore", 39.2904, -76.6122, -5)],
      },
      {
        name: "Pennsylvania",
        cities: [city("Philadelphia", 39.9526, -75.1652, -5)],
      },
      {
        name: "Michigan",
        cities: [city("Detroit", 42.3314, -83.0458, -5)],
      },
      {
        name: "Ohio",
        cities: [city("Columbus", 39.9612, -82.9988, -5)],
      },
      {
        name: "North Carolina",
        cities: [city("Charlotte", 35.2271, -80.8431, -5)],
      },
    ],
  },
  {
    name: "Canada",
    states: [
      {
        name: "Ontario",
        cities: [
          city("Toronto", 43.6532, -79.3832, -5),
          city("Ottawa", 45.4215, -75.6972, -5),
          city("Mississauga", 43.589, -79.6441, -5),
          city("Brampton", 43.7315, -79.7624, -5),
        ],
      },
      {
        name: "British Columbia",
        cities: [
          city("Vancouver", 49.2827, -123.1207, -8),
          city("Surrey", 49.1913, -122.849, -8),
        ],
      },
      {
        name: "Alberta",
        cities: [
          city("Calgary", 51.0447, -114.0719, -7),
          city("Edmonton", 53.5461, -113.4938, -7),
        ],
      },
      {
        name: "Quebec",
        cities: [
          city("Montreal", 45.5017, -73.5673, -5),
          city("Quebec City", 46.8139, -71.208, -5),
        ],
      },
      {
        name: "Manitoba",
        cities: [city("Winnipeg", 49.8954, -97.1385, -6)],
      },
    ],
  },
  {
    name: "Australia",
    states: [
      {
        name: "New South Wales",
        cities: [
          city("Sydney", -33.8688, 151.2093, 10),
          city("Newcastle", -32.9283, 151.7817, 10),
        ],
      },
      {
        name: "Victoria",
        cities: [
          city("Melbourne", -37.8136, 144.9631, 10),
          city("Geelong", -38.1499, 144.3617, 10),
        ],
      },
      {
        name: "Queensland",
        cities: [city("Brisbane", -27.4698, 153.0251, 10)],
      },
      {
        name: "Western Australia",
        cities: [city("Perth", -31.9505, 115.8605, 8)],
      },
      {
        name: "South Australia",
        cities: [city("Adelaide", -34.9285, 138.6007, 9.5)],
      },
    ],
  },
  {
    name: "New Zealand",
    states: [
      {
        name: "Auckland",
        cities: [city("Auckland", -36.8485, 174.7633, 12)],
      },
      {
        name: "Wellington",
        cities: [city("Wellington", -41.2865, 174.7762, 12)],
      },
    ],
  },
  {
    name: "Japan",
    states: [
      {
        name: "Tokyo",
        cities: [city("Tokyo", 35.6762, 139.6503, 9)],
      },
      {
        name: "Osaka",
        cities: [city("Osaka", 34.6937, 135.5023, 9)],
      },
    ],
  },
  {
    name: "South Korea",
    states: [
      {
        name: "Seoul",
        cities: [city("Seoul", 37.5665, 126.978, 9)],
      },
    ],
  },
  {
    name: "South Africa",
    states: [
      {
        name: "Gauteng",
        cities: [
          city("Johannesburg", -26.2041, 28.0473, 2),
          city("Pretoria", -25.7479, 28.2293, 2),
        ],
      },
      {
        name: "Western Cape",
        cities: [city("Cape Town", -33.9249, 18.4241, 2)],
      },
      {
        name: "KwaZulu-Natal",
        cities: [city("Durban", -29.8587, 31.0218, 2)],
      },
    ],
  },
  {
    name: "Mauritius",
    states: [
      {
        name: "Port Louis District",
        cities: [city("Port Louis", -20.1609, 57.5012, 4)],
      },
    ],
  },
  {
    name: "Fiji",
    states: [
      {
        name: "Central Division",
        cities: [city("Suva", -18.1248, 178.4501, 12)],
      },
    ],
  },
  {
    name: "Réunion",
    states: [
      {
        name: "Saint-Denis",
        cities: [city("Saint-Denis", -20.8789, 55.4481, 4)],
      },
    ],
  },
];
