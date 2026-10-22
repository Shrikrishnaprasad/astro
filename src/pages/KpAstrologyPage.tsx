import { useMemo, useState } from "react";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import KpSystemPanel from "../components/KpSystemPanel";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import type { EphemerisSettings } from "../engine/ephemerisSettings";
import {
  computeFullKpSystem,
  getKp249Table,
} from "../engine/kp";
import type { BirthInput } from "../engine/types";
import { formatSiderealLongitude } from "../utils/format";

type KpMode = "natal" | "horary249";

export default function KpAstrologyPage() {
  const { resolved } = useEphemerisSettings();
  const [mode, setMode] = useState<KpMode>("natal");
  const [useKpAyanamsa, setUseKpAyanamsa] = useState(true);
  const [horaryNumber, setHoraryNumber] = useState<number>(1);
  const [question, setQuestion] = useState("");
  const [input, setInput] = useState<BirthInput | null>(null);
  const [rpMoment, setRpMoment] = useState<Date>(() => new Date());
  const [tableFilter, setTableFilter] = useState("");

  const effectiveSettings = useMemo((): EphemerisSettings => {
    if (!useKpAyanamsa) return resolved;
    return {
      ...resolved,
      ayanamsa: "kp",
      preferHighPrecision: false,
    };
  }, [resolved, useKpAyanamsa]);

  const kp249Table = useMemo(() => getKp249Table(), []);

  const selected249Entry = useMemo(
    () => kp249Table[Math.min(249, Math.max(1, horaryNumber)) - 1],
    [kp249Table, horaryNumber],
  );

  const kpResult = useMemo(() => {
    if (!input) return null;
    return computeFullKpSystem(
      input.date,
      input.latitude,
      input.longitude,
      effectiveSettings,
      mode === "horary249" ? horaryNumber : undefined,
      rpMoment,
    );
  }, [input, effectiveSettings, mode, horaryNumber, rpMoment]);

  const filtered249Rows = useMemo(() => {
    const q = tableFilter.trim().toLowerCase();
    if (!q) return kp249Table;
    return kp249Table.filter(
      (r) =>
        String(r.number) === q ||
        r.rasiName.toLowerCase().includes(q) ||
        r.nakshatraName.toLowerCase().includes(q) ||
        r.starLord.toLowerCase().includes(q) ||
        r.subLord.toLowerCase().includes(q),
    );
  }, [kp249Table, tableFilter]);

  return (
    <div>
      <h2>KP Astrology System (Krishnamurti Paddhati)</h2>
      <EphemerisAccuracyNotice />
      <p style={{ fontSize: 14, color: "#9aa0c0", maxWidth: 820 }}>
        Complete <strong>Krishnamurti Paddhati (KP)</strong> suite:{" "}
        <strong>12 Placidus House Cusps</strong> (Sign · Star · Sub · Sub-Sub · Prana Lords),{" "}
        <strong>Placidus Bhava Chalit</strong>, <strong>4-Fold KP Significators (A/B/C/D)</strong>{" "}
        with Rahu/Ketu agent &amp; Untenanted planet rules,{" "}
        <strong>1–249 Horary Number Chart</strong>, <strong>Ruling Planets (RP)</strong>, and{" "}
        <strong>Cuspal Sub-Lord Event Promise Analyzer</strong>.
      </p>

      <div className="card">
        <div className="field-row">
          <label>
            KP Chart Mode
            <select value={mode} onChange={(e) => setMode(e.target.value as KpMode)}>
              <option value="natal">KP Natal / Birth Chart (Time-Based Placidus Cusps)</option>
              <option value="horary249">KP 1–249 Horary (Prasna) Number Chart</option>
            </select>
          </label>

          <label style={{ marginTop: 18 }}>
            <input
              type="checkbox"
              checked={useKpAyanamsa}
              onChange={(e) => setUseKpAyanamsa(e.target.checked)}
            />
            Use KP (Krishnamurti) Ayanamsa (uncheck to use global Ephemeris Ayanamsa)
          </label>
        </div>

        {mode === "horary249" && (
          <div style={{ marginTop: 12 }}>
            <div className="field-row" style={{ alignItems: "flex-end" }}>
              <label>
                KP Horary Number (1–249)
                <input
                  type="number"
                  min={1}
                  max={249}
                  value={horaryNumber}
                  onChange={(e) =>
                    setHoraryNumber(Math.min(249, Math.max(1, Number(e.target.value) || 1)))
                  }
                />
              </label>
              <button
                type="button"
                onClick={() => setHoraryNumber(Math.floor(Math.random() * 249) + 1)}
              >
                Pick Random KP Number (1–249)
              </button>
            </div>
            {selected249Entry && (
              <p style={{ fontSize: 13, color: "#8fd19e", marginTop: 6 }}>
                <strong>Horary #{selected249Entry.number}:</strong> {selected249Entry.rasiName}{" "}
                (Sign Lord: {selected249Entry.rasiLord}) · Star:{" "}
                {selected249Entry.nakshatraName} ({selected249Entry.starLord}) ·{" "}
                <strong>Sub-Lord: {selected249Entry.subLord}</strong> ·{" "}
                {formatSiderealLongitude(selected249Entry.startLongitude)}–
                {formatSiderealLongitude(selected249Entry.endLongitude)}
              </p>
            )}
            <label style={{ display: "block", marginTop: 8 }}>
              Horary Question (optional)
              <input
                type="text"
                placeholder="Enter the question being asked..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                style={{ width: "100%" }}
              />
            </label>
          </div>
        )}
      </div>

      <DateTimePlaceForm
        submitToCalculate
        submitLabel={
          mode === "horary249"
            ? `Cast KP Horary #${horaryNumber} Chart`
            : "Calculate KP Natal Chart"
        }
        onChange={(inp) => {
          setInput(inp);
          if (inp) setRpMoment(new Date());
        }}
      />

      {!kpResult && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter the date, time, and place above, then click{" "}
          <strong>
            {mode === "horary249"
              ? `Cast KP Horary #${horaryNumber} Chart`
              : "Calculate KP Natal Chart"}
          </strong>
          .
        </p>
      )}

      {kpResult && (
        <>
          {mode === "horary249" && question.trim() && (
            <div className="card">
              <strong>Question:</strong> {question.trim()}
            </div>
          )}
          <KpSystemPanel
            kp={kpResult}
            onRefreshRulingPlanets={() => setRpMoment(new Date())}
          />
        </>
      )}

      <details className="card" style={{ marginTop: 16 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 16 }}>
          Reference: Complete 1–249 KP Sub-Lord Table
        </summary>
        <div style={{ marginTop: 12 }}>
          <div className="field-row" style={{ marginBottom: 10 }}>
            <label style={{ flex: 1 }}>
              Search 1–249 by Number, Rasi, Nakshatra, Star Lord, or Sub-Lord:
              <input
                type="text"
                placeholder="e.g. 108, Simha, Rohini, Venus..."
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value)}
              />
            </label>
          </div>
          <div className="chart-scroll" style={{ maxHeight: 420, overflowY: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>KP #</th>
                  <th>Rasi (Sign Lord)</th>
                  <th>Nakshatra</th>
                  <th>Star Lord</th>
                  <th>Sub-Lord</th>
                  <th>Sidereal Span</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered249Rows.map((row) => (
                  <tr key={row.number}>
                    <td>
                      <strong>#{row.number}</strong>
                    </td>
                    <td>
                      {row.rasiName} ({row.rasiLord})
                    </td>
                    <td>{row.nakshatraName}</td>
                    <td>{row.starLord}</td>
                    <td className="pass">
                      <strong>{row.subLord}</strong>
                    </td>
                    <td>
                      {formatSiderealLongitude(row.startLongitude)} –{" "}
                      {formatSiderealLongitude(row.endLongitude)}
                    </td>
                    <td>
                      <button
                        type="button"
                        style={{ padding: "2px 8px", fontSize: 12 }}
                        onClick={() => {
                          setMode("horary249");
                          setHoraryNumber(row.number);
                        }}
                      >
                        Use #{row.number}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>
    </div>
  );
}
