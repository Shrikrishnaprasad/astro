import { Link } from "react-router-dom";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import {
  EPHEMERIS_AUTOMATED_TESTS,
  EPHEMERIS_FOLLOW_UP,
  EPHEMERIS_LIMITS,
  EPHEMERIS_MANUAL_SPOTCHECK,
  EPHEMERIS_SUITABILITY_SUMMARY,
} from "../data/ephemerisAccuracy";

export function EphemerisAccuracyNotice() {
  const { label } = useEphemerisSettings();
  return (
    <p className="card ephemeris-notice">
      {EPHEMERIS_SUITABILITY_SUMMARY} Active frame: {label}.{" "}
      <Link to="/accuracy">Ephemeris accuracy &amp; options</Link>
    </p>
  );
}

export default function EphemerisAccuracyPanel({ showFullDetails = true }: { showFullDetails?: boolean }) {
  return (
    <section className="card ephemeris-accuracy">
      <h3 className="ephemeris-accuracy__title">Ephemeris accuracy</h3>
      <p className="ephemeris-notice__lead">{EPHEMERIS_SUITABILITY_SUMMARY}</p>

      <ul className="jyotish-scope__list">
        {EPHEMERIS_LIMITS.map((limit) => (
          <li key={limit.id} className="jyotish-scope__item">
            <strong>{limit.title}</strong>
            <span className="jyotish-scope__summary"> — {limit.summary}</span>
            <p className="jyotish-scope__detail">{limit.detail}</p>
            <p className="jyotish-scope__detail" style={{ fontSize: 11 }}>
              Engine: <code>{limit.engineRef}</code>
            </p>
          </li>
        ))}
      </ul>

      {showFullDetails && (
        <>
          <h4 className="ephemeris-accuracy__subtitle">Automated tests ({EPHEMERIS_AUTOMATED_TESTS.length})</h4>
          <ul className="ephemeris-accuracy__bullets">
            {EPHEMERIS_AUTOMATED_TESTS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="jyotish-scope__detail">{EPHEMERIS_MANUAL_SPOTCHECK}</p>
          <p className="jyotish-scope__detail">
            <strong>Suggested follow-up:</strong> {EPHEMERIS_FOLLOW_UP}
          </p>
          <p className="jyotish-scope__detail" style={{ fontSize: 11 }}>
            Repository copy: <code>VERIFICATION.md</code> (same content as this page).
          </p>
        </>
      )}
    </section>
  );
}
