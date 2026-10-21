import type { AyanamsaMode, LunarNodeMode } from "../engine/ephemerisSettings";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";

export default function EphemerisSettingsPanel() {
  const { settings, resolved, label, setAyanamsa, setNodeMode, setPreferHighPrecision } =
    useEphemerisSettings();

  return (
    <section className="card ephemeris-settings">
      <h3 className="ephemeris-accuracy__title">Calculation options</h3>
      <p className="jyotish-scope__detail">
        Active: <strong>{label}</strong>. High precision uses Lahiri + nutation and true node;
        graha longitudes still come from astronomy-engine (not Swiss Ephemeris).
      </p>
      <div className="field-row">
        <label>
          <input
            type="checkbox"
            checked={settings.preferHighPrecision}
            onChange={(e) => setPreferHighPrecision(e.target.checked)}
          />
          Prefer high precision (Lahiri + nutation, true node)
        </label>
      </div>
      {!settings.preferHighPrecision && (
        <>
          <div className="field-row">
            <label>
              Ayanamsa
              <select
                value={settings.ayanamsa}
                onChange={(e) => setAyanamsa(e.target.value as AyanamsaMode)}
              >
                <option value="lahiri-mean">Lahiri (mean)</option>
                <option value="lahiri-true">Lahiri (mean + nutation)</option>
                <option value="raman">Raman</option>
                <option value="kp">KP ayanamsa (22°27′37″ @ 1900)</option>
              </select>
            </label>
            <label>
              Rahu / Ketu
              <select
                value={settings.nodeMode}
                onChange={(e) => setNodeMode(e.target.value as LunarNodeMode)}
              >
                <option value="mean">Mean node</option>
                <option value="true">True node</option>
              </select>
            </label>
          </div>
        </>
      )}
      {settings.preferHighPrecision && (
        <p className="jyotish-scope__detail">
          Resolved: {resolved.ayanamsa}, {resolved.nodeMode} node
        </p>
      )}
      {(settings.ayanamsa === "kp" || settings.ayanamsa === "krishnamurti") && (
        <p className="jyotish-scope__detail">
          KP formula: 22°27′37″ at year 1900 + (calendar year − 1900) × 50.2388475″. Use with{" "}
          <strong>true node</strong> for typical KP charts. Sub-lords on Advanced Jyotish / Prasna.
        </p>
      )}
    </section>
  );
}
