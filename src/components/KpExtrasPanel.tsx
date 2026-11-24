import { useMemo } from "react";
import type { EphemerisSettings } from "../engine/ephemerisSettings";
import { buildKpNodeDetails, computeKpFortuna } from "../engine/kpExtras";
import type { KpSystemResult } from "../engine/kp";
import { RASIS } from "../data/rasis";
import { formatDegreeInRasi, formatSiderealLongitude } from "../utils/format";

export default function KpExtrasPanel({
  kp,
  date,
  latitude,
  longitude,
  settings,
}: {
  kp: KpSystemResult;
  date: Date;
  latitude: number;
  longitude: number;
  settings?: EphemerisSettings;
}) {
  const fortuna = useMemo(
    () => computeKpFortuna(date, latitude, longitude, kp.cusps, settings),
    [date, latitude, longitude, kp.cusps, settings],
  );
  const nodes = useMemo(() => buildKpNodeDetails(kp), [kp]);

  return (
    <section className="card">
      <h3>Fortuna &amp; Rahu/Ketu Detail (பாக்கியம் &amp; ராகு/கேது)</h3>

      {fortuna ? (
        <div style={{ marginBottom: 12 }}>
          <h4 style={{ margin: "0 0 4px" }}>Part of Fortune (Fortuna)</h4>
          <p style={{ fontSize: 12, color: "#9aa0c0" }}>
            {fortuna.isDayChart ? "Day chart" : "Night chart"} · Formula: {fortuna.formula}
          </p>
          <p style={{ fontSize: 13 }}>
            {formatSiderealLongitude(fortuna.longitude)} ·{" "}
            {RASIS[fortuna.rasiIndex].nameEnglish} {formatDegreeInRasi(fortuna.degreeInRasi)} ·{" "}
            Star <strong>{fortuna.nakshatraLord}</strong> · Sub{" "}
            <strong className="pass">{fortuna.subLord}</strong> · Placidus Bhava{" "}
            <strong>{fortuna.bhavaHouse}</strong>
          </p>
        </div>
      ) : (
        <p style={{ fontSize: 12 }}>Fortuna could not be computed (sunrise/sunset missing).</p>
      )}

      <h4>Rahu / Ketu agent detail</h4>
      <div className="chart-scroll">
        <table>
          <thead>
            <tr>
              <th>Node</th>
              <th>Bhava</th>
              <th>Sign / Star / Sub</th>
              <th>Conjoined</th>
              <th>Agents</th>
              <th>Houses signified</th>
              <th>Tenancy</th>
            </tr>
          </thead>
          <tbody>
            {nodes.map((n) => (
              <tr key={n.planet}>
                <td>
                  <strong>{n.planet}</strong>
                </td>
                <td>H{n.bhavaHouse}</td>
                <td style={{ fontSize: 12 }}>
                  {n.signLord} / {n.starLord} / <strong className="pass">{n.chain.subLord}</strong>
                </td>
                <td style={{ fontSize: 12 }}>{n.conjoined.join(", ") || "—"}</td>
                <td style={{ fontSize: 12 }}>{n.agentNote || "—"}</td>
                <td>
                  <strong>[{n.agentHouses.join(", ")}]</strong>
                </td>
                <td className={n.isUntenanted ? "pass" : ""}>
                  {n.isUntenanted ? "★ Untenanted" : "Tenanted"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
