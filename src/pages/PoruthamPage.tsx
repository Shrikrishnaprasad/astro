import { useMemo, useState } from "react";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import JyotishScopePanel from "../components/JyotishScopePanel";
import { NAKSHATRAS } from "../data/nakshatras";
import { RASIS } from "../data/rasis";
import { computePoruthamMatchReport } from "../engine/poruthamMatch";
import type { BirthInput } from "../engine/types";
import { useBirthChart } from "../hooks/useBirthChart";

export default function PoruthamPage() {
  const [brideInput, setBrideInput] = useState<BirthInput | null>(null);
  const [groomInput, setGroomInput] = useState<BirthInput | null>(null);
  const [minimumScore, setMinimumScore] = useState(6);

  const brideChart = useBirthChart(brideInput);
  const groomChart = useBirthChart(groomInput);

  const brideMoon = brideChart?.planetRasi.Moon;
  const groomMoon = groomChart?.planetRasi.Moon;

  const report = useMemo(() => {
    if (!brideChart || !groomChart) return null;
    return computePoruthamMatchReport(brideChart, groomChart, minimumScore);
  }, [brideChart, groomChart, minimumScore]);

  return (
    <div>
      <h2>Porutham (Match Report)</h2>
      <EphemerisAccuracyNotice />
      <p style={{ fontSize: 14, color: "#9aa0c0", marginBottom: 12 }}>
        Dasakoota from Moon nakshatra &amp; rasi, plus Papa samyam, Kuja dosha, lagna match, and
        configurable community minimums.
      </p>

      <div className="card field-row">
        <label>
          Community minimum (Dasakoota score)
          <input
            type="number"
            min={0}
            max={10}
            value={minimumScore}
            onChange={(e) => setMinimumScore(Number(e.target.value) || 6)}
          />
        </label>
      </div>

      <div className="chart-pair">
        <div className="chart-pair__item">
          <h3 className="chart-pair__title">Bride</h3>
          <DateTimePlaceForm
            submitToCalculate
            submitLabel="Calculate bride chart"
            onChange={setBrideInput}
          />
          {brideChart && brideMoon && (
            <div className="card">
              <strong>Summary</strong>
              <p>
                Lagna: {RASIS[brideChart.lagnaRasiIndex].nameEnglish} · Moon:{" "}
                {NAKSHATRAS[brideMoon.nakshatraIndex].nameEnglish} pada {brideMoon.pada} ·{" "}
                {RASIS[brideMoon.rasiIndex].nameEnglish}
              </p>
            </div>
          )}
        </div>
        <div className="chart-pair__item">
          <h3 className="chart-pair__title">Groom</h3>
          <DateTimePlaceForm
            submitToCalculate
            submitLabel="Calculate groom chart"
            onChange={setGroomInput}
          />
          {groomChart && groomMoon && (
            <div className="card">
              <strong>Summary</strong>
              <p>
                Lagna: {RASIS[groomChart.lagnaRasiIndex].nameEnglish} · Moon:{" "}
                {NAKSHATRAS[groomMoon.nakshatraIndex].nameEnglish} pada {groomMoon.pada} ·{" "}
                {RASIS[groomMoon.rasiIndex].nameEnglish}
              </p>
            </div>
          )}
        </div>
      </div>

      {!report && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter and calculate both birth charts to generate the match report.
        </p>
      )}

      {report && (
        <>
          <div
            className={`card ${
              report.recommendation === "favorable"
                ? "pass"
                : report.recommendation === "not_favorable"
                  ? "fail"
                  : ""
            }`}
          >
            <strong>Overall: {report.recommendation.replace("_", " ")}</strong>
            <p style={{ marginTop: 8 }}>{report.summary}</p>
          </div>

          <div className="card">
            <strong>
              Dasakoota: {report.dasakoota.score} / {report.dasakoota.total}
            </strong>
            <p className={report.minimums.pass ? "pass" : "fail"}>{report.minimums.note}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Check</th>
                <th>Result</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {report.dasakoota.checks.map((check) => (
                <tr key={check.name}>
                  <td>{check.name}</td>
                  <td className={check.pass ? "pass" : "fail"}>{check.pass ? "Pass" : "Fail"}</td>
                  <td>{check.note}</td>
                </tr>
              ))}
              <tr>
                <td>Papa samyam</td>
                <td className={report.papaSamyam.pass ? "pass" : "fail"}>
                  {report.papaSamyam.pass ? "Pass" : "Fail"}
                </td>
                <td>
                  Bride papa {report.papaSamyam.bridePapaScore}, groom papa{" "}
                  {report.papaSamyam.groomPapaScore}. {report.papaSamyam.note}
                </td>
              </tr>
              <tr>
                <td>Lagna porutham</td>
                <td className={report.lagnaPorutham.pass ? "pass" : "fail"}>
                  {report.lagnaPorutham.pass ? "Pass" : "Fail"}
                </td>
                <td>{report.lagnaPorutham.note}</td>
              </tr>
              <tr>
                <td>Kuja dosha (bride)</td>
                <td className={report.brideKuja.activeAfterCancellation ? "fail" : "pass"}>
                  {report.brideKuja.activeAfterCancellation ? "Active" : "Clear / cancelled"}
                </td>
                <td>
                  {report.brideKuja.references.length
                    ? report.brideKuja.references
                        .map((r) => `Mars house ${r.house} from ${r.from}`)
                        .join("; ")
                    : "None"}
                </td>
              </tr>
              <tr>
                <td>Kuja dosha (groom)</td>
                <td className={report.groomKuja.activeAfterCancellation ? "fail" : "pass"}>
                  {report.groomKuja.activeAfterCancellation ? "Active" : "Clear / cancelled"}
                </td>
                <td>
                  {report.groomKuja.references.length
                    ? report.groomKuja.references
                        .map((r) => `Mars house ${r.house} from ${r.from}`)
                        .join("; ")
                    : "None"}{" "}
                  — {report.kujaCompatibilityNote}
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <JyotishScopePanel pageId="porutham" />
    </div>
  );
}
