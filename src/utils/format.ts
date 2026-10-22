export function formatDegreeInRasi(degree: number): string {
  const deg = Math.floor(degree);
  const minutes = Math.round((degree - deg) * 60);
  if (minutes === 60) return `${deg + 1}°00'`;
  return `${deg}°${minutes.toString().padStart(2, "0")}'`;
}

/** Ecliptic longitude 0–360° as degrees and minutes. */
export function formatSiderealLongitude(longitude: number): string {
  const norm = ((longitude % 360) + 360) % 360;
  const deg = Math.floor(norm);
  const minutes = Math.round((norm - deg) * 60);
  if (minutes === 60) return `${deg + 1}°00'`;
  return `${deg}°${minutes.toString().padStart(2, "0")}'`;
}
