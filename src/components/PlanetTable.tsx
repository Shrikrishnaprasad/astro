import { useMemo } from "react";
import { NAKSHATRAS } from "../data/nakshatras";
import { RASIS } from "../data/rasis";
import { PLANET_TAMIL_NAME } from "../data/planetsTamil";
import { rasiToHouseNumber } from "../engine/houses";
import { longitudeToRasiNakshatra } from "../engine/rasiNakshatra";
import { getRetrogradeStatus, shouldShowRetrograde } from "../engine/retrograde";
import type { LongitudeMap } from "../engine/types";
import { PLANETS } from "../engine/types";
import { formatDegreeInRasi } from "../utils/format";

export default function PlanetTable({
  longitudes,
  date,
  lagnaRasiIndex,
}: {
  longitudes: LongitudeMap;
  // Moment the longitudes are for, used to flag vakram (retrograde) grahas.
  // Omit when unavailable/unneeded (e.g. a precomputed table with no clear
  // "as of" moment) to skip the (R) column.
  date?: Date;
  /** Whole-sign house (1–12) from lagna; omit to hide the House column. */
  lagnaRasiIndex?: number;
}) {
  const retrograde = useMemo(() => (date ? getRetrogradeStatus(date) : null), [date]);

  return (
    <table>
      <thead>
        <tr>
          <th>Planet</th>
          <th>Degree</th>
          <th>Rasi</th>
          <th>Nakshatra</th>
          <th>Pada</th>
          {lagnaRasiIndex !== undefined && <th>House</th>}
        </tr>
      </thead>
      <tbody>
        {PLANETS.map((planet) => {
          const info = longitudeToRasiNakshatra(longitudes[planet]);
          const nakshatra = NAKSHATRAS[info.nakshatraIndex];
          const rasi = RASIS[info.rasiIndex];
          const isRetrograde = shouldShowRetrograde(planet, retrograde);
          const house =
            lagnaRasiIndex !== undefined
              ? rasiToHouseNumber(lagnaRasiIndex, info.rasiIndex)
              : null;
          return (
            <tr key={planet}>
              <td>
                {planet} <span className="tamil">({PLANET_TAMIL_NAME[planet]})</span>
                {isRetrograde && (
                  <span className="retrograde-tag" title="Vakram (retrograde)">
                    {" "}
                    (R)
                  </span>
                )}
              </td>
              <td>{formatDegreeInRasi(info.degreeInRasi)}</td>
              <td>
                {rasi.nameEnglish} <span className="tamil">({rasi.nameTamil})</span>
              </td>
              <td>
                {nakshatra.nameEnglish} <span className="tamil">({nakshatra.nameTamil})</span>
              </td>
              <td>{info.pada}</td>
              {house !== null && <td>{house}</td>}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
