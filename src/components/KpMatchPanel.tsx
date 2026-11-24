import { useState } from "react";
import DateTimePlaceForm from "./DateTimePlaceForm";
import type { EphemerisSettings } from "../engine/ephemerisSettings";
import { compareKpCharts, type KpMatchReport } from "../engine/kpMatch";
import type { BirthInput } from "../engine/types";

export default function KpMatchPanel({
  personA,
  settings,
}: {
  /** Chart A already calculated on the page (optional baseline). */
  personA: BirthInput | null;
  settings?: EphemerisSettings;
}) {
  const [a, setA] = useState<BirthInput | null>(personA);
  const [b, setB] = useState<BirthInput | null>(null);
  const [labelA, setLabelA] = useState("Person A");
  const [labelB, setLabelB] = useState("Person B");
  const [report, setReport] = useState<KpMatchReport | null>(null);
  const [error, setError] = useState("");

  const run = () => {
    setError("");
    if (!a || !b) {
      setError("Enter birth data for both persons.");
      return;
    }
    setReport(
      compareKpCharts(
        { label: labelA || "A", date: a.date, latitude: a.latitude, longitude: a.longitude },
        { label: labelB || "B", date: b.date, latitude: b.latitude, longitude: b.longitude },
        settings,
      ),
    );
  };

  return (
    <section className="card">
      <h3>KP Chart Comparison — Marriage / Partnership (ஒப்பீடு)</h3>
      <p style={{ fontSize: 12, color: "#9aa0c0" }}>
        Simplified KP matching on 7th cusp Sub-Lords, common 2/7/11 significators, and mutual star
        links. Indications only.
      </p>

      <div className="field-row">
        <label>
          Label A
          <input value={labelA} onChange={(e) => setLabelA(e.target.value)} />
        </label>
        <label>
          Label B
          <input value={labelB} onChange={(e) => setLabelB(e.target.value)} />
        </label>
        {personA && (
          <button type="button" onClick={() => setA(personA)}>
            Use page chart as A
          </button>
        )}
      </div>

      <h4>Person A</h4>
      <DateTimePlaceForm
        submitToCalculate
        submitLabel="Set Person A"
        onChange={(inp) => setA(inp)}
      />
      <h4>Person B</h4>
      <DateTimePlaceForm
        submitToCalculate
        submitLabel="Set Person B"
        onChange={(inp) => setB(inp)}
      />

      <button type="button" onClick={run} style={{ marginTop: 8 }}>
        Compare KP charts
      </button>
      {error && <p className="fail">{error}</p>}

      {report && (
        <div style={{ marginTop: 12 }}>
          <p>
            <strong className="pass">
              {report.totalScore} / {report.maxScore}
            </strong>{" "}
            — {report.verdictEn}
          </p>
          <p className="tamil" style={{ color: "#9aa0c0", fontSize: 13 }}>
            {report.verdictTa}
          </p>
          <div className="chart-scroll">
            <table>
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Score</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {report.factors.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <strong>{f.titleEn}</strong>
                      <div className="tamil" style={{ fontSize: 11, color: "#9aa0c0" }}>
                        {f.titleTa}
                      </div>
                    </td>
                    <td>
                      {f.score}/{f.maxScore}
                    </td>
                    <td style={{ fontSize: 12 }}>{f.noteEn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
