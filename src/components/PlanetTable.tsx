import { useMemo } from "react";
import { NAKSHATRAS } from "../data/nakshatras";
import { PLANET_TAMIL_NAME } from "../data/planetsTamil";
import { longitudeToRasiNakshatra } from "../engine/rasiNakshatra";
import { getRetrogradeStatus, shouldShowRetrograde } from "../engine/retrograde";
import type { LongitudeMap } from "../engine/types";
import { PLANETS } from "../engine/types";
import { formatDegreeInRasi } from "../utils/format";

export default function PlanetTable({
  longitudes,
  date,
}: {
  longitudes: LongitudeMap;
  // Moment the longitudes are for, used to flag vakram (retrograde) grahas.
  // Omit when unavailable/unneeded (e.g. a precomputed table with no clear
  // "as of" moment) to skip the (R) column.
  date?: Date;
}) {
  const retrograde = useMemo(() => (date ? getRetrogradeStatus(date) : null), [date]);

  return (
    <table>
      <thead>
        <tr>
          <th>Planet</th>
          <th>Degree</th>
          <th>Nakshatra</th>
          <th>Pada</th>
        </tr>
      </thead>
      <tbody>
        {PLANETS.map((planet) => {
          const info = longitudeToRasiNakshatra(longitudes[planet]);
          const nakshatra = NAKSHATRAS[info.nakshatraIndex];
          const isRetrograde = shouldShowRetrograde(planet, retrograde);
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
                {nakshatra.nameEnglish} <span className="tamil">({nakshatra.nameTamil})</span>
              </td>
              <td>{info.pada}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
