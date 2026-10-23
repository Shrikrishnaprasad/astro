import type { PredictionQa, QaTone } from "../engine/predictionResults";

const TONE_CLASS: Record<QaTone, string> = {
  supportive: "pass",
  strained: "fail",
  mixed: "",
  past: "qa-tone-past",
  upcoming: "qa-tone-next",
};

export default function PredictionQaPanel({
  title,
  rows,
}: {
  title: string;
  rows: PredictionQa[];
}) {
  if (rows.length === 0) {
    return (
      <section className="card">
        <h3>{title}</h3>
        <p>No prediction rows for the current significators.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <h3>{title}</h3>
      <p style={{ fontSize: 13, color: "#9aa0c0" }}>
        Possible questions and answers from this app&apos;s graha-karaka list (and two-planet yogas).
        These are indications, not a reprint of any book, and not a yes/no guarantee.
      </p>
      <p style={{ fontSize: 12, color: "#7a8199" }}>{rows.length} question–answer rows</p>
      <table className="qa-table">
        <thead>
          <tr>
            <th>Source</th>
            <th>Possible question</th>
            <th>Possible answer</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.source}-${row.question}-${index}`}>
              <td>{row.source}</td>
              <td>{row.question}</td>
              <td className={TONE_CLASS[row.tone]}>{row.answer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
