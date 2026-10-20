import { useMemo, useState } from "react";
import { NAKSHATRAS } from "../data/nakshatras";
import { computePorutham } from "../engine/porutham";

export default function PoruthamPage() {
  const [brideIndex, setBrideIndex] = useState(0);
  const [groomIndex, setGroomIndex] = useState(0);

  const result = useMemo(() => computePorutham(brideIndex, groomIndex), [brideIndex, groomIndex]);

  return (
    <div>
      <h2>Porutham (10-Point Compatibility)</h2>
      <div className="card field-row">
        <label>
          Bride's Nakshatra
          <select
            className="tamil"
            value={brideIndex}
            onChange={(e) => setBrideIndex(Number(e.target.value))}
          >
            {NAKSHATRAS.map((n) => (
              <option key={n.index} value={n.index}>
                {n.nameEnglish} ({n.nameTamil})
              </option>
            ))}
          </select>
        </label>
        <label>
          Groom's Nakshatra
          <select
            className="tamil"
            value={groomIndex}
            onChange={(e) => setGroomIndex(Number(e.target.value))}
          >
            {NAKSHATRAS.map((n) => (
              <option key={n.index} value={n.index}>
                {n.nameEnglish} ({n.nameTamil})
              </option>
            ))}
          </select>
        </label>
      </div>

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
      <p style={{ fontSize: 12, color: "#9aa0c0" }}>
        Simplified Dasakoota implementation (nakshatra-based rules only); treat as indicative,
        not a substitute for a qualified astrologer's full review.
      </p>
    </div>
  );
}
