import { useMemo, useState } from "react";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import JyotishScopePanel from "../components/JyotishScopePanel";
import { NAKSHATRAS } from "../data/nakshatras";
import { RASIS } from "../data/rasis";
import { computePorutham } from "../engine/porutham";
import type { BirthInput } from "../engine/types";
import { useBirthChart } from "../hooks/useBirthChart";

export default function PoruthamPage() {
  const [brideInput, setBrideInput] = useState<BirthInput | null>(null);
  const [groomInput, setGroomInput] = useState<BirthInput | null>(null);

  const brideChart = useBirthChart(brideInput);
  const groomChart = useBirthChart(groomInput);

  const brideMoon = brideChart?.planetRasi.Moon;
  const groomMoon = groomChart?.planetRasi.Moon;

  const result = useMemo(() => {
    if (!brideMoon || !groomMoon) return null;
    return computePorutham(
      brideMoon.nakshatraIndex,
      groomMoon.nakshatraIndex,
      brideMoon.rasiIndex,
      groomMoon.rasiIndex,
    );
  }, [brideMoon, groomMoon]);

  return (
    <div>
      <h2>Porutham (10-Point Compatibility)</h2>
      <p style={{ fontSize: 14, color: "#9aa0c0", marginBottom: 12 }}>
        Enter each person&apos;s birth date, time, and place. Porutham uses the sidereal Moon
        nakshatra, pada, and rasi from those charts (Chandra-based Dasakoota).
      </p>

      <div className="chart-pair">
        <div className="chart-pair__item">
          <h3 className="chart-pair__title">Bride</h3>
          <DateTimePlaceForm
            submitToCalculate
            submitLabel="Calculate bride chart"
            onChange={setBrideInput}
          />
          {brideMoon && (
            <div className="card">
              <strong>Moon (Chandra)</strong>
              <p>
                Nakshatra: {NAKSHATRAS[brideMoon.nakshatraIndex].nameEnglish}{" "}
                <span className="tamil">({NAKSHATRAS[brideMoon.nakshatraIndex].nameTamil})</span> —
                Pada {brideMoon.pada}
              </p>
              <p>
                Rasi: {RASIS[brideMoon.rasiIndex].nameEnglish}{" "}
                <span className="tamil">({RASIS[brideMoon.rasiIndex].nameTamil})</span>
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
          {groomMoon && (
            <div className="card">
              <strong>Moon (Chandra)</strong>
              <p>
                Nakshatra: {NAKSHATRAS[groomMoon.nakshatraIndex].nameEnglish}{" "}
                <span className="tamil">({NAKSHATRAS[groomMoon.nakshatraIndex].nameTamil})</span> —
                Pada {groomMoon.pada}
              </p>
              <p>
                Rasi: {RASIS[groomMoon.rasiIndex].nameEnglish}{" "}
                <span className="tamil">({RASIS[groomMoon.rasiIndex].nameTamil})</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {!result && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter and calculate both birth charts to see the 10-point Porutham score.
        </p>
      )}

      {result && (
        <>
          <div className="card">
            <strong>
              Score: {result.score} / {result.total}
            </strong>
          </div>

          <table>
            <thead>
              <tr>
                <th>Koota</th>
                <th>Result</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {result.checks.map((check) => (
                <tr key={check.name}>
                  <td>{check.name}</td>
                  <td className={check.pass ? "pass" : "fail"}>{check.pass ? "Pass" : "Fail"}</td>
                  <td>{check.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <JyotishScopePanel pageId="porutham" />
    </div>
  );
}
