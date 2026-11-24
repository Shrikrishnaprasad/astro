import { useMemo, useState } from "react";
import { KP_EVENT_TOPICS } from "../engine/kp";
import type { EphemerisSettings } from "../engine/ephemerisSettings";
import {
  rectifyKpBirthTime,
  type KpLifeEvent,
  type KpRectificationResult,
} from "../engine/kpRectification";

const fmt = (d: Date) =>
  d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const fmtDay = (d: Date) =>
  d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

type DraftEvent = { id: string; topicId: string; dateStr: string; label: string };

function newDraft(): DraftEvent {
  return {
    id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    topicId: "marriage",
    dateStr: "",
    label: "",
  };
}

export default function KpRectificationPanel({
  birthDate,
  latitude,
  longitude,
  settings,
  onApplyBirthDate,
}: {
  birthDate: Date;
  latitude: number;
  longitude: number;
  settings?: EphemerisSettings;
  /** Optional: apply a candidate birth time back to the chart form. */
  onApplyBirthDate?: (date: Date) => void;
}) {
  const [drafts, setDrafts] = useState<DraftEvent[]>([newDraft()]);
  const [windowMinutes, setWindowMinutes] = useState(30);
  const [stepMinutes, setStepMinutes] = useState(2);
  const [result, setResult] = useState<KpRectificationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const top = useMemo(() => result?.candidates.slice(0, 8) ?? [], [result]);

  const run = () => {
    setError("");
    const events: KpLifeEvent[] = [];
    for (const d of drafts) {
      if (!d.dateStr) continue;
      const date = new Date(`${d.dateStr}T12:00:00`);
      if (Number.isNaN(date.getTime())) {
        setError(`Invalid date: ${d.dateStr}`);
        return;
      }
      events.push({
        id: d.id,
        topicId: d.topicId,
        date,
        label: d.label.trim() || undefined,
      });
    }
    if (events.length === 0) {
      setError("Add at least one life event with a date.");
      return;
    }
    setBusy(true);
    // Yield so the button can show "Scanning…" before the sync loop.
    window.setTimeout(() => {
      try {
        const report = rectifyKpBirthTime(events, {
          birthDate,
          latitude,
          longitude,
          settings,
          windowMinutes,
          stepMinutes,
        });
        setResult(report);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Rectification failed.");
      } finally {
        setBusy(false);
      }
    }, 30);
  };

  return (
    <section className="card">
      <h3>KP Birth-Time Rectification (ஜனன நேர சரிபார்ப்பு)</h3>
      <p style={{ fontSize: 12, color: "#9aa0c0" }}>
        Enter known life events. The tool scans birth times around the given chart (± window) and
        ranks candidates by cusp-sub-lord promise + whether dasa–bhukti at the event carry that
        matter. Indications only — not a substitute for classical KP rectification practice.
      </p>

      <div className="field-row" style={{ alignItems: "flex-end" }}>
        <label>
          Search window (± minutes)
          <input
            type="number"
            min={5}
            max={90}
            value={windowMinutes}
            onChange={(e) => setWindowMinutes(Math.min(90, Math.max(5, Number(e.target.value) || 30)))}
          />
        </label>
        <label>
          Step (minutes)
          <input
            type="number"
            min={1}
            max={10}
            value={stepMinutes}
            onChange={(e) => setStepMinutes(Math.min(10, Math.max(1, Number(e.target.value) || 2)))}
          />
        </label>
        <button type="button" onClick={run} disabled={busy}>
          {busy ? "Scanning…" : "Find birth time"}
        </button>
      </div>

      {drafts.map((d, idx) => (
        <div key={d.id} className="field-row" style={{ marginTop: 8, alignItems: "flex-end" }}>
          <label>
            Topic
            <select
              value={d.topicId}
              onChange={(e) => {
                const next = [...drafts];
                next[idx] = { ...d, topicId: e.target.value };
                setDrafts(next);
              }}
            >
              {KP_EVENT_TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.topic}
                </option>
              ))}
            </select>
          </label>
          <label>
            Event date
            <input
              type="date"
              value={d.dateStr}
              onChange={(e) => {
                const next = [...drafts];
                next[idx] = { ...d, dateStr: e.target.value };
                setDrafts(next);
              }}
            />
          </label>
          <label style={{ flex: 1 }}>
            Note (optional)
            <input
              type="text"
              placeholder="e.g. Wedding / First job"
              value={d.label}
              onChange={(e) => {
                const next = [...drafts];
                next[idx] = { ...d, label: e.target.value };
                setDrafts(next);
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => setDrafts(drafts.filter((x) => x.id !== d.id))}
            disabled={drafts.length <= 1}
          >
            Remove
          </button>
        </div>
      ))}

      <button type="button" style={{ marginTop: 8 }} onClick={() => setDrafts([...drafts, newDraft()])}>
        + Add event
      </button>

      {error && (
        <p className="fail" style={{ fontSize: 13 }}>
          {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: 13 }}>
            Scanned ±{result.windowMinutes} min every {result.stepMinutes} min around{" "}
            {fmt(result.center)}. Best score: <strong className="pass">{result.bestScore}</strong>
          </p>
          <div className="chart-scroll">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Birth time</th>
                  <th>Offset</th>
                  <th>Lagna Sign/Star/Sub</th>
                  <th>Score</th>
                  <th>Event fits</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {top.map((c, i) => (
                  <tr key={c.birthDate.getTime()}>
                    <td>
                      <strong>#{i + 1}</strong>
                    </td>
                    <td>{fmt(c.birthDate)}</td>
                    <td>
                      {c.offsetMinutes >= 0 ? "+" : ""}
                      {c.offsetMinutes} min
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {c.lagnaSignLord} / {c.lagnaStarLord} /{" "}
                      <strong className="pass">{c.lagnaSubLord}</strong>
                    </td>
                    <td className={c.totalScore === result.bestScore ? "pass" : ""}>
                      <strong>{c.totalScore}</strong>
                    </td>
                    <td style={{ fontSize: 11, maxWidth: 360 }}>
                      {c.eventFits.map((f) => (
                        <div key={`${f.topicId}-${f.eventDate.getTime()}`}>
                          <strong>{f.label}</strong> ({fmtDay(f.eventDate)}): score {f.score} —{" "}
                          {f.noteEn}
                        </div>
                      ))}
                    </td>
                    <td>
                      {onApplyBirthDate && (
                        <button type="button" style={{ fontSize: 12 }} onClick={() => onApplyBirthDate(c.birthDate)}>
                          Use this time
                        </button>
                      )}
                    </td>
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
