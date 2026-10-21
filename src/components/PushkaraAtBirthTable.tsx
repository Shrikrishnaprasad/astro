import { PLANET_TAMIL_NAME } from "../data/planetsTamil";
import { computePushkaraForLongitude } from "../engine/pushkara";
import type { ChartResult } from "../engine/types";
import { PLANETS } from "../engine/types";

export default function PushkaraAtBirthTable({ chart }: { chart: ChartResult }) {
  const rows: Array<{ key: string; label: string; longitude: number }> = [
    { key: "Lagna", label: "Lagna (Ascendant)", longitude: chart.lagnaLongitude },
    ...PLANETS.map((p) => ({
      key: p,
      label: `${p} (${PLANET_TAMIL_NAME[p]})`,
      longitude: chart.planetLongitudes[p],
    })),
  ];

  return (
    <>
      <h3>Pushkara at birth (all grahas &amp; lagna)</h3>
      <table>
        <thead>
          <tr>
            <th>Body</th>
            <th>Pushkara Navamsa</th>
            <th>Navamsa pada</th>
            <th>Near Pushkara Bhaga</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const p = computePushkaraForLongitude(row.longitude);
            return (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td className={p.isPushkaraNavamsa ? "pass" : undefined}>
                  {p.isPushkaraNavamsa ? "Yes" : "No"}
                </td>
                <td>
                  {p.navamsaPada}/9
                </td>
                <td className={p.isNearPushkaraBhaga ? "pass" : undefined}>
                  {p.isNearPushkaraBhaga ? "Yes" : "No"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
