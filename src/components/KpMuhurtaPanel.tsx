import { useState } from "react";
import { KP_EVENT_TOPICS, type KpSystemResult } from "../engine/kp";
import type { EphemerisSettings } from "../engine/ephemerisSettings";
import { searchKpMuhurta, type KpMuhurtaSearchResult } from "../engine/kpMuhurta";

const fmt = (d: Date) =>
  d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function KpMuhurtaPanel({
  kp,
  latitude,
  longitude,
  settings,
}: {
  kp: KpSystemResult;
  latitude: number;
  longitude: number;
  settings?: EphemerisSettings;
}) {
  const [topicId, setTopicId] = useState("marriage");
  const [days, setDays] = useState(14);
  const [stepMinutes, setStepMinutes] = useState(60);
  const [result, setResult] = useState<KpMuhurtaSearchResult | null>(null);
  const [busy, setBusy] = useState(false);

  const run = () => {
    setBusy(true);
    window.setTimeout(() => {
      setResult(
        searchKpMuhurta({
          natal: kp,
          topicId,
          latitude,
          longitude,
          settings,
          days,
          stepMinutes,
        }),
      );
      setBusy(false);
    }, 30);
  };

  return (
    <section className="card">
      <h3>KP Muhurta / Election (கேபி முகூர்த்தம்)</h3>
      <p style={{ fontSize: 12, color: "#9aa0c0" }}>
        Finds moments when Ruling Planets include the natal topic&apos;s cusp Sub-Lord. Sampled at
        the step below (not every second). Use with classical muhurta checks as well.
      </p>
      <div className="field-row" style={{ alignItems: "flex-end" }}>
        <label>
          Topic
          <select value={topicId} onChange={(e) => setTopicId(e.target.value)}>
            {KP_EVENT_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.topic}
              </option>
            ))}
          </select>
        </label>
        <label>
          Days ahead
          <input
            type="number"
            min={1}
            max={60}
            value={days}
            onChange={(e) => setDays(Math.min(60, Math.max(1, Number(e.target.value) || 14)))}
          />
        </label>
        <label>
          Step (minutes)
          <input
            type="number"
            min={15}
            max={180}
            step={15}
            value={stepMinutes}
            onChange={(e) =>
              setStepMinutes(Math.min(180, Math.max(15, Number(e.target.value) || 60)))
            }
          />
        </label>
        <button type="button" onClick={run} disabled={busy}>
          {busy ? "Searching…" : "Find KP election times"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 10 }}>
          <p style={{ fontSize: 13 }}>
            Natal Sub-Lord for {result.topic}:{" "}
            <strong className="pass">{result.natalSubLord}</strong> · Fav houses [
            {result.favorableHouses.join(", ")}] · {result.slots.length} slot(s) in{" "}
            {fmt(result.scannedFrom)} – {fmt(result.scannedTo)}
          </p>
          {result.slots.length === 0 ? (
            <p style={{ fontSize: 13 }}>
              No slot in this range includes the natal Sub-Lord among Ruling Planets. Widen days or
              step.
            </p>
          ) : (
            <div className="chart-scroll">
              <table>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Score</th>
                    <th>Lagna Sub</th>
                    <th>Moon Sub</th>
                    <th>Day</th>
                    <th>Ruling Planets</th>
                    <th>Why</th>
                  </tr>
                </thead>
                <tbody>
                  {result.slots.map((s) => (
                    <tr key={s.start.getTime()}>
                      <td>{fmt(s.start)}</td>
                      <td className={s.score >= 6 ? "pass" : ""}>
                        <strong>{s.score}</strong>
                      </td>
                      <td>{s.lagnaSubLord}</td>
                      <td>{s.moonSubLord}</td>
                      <td>{s.dayLord}</td>
                      <td style={{ fontSize: 12 }}>{s.rulingPlanets.join(", ")}</td>
                      <td style={{ fontSize: 11 }}>{s.noteEn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
