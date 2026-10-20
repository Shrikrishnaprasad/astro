import * as Astronomy from "astronomy-engine";
import { describe, expect, it } from "vitest";
import { getTropicalAscendant } from "./ascendant";
import { getMeanObliquityDegrees } from "./siderealTime";

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Independent cross-check: converts an ecliptic-of-date longitude (latitude
 * 0, i.e. right on the ecliptic) to equatorial RA/Dec, then asks
 * astronomy-engine's own Horizon() for its altitude/azimuth. Used to confirm
 * the ascendant formula's result is actually on the rising, due-east side of
 * the sky (azimuth near 90°) and not the setting, due-west side (azimuth
 * near 270°) - the 180° mix-up this test guards against.
 */
function horizonAzimuthForEclipticLongitude(
  date: Date,
  observer: Astronomy.Observer,
  eclipticLongitudeDeg: number,
): number {
  const eps = getMeanObliquityDegrees(date) * DEG2RAD;
  const lambda = eclipticLongitudeDeg * DEG2RAD;
  const raRad = Math.atan2(Math.sin(lambda) * Math.cos(eps), Math.cos(lambda));
  const raHours = (((raRad * RAD2DEG) / 15) % 24 + 24) % 24;
  const dec = Math.asin(Math.sin(lambda) * Math.sin(eps)) * RAD2DEG;
  return Astronomy.Horizon(date, observer, raHours, dec, "normal").azimuth;
}

describe("getTropicalAscendant", () => {
  it("lands on the rising (eastern, azimuth ~90°) side of the horizon, not the setting (western) side", () => {
    const cases = [
      { date: new Date("2024-06-15T06:00:00Z"), lat: 13.0827, lon: 80.2707 }, // Chennai
      { date: new Date("2024-01-01T18:30:00Z"), lat: 11.0168, lon: 76.9558 }, // Coimbatore
      { date: new Date("2024-09-01T00:00:00Z"), lat: 28.7041, lon: 77.1025 }, // Delhi
    ];

    for (const { date, lat, lon } of cases) {
      const observer = new Astronomy.Observer(lat, lon, 0);
      const ascendant = getTropicalAscendant(date, lat, lon);
      const azimuth = horizonAzimuthForEclipticLongitude(date, observer, ascendant);

      // Due east is 90°; allow a wide margin since azimuth varies with
      // declination/latitude, but it must be clearly on the eastern half
      // (not anywhere near due west, which is what a 180°-flipped
      // (descendant) result would produce).
      const distanceFromEast = Math.min(Math.abs(azimuth - 90), 360 - Math.abs(azimuth - 90));
      expect(distanceFromEast).toBeLessThan(45);
    }
  });
});
