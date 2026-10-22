import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { ChartMarker } from "../components/SouthIndianChart";
import SouthIndianChart from "../components/SouthIndianChart";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import JyotishScopePanel from "../components/JyotishScopePanel";
import PlanetTable from "../components/PlanetTable";
import PushkaraAtBirthTable from "../components/PushkaraAtBirthTable";
import AshtakavargaPanel from "../components/AshtakavargaPanel";
import ShodashavargaPanel from "../components/ShodashavargaPanel";
import { NAKSHATRAS } from "../data/nakshatras";
import { PLANET_TAMIL_ABBR, PLANET_TAMIL_NAME } from "../data/planetsTamil";
import { RASIS } from "../data/rasis";
import { getSiderealAscendant } from "../engine/ascendant";
import { houseRasiIndex } from "../engine/houses";
import { longitudeToNavamsa } from "../engine/navamsa";
import {
  computeVargaPlacement,
  SHODASHAVARGA_DEFS,
  type VargaId,
} from "../engine/vargas";
import {
  computeAvayogi,
  computeInduLagna,
  computeYogi,
  getTithiType,
} from "../engine/jaiminiPoints";
import { computeTithiShunya } from "../engine/tithiShunya";
import { computePanchangam } from "../engine/panchanga";
import { getRetrogradeStatus, shouldShowRetrograde } from "../engine/retrograde";
import { computeSamvatsara } from "../engine/samvatsara";
import { computeMandhi } from "../engine/specialPoints";
import type { Planet } from "../engine/types";
import { PLANETS } from "../engine/types";
import type { BirthInput } from "../engine/types";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import { useBirthChart } from "../hooks/useBirthChart";
import { useCurrentTransit } from "../hooks/useCurrentTransit";
import { formatDegreeInRasi } from "../utils/format";

function planetTamil(name: string): string {
  return PLANET_TAMIL_NAME[name as Planet] ?? name;
}

export default function BirthChartPage() {
  const { resolved } = useEphemerisSettings();
  const [input, setInput] = useState<BirthInput | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [companionVarga, setCompanionVarga] = useState<VargaId>("D9");
  const chart = useBirthChart(input);
  const { now: transitNow, longitudes: transitLongitudes, refresh } = useCurrentTransit(
    autoRefresh ? 60000 : 0,
  );

  const mandhi = useMemo(
    () =>
      input ? computeMandhi(input.date, input.latitude, input.longitude, resolved) : null,
    [input, resolved],
  );

  const birthRetrograde = useMemo(
    () => (input ? getRetrogradeStatus(input.date, undefined, resolved) : null),
    [input, resolved],
  );
  const transitRetrograde = useMemo(
    () => getRetrogradeStatus(transitNow, undefined, resolved),
    [transitNow, resolved],
  );

  // Live (current-moment) lagna and mandhi, at the same place as the birth
  // input, for the outer transit ring.
  const transitLagna = useMemo(
    () =>
      input ? getSiderealAscendant(transitNow, input.latitude, input.longitude, resolved) : null,
    [transitNow, input, resolved],
  );
  const transitMandhi = useMemo(
    () =>
      input ? computeMandhi(transitNow, input.latitude, input.longitude, resolved) : null,
    [transitNow, input, resolved],
  );

  // Panchanga and other Jyotish reference points computed at the birth
  // moment itself (not "live" - these describe the natal chart).
  const birthPanchangam = useMemo(
    () =>
      input ? computePanchangam(input.date, input.latitude, input.longitude, resolved) : null,
    [input, resolved],
  );
  const birthSamvatsara = useMemo(() => (input ? computeSamvatsara(input.date) : null), [input]);
  const induLagna = useMemo(
    () => (chart ? computeInduLagna(chart.lagnaRasiIndex, chart.planetRasi.Moon.rasiIndex) : null),
    [chart],
  );
  const yogi = useMemo(
    () => (chart ? computeYogi(chart.planetLongitudes.Sun, chart.planetLongitudes.Moon) : null),
    [chart],
  );
  const avayogi = useMemo(
    () => (chart ? computeAvayogi(chart.planetLongitudes.Sun, chart.planetLongitudes.Moon) : null),
    [chart],
  );
  const tithiShunya = useMemo(() => {
    if (!chart || !birthPanchangam) return null;
    return computeTithiShunya(birthPanchangam.tithiIndex, chart.planetRasi.Moon.nakshatraIndex);
  }, [chart, birthPanchangam]);

  // Inside each box: this person's own birth-chart placements (planets + lagna + mandhi).
  const cellContents = useMemo(() => {
    const cells: Record<number, ChartMarker[]> = {};
    const push = (rasiIndex: number, marker: ChartMarker) => {
      (cells[rasiIndex] ??= []).push(marker);
    };

    if (chart) {
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
        label: "லக்",
        kind: "lagna",
        title: "லக்னம் (Lagna)",
        degree: chart.lagnaDegreeInRasi,
      });
    }
    if (mandhi) {
      push(mandhi.rasiIndex, {
        label: "மாந்",
        kind: "mandhi",
        title: "மாந்தி (Mandhi / Gulika)",
        degree: mandhi.longitude - mandhi.rasiIndex * 30,
      });
    }
    return cells;
  }, [chart, mandhi, birthRetrograde]);

  const companionVargaDef = useMemo(
    () => SHODASHAVARGA_DEFS.find((d) => d.id === companionVarga) ?? SHODASHAVARGA_DEFS[5],
    [companionVarga],
  );

  const navamsaCellContents = useMemo(() => {
    const cells: Record<number, ChartMarker[]> = {};
    const push = (rasiIndex: number, marker: ChartMarker) => {
      (cells[rasiIndex] ??= []).push(marker);
    };

    if (!chart) return cells;

    if (companionVarga === "D9") {
      for (const planet of PLANETS) {
        const nav = longitudeToNavamsa(chart.planetLongitudes[planet]);
        const isRetrograde = shouldShowRetrograde(planet, birthRetrograde);
        push(nav.rasiIndex, {
          label: PLANET_TAMIL_ABBR[planet],
          kind: "planet",
          title: `${planet} (${PLANET_TAMIL_NAME[planet]}) — Navamsa${isRetrograde ? " - Vakram (retrograde)" : ""}`,
          degree: nav.degreeInRasi,
          retrograde: isRetrograde,
        });
      }
      const lagnaNav = longitudeToNavamsa(chart.lagnaLongitude);
      push(lagnaNav.rasiIndex, {
        label: "லக்",
        kind: "lagna",
        title: "நவாம்ச லக்னம் (Navamsa Lagna)",
        degree: lagnaNav.degreeInRasi,
      });
      return cells;
    }

    for (const planet of PLANETS) {
      const vp = computeVargaPlacement(chart.planetLongitudes[planet], companionVarga);
      const isRetrograde = shouldShowRetrograde(planet, birthRetrograde);
      push(vp.rasiIndex, {
        label: PLANET_TAMIL_ABBR[planet],
        kind: "planet",
        title: `${planet} (${PLANET_TAMIL_NAME[planet]}) — ${companionVarga} (${companionVargaDef.nameSanskrit})${vp.isVargottama ? " ★ Vargottama" : ""}${isRetrograde ? " - Vakram" : ""}`,
        retrograde: isRetrograde,
      });
    }
    const lagnaVp = computeVargaPlacement(chart.lagnaLongitude, companionVarga);
    push(lagnaVp.rasiIndex, {
      label: "லக்",
      kind: "lagna",
      title: `${companionVarga} Lagna (${RASIS[lagnaVp.rasiIndex].nameEnglish})`,
    });
    return cells;
  }, [chart, birthRetrograde, companionVarga, companionVargaDef]);

  // Outer ring: where each planet (+ lagna, + mandhi) is transiting right
  // now, with its current degree.
  const outerMarkers = useMemo(() => {
    const outer: Record<number, ChartMarker[]> = {};
    const push = (rasiIndex: number, marker: ChartMarker) => {
      (outer[rasiIndex] ??= []).push(marker);
    };
    for (const planet of PLANETS) {
      const longitude = transitLongitudes[planet];
      const rasiIndex = Math.floor(longitude / 30);
      const degreeInRasi = longitude - rasiIndex * 30;
      const isRetrograde = shouldShowRetrograde(planet, transitRetrograde);
      push(rasiIndex, {
        label: PLANET_TAMIL_ABBR[planet],
        kind: "transit",
        title: `Gochara (transit): ${planet} (${PLANET_TAMIL_NAME[planet]})${isRetrograde ? " - Vakram (retrograde)" : ""}`,
        degree: degreeInRasi,
        retrograde: isRetrograde,
      });
    }
    if (transitLagna !== null) {
      const rasiIndex = Math.floor(transitLagna / 30);
      push(rasiIndex, {
        label: "லக்",
        kind: "lagna",
        title: "நடப்பு லக்னம் (Transit Lagna)",
        degree: transitLagna - rasiIndex * 30,
      });
    }
    if (transitMandhi) {
      push(transitMandhi.rasiIndex, {
        label: "மாந்",
        kind: "mandhi",
        title: "நடப்பு மாந்தி (Transit Mandhi)",
        degree: transitMandhi.longitude - transitMandhi.rasiIndex * 30,
      });
    }
    return outer;
  }, [transitLongitudes, transitLagna, transitMandhi, transitRetrograde]);

  return (
    <div>
      <h2>Birth / Rasi Chart</h2>
      <EphemerisAccuracyNotice />
      <DateTimePlaceForm submitToCalculate submitLabel="Calculate birth chart" onChange={setInput} />
      {!chart && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter date, time, and place, then click <strong>Calculate birth chart</strong>.
        </p>
      )}
      {chart && (
        <>
          <div className="card">
            <strong>Lagna (Ascendant) / உதயம்:</strong>{" "}
            {RASIS[chart.lagnaRasiIndex].nameEnglish}{" "}
            <span className="tamil">({RASIS[chart.lagnaRasiIndex].nameTamil})</span>{" "}
            {formatDegreeInRasi(chart.lagnaDegreeInRasi)}
          </div>

          <div className="card field-row">
            <span>Live transit (Gochara) as of: {transitNow.toLocaleString()}</span>
            <button onClick={refresh}>Refresh now</button>
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
              <p className="chart-pair__hint">Outer ring: live Gochara at birth location</p>
            </div>
            <div className="chart-pair__item">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <h3 className="chart-pair__title" style={{ margin: 0 }}>
                  {companionVargaDef.nameSanskrit} ({companionVargaDef.id})
                </h3>
                <select
                  value={companionVarga}
                  onChange={(e) => setCompanionVarga(e.target.value as VargaId)}
                  style={{ fontSize: 12, padding: "2px 6px" }}
                >
                  {SHODASHAVARGA_DEFS.filter((d) => d.id !== "D1").map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.id} — {d.nameSanskrit} ({d.nameEnglish})
                    </option>
                  ))}
                </select>
              </div>
              <SouthIndianChart cellContents={navamsaCellContents} />
              <p className="chart-pair__hint">{companionVargaDef.signification}</p>
            </div>
          </div>

          <PlanetTable
            longitudes={chart.planetLongitudes}
            date={input?.date}
            lagnaRasiIndex={chart.lagnaRasiIndex}
          />
          <h3>Whole-sign Houses</h3>
          <table>
            <thead>
              <tr>
                <th>House</th>
                <th>Rasi</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
                const rasi = RASIS[houseRasiIndex(chart.lagnaRasiIndex, house)];
                return (
                  <tr key={house}>
                    <td>House {house}</td>
                    <td>
                      {rasi.nameEnglish} <span className="tamil">({rasi.nameTamil})</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {birthPanchangam && (
            <>
              <h3>Panchanga (at birth)</h3>
              <table>
                <tbody>
                  <tr>
                    <th>Vara (Weekday)</th>
                    <td>{birthPanchangam.vara}</td>
                  </tr>
                  <tr>
                    <th>Tithi</th>
                    <td>
                      {birthPanchangam.tithiName} ({birthPanchangam.paksha} Paksha) —{" "}
                      {getTithiType(birthPanchangam.tithiIndex)}
                    </td>
                  </tr>
                  <tr>
                    <th>Nakshatra</th>
                    <td>
                      {birthPanchangam.nakshatraName}
                      {chart && ` - Pada ${chart.planetRasi.Moon.pada}`}
                    </td>
                  </tr>
                  <tr>
                    <th>Yoga</th>
                    <td>{birthPanchangam.yogaName}</td>
                  </tr>
                  <tr>
                    <th>Karana</th>
                    <td>{birthPanchangam.karanaName}</td>
                  </tr>
                  <tr>
                    <th>Tamil Masa</th>
                    <td>{birthPanchangam.tamilMasa}</td>
                  </tr>
                  <tr>
                    <th>Ritu (Season)</th>
                    <td>{birthPanchangam.ritu}</td>
                  </tr>
                  <tr>
                    <th>Ayana</th>
                    <td>{birthPanchangam.ayana}</td>
                  </tr>
                  {birthSamvatsara && (
                    <tr>
                      <th>Samvatsara / Year</th>
                      <td>
                        Shaka {birthSamvatsara.shaka} · Vikram {birthSamvatsara.vikram}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <h3>Jaimini &amp; Other Points (at birth)</h3>
              <table>
                <tbody>
                  {induLagna && (
                    <tr>
                      <th>Indu Lagna</th>
                      <td>
                        {RASIS[induLagna.rasiIndex].nameEnglish}{" "}
                        <span className="tamil">({RASIS[induLagna.rasiIndex].nameTamil})</span>
                        <details style={{ fontSize: 12, color: "#9aa0c0", marginTop: 4 }}>
                          <summary>Formula trace &amp; source note</summary>
                          <p>{induLagna.sourceNote}</p>
                          <ul style={{ margin: "4px 0 0 0", paddingLeft: 18 }}>
                            {induLagna.calculationTrace.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        </details>
                      </td>
                    </tr>
                  )}
                  {yogi && (
                    <tr>
                      <th>Yogi Point</th>
                      <td>
                        {NAKSHATRAS[yogi.yogiNakshatraIndex].nameEnglish}{" "}
                        <span className="tamil">
                          ({NAKSHATRAS[yogi.yogiNakshatraIndex].nameTamil})
                        </span>{" "}
                        — Yogi Graha: {yogi.yogiGraha}{" "}
                        <span className="tamil">({planetTamil(yogi.yogiGraha)})</span>
                        · Duplicate Yogi: {yogi.duplicateYogiGraha}
                        <details style={{ fontSize: 12, color: "#9aa0c0", marginTop: 4 }}>
                          <summary>Formula trace &amp; source note</summary>
                          <p>{yogi.sourceNote}</p>
                          <ul style={{ margin: "4px 0 0 0", paddingLeft: 18 }}>
                            {yogi.calculationTrace.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        </details>
                      </td>
                    </tr>
                  )}
                  {avayogi && (
                    <tr>
                      <th>Avayogi</th>
                      <td>
                        {NAKSHATRAS[avayogi.avayogiNakshatraIndex].nameEnglish}{" "}
                        <span className="tamil">
                          ({NAKSHATRAS[avayogi.avayogiNakshatraIndex].nameTamil})
                        </span>{" "}
                        — {avayogi.avayogiGraha}{" "}
                        <span className="tamil">({planetTamil(avayogi.avayogiGraha)})</span>
                      </td>
                    </tr>
                  )}
                  {tithiShunya && (
                    <tr>
                      <th>Tithi Shunya Nakshatra</th>
                      <td className={tithiShunya.moonIsShunya ? "fail" : "pass"}>
                        Tithi #{tithiShunya.tithiNumberInPaksha} ({getTithiType(birthPanchangam!.tithiIndex)}
                        ) — shunya:{" "}
                        {tithiShunya.hasShunyaList
                          ? tithiShunya.shunyaNakshatraNames.join(", ")
                          : "none"}
                        . Moon:{" "}
                        {tithiShunya.moonIsShunya ? "in shunya list" : "not shunya"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <PushkaraAtBirthTable chart={chart} />

              <details className="card" style={{ marginTop: 14 }}>
                <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 16 }}>
                  Shodashavarga — All 16 Divisional Charts (D1–D60) &amp; Vimshopaka Bala
                </summary>
                <div style={{ marginTop: 12 }}>
                  <ShodashavargaPanel chart={chart} retrograde={birthRetrograde} />
                </div>
              </details>

              <details className="card" style={{ marginTop: 14 }}>
                <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 16 }}>
                  Ashtakavarga — 337-Bindu SAV, BAV, Reductions &amp; Kakshya
                </summary>
                <div style={{ marginTop: 12 }}>
                  <AshtakavargaPanel chart={chart} transitLongitudes={transitLongitudes} />
                </div>
              </details>

              <p style={{ fontSize: 13 }}>
                <Link to="/divisional-charts">Divisional Charts (D1–D60)</Link> ·{" "}
                <Link to="/ashtakavarga">Ashtakavarga</Link> ·{" "}
                <Link to="/advanced-jyotish">Advanced Jyotish</Link>
              </p>
            </>
          )}
          <JyotishScopePanel pageId="birth-chart" />
        </>
      )}
    </div>
  );
}
