import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import {
  DNA_KARMA_PLANETS,
  DNA_TOPIC_LABELS,
  type DnaKarmaPlanet,
  type DnaTopicRole,
} from "../data/dnaAstrology";
import { NAKSHATRAS } from "../data/nakshatras";
import { RASIS } from "../data/rasis";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import {
  computeDnaCore,
  computeDnaTiming,
  dnaGuidanceFor,
  inferAllDnaTopics,
  inferDnaTopicPattern,
  scoreDnaMatch,
} from "../engine/dnaAstrology";
import { getSiderealLongitudes } from "../engine/planetaryPositions";
import type { BirthInput } from "../engine/types";
import { computeChart } from "../hooks/useBirthChart";

const TOPIC_ROLES = Object.keys(DNA_TOPIC_LABELS) as DnaTopicRole[];

export default function DnaAstrologyPage() {
  const { resolved } = useEphemerisSettings();
  const [input, setInput] = useState<BirthInput | null>(null);
  const [otherInput, setOtherInput] = useState<BirthInput | null>(null);
  const [topic, setTopic] = useState<DnaTopicRole>("spouse");
  const [matchRole, setMatchRole] = useState<DnaTopicRole>("spouse");
  const [guidancePlanet, setGuidancePlanet] = useState<DnaKarmaPlanet>("Sun");

  const chart = useMemo(
    () => (input ? computeChart(input, resolved) : null),
    [input, resolved],
  );
  const otherChart = useMemo(
    () => (otherInput ? computeChart(otherInput, resolved) : null),
    [otherInput, resolved],
  );

  const core = useMemo(() => (chart ? computeDnaCore(chart) : null), [chart]);
  const topics = useMemo(() => (chart ? inferAllDnaTopics(chart) : null), [chart]);
  const activeTopic = useMemo(
    () => (chart ? inferDnaTopicPattern(chart, topic) : null),
    [chart, topic],
  );

  const matchPattern = useMemo(
    () => (chart ? inferDnaTopicPattern(chart, matchRole) : null),
    [chart, matchRole],
  );
  const match = useMemo(
    () => (matchPattern && otherChart ? scoreDnaMatch(matchPattern, otherChart) : null),
    [matchPattern, otherChart],
  );

  const timing = useMemo(() => {
    if (!chart || !input || !core) return null;
    const now = new Date();
    const transit = getSiderealLongitudes(now, resolved);
    return computeDnaTiming(chart, input.date, core, transit, now);
  }, [chart, input, core, resolved]);

  const selectedGuidance = dnaGuidanceFor(guidancePlanet);

  return (
    <div>
      <h2>DNA Astrology (மரபணு ஜோதிடம்)</h2>
      <EphemerisAccuracyNotice />
      <p className="card" style={{ fontSize: 14, color: "#9aa0c0" }}>
        Public Vishal / Karumbu-style karmic registries: Lagna star, Lagna-lord star, and Moon
        star (weights 100 / 100 / 50), plus planet birth-star, sign, and house DNA maps. This is a{" "}
        <strong>guidance / pattern</strong> tool — not classical predictive jyotish. Dasa and
        transit lines are heuristic highlights only. See{" "}
        <Link to="/jyotish-scope">Jyotish scope</Link>.
      </p>

      <div className="card">
        <h3>Native chart</h3>
        <DateTimePlaceForm
          submitToCalculate
          submitLabel="Calculate DNA report"
          onChange={setInput}
        />
      </div>

      {!chart && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter date, time, and place, then calculate.
        </p>
      )}

      {core && (
        <>
          <div className="card">
            <h3>Core DNA karmas</h3>
            <table>
              <thead>
                <tr>
                  <th>Pillar</th>
                  <th>Weight</th>
                  <th>Nakshatra</th>
                  <th>Karma</th>
                </tr>
              </thead>
              <tbody>
                {core.pillars.map((p) => (
                  <tr key={p.id}>
                    <td>{p.label}</td>
                    <td>{p.weight}%</td>
                    <td>
                      {p.nakshatraName} ({NAKSHATRAS[p.nakshatraIndex].nameTamil})
                    </td>
                    <td>{p.karmaPlanet ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ fontSize: 13, marginTop: 12 }}>
              Lagna lord: <strong>{core.lagnaLord}</strong>
            </p>
            <h4>Ranked karmas</h4>
            <table>
              <thead>
                <tr>
                  <th>Planet</th>
                  <th>Weight</th>
                  <th>% of max</th>
                  <th>From pillars</th>
                </tr>
              </thead>
              <tbody>
                {core.rankedKarmas.map((k) => (
                  <tr key={k.planet}>
                    <td>{k.planet}</td>
                    <td>{k.weight}</td>
                    <td>{k.percent}%</td>
                    <td>{k.pillars.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Registries (this chart)</h3>
            <h4>Planets as DNA carriers</h4>
            <table>
              <thead>
                <tr>
                  <th>Planet</th>
                  <th>House</th>
                  <th>Rasi</th>
                  <th>Carries karma</th>
                  <th>Sign karmas</th>
                </tr>
              </thead>
              <tbody>
                {core.planetRows.map((row) => (
                  <tr key={row.planet}>
                    <td>{row.planet}</td>
                    <td>{row.house}</td>
                    <td>{RASIS[row.rasiIndex].nameEnglish}</td>
                    <td>{row.carriesKarma ?? "—"}</td>
                    <td>{row.signKarmas.join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4>Houses</h4>
            <table>
              <thead>
                <tr>
                  <th>House</th>
                  <th>Rasi</th>
                  <th>House karma</th>
                  <th>Sign karma</th>
                </tr>
              </thead>
              <tbody>
                {core.houseRows.map((row) => (
                  <tr key={row.house}>
                    <td>{row.house}</td>
                    <td>{row.rasiName}</td>
                    <td>{row.houseKarmas.join(", ") || "—"}</td>
                    <td>{row.signKarmas.join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Guidance</h3>
            <div className="field-row">
              <label>
                Karma planet{" "}
                <select
                  value={guidancePlanet}
                  onChange={(e) => setGuidancePlanet(e.target.value as DnaKarmaPlanet)}
                >
                  {DNA_KARMA_PLANETS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                      {core.rankedKarmas.some((k) => k.planet === p) ? " ★" : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p>
              <strong>{guidancePlanet}</strong> — {selectedGuidance.english}
            </p>
            <p style={{ fontSize: 13, color: "#c8c4e0" }}>{selectedGuidance.tamil}</p>
            <p style={{ fontSize: 13 }}>
              <em>Family professions:</em> {selectedGuidance.familyProfessions}
            </p>
            <p style={{ fontSize: 13 }}>
              <em>Caution:</em> {selectedGuidance.caution}
            </p>
          </div>

          <div className="card">
            <h3>Life topics</h3>
            <div className="field-row" style={{ flexWrap: "wrap", gap: 8 }}>
              {TOPIC_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={topic === role ? "active" : undefined}
                  onClick={() => setTopic(role)}
                >
                  {DNA_TOPIC_LABELS[role].english}
                </button>
              ))}
            </div>
            {activeTopic && (
              <>
                <p style={{ fontSize: 13, color: "#9aa0c0" }}>
                  {activeTopic.labelTamil} — {activeTopic.notes.join(" ")}
                </p>
                <p>
                  <strong>Karma planets:</strong> {activeTopic.karmaPlanets.join(", ") || "—"}
                </p>
                <p>
                  <strong>Expected nakshatras:</strong>{" "}
                  {activeTopic.expectedNakshatraIndices
                    .map((i) => NAKSHATRAS[i].nameEnglish)
                    .join(", ") || "—"}
                </p>
                <p>
                  <strong>Carrier planets:</strong>{" "}
                  {activeTopic.expectedCarrierPlanets.join(", ") || "—"}
                </p>
                <p>
                  <strong>Signs:</strong>{" "}
                  {activeTopic.expectedSignIndices.map((i) => RASIS[i].nameEnglish).join(", ") ||
                    "—"}
                </p>
                <p>
                  <strong>Houses:</strong> {activeTopic.expectedHouses.join(", ") || "—"}
                </p>
                {activeTopic.oppositeNakshatraIndices.length > 0 && (
                  <p style={{ fontSize: 13 }}>
                    Opposition band:{" "}
                    {activeTopic.oppositeNakshatraIndices
                      .map((i) => NAKSHATRAS[i].nameEnglish)
                      .join(", ")}
                  </p>
                )}
              </>
            )}
            {topics && (
              <p style={{ fontSize: 12, color: "#7a7f9c", marginTop: 8 }}>
                All topics computed: {topics.map((t) => t.labelEnglish).join(" · ")}
              </p>
            )}
          </div>

          <div className="card">
            <h3>Match second chart</h3>
            <p style={{ fontSize: 13, color: "#9aa0c0" }}>
              Infer expected DNA pattern from the native, then score another birth chart against
              that checklist (transparent hits, 0–100).
            </p>
            <div className="field-row">
              <label>
                Role{" "}
                <select
                  value={matchRole}
                  onChange={(e) => setMatchRole(e.target.value as DnaTopicRole)}
                >
                  {TOPIC_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {DNA_TOPIC_LABELS[role].english}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <DateTimePlaceForm
              submitToCalculate
              submitLabel="Score second chart"
              onChange={setOtherInput}
            />
            {match && (
              <>
                <p>
                  <strong>Score: {match.score}</strong> — {match.summary}
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Check</th>
                      <th>Hit</th>
                      <th>Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.hits.map((h) => (
                      <tr key={h.id}>
                        <td>{h.label}</td>
                        <td className={h.matched ? "pass" : "fail"}>
                          {h.matched ? "Yes" : "No"}
                        </td>
                        <td>{h.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>

          {timing && (
            <div className="card">
              <h3>Timing (heuristic)</h3>
              <p style={{ fontSize: 13 }}>
                Current Mahadasa: <strong>{timing.mahadasaLord ?? "—"}</strong> · Bhukti:{" "}
                <strong>{timing.bhuktiLord ?? "—"}</strong>
              </p>
              <ul>
                {timing.notes.map((n, i) => (
                  <li key={`${n.kind}-${i}`}>
                    <span style={{ color: n.kind === "dasa" ? "#e7b96e" : "#6eb8e7" }}>
                      [{n.kind}]
                    </span>{" "}
                    {n.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
