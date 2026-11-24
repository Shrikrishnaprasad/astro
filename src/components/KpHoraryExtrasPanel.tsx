import { useMemo } from "react";
import type { KpSystemResult } from "../engine/kp";
import { judgeKpHoraryExtras } from "../engine/kpHorary";
import { matchKpTopicDetailed } from "../engine/kpHorary";
import { KP_EVENT_TOPICS } from "../engine/kp";

export default function KpHoraryExtrasPanel({
  kp,
  question,
  topicOverride,
  onTopicChange,
}: {
  kp: KpSystemResult;
  question: string;
  topicOverride: string;
  onTopicChange: (id: string) => void;
}) {
  const judgment = useMemo(() => judgeKpHoraryExtras(kp), [kp]);
  const matched = useMemo(() => matchKpTopicDetailed(question), [question]);
  const effectiveTopic = topicOverride || matched.topicId || "";

  return (
    <section className="card" style={{ borderLeft: "4px solid #f0b429" }}>
      <h3>KP Horary Judgment Aids (பிரசன்ன உதவி)</h3>
      <p style={{ fontSize: 13 }}>{judgment.summaryEn}</p>
      <p className="tamil" style={{ fontSize: 13, color: "#9aa0c0" }}>
        {judgment.summaryTa}
      </p>
      <p style={{ fontSize: 12 }}>
        Moon: {judgment.moonRetroNoteEn}{" "}
        <span className="tamil">({judgment.moonRetroNoteTa})</span>
      </p>
      {judgment.nodeNotes.length > 0 && (
        <ul style={{ fontSize: 12, margin: "4px 0" }}>
          {judgment.nodeNotes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}

      <div className="field-row" style={{ marginTop: 8 }}>
        <label>
          Question topic (picker overrides keyword match)
          <select
            value={effectiveTopic}
            onChange={(e) => onTopicChange(e.target.value)}
          >
            <option value="">— Auto from question —</option>
            {KP_EVENT_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.topic}
              </option>
            ))}
          </select>
        </label>
      </div>
      {matched.topicId && !topicOverride && (
        <p style={{ fontSize: 12, color: "#8fd19e" }}>
          Keyword match: <strong>{matched.topicId}</strong> (words: {matched.matchedWords.join(", ")})
        </p>
      )}
    </section>
  );
}
