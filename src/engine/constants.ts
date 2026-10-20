export enum AyanamsaMode {
  LAHIRI = "LAHIRI",
}

export const AYANAMSA_MODE: AyanamsaMode = AyanamsaMode.LAHIRI;

export function toJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export function julianCenturiesSinceJ2000(jd: number): number {
  return (jd - 2451545.0) / 36525;
}

export function normalizeDegrees(deg: number): number {
  const d = deg % 360;
  return d < 0 ? d + 360 : d;
}
