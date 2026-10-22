import { useMemo, useState } from "react";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import { RASIS } from "../data/rasis";
import { computePrasna } from "../engine/prasna";
import type { BirthInput } from "../engine/types";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import { useBirthChart } from "../hooks/useBirthChart";

export default function PrasnaPage() {
  const { resolved } = useEphemerisSettings();
  const [input, setInput] = useState<BirthInput | null>(null);
  const [question, setQuestion] = useState("");
  const chart = useBirthChart(input);

  const prasna = useMemo(
    () => (chart && input ? computePrasna(input, chart, resolved) : null),
    [chart, input, resolved],
  );

  return (
    <div>
      <h2>Prasna (Horary)</h2>
      <EphemerisAccuracyNotice />
      <p style={{ fontSize: 14, color: "#9aa0c0" }}>
        Chart cast for the moment the question is asked (date, time, place). Uses whole-sign houses,
        KP sub-lord of lagna, and simple Moon/lagna hints — not a full KP Prasna rule book.
      </p>

      <div className="card">
        <label>
          Question (optional, for your notes)
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>
      </div>

      <DateTimePlaceForm submitToCalculate submitLabel="Cast Prasna chart" onChange={setInput} />

      {!chart && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter the moment you are asking, then click <strong>Cast Prasna chart</strong>.
        </p>
      )}

      {prasna && chart && (
        <>
          {question.trim() && (
            <div className="card">
              <strong>Question:</strong> {question.trim()}
            </div>
          )}
          <div className="card">
            <table>
              <tbody>
                <tr>
                  <th>Prasna Lagna</th>
                  <td>
                    {RASIS[prasna.lagnaRasiIndex].nameEnglish}{" "}
                    <span className="tamil">({RASIS[prasna.lagnaRasiIndex].nameTamil})</span> — lord{" "}
                    {prasna.lagnaLord}
                  </td>
                </tr>
                <tr>
                  <th>Lagna KP sub-lord</th>
                  <td>{prasna.lagnaSubLord}</td>
                </tr>
                <tr>
                  <th>Moon</th>
                  <td>
                    {prasna.moonNakshatra}, house {prasna.moonHouse} from lagna — {prasna.tithiName}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="card">
            <strong>Hints</strong>
            <ul>
              {prasna.hints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
