import { useMemo } from "react";
import type { EphemerisSettings } from "../engine/ephemerisSettings";
import type { KpSystemResult } from "../engine/kp";
import {
  buildKpPredictionReport,
  type KpMode,
  type KpRemedyItem,
  type KpTopicPrediction,
} from "../engine/kpPredictions";

const fmt = (d: Date) =>
  d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

function verdictClass(v: KpTopicPrediction["verdict"]) {
  return v === "Promised (Strong)" ? "pass" : v === "Denied / Unfavorable" ? "fail" : "";
}

function RemedyList({ items }: { items: KpRemedyItem[] }) {
  if (items.length === 0) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <strong>Remedies · பரிகாரங்கள்</strong>
      {items.map((it) => (
        <div
          key={`${it.planet}-${it.kind}`}
          style={{ fontSize: 12, margin: "6px 0", paddingLeft: 8, borderLeft: "2px solid #3a4066" }}
        >
          <div>
            <strong className={it.kind === "strengthen" ? "pass" : "fail"}>
              {it.kind === "strengthen" ? "Strengthen" : "Pacify"} {it.planet}
            </strong>{" "}
            — {it.reasonEn}
          </div>
          <div className="tamil" style={{ color: "#9aa0c0" }}>
            {it.reasonTa}
          </div>
          <div>
            Day: {it.remedy.day} ({it.remedy.dayTa}) · Deity: {it.remedy.deity} ({it.remedy.deityTa})
          </div>
          <div>Mantra: {it.remedy.mantra}</div>
          <div>
            Temple: {it.remedy.temple} <span className="tamil">({it.remedy.templeTa})</span>
          </div>
          <div>
            Dana: {it.remedy.dana} <span className="tamil">({it.remedy.danaTa})</span>
          </div>
          <div>
            Practice: {it.remedy.practice} <span className="tamil">({it.remedy.practiceTa})</span>
          </div>
          <div style={{ color: "#9aa0c0" }}>
            Gem (optional, only after expert advice): {it.remedy.gem} ({it.remedy.gemTa})
          </div>
        </div>
      ))}
    </div>
  );
}

function TopicCard({ t, highlight }: { t: KpTopicPrediction; highlight: boolean }) {
  return (
    <div
      className="card"
      style={{ borderLeft: highlight ? "4px solid #f0b429" : "4px solid #2c3254" }}
    >
      {highlight && (
        <div style={{ color: "#f0b429", fontSize: 12 }}>Matches your horary question</div>
      )}
      <h4 style={{ margin: "0 0 4px" }}>
        {t.topic} <span className="tamil">· {t.topicTa}</span>
      </h4>
      <div>
        Answer: <strong className={verdictClass(t.verdict)}>{t.answer}</strong> ({t.answerTa}) ·{" "}
        <span className={verdictClass(t.verdict)}>
          {t.verdict} / {t.verdictTa}
        </span>
      </div>
      <p style={{ fontSize: 13, margin: "6px 0" }}>{t.predictionEn}</p>
      <p className="tamil" style={{ fontSize: 13, margin: "6px 0", color: "#9aa0c0" }}>
        {t.predictionTa}
      </p>
      <div style={{ fontSize: 12, color: "#9aa0c0" }}>
        Why: {t.promise.explanation}
      </div>
      <div style={{ fontSize: 12, color: "#9aa0c0" }}>
        Cusp scores:{" "}
        {t.promise.contributions
          .map((c) => `C${c.cusp} ${c.subLord} ${c.score}${c.weight < 1 ? ` ×${c.weight}` : ""}`)
          .join(" · ")}{" "}
        → combined {t.promise.combinedScore.toFixed(1)}
      </div>
      <div style={{ fontSize: 12, color: "#9aa0c0" }}>
        Event-carrying planets: {t.eventPlanets.length ? t.eventPlanets.join(", ") : "—"}
      </div>

      {t.windows.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <strong>Likely timing (next 15 years) · காலம்</strong>
          <table style={{ marginTop: 4 }}>
            <thead>
              <tr>
                <th>Period</th>
                <th>Dasa–Bhukti</th>
                <th>Strength</th>
                <th>Antara sub-windows</th>
                <th>Sub-lord chain</th>
                <th>RP confirm</th>
              </tr>
            </thead>
            <tbody>
              {t.windows.map((w) => (
                <tr key={`${w.start.getTime()}-${w.bhuktiLord}`}>
                  <td>
                    {fmt(w.start)} – {fmt(w.end)}
                    {w.isCurrent && <span className="pass"> (running)</span>}
                  </td>
                  <td>
                    {w.dasaLord}–{w.bhuktiLord}
                  </td>
                  <td className={w.strength === "strong" ? "pass" : ""}>{w.strength}</td>
                  <td style={{ fontSize: 12 }}>
                    {w.antaras.length
                      ? w.antaras.slice(0, 4).map((a) => (
                          <div key={`${a.lord}-${a.start.getTime()}`}>
                            {a.lord} {fmt(a.start)}–{fmt(a.end)}
                            {a.sookshmas.length > 0 && (
                              <div style={{ color: "#9aa0c0", paddingLeft: 8 }}>
                                Sookshma:{" "}
                                {a.sookshmas
                                  .slice(0, 3)
                                  .map((k) => `${k.lord} ${fmt(k.start)}–${fmt(k.end)}`)
                                  .join("; ")}
                              </div>
                            )}
                          </div>
                        ))
                      : "—"}
                  </td>
                  <td>{w.chainConnected.join(", ") || "—"}</td>
                  <td>{w.rpConfirmed.join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {t.windows.length === 0 && t.verdict !== "Denied / Unfavorable" && (
        <p style={{ fontSize: 12, color: "#9aa0c0" }}>
          No qualifying dasa–bhukti window found in the horizon (or timing is not applicable in
          horary mode — use the Ruling Planets).
        </p>
      )}

      {t.triggers.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <strong>Most likely dates (transit trigger) · தேதிகள்</strong>
          <div style={{ fontSize: 12, color: "#9aa0c0" }}>
            Transiting Sun / Jupiter / Saturn on the stars of the event planets. Moon is not scanned.
          </div>
          {t.triggers.map((tr) => (
            <div key={tr.window.start.getTime()} style={{ fontSize: 12, marginTop: 4 }}>
              In {tr.window.dasaLord}–{tr.window.bhuktiLord}:
              {tr.dates.map((d) => (
                <div key={d.start.getTime()} style={{ paddingLeft: 8 }}>
                  <strong className={d.count >= 2 ? "pass" : ""}>
                    {fmt(d.start)} – {fmt(d.end)}
                  </strong>{" "}
                  ({d.planets.join("+")}) — {d.details.join("; ")}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <RemedyList items={t.remedies} />
      {t.tipEn && (
        <div style={{ fontSize: 12, marginTop: 8 }}>
          <strong>Support:</strong> {t.tipEn}
          <div className="tamil" style={{ color: "#9aa0c0" }}>
            {t.tipTa}
          </div>
        </div>
      )}
    </div>
  );
}

export default function KpPredictionsPanel({
  kp,
  birthDate,
  mode,
  question,
  settings,
  topicOverride,
}: {
  kp: KpSystemResult;
  birthDate: Date;
  mode: KpMode;
  question: string;
  settings?: EphemerisSettings;
  /** Manual topic id from the horary picker (overrides keyword match). */
  topicOverride?: string;
}) {
  const report = useMemo(
    () => buildKpPredictionReport(kp, birthDate, new Date(), mode, question, settings),
    [kp, birthDate, mode, question, settings],
  );

  const focusTopicId = topicOverride || report.questionTopicId;

  const ordered = useMemo(() => {
    if (!focusTopicId) return report.topics;
    return [...report.topics].sort(
      (a, b) => Number(b.id === focusTopicId) - Number(a.id === focusTopicId),
    );
  }, [report, focusTopicId]);

  return (
    <section className="card">
      <h3>KP Predictions &amp; Remedies (கணிப்பு &amp; பரிகாரம்)</h3>
      <p style={{ fontSize: 12, color: "#9aa0c0" }}>
        Derived from Cuspal Sub-Lord verdicts, 4-fold significators, Vimshottari timing and Ruling
        Planets. These are indications, not guarantees; gems are optional and advisory only.
      </p>

      <div className="card" style={{ borderLeft: "4px solid #5a8dee" }}>
        <strong>Current period</strong>
        <p style={{ fontSize: 13, margin: "4px 0" }}>{report.currentSummaryEn}</p>
        <p className="tamil" style={{ fontSize: 13, margin: "4px 0", color: "#9aa0c0" }}>
          {report.currentSummaryTa}
        </p>
        <RemedyList items={report.currentRemedies} />
      </div>

      {mode === "horary249" && question.trim() && !focusTopicId && (
        <p style={{ fontSize: 12, color: "#f0b429" }}>
          Could not map the question to a topic; pick one in Horary aids or review all topics below.
        </p>
      )}

      {ordered.map((t) => (
        <TopicCard key={t.id} t={t} highlight={t.id === focusTopicId} />
      ))}
    </section>
  );
}
