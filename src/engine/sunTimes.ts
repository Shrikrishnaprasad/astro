import * as Astronomy from "astronomy-engine";

export function makeObserver(latitude: number, longitude: number): Astronomy.Observer {
  return new Astronomy.Observer(latitude, longitude, 0);
}

function searchRiseSet(
  body: Astronomy.Body,
  observer: Astronomy.Observer,
  date: Date,
  direction: 1 | -1,
  limitDays: number,
): Date | null {
  try {
    const result = Astronomy.SearchRiseSet(body, observer, direction, date, limitDays);
    return result ? result.date : null;
  } catch {
    return null;
  }
}

export function getSunriseSunset(
  date: Date,
  latitude: number,
  longitude: number,
): { sunrise: Date | null; sunset: Date | null } {
  const observer = makeObserver(latitude, longitude);
  const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const sunrise = searchRiseSet(Astronomy.Body.Sun, observer, dayStart, 1, 2);
  const sunset = sunrise ? searchRiseSet(Astronomy.Body.Sun, observer, sunrise, -1, 2) : null;
  return { sunrise, sunset };
}

export function getMoonriseMoonset(
  date: Date,
  latitude: number,
  longitude: number,
): { moonrise: Date | null; moonset: Date | null } {
  const observer = makeObserver(latitude, longitude);
  const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const moonrise = searchRiseSet(Astronomy.Body.Moon, observer, dayStart, 1, 2);
  const moonset = searchRiseSet(Astronomy.Body.Moon, observer, dayStart, -1, 2);
  return { moonrise, moonset };
}

/** Most recent sunrise at or before `date` (searches backward if needed). */
export function getMostRecentSunrise(date: Date, latitude: number, longitude: number): Date | null {
  const observer = makeObserver(latitude, longitude);
  return searchRiseSet(Astronomy.Body.Sun, observer, date, 1, -2);
}
