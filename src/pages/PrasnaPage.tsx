import { useMemo, useState } from "react";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import KpSystemPanel from "../components/KpSystemPanel";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import { RASIS } from "../data/rasis";
import { computeFullKpSystem } from "../engine/kp";
import { computePrasna } from "../engine/prasna";
import type { BirthInput } from "../engine/types";
import { useBirthChart } from "../hooks/useBirthChart";

export default function PrasnaPage() {
  const { resolved } = useEphemerisSettings();
  const [input, setInput] = useState<BirthInput | null>(null);
  const [question, setQuestion] = useState("");
  const [useHorary249, setUseHorary249] = useState(false);
  const [horaryNumber, setHoraryNumber] = useState<number>(1);
  const [rpMoment, setRpMoment] = useState<Date>(() => new Date());

  const chart = useBirthChart(input);

  const prasna = useMemo(
    () => (chart && input ? computePrasna(input, chart, resolved) : null),
    [chart, input, resolved],
  );

  const kpHorary = useMemo(() => {
    if (!input) return null;
    return computeFullKpSystem(
      input.date,
      input.latitude,
      input.longitude,
      resolved,
      useHorary249 ? horaryNumber : undefined,
      rpMoment,
    );
  }, [input, resolved, useHorary249, horaryNumber, rpMoment]);

  return (
    <div>
      <h2>Prasna (Horary &amp; KP 1–249 Prasna)</h2>
      <EphemerisAccuracyNotice />
      <p style={{ fontSize: 14, color: "#9aa0c0", maxWidth: 780 }}>
        Cast a Horary chart either for the exact moment the question is asked or using a{" "}
        <strong>KP Horary Number (1–249)</strong>, complete with 12 Placidus Cusps, 4-Step KP
        Significators, Ruling Planets, and Cuspal Sub-Lord Event Promises.
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

        <div className="field-row" style={{ marginTop: 10 }}>
          <label>
            <input
              type="checkbox"
              checked={useHorary249}
              onChange={(e) => setUseHorary249(e.target.checked)}
            />
            Use KP 1–249 Horary Number (instead of time-based Lagna)
          </label>
          {useHorary249 && (
            <>
              <label>
                KP Number (1–249)
                <input
                  type="number"
                  min={1}
                  max={249}
                  value={horaryNumber}
                  onChange={(e) =>
                    setHoraryNumber(Math.min(249, Math.max(1, Number(e.target.value) || 1)))
                  }
                />
              </label>
              <button
                type="button"
                onClick={() => setHoraryNumber(Math.floor(Math.random() * 249) + 1)}
              >
                Pick Random (1–249)
              </button>
            </>
          )}
        </div>
      </div>

      <DateTimePlaceForm
        submitToCalculate
        submitLabel="Cast Prasna chart"
        onChange={(inp) => {
          setInput(inp);
          if (inp) setRpMoment(new Date());
        }}
      />

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
            <h3>Classical Prasna Summary</h3>
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
            <strong style={{ display: "block", marginTop: 10 }}>Indicative Hints</strong>
            <ul>
              {prasna.hints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>

          {kpHorary && (
            <KpSystemPanel
              kp={kpHorary}
              onRefreshRulingPlanets={() => setRpMoment(new Date())}
            />
          )}
        </>
      )}
    </div>
  );
}
