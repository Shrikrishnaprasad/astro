import { Link } from "react-router-dom";
import EphemerisAccuracyPanel from "../components/EphemerisAccuracyPanel";
import {
  JYOTISH_FEATURES,
  featuresByStatus,
  type JyotishFeatureStatus,
} from "../data/jyotishScope";

const SECTION_ORDER: JyotishFeatureStatus[] = ["implemented", "partial", "not-planned"];

const SECTION_TITLE: Record<JyotishFeatureStatus, string> = {
  implemented: "Implemented in this app",
  partial: "Partial / simplified",
  "not-planned": "Explicitly not implemented",
};

export default function JyotishDepthPage() {
  return (
    <div>
      <h2>Jyotish depth &amp; scope</h2>
      <p style={{ fontSize: 14, color: "#9aa0c0", maxWidth: 720 }}>
        This catalog matches what the calculation engine and UI actually expose. Features marked
        partial use real chart data but simplified or tradition-dependent rules. Items under
        &quot;not implemented&quot; are omitted on purpose until a verified source is wired in.
      </p>

      {SECTION_ORDER.map((status) => {
        const items = featuresByStatus(status);
        if (items.length === 0) return null;
        return (
          <section key={status} className="card">
            <h3>{SECTION_TITLE[status]}</h3>
            <ul className="jyotish-scope__list">
              {items.map((f) => (
                <li key={f.id} className="jyotish-scope__item">
                  <strong>{f.name}</strong>
                  <span className="jyotish-scope__summary"> — {f.summary}</span>
                  {f.detail && <p className="jyotish-scope__detail">{f.detail}</p>}
                  <p className="jyotish-scope__detail" style={{ fontSize: 11 }}>
                    Menus: {f.pages.filter((p) => p !== "global").join(", ") || "—"}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <EphemerisAccuracyPanel showFullDetails={false} />

      <p style={{ fontSize: 12, color: "#9aa0c0" }}>
        Total catalog entries: {JYOTISH_FEATURES.length}. Full test notes:{" "}
        <Link to="/accuracy">Ephemeris accuracy</Link> · <code>VERIFICATION.md</code>
      </p>
    </div>
  );
}
