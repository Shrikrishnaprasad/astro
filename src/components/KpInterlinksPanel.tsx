import { useMemo } from "react";
import { buildKpInterlinks, type KpInterlinkCell } from "../engine/kpInterlinks";
import type { KpSystemResult } from "../engine/kp";
import { PLANETS } from "../engine/types";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function cellLabel(c: KpInterlinkCell | undefined): string {
  if (!c) return "·";
  if (c === "both") return "★+S";
  if (c === "star") return "★";
  if (c === "sub") return "S";
  return "○";
}

function cellTitle(c: KpInterlinkCell | undefined): string {
  if (!c) return "No link";
  if (c === "both") return "Via Star Lord and Sub Lord";
  if (c === "star") return "Via Star Lord (results)";
  if (c === "sub") return "Via Sub Lord (deciding)";
  return "Significator only (A/B/C/D)";
}

export default function KpInterlinksPanel({ kp }: { kp: KpSystemResult }) {
  const links = useMemo(() => buildKpInterlinks(kp), [kp]);

  return (
    <section className="card">
      <h3>KP Cuspal Interlinks (பாவ இணைப்புகள்)</h3>
      <p style={{ fontSize: 12, color: "#9aa0c0" }}>
        Each cusp is interlinked to the houses its <strong>Sub-Lord</strong> signifies. Results flow
        through the Sub-Lord&apos;s <strong>Star Lord</strong>. Matrix: ★ = via star, S = via sub, ★+S
        = both, ○ = significator only.
      </p>

      <h4>Cusp → Interlinked Houses</h4>
      <div className="chart-scroll">
        <table>
          <thead>
            <tr>
              <th>Cusp</th>
              <th>Sign / Star / Sub</th>
              <th>Linked houses (Sub-Lord)</th>
              <th>Via Sub&apos;s Star Lord</th>
              <th>Result planets (★)</th>
              <th>Deciding planets (S)</th>
            </tr>
          </thead>
          <tbody>
            {links.byCusp.map((c) => (
              <tr key={c.house}>
                <td>
                  <strong>
                    {ROMAN[c.house - 1]} (H{c.house})
                  </strong>
                </td>
                <td style={{ fontSize: 12 }}>
                  {c.signLord} / {c.starLord} / <strong className="pass">{c.subLord}</strong>
                </td>
                <td>
                  <strong>[{c.linkedHouses.join(", ")}]</strong>
                </td>
                <td>[{c.linkedViaStar.join(", ")}]</td>
                <td style={{ fontSize: 12 }}>{c.resultPlanets.join(", ") || "—"}</td>
                <td style={{ fontSize: 12 }}>{c.decidingPlanets.join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 style={{ marginTop: 16 }}>Planet × House Matrix (Star / Sub)</h4>
      <div className="chart-scroll">
        <table>
          <thead>
            <tr>
              <th>Planet</th>
              {Array.from({ length: 12 }, (_, i) => (
                <th key={i}>{i + 1}</th>
              ))}
              <th>Cusps as Sub</th>
              <th>Cusps as Star</th>
            </tr>
          </thead>
          <tbody>
            {PLANETS.map((p) => {
              const row = links.byPlanet.find((r) => r.planet === p)!;
              return (
                <tr key={p}>
                  <td>
                    <strong>{p}</strong>
                  </td>
                  {Array.from({ length: 12 }, (_, i) => {
                    const cell = links.matrix[p][i + 1];
                    return (
                      <td
                        key={i}
                        title={cellTitle(cell)}
                        className={cell === "both" || cell === "star" ? "pass" : ""}
                        style={{ textAlign: "center", fontSize: 11 }}
                      >
                        {cellLabel(cell)}
                      </td>
                    );
                  })}
                  <td style={{ fontSize: 12 }}>{row.cuspsAsSubLord.join(", ") || "—"}</td>
                  <td style={{ fontSize: 12 }}>{row.cuspsAsStarLord.join(", ") || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
