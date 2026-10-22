import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DateTimePlaceForm, { birthFormToInput, type BirthFormValue } from "../components/DateTimePlaceForm";
import EphemerisSettingsPanel from "../components/EphemerisSettingsPanel";
import PlanetTable from "../components/PlanetTable";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import { RASIS } from "../data/rasis";
import { computeDailyEphemerisRows, computeEphemerisSnapshot } from "../engine/ephemerisSnapshot";
import type { BirthInput } from "../engine/types";
import { PLANETS } from "../engine/types";
import { formatDegreeInRasi, formatSiderealLongitude } from "../utils/format";

const DAILY_LOCAL_HOURS = [0, 6, 12, 18];

export default function EphemerisPage() {
  const { resolved, label } = useEphemerisSettings();
  const [input, setInput] = useState<BirthInput | null>(null);
  const [formRaw, setFormRaw] = useState<BirthFormValue | null>(null);
  const [mode, setMode] = useState<"moment" | "daily">("moment");

  const snapshot = useMemo(() => {
    if (!input) return null;
    return computeEphemerisSnapshot(input.date, input.latitude, input.longitude, resolved);
  }, [input, resolved]);

  const dailyRows = useMemo(() => {
    if (!input || !formRaw || mode !== "daily") return null;
    const tz = formRaw.useManual
      ? Number(formRaw.manualTz)
      : formRaw.place.tzOffsetHours;
    if (Number.isNaN(tz)) return null;
    return computeDailyEphemerisRows(
      formRaw.dateStr,
      input.latitude,
      input.longitude,
      tz,
      DAILY_LOCAL_HOURS,
      resolved,
    );
  }, [input, formRaw, mode, resolved]);

  const lagnaRasiIndex = snapshot ? Math.floor(snapshot.lagnaLongitude / 30) : undefined;

  return (
    <div>
      <h2>Ephemeris</h2>
      <p style={{ fontSize: 14, color: "#9aa0c0", maxWidth: 720 }}>
        Sidereal graha longitudes for any date, time, and place using your calculation options
        below. Tropical positions come from astronomy-engine; sidereal values subtract the selected
        ayanamsa. This is not Swiss Ephemeris — see{" "}
        <Link to="/accuracy">Ephemeris accuracy</Link> for limits.
      </p>

      <EphemerisSettingsPanel />

      <DateTimePlaceForm
        submitToCalculate
        submitLabel="Show ephemeris"
        onChange={(next, raw) => {
          setInput(next);
          setFormRaw(raw);
        }}
      />

      <div className="card field-row">
        <label>
          View
          <select value={mode} onChange={(e) => setMode(e.target.value as "moment" | "daily")}>
            <option value="moment">Single moment</option>
            <option value="daily">Daily sheet (00 / 06 / 12 / 18 local)</option>
          </select>
        </label>
      </div>

      {!snapshot && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter date, time, and place, then click <strong>Show ephemeris</strong>.
        </p>
      )}

      {snapshot && mode === "moment" && input && (
        <>
          <div className="card">
            <p>
              <strong>Instant (UTC):</strong> {input.date.toISOString()}
            </p>
            <p>
              <strong>Frame:</strong> {label}
            </p>
            <p>
              <strong>Ayanamsa:</strong> {formatSiderealLongitude(snapshot.ayanamsaDegrees)}
            </p>
            <p>
              <strong>Lagna:</strong>{" "}
              {RASIS[lagnaRasiIndex!].nameEnglish}{" "}
              <span className="tamil">({RASIS[lagnaRasiIndex!].nameTamil})</span>{" "}
              {formatDegreeInRasi(snapshot.lagnaLongitude - lagnaRasiIndex! * 30)}
            </p>
          </div>
          <PlanetTable
            longitudes={snapshot.siderealLongitudes}
            date={input.date}
            lagnaRasiIndex={lagnaRasiIndex}
            showSiderealLongitude
          />
        </>
      )}

      {snapshot && mode === "daily" && dailyRows && formRaw && (
        <>
          <div className="card">
            <p>
              <strong>Date:</strong> {formRaw.dateStr} · <strong>Frame:</strong> {label}
            </p>
            <p style={{ fontSize: 12, color: "#9aa0c0" }}>
              Times are local clock at the place&apos;s UTC offset (
              {formRaw.useManual ? formRaw.manualTz : formRaw.place.tzOffsetHours} h). Moon sidereal
              λ shown; use single-moment view for full tables.
            </p>
          </div>
          <div className="chart-scroll">
            <table>
              <thead>
                <tr>
                  <th>Local time</th>
                  {PLANETS.map((p) => (
                    <th key={p}>{p}</th>
                  ))}
                  <th>Lagna λ</th>
                </tr>
              </thead>
              <tbody>
                {dailyRows.map((row) => (
                  <tr key={row.localTime}>
                    <td>{row.localTime}</td>
                    {PLANETS.map((p) => (
                      <td key={p}>
                        {formatSiderealLongitude(row.snapshot.siderealLongitudes[p])}
                      </td>
                    ))}
                    <td>{formatSiderealLongitude(row.snapshot.lagnaLongitude)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
