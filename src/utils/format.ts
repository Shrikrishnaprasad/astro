export function formatDegreeInRasi(degree: number): string {
  const deg = Math.floor(degree);
  const minutes = Math.round((degree - deg) * 60);
  if (minutes === 60) return `${deg + 1}°00'`;
  return `${deg}°${minutes.toString().padStart(2, "0")}'`;
}
