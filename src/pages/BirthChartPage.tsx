import { useMemo, useState } from "react";
import type { ChartMarker } from "../components/SouthIndianChart";
import SouthIndianChart from "../components/SouthIndianChart";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import JyotishScopePanel from "../components/JyotishScopePanel";
import PlanetTable from "../components/PlanetTable";
import { NAKSHATRAS } from "../data/nakshatras";
import { PLANET_TAMIL_ABBR, PLANET_TAMIL_NAME } from "../data/planetsTamil";
import { RASIS } from "../data/rasis";
import { getSiderealAscendant } from "../engine/ascendant";
import { houseRasiIndex } from "../engine/houses";
import { longitudeToNavamsa } from "../engine/navamsa";
import {
  AVAYOGI_NOT_IMPLEMENTED_REASON,
  TITHI_SHUNYA_NAKSHATRA_NOT_IMPLEMENTED_REASON,
  computeInduLagna,
  computeYogi,
  getTithiType,
} from "../engine/jaiminiPoints";
import { computePanchangam } from "../engine/panchanga";
import { computePushkara } from "../engine/pushkara";
import { getRetrogradeStatus, shouldShowRetrograde } from "../engine/retrograde";
import { computeSamvatsara } from "../engine/samvatsara";
import { computeMandhi } from "../engine/specialPoints";
import type { Planet } from "../engine/types";
import { PLANETS } from "../engine/types";
import type { BirthInput } from "../engine/types";
import { useBirthChart } from "../hooks/useBirthChart";
import { useCurrentTransit } from "../hooks/useCurrentTransit";
import { formatDegreeInRasi } from "../utils/format";

function planetTamil(name: string): string {
  return PLANET_TAMIL_NAME[name as Planet] ?? name;
}

export default function BirthChartPage() {
  const [input, setInput] = useState<BirthInput | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const chart = useBirthChart(input);
  const { now: transitNow, longitudes: transitLongitudes, refresh } = useCurrentTransit(
    autoRefresh ? 60000 : 0,
  );

  const mandhi = useMemo(
    () => (input ? computeMandhi(input.date, input.latitude, input.longitude) : null),
    [input],
  );

  const birthRetrograde = useMemo(
    () => (input ? getRetrogradeStatus(input.date) : null),
    [input],
  );
  const transitRetrograde = useMemo(() => getRetrogradeStatus(transitNow), [transitNow]);

  // Live (current-moment) lagna and mandhi, at the same place as the birth
  // input, for the outer transit ring.
  const transitLagna = useMemo(
    () => (input ? getSiderealAscendant(transitNow, input.latitude, input.longitude) : null),
    [transitNow, input],
  );
  const transitMandhi = useMemo(
    () => (input ? computeMandhi(transitNow, input.latitude, input.longitude) : null),
    [transitNow, input],
  );

  // Panchanga and other Jyotish reference points computed at the birth
  // moment itself (not "live" - these describe the natal chart).
  const birthPanchangam = useMemo(
    () => (input ? computePanchangam(input.date, input.latitude, input.longitude) : null),
    [input],
  );
  const birthSamvatsara = useMemo(() => (input ? computeSamvatsara(input.date) : null), [input]);
  const moonPushkara = useMemo(
    () =>
      chart ? computePushkara(chart.planetRasi.Moon.rasiIndex, chart.planetRasi.Moon.degreeInRasi) : null,
    [chart],
  );
  const induLagna = useMemo(
    () => (chart ? computeInduLagna(chart.lagnaRasiIndex, chart.planetRasi.Moon.rasiIndex) : null),
    [chart],
  );
  const yogi = useMemo(
    () => (chart ? computeYogi(chart.planetLongitudes.Sun, chart.planetLongitudes.Moon) : null),
    [chart],
  );

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

  const navamsaCellContents = useMemo(() => {
    const cells: Record<number, ChartMarker[]> = {};
    const push = (rasiIndex: number, marker: ChartMarker) => {
      (cells[rasiIndex] ??= []).push(marker);
    };

    if (!chart) return cells;

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
  }, [chart, birthRetrograde]);

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
              <h3 className="chart-pair__title">Navamsa (D9)</h3>
              <SouthIndianChart cellContents={navamsaCellContents} />
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
                      </td>
                    </tr>
                  )}
                  {moonPushkara && (
                    <tr>
                      <th>Moon's Pushkara Navamsa</th>
                      <td className={moonPushkara.isPushkaraNavamsa ? "pass" : "fail"}>
                        {moonPushkara.isPushkaraNavamsa ? "Yes" : "No"} (pada{" "}
                        {moonPushkara.navamsaPada}/9)
                      </td>
                    </tr>
                  )}
                  <tr>
                    <th>Avayogi</th>
                    <td className="fail" title={AVAYOGI_NOT_IMPLEMENTED_REASON}>
                      Not implemented
                    </td>
                  </tr>
                  <tr>
                    <th>Tithi Shunya Nakshatra</th>
                    <td className="fail" title={TITHI_SHUNYA_NAKSHATRA_NOT_IMPLEMENTED_REASON}>
                      Not implemented
                      {birthPanchangam && (
                        <span style={{ fontSize: 12, color: "#9aa0c0" }}>
                          {" "}
                          (birth tithi type: {getTithiType(birthPanchangam.tithiIndex)})
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              <details style={{ fontSize: 12, color: "#9aa0c0", marginTop: 8 }}>
                <summary>Why Avayogi &amp; Tithi Shunya are omitted</summary>
                <p>{AVAYOGI_NOT_IMPLEMENTED_REASON}</p>
                <p>{TITHI_SHUNYA_NAKSHATRA_NOT_IMPLEMENTED_REASON}</p>
              </details>
            </>
          )}
          <JyotishScopePanel pageId="birth-chart" />
        </>
      )}
    </div>
  );
}
