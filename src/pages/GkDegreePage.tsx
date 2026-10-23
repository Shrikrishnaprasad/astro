import { useMemo, useState } from "react";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import JyotishScopePanel from "../components/JyotishScopePanel";
import PredictionQaPanel from "../components/PredictionQaPanel";
import type { ChartMarker } from "../components/SouthIndianChart";
import SouthIndianChart from "../components/SouthIndianChart";
import { CHANDRA_NADI_NOTES, GK_POINT_THEMES, GK_RULE_NOTES } from "../data/gkDegreeNotes";
import { LAGNA_TAMIL, MANDHI_TAMIL, PLANET_TAMIL_ABBR, PLANET_TAMIL_NAME } from "../data/planetsTamil";
import { RASIS } from "../data/rasis";
import { getSiderealAscendant } from "../engine/ascendant";
import {
  computeVimshottariDasa,
  findActiveMahadasaAndBhukti,
} from "../engine/dasa";
import { computeChandraNadi } from "../engine/chandraNadi";
import {
  buildChandraNadiPredictions,
  buildDegreeSystemPredictions,
} from "../engine/predictionResults";
import {
  computeGkNatal,
  computeGkSensitiveTransitHits,
  computeGkSynastry,
  computeGkTransitHits,
  isGkHealthDasaLord,
  pairInvolvesLords,
  type GkPointId,
} from "../engine/gkDegree";
import { getRetrogradeStatus, shouldShowRetrograde } from "../engine/retrograde";
import { computeMandhi } from "../engine/specialPoints";
import type { BirthInput, Planet } from "../engine/types";
import { PLANETS } from "../engine/types";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import { useBirthChart } from "../hooks/useBirthChart";
import { useCurrentTransit } from "../hooks/useCurrentTransit";
import { formatDegreeInRasi, formatSiderealLongitude } from "../utils/format";

function pointLabel(id: GkPointId): string {
  if (id === "Lagna") return `Lagna (${LAGNA_TAMIL})`;
  return `${id} (${PLANET_TAMIL_NAME[id]})`;
}

function rasiDegree(rasiIndex: number, degree: number): string {
  return `${RASIS[rasiIndex].nameEnglish} ${formatDegreeInRasi(degree)}`;
}

export default function GkDegreePage() {
  const { resolved } = useEphemerisSettings();
  const [input, setInput] = useState<BirthInput | null>(null);
  const [otherInput, setOtherInput] = useState<BirthInput | null>(null);
  const [showOther, setShowOther] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const chart = useBirthChart(input);
  const otherChart = useBirthChart(otherInput);
  const { now, longitudes, refresh } = useCurrentTransit(autoRefresh ? 60000 : 0);

  const natal = useMemo(() => (chart ? computeGkNatal(chart) : null), [chart]);
  const otherNatal = useMemo(() => (otherChart ? computeGkNatal(otherChart) : null), [otherChart]);

  const transitLagna = useMemo(() => {
    if (!input) return null;
    return getSiderealAscendant(now, input.latitude, input.longitude, resolved);
  }, [input, now, resolved]);

  const transitMandhi = useMemo(
    () => (input ? computeMandhi(now, input.latitude, input.longitude, resolved) : null),
    [input, now, resolved],
  );

  const natalMandhi = useMemo(
    () => (input ? computeMandhi(input.date, input.latitude, input.longitude, resolved) : null),
    [input, resolved],
  );

  const birthRetrograde = useMemo(
    () => (input ? getRetrogradeStatus(input.date, undefined, resolved) : null),
    [input, resolved],
  );

  const retrograde = useMemo(
    () => getRetrogradeStatus(now, undefined, resolved),
    [now, resolved],
  );

  const cellContents = useMemo(() => {
    const cells: Record<number, ChartMarker[]> = {};
    const push = (rasiIndex: number, marker: ChartMarker) => {
      (cells[rasiIndex] ??= []).push(marker);
    };
    if (!chart) return cells;
    for (const planet of PLANETS) {
      const info = chart.planetRasi[planet];
      const isRetrograde = shouldShowRetrograde(planet, birthRetrograde);
      push(info.rasiIndex, {
        label: PLANET_TAMIL_ABBR[planet],
        kind: "planet",
        title: `${planet} (${PLANET_TAMIL_NAME[planet]})${isRetrograde ? " - Vakram (retrograde)" : ""}`,
        degree: info.degreeInRasi,
        retrograde: isRetrograde,
      });
    }
    push(chart.lagnaRasiIndex, {
      label: LAGNA_TAMIL,
      kind: "lagna",
      title: "ல (Lagna)",
      degree: chart.lagnaDegreeInRasi,
    });
    if (natalMandhi) {
      push(natalMandhi.rasiIndex, {
        label: MANDHI_TAMIL,
        kind: "mandhi",
        title: "மாந் (Mandhi / Gulika)",
        degree: natalMandhi.longitude - natalMandhi.rasiIndex * 30,
      });
    }
    return cells;
  }, [chart, natalMandhi, birthRetrograde]);

  const outerMarkers = useMemo(() => {
    const outer: Record<number, ChartMarker[]> = {};
    const push = (rasiIndex: number, marker: ChartMarker) => {
      (outer[rasiIndex] ??= []).push(marker);
    };
    for (const planet of PLANETS) {
      const longitude = longitudes[planet];
      const rasiIndex = Math.floor(longitude / 30);
      const isRetrograde = shouldShowRetrograde(planet, retrograde);
      push(rasiIndex, {
        label: PLANET_TAMIL_ABBR[planet],
        kind: "transit",
        title: `Gochara (transit): ${planet} (${PLANET_TAMIL_NAME[planet]})${isRetrograde ? " - Vakram (retrograde)" : ""}`,
        degree: longitude - rasiIndex * 30,
        retrograde: isRetrograde,
      });
    }
    if (transitLagna !== null) {
      const rasiIndex = Math.floor(transitLagna / 30);
      push(rasiIndex, {
        label: LAGNA_TAMIL,
        kind: "lagna",
        title: "நடப்பு ல (Transit Lagna)",
        degree: transitLagna - rasiIndex * 30,
      });
    }
    if (transitMandhi) {
      push(transitMandhi.rasiIndex, {
        label: MANDHI_TAMIL,
        kind: "mandhi",
        title: "நடப்பு மாந் (Transit Mandhi)",
        degree: transitMandhi.longitude - transitMandhi.rasiIndex * 30,
      });
    }
    return outer;
  }, [longitudes, transitLagna, transitMandhi, retrograde]);

  const transitHits = useMemo(() => {
    if (!natal || transitLagna == null) return [];
    return computeGkTransitHits(natal, longitudes, transitLagna, retrograde);
  }, [natal, longitudes, transitLagna, retrograde]);

  const sensitiveHits = useMemo(() => {
    if (!natal || transitLagna == null) return [];
    return computeGkSensitiveTransitHits(natal, longitudes, transitLagna);
  }, [natal, longitudes, transitLagna]);

  const synastry = useMemo(() => {
    if (!natal || !otherNatal) return [];
    return computeGkSynastry(natal, otherNatal);
  }, [natal, otherNatal]);

  const dasaNote = useMemo(() => {
    if (!natal || !chart || !input) return null;
    const mahadasas = computeVimshottariDasa(chart.planetLongitudes.Moon, input.date, 1, 1);
    const { mahadasa, bhukti } = findActiveMahadasaAndBhukti(mahadasas, now);
    if (!mahadasa) return null;
    const lords = [mahadasa.lord, bhukti?.lord].filter(Boolean) as string[];
    const highLowHit = lords.filter((lord) => isGkHealthDasaLord(natal, lord));
    const pairHit = natal.combinations.filter((pair) => pairInvolvesLords(pair, lords));
    return { mahadasa: mahadasa.lord, bhukti: bhukti?.lord ?? "—", highLowHit, pairHit };
  }, [natal, chart, input, now]);

  const chandraNadi = useMemo(
    () => (chart ? computeChandraNadi(chart.planetLongitudes, longitudes.Moon) : null),
    [chart, longitudes.Moon],
  );

  const degreePredictions = useMemo(() => {
    if (!natal) return [];
    const lords = dasaNote ? [dasaNote.mahadasa, dasaNote.bhukti].filter((l) => l && l !== "—") : [];
    return buildDegreeSystemPredictions(natal, natal.combinations, transitHits, lords);
  }, [natal, transitHits, dasaNote]);

  const chandraNadiPredictions = useMemo(
    () => (chandraNadi ? buildChandraNadiPredictions(chandraNadi) : []),
    [chandraNadi],
  );

  const lagnaHits = transitHits.filter((h) => h.transit === "Lagna");
  const moonHits = transitHits.filter((h) => h.transit === "Moon");

  return (
    <div>
      <h2>Degree System (பாகை முறை)</h2>
      <EphemerisAccuracyNotice />
      <p style={{ fontSize: 14, color: "#9aa0c0", maxWidth: 820 }}>
        Degree method: rank grahas by <strong>degree inside the rasi</strong>, treat ±3° as a yoga
        even across signs, and time events when transit Lagna / Moon / grahas meet those natal
        degrees.
      </p>
      <p style={{ fontSize: 12, color: "#7a8199", maxWidth: 820 }}>{GK_RULE_NOTES.source}</p>

      <DateTimePlaceForm submitToCalculate submitLabel="Calculate natal chart" onChange={setInput} />

      {!chart && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter birth data and click <strong>Calculate natal chart</strong>.
        </p>
      )}

      {natal && chart && (
        <>
          <div className="card">
            <strong>Lagna (Ascendant) / உதயம்:</strong>{" "}
            {RASIS[chart.lagnaRasiIndex].nameEnglish}{" "}
            <span className="tamil">({RASIS[chart.lagnaRasiIndex].nameTamil})</span>{" "}
            {formatDegreeInRasi(chart.lagnaDegreeInRasi)}
          </div>

          <div className="card field-row">
            <span>Live transit (Gochara) as of: {now.toLocaleString()}</span>
            <button type="button" onClick={refresh}>
              Refresh now
            </button>
            <label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh every minute
            </label>
          </div>

          <div className="chart-pair">
            <div className="chart-pair__item">
              <h3 className="chart-pair__title">Rasi (D1)</h3>
              <SouthIndianChart cellContents={cellContents} outerMarkers={outerMarkers} />
              <p className="chart-pair__hint">
                Inside: natal grahas, Lagna, Mandhi. Outer ring: live Gochara grahas, Lagna, Mandhi
                at the birth place.
              </p>
            </div>
          </div>

          <section className="card">
            <h3>Highest &amp; lowest degree</h3>
            <p style={{ fontSize: 13, color: "#9aa0c0" }}>{GK_RULE_NOTES.highLow}</p>
            <div className="gk-highlow">
              <div>
                <strong>Highest — {pointLabel(natal.highest.id)}</strong>
                <div>
                  {rasiDegree(natal.highest.rasiIndex, natal.highest.degreeInRasi)}
                </div>
                {natal.highest.id !== "Lagna" && (
                  <p className="gk-theme">
                    {GK_POINT_THEMES[natal.highest.id as Planet].en}
                    <br />
                    <span className="tamil">{GK_POINT_THEMES[natal.highest.id as Planet].ta}</span>
                  </p>
                )}
              </div>
              <div>
                <strong>Lowest — {pointLabel(natal.lowest.id)}</strong>
                <div>
                  {rasiDegree(natal.lowest.rasiIndex, natal.lowest.degreeInRasi)}
                </div>
                {natal.lowest.id !== "Lagna" && (
                  <p className="gk-theme">
                    {GK_POINT_THEMES[natal.lowest.id as Planet].en}
                    <br />
                    <span className="tamil">{GK_POINT_THEMES[natal.lowest.id as Planet].ta}</span>
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="card">
            <h3>Degree table (ராசிக்குள் பாகை)</h3>
            <table className="gk-degree-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Graha</th>
                  <th>Rasi</th>
                  <th>Degree</th>
                  <th>Sidereal λ</th>
                </tr>
              </thead>
              <tbody>
                {natal.rankedPlanets.map((point, index) => (
                  <tr
                    key={point.id}
                    className={
                      point.id === natal.highest.id
                        ? "gk-row--high"
                        : point.id === natal.lowest.id
                          ? "gk-row--low"
                          : undefined
                    }
                  >
                    <td>{index + 1}</td>
                    <td>{pointLabel(point.id)}</td>
                    <td>
                      {RASIS[point.rasiIndex].nameEnglish}{" "}
                      <span className="tamil">({RASIS[point.rasiIndex].nameTamil})</span>
                    </td>
                    <td>{formatDegreeInRasi(point.degreeInRasi)}</td>
                    <td>{formatSiderealLongitude(point.longitude)}</td>
                  </tr>
                ))}
                <tr>
                  <td>—</td>
                  <td>{pointLabel("Lagna")}</td>
                  <td>
                    {RASIS[chart.lagnaRasiIndex].nameEnglish}{" "}
                    <span className="tamil">({RASIS[chart.lagnaRasiIndex].nameTamil})</span>
                  </td>
                  <td>{formatDegreeInRasi(chart.lagnaDegreeInRasi)}</td>
                  <td>{formatSiderealLongitude(chart.lagnaLongitude)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="card">
            <h3>Paagai combinations (±3°)</h3>
            <p style={{ fontSize: 13, color: "#9aa0c0" }}>{GK_RULE_NOTES.orb}</p>
            {natal.combinations.length === 0 ? (
              <p>No natal pairs within 3°.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Pair</th>
                    <th>Δ degree</th>
                    <th>House count</th>
                  </tr>
                </thead>
                <tbody>
                  {natal.combinations.map((pair) => (
                    <tr key={`${pair.a}-${pair.b}`}>
                      <td>
                        {pointLabel(pair.a)} — {pointLabel(pair.b)}
                      </td>
                      <td>{pair.degreeDelta.toFixed(2)}°</td>
                      <td>
                        {pair.houseCount}
                        {pair.isSixthOrEighth ? " (6/8 — still a degree yoga)" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="card">
            <h3>Jupiter, Rahu–Ketu &amp; Bhrigu Bindu</h3>
            <p style={{ fontSize: 13, color: "#9aa0c0" }}>
              {GK_RULE_NOTES.jupiter} {GK_RULE_NOTES.rahuKetu}
            </p>
            <table>
              <tbody>
                <tr>
                  <th>Near Jupiter degree (strengthened)</th>
                  <td className="pass">
                    {natal.nearJupiter.length ? natal.nearJupiter.map(pointLabel).join(", ") : "None"}
                  </td>
                </tr>
                <tr>
                  <th>Near Rahu / Ketu degree (weakened)</th>
                  <td className="fail">
                    {natal.nearRahuKetu.length ? natal.nearRahuKetu.map(pointLabel).join(", ") : "None"}
                  </td>
                </tr>
                <tr>
                  <th>Bhrigu Bindu (Moon–Rahu midpoint)</th>
                  <td>{formatSiderealLongitude(natal.bhriguBindu)}</td>
                </tr>
                <tr>
                  <th>Natal grahas on Bhrigu Bindu</th>
                  <td>
                    {natal.planetsOnBhriguBindu.length
                      ? natal.planetsOnBhriguBindu.map(pointLabel).join(", ")
                      : "None"}
                  </td>
                </tr>
                <tr>
                  <th>Rahu–Ketu axis midpoints</th>
                  <td>
                    {natal.rahuKetuAxisMidpoints.map(formatSiderealLongitude).join(" · ")}
                  </td>
                </tr>
                <tr>
                  <th>Natal grahas on RK midpoint</th>
                  <td>
                    {natal.planetsOnRkMidpoint.length
                      ? natal.planetsOnRkMidpoint.map(pointLabel).join(", ")
                      : "None"}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <PredictionQaPanel
            title="Degree system — possible questions &amp; answers"
            rows={degreePredictions}
          />

          {dasaNote && (
            <section className="card">
              <h3>Current Dasa / Bhukti (health flag)</h3>
              <p>
                Maha: <strong>{dasaNote.mahadasa}</strong> · Bhukti:{" "}
                <strong>{dasaNote.bhukti}</strong>
              </p>
              {dasaNote.highLowHit.length > 0 ? (
                <p className="fail">
                  Running lord {dasaNote.highLowHit.join(" / ")} is the natal highest or lowest
                  degree graha — the degree system flags this period for health strain.
                </p>
              ) : (
                <p className="pass">Current lords are not the highest/lowest degree grahas.</p>
              )}
              {dasaNote.pairHit.length > 0 && (
                <p>
                  Close-degree pair also running:{" "}
                  {dasaNote.pairHit.map((p) => `${p.a}–${p.b}`).join(", ")}.
                </p>
              )}
            </section>
          )}

          <section className="card">
            <h3>Transit overlay (கோசாரம்)</h3>
            <p style={{ fontSize: 13, color: "#9aa0c0" }}>
              {GK_RULE_NOTES.transitLagna} {GK_RULE_NOTES.transitMoon} {GK_RULE_NOTES.approaching}
            </p>
            <p>As of: {now.toLocaleString()}</p>
            <div className="field-row">
              <button type="button" onClick={refresh}>
                Refresh transits
              </button>
              <label style={{ marginTop: 8 }}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />{" "}
                Auto-refresh every minute
              </label>
            </div>

            <h4>Transit Lagna on natal degrees</h4>
            {lagnaHits.length === 0 ? (
              <p>Transit Lagna is not within 3° of a natal point.</p>
            ) : (
              <HitTable hits={lagnaHits} />
            )}

            <h4>Transit Moon on natal degrees</h4>
            {moonHits.length === 0 ? (
              <p>Transit Moon is not within 3° of a natal point.</p>
            ) : (
              <HitTable hits={moonHits} />
            )}

            <h4>All transit–natal degree hits</h4>
            {transitHits.length === 0 ? (
              <p>No transit graha within 3° of a natal degree right now.</p>
            ) : (
              <HitTable hits={transitHits} />
            )}

            <h4>Transit on Bhrigu Bindu / RK midpoints</h4>
            {sensitiveHits.length === 0 ? (
              <p>No transit point on Bhrigu Bindu or the Rahu–Ketu midpoints.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Sensitive point</th>
                    <th>Transit</th>
                    <th>Δ ecliptic</th>
                  </tr>
                </thead>
                <tbody>
                  {sensitiveHits.map((hit) => (
                    <tr key={`${hit.label}-${hit.transit}-${hit.targetLongitude}`}>
                      <td>
                        {hit.label} {formatSiderealLongitude(hit.targetLongitude)}
                      </td>
                      <td>{pointLabel(hit.transit)}</td>
                      <td>{hit.eclipticDelta.toFixed(2)}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {chandraNadi && (
            <section className="card">
              <h3>Chandra Naadi (சந்திர நாடி)</h3>
              <p style={{ fontSize: 13, color: "#9aa0c0" }}>{CHANDRA_NADI_NOTES.intro}</p>
              <p>
                Transit Moon now:{" "}
                <strong>
                  {chandraNadi.transitMoonRasiName}{" "}
                  <span className="tamil">
                    ({RASIS[chandraNadi.transitMoonRasiIndex].nameTamil})
                  </span>{" "}
                  {formatDegreeInRasi(chandraNadi.transitMoonDegree)}
                </strong>
              </p>

              <h4>Query &amp; answer significators</h4>
              <p style={{ fontSize: 13, color: "#9aa0c0" }}>
                Natal grahas conjoining or aspecting the transit Moon.
              </p>
              {chandraNadi.querySignificators.length === 0 ? (
                <p>No natal graha conjoins or aspects the transit Moon right now.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Natal graha</th>
                      <th>Link</th>
                      <th>Karaka</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chandraNadi.querySignificators.map((link) => (
                      <tr key={`${link.planet}-${link.relation}-${link.aspectHouse}`}>
                        <td>{pointLabel(link.planet)}</td>
                        <td>
                          {link.relation === "conjunction"
                            ? "Conjunction (same rasi)"
                            : `${link.aspectHouse}th aspect`}
                        </td>
                        <td>
                          {GK_POINT_THEMES[link.planet].en}
                          <br />
                          <span className="tamil">{GK_POINT_THEMES[link.planet].ta}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h4>Just crossed (past)</h4>
              <p style={{ fontSize: 13, color: "#9aa0c0" }}>{CHANDRA_NADI_NOTES.past}</p>
              {chandraNadi.justCrossed.length === 0 ? (
                <p>No natal graha behind the transit Moon.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Natal graha</th>
                      <th>Position</th>
                      <th>Behind Moon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chandraNadi.justCrossed.map((item) => (
                      <tr key={`past-${item.planet}`}>
                        <td>{pointLabel(item.planet)}</td>
                        <td>{rasiDegree(item.rasiIndex, item.degreeInRasi)}</td>
                        <td>{item.delta.toFixed(2)}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h4>Next touch (upcoming)</h4>
              <p style={{ fontSize: 13, color: "#9aa0c0" }}>{CHANDRA_NADI_NOTES.next}</p>
              {chandraNadi.nextTouch.length === 0 ? (
                <p>No natal graha ahead of the transit Moon.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Natal graha</th>
                      <th>Position</th>
                      <th>Ahead of Moon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chandraNadi.nextTouch.map((item) => (
                      <tr key={`next-${item.planet}`}>
                        <td>{pointLabel(item.planet)}</td>
                        <td>{rasiDegree(item.rasiIndex, item.degreeInRasi)}</td>
                        <td>{item.delta.toFixed(2)}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h4>6 / 8 / 12 from natal graha</h4>
              <p style={{ fontSize: 13, color: "#9aa0c0" }}>{CHANDRA_NADI_NOTES.dusthana}</p>
              {chandraNadi.unfavourable.length === 0 ? (
                <p className="pass">Transit Moon is not in 6/8/12 from any natal graha.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Natal graha</th>
                      <th>Moon is in</th>
                      <th>Karaka under strain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chandraNadi.unfavourable.map((link) => (
                      <tr key={`dust-${link.planet}-${link.houseFromPlanet}`}>
                        <td>{pointLabel(link.planet)}</td>
                        <td className="fail">{link.houseFromPlanet}th</td>
                        <td>
                          {GK_POINT_THEMES[link.planet].en}
                          <br />
                          <span className="tamil">{GK_POINT_THEMES[link.planet].ta}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}

          <PredictionQaPanel
            title="Chandra Naadi — possible questions &amp; answers"
            rows={chandraNadiPredictions}
          />

          <section className="card">
            <h3>Second chart (degree synastry)</h3>
            <p style={{ fontSize: 13, color: "#9aa0c0" }}>{GK_RULE_NOTES.synastry}</p>
            <label>
              <input
                type="checkbox"
                checked={showOther}
                onChange={(e) => setShowOther(e.target.checked)}
              />{" "}
              Compare another person
            </label>
            {showOther && (
              <div style={{ marginTop: 12 }}>
                <DateTimePlaceForm
                  submitToCalculate
                  submitLabel="Calculate other chart"
                  onChange={setOtherInput}
                />
                {synastry.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Natal</th>
                        <th>Other</th>
                        <th>Δ degree</th>
                      </tr>
                    </thead>
                    <tbody>
                      {synastry.map((pair) => (
                        <tr key={`${pair.a}-${pair.b}-${pair.degreeDelta}`}>
                          <td>{pointLabel(pair.a)}</td>
                          <td>{pointLabel(pair.b)}</td>
                          <td>{pair.degreeDelta.toFixed(2)}°</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : otherNatal ? (
                  <p>No cross-chart pairs within 3°.</p>
                ) : null}
              </div>
            )}
          </section>
        </>
      )}

      <JyotishScopePanel pageId="degree-system" />
    </div>
  );
}

function HitTable({
  hits,
}: {
  hits: Array<{
    natal: GkPointId;
    transit: GkPointId;
    natalDegree: number;
    transitDegree: number;
    degreeDelta: number;
    status: string;
  }>;
}) {
  return (
    <table>
      <thead>
        <tr>
          <th>Transit</th>
          <th>Natal</th>
          <th>Degrees</th>
          <th>Δ</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {hits.map((hit) => (
          <tr key={`${hit.transit}-${hit.natal}-${hit.degreeDelta}`}>
            <td>{pointLabel(hit.transit)}</td>
            <td>{pointLabel(hit.natal)}</td>
            <td>
              {formatDegreeInRasi(hit.transitDegree)} → {formatDegreeInRasi(hit.natalDegree)}
            </td>
            <td>{hit.degreeDelta.toFixed(2)}°</td>
            <td className={hit.status === "passed" ? "fail" : "pass"}>{hit.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

