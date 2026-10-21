import EphemerisAccuracyPanel from "../components/EphemerisAccuracyPanel";
import EphemerisSettingsPanel from "../components/EphemerisSettingsPanel";

export default function EphemerisAccuracyPage() {
  return (
    <div>
      <h2>Ephemeris accuracy &amp; verification</h2>
      <p style={{ fontSize: 14, color: "#9aa0c0", maxWidth: 720 }}>
        Design target for this app is <strong>sign- and nakshatra-level</strong> Vedic/Tamil astrology in
        the browser — not arcsecond professional ephemeris. The limits below are intentional for v1;
        they are documented in <code>VERIFICATION.md</code> and enforced in unit tests where applicable.
      </p>
      <EphemerisSettingsPanel />
      <EphemerisAccuracyPanel showFullDetails />
    </div>
  );
}
