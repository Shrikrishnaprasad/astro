import { useCallback, useEffect, useMemo, useState } from "react";
import type { BirthFormValue } from "../components/DateTimePlaceForm";
import type { ChartMarker } from "../components/SouthIndianChart";
import SouthIndianChart from "../components/SouthIndianChart";
import JamaGrahaPerimeter, { PLANET_TO_RING_ID } from "../components/JamaGrahaPerimeter";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import PlaceSelector from "../components/PlaceSelector";
import { defaultPlace, type ResolvedPlace } from "../data/places";
import { LAGNA_TAMIL, MANDHI_TAMIL, PLANET_TAMIL_ABBR, PLANET_TAMIL_NAME } from "../data/planetsTamil";
import { RASIS } from "../data/rasis";
import { computeAllArudhaPadas } from "../engine/arudha";
import { calculateKavippu } from "../engine/kavippu";
import { calculateUdhayamFromDate } from "../engine/udhayam";
import { calculateEightJamaGrahasFromUTC } from "../engine/jamaGrahaRing";
import { getRetrogradeStatus, shouldShowRetrograde } from "../engine/retrograde";
import { computeJamagraham, computeMandhi } from "../engine/specialPoints";
import type { BirthInput } from "../engine/types";
import { PLANETS } from "../engine/types";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import { planetRasiIndexMap, useBirthChart } from "../hooks/useBirthChart";
import { useRefreshableNow } from "../hooks/useNow";
import { formatDegreeInRasi } from "../utils/format";

const ARUDHA_LABEL: Record<number, string> = {
  1: "ஆல்", 2: "அரு2", 3: "அரு3", 4: "அரு4", 5: "அரு5", 6: "அரு6",
  7: "அரு7", 8: "அரு8", 9: "அரு9", 10: "அரு10", 11: "அரு11", 12: "அரு12",
};

export default function ArudhaLagnaPage() {
  const { resolved } = useEphemerisSettings();
  const [live, setLive] = useState(true);
  const [place, setPlace] = useState<ResolvedPlace>(defaultPlace());
  const [formInput, setFormInput] = useState<BirthInput | null>(null);
  // Timezone offset (hours) for the manual-mode input — captured from the
  // raw form value so the Jama Graha ring can identify the 06:00 AM reference.
  const [formTzOffset, setFormTzOffset] = useState(defaultPlace().tzOffsetHours);

  const handleFormChange = useCallback(
    (input: BirthInput | null, raw: BirthFormValue) => {
      setFormInput(input);
      const tz = raw.useManual ? Number(raw.manualTz) : raw.place.tzOffsetHours;
      setFormTzOffset(isNaN(tz) ? 0 : tz);
    },
    [],
  );
  // Frozen at the moment the page opens (or Live is switched on); only
  // changes via the "Refresh now" button, never on its own.
  const { now, refresh } = useRefreshableNow(false);

  useEffect(() => {
    if (live) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);

  const input: BirthInput | null = live
    ? { date: now, latitude: place.lat, longitude: place.lon }
    : formInput;

  const chart = useBirthChart(input);

  const arudhaPadas = useMemo(
    () => (chart ? computeAllArudhaPadas(chart.lagnaRasiIndex, planetRasiIndexMap(chart)) : null),
    [chart],
  );

  const mandhi = useMemo(
    () =>
      input ? computeMandhi(input.date, input.latitude, input.longitude, resolved) : null,
    [input, resolved],
  );

  const retrograde = useMemo(
    () => (input ? getRetrogradeStatus(input.date, undefined, resolved) : null),
    [input, resolved],
  );

  const jamagraham = useMemo(
    () => (input ? computeJamagraham(input.date, input.latitude, input.longitude) : null),
    [input],
  );

  // Arudha Lagna visually cycles through all 12 rasis in clock order (Mesha
  // first), spending 5 minutes in each, completing one full loop every hour:
  // minute 0-4 -> Mesha, 5-9 -> Vrishabha, ... 55-59 -> Meena. Its "degree"
  // within that rasi advances smoothly across the 5-minute window (0-30°).
  // Uses the same frozen reference moment as the rest of the chart (the
  // selected input's date, live or manual) so it only moves on refresh or a
  // date/time change, never on its own.
  const referenceDate = input?.date ?? now;
  const displayedArudhaLagnaRasi = Math.floor(referenceDate.getMinutes() / 5);
  const secondsIntoCurrentRasi = (referenceDate.getMinutes() % 5) * 60 + referenceDate.getSeconds();
  const displayedArudhaLagnaDegree = (secondsIntoCurrentRasi / 300) * 30;

  // Kavippu: uses this app's existing Udhayam (real Lagna) and Aarudam
  // (the 5-min rotation above) as inputs, plus a Surya Veedhi lookup keyed
  // by the Sun's rasi - see src/engine/kavippu.ts for the verified formula.
  const kavippu = useMemo(() => {
    if (!chart) return null;
    return calculateKavippu({
      sunRasiIndex: chart.planetRasi.Sun.rasiIndex,
      udhayamRasiIndex: chart.lagnaRasiIndex,
      udhayamDegreeInRasi: chart.lagnaDegreeInRasi,
      aarudamRasiIndex: displayedArudhaLagnaRasi,
      aarudamDegreeInRasi: displayedArudhaLagnaDegree,
    });
  }, [chart, displayedArudhaLagnaRasi, displayedArudhaLagnaDegree]);

  // Full Udhayam details (tropical, sidereal, nakshatra, ayanamsa, GMST/GAST/LST)
  const udhayam = useMemo(() => {
    if (!input || !chart) return null;
    return calculateUdhayamFromDate(input.date, input.latitude, input.longitude, resolved);
  }, [input, chart, resolved]);

  // Effective timezone offset: place-based for live mode, captured from form in manual mode
  const effectiveTzOffset = live ? place.tzOffsetHours : formTzOffset;

  // Eight Jama Grahas ring (45-degree Vaidyanathan method)
  const jamaGrahaRing = useMemo(() => {
    if (!input) return null;
    return calculateEightJamaGrahasFromUTC(input.date, effectiveTzOffset);
  }, [input, effectiveTzOffset]);

  const cellContents = useMemo(() => {
    const cells: Record<number, ChartMarker[]> = {};
    const push = (rasiIndex: number, marker: ChartMarker) => {
      (cells[rasiIndex] ??= []).push(marker);
    };

    if (chart) {
      for (const planet of PLANETS) {
        const info = chart.planetRasi[planet];
        const isRetrograde = shouldShowRetrograde(planet, retrograde);
        push(info.rasiIndex, {
          label: PLANET_TAMIL_ABBR[planet],
          kind: "planet",
          title: `${planet} (${PLANET_TAMIL_NAME[planet]})${isRetrograde ? " - Vakram (retrograde)" : ""}`,
          degree: info.degreeInRasi,
          retrograde: isRetrograde,
        });
      }
      push(chart.lagnaRasiIndex, {
        label: LAGNA_TAMIL,  // "ல" Lagnam
        kind: "lagna",
        title: "லக்னம் (Lagnam)",
        degree: chart.lagnaDegreeInRasi,
      });
      push(chart.lagnaRasiIndex, {
        label: "உத",  // "உத" Udhayam (Jamakkol-specific)
        kind: "lagna",
        title: "உதயம் (Udhayam / Jamakkol Lagna)",
        degree: chart.lagnaDegreeInRasi,
      });
    }
    push(displayedArudhaLagnaRasi, {
      label: "ஆரு",
      kind: "arudha",
      title: "ஆரூடம் (Aaru) - cycles 1 rasi every 5 min, Mesha at :00, full loop every hour",
      degree: displayedArudhaLagnaDegree,
    });
    if (mandhi) {
      push(mandhi.rasiIndex, {
        label: MANDHI_TAMIL,
        kind: "mandhi",
        title: "மாந் (Mandhi / Gulika)",
        degree: mandhi.longitude - mandhi.rasiIndex * 30,
      });
    }
    if (kavippu) {
      push(kavippu.rasiIndex, {
        label: "கவி",
        kind: "kavippu",
        title: "கவிப்பு (Kavippu)",
        degree: kavippu.degreeInRasi,
      });
    }
    return cells;
  }, [chart, displayedArudhaLagnaRasi, displayedArudhaLagnaDegree, mandhi, kavippu, retrograde]);

  // Map the active sunrise-cycle Jamagraham planet to the ring ID used by
  // JamaGrahaPerimeter so the correct perimeter box gets highlighted.
  const activeRingGrahaId = jamagraham
    ? (PLANET_TO_RING_ID[jamagraham.graha] ?? null)
    : null;

  return (
    <div>
      <h2>ஜாமக்கோள் ஆரூடம் (Jamakkol Arudam)</h2>
      <EphemerisAccuracyNotice />
      <p className="tamil">உதயம், ஆரூடம், மாந் ஆகியவை தென்னிந்திய முறை ராசி சக்கரத்தில்.</p>

      <div className="card field-row">
        <label>
          <input type="checkbox" checked={live} onChange={(e) => setLive(e.target.checked)} />
          Live (current date/time)
        </label>
      </div>
      {live && <PlaceSelector onChange={setPlace} />}

      {live && (
        <div className="card">
          <p>As of: {now.toLocaleString()}</p>
          <div className="field-row">
            <button onClick={refresh}>Refresh now</button>
          </div>
        </div>
      )}
      {!live && (
        <DateTimePlaceForm
          submitToCalculate
          submitLabel="Calculate Jamakkol Arudam"
          onChange={handleFormChange}
        />
      )}
      {!live && !chart && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter date, time, and place, then click <strong>Calculate Jamakkol Arudam</strong>.
        </p>
      )}

      {chart && (
        <>
          {/* ── Eight Jama Grahas perimeter + inner Rasi chart ── */}
          {jamaGrahaRing ? (
            <JamaGrahaPerimeter
              grahas={jamaGrahaRing.jamaGrahas}
              activeGrahaId={activeRingGrahaId}
            >
              <SouthIndianChart cellContents={cellContents} />
            </JamaGrahaPerimeter>
          ) : (
            <SouthIndianChart cellContents={cellContents} />
          )}

          {/* ── Udhayam details card ── */}
          {udhayam && (
            <div className="card">
              <strong className="tamil">உதயம் (Udhayam / Lagna):</strong>
              <div style={{ marginTop: 6 }}>
                <table style={{ borderCollapse: "collapse", fontSize: 14 }}>
                  <tbody>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0" }}>Rasi</td>
                      <td>
                        {udhayam.siderealAscendant.rasi}{" "}
                        <span className="tamil">
                          ({RASIS[udhayam.siderealAscendant.rasiIndex].nameTamil})
                        </span>
                        <span style={{ fontSize: 12, color: "#9aa0c0", marginLeft: 6 }}>
                          lord: {udhayam.rasiLord}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0" }}>Degree</td>
                      <td>
                        {udhayam.siderealAscendant.degree}°
                        {String(udhayam.siderealAscendant.minute).padStart(2, "0")}′
                        {String(udhayam.siderealAscendant.second).padStart(2, "0")}″
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0" }}>Nakshatra</td>
                      <td>
                        {udhayam.nakshatra.name}{" "}
                        <span className="tamil">({udhayam.nakshatra.nameTamil})</span>
                        <span style={{ fontSize: 12, color: "#9aa0c0", marginLeft: 6 }}>
                          lord: {udhayam.nakshatra.lord}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0" }}>Pada</td>
                      <td>{udhayam.nakshatra.pada}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0" }}>Ayanamsa</td>
                      <td>
                        {udhayam.ayanamsa.name} — {udhayam.ayanamsa.value.toFixed(4)}°
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0" }}>Tropical Asc.</td>
                      <td>
                        {udhayam.tropicalAscendant.rasi}{" "}
                        {udhayam.tropicalAscendant.degree}°
                        {String(udhayam.tropicalAscendant.minute).padStart(2, "0")}′
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0" }}>Sidereal Asc.</td>
                      <td>
                        {udhayam.siderealAscendant.rasi}{" "}
                        {formatDegreeInRasi(udhayam.siderealAscendant.degreeInRasi)}
                        <span style={{ fontSize: 12, color: "#9aa0c0", marginLeft: 6 }}>
                          λ = {udhayam.siderealAscendant.longitude.toFixed(4)}°
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <details style={{ fontSize: 12, color: "#9aa0c0", marginTop: 8 }}>
                <summary style={{ cursor: "pointer" }}>
                  Calculation details (astronomical pipeline)
                </summary>
                <table
                  style={{
                    borderCollapse: "collapse",
                    marginTop: 6,
                    fontSize: 12,
                    width: "100%",
                  }}
                >
                  <tbody>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        1. UTC instant
                      </td>
                      <td>{udhayam.utcDate.toISOString()}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        2. Latitude / Longitude
                      </td>
                      <td>
                        {input?.latitude.toFixed(4)}° N,{" "}
                        {input?.longitude.toFixed(4)}° E
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        3. Julian Day
                      </td>
                      <td>{udhayam.astronomicalData.julianDay.toFixed(6)}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        4. GMST
                      </td>
                      <td>{udhayam.astronomicalData.gmst.toFixed(6)}°</td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        5. GAST
                      </td>
                      <td>{udhayam.astronomicalData.gast.toFixed(6)}°</td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        6. Local Sidereal Time
                      </td>
                      <td>{udhayam.astronomicalData.localSiderealTime.toFixed(6)}°</td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        7. Mean obliquity
                      </td>
                      <td>{udhayam.astronomicalData.obliquity.toFixed(6)}°</td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        8. Tropical Ascendant
                      </td>
                      <td>
                        {udhayam.tropicalAscendant.rasi}{" "}
                        {formatDegreeInRasi(udhayam.tropicalAscendant.degreeInRasi)}
                        {" "}(λ = {udhayam.tropicalAscendant.longitude.toFixed(4)}°)
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        9. Ayanamsa correction
                      </td>
                      <td>
                        {udhayam.ayanamsa.name} = −{udhayam.ayanamsa.value.toFixed(4)}°
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        10. Sidereal Udhayam
                      </td>
                      <td>
                        <strong>
                          {udhayam.siderealAscendant.rasi}{" "}
                          {udhayam.siderealAscendant.degree}°
                          {String(udhayam.siderealAscendant.minute).padStart(2, "0")}′
                          {String(udhayam.siderealAscendant.second).padStart(2, "0")}″
                          {" "}| {udhayam.nakshatra.name} pada {udhayam.nakshatra.pada}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </details>
            </div>
          )}

          <div className="card">
            <strong className="tamil">ஜாமகிரஹம் (Jamagraham) window:</strong>{" "}
            {jamagraham ? (
              <>
                {jamagraham.periodStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {" – "}
                {jamagraham.periodEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </>
            ) : (
              "unavailable"
            )}
            <div style={{ fontSize: 12, color: "#9aa0c0", marginTop: 4 }}>
              Shown on the outer edge of the box holding that graha's current position. Changes every
              1.5 hours from sunrise, cycling Guru-Budhan-Sukran-Sani-Chandran-Ragu-Suriyan-Chevai in
              reverse order, starting each day from that weekday's lord.
            </div>
          </div>

          <div className="card">
            <strong className="tamil">கவிப்பு (Kavippu):</strong>{" "}
            {kavippu ? (
              <>
                {/* ── Primary result ── */}
                <div style={{ marginTop: 6 }}>
                  <table style={{ borderCollapse: "collapse", fontSize: 14 }}>
                    <tbody>
                      <tr>
                        <td style={{ paddingRight: 12, color: "#9aa0c0" }}>Rasi</td>
                        <td>
                          {kavippu.rasiName}{" "}
                          <span className="tamil">({kavippu.rasiNameTamil})</span>
                          <span style={{ fontSize: 12, color: "#9aa0c0", marginLeft: 6 }}>
                            lord: {kavippu.rasiLord}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingRight: 12, color: "#9aa0c0" }}>Degree</td>
                        <td>{formatDegreeInRasi(kavippu.degreeInRasi)}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingRight: 12, color: "#9aa0c0" }}>Nakshatra</td>
                        <td>
                          {kavippu.nakshatraName}{" "}
                          <span className="tamil">({kavippu.nakshatraNameTamil})</span>
                          <span style={{ fontSize: 12, color: "#9aa0c0", marginLeft: 6 }}>
                            lord: {kavippu.nakshatraLord}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingRight: 12, color: "#9aa0c0" }}>Pada</td>
                        <td>{kavippu.pada}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingRight: 12, color: "#9aa0c0" }}>Longitude</td>
                        <td>{kavippu.longitude.toFixed(4)}°</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ── Calculation details ── */}
                <details style={{ fontSize: 12, color: "#9aa0c0", marginTop: 8 }}>
                  <summary style={{ cursor: "pointer" }}>
                    Calculation details (Vaidyanathan method)
                  </summary>
                  <table
                    style={{
                      borderCollapse: "collapse",
                      marginTop: 6,
                      fontSize: 12,
                      width: "100%",
                    }}
                  >
                    <tbody>
                      <tr>
                        <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                          1. Sun's Rasi
                        </td>
                        <td>
                          {chart &&
                            `${RASIS[chart.planetRasi.Sun.rasiIndex].nameEnglish} (index ${chart.planetRasi.Sun.rasiIndex})`}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                          2. Surya Veedhi
                        </td>
                        <td>
                          {kavippu.suryaVeedhiRasiName} (8th from Sun, inclusive)
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                          3. Arudam → Surya Veedhi count
                        </td>
                        <td>{kavippu.count} (forward, inclusive)</td>
                      </tr>
                      <tr>
                        <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                          4. Udhayam → Kavippu count
                        </td>
                        <td>{kavippu.count} (same count applied from Udhayam)</td>
                      </tr>
                      <tr>
                        <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                          5. Arudam degree
                        </td>
                        <td>{formatDegreeInRasi(displayedArudhaLagnaDegree)}</td>
                      </tr>
                      <tr>
                        <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                          6. Kavippu degree
                        </td>
                        <td>
                          30° − {formatDegreeInRasi(displayedArudhaLagnaDegree)} ={" "}
                          {formatDegreeInRasi(kavippu.degreeInRasi)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                          7. Final result
                        </td>
                        <td>
                          <strong>
                            {kavippu.rasiName} {formatDegreeInRasi(kavippu.degreeInRasi)} |{" "}
                            {kavippu.nakshatraName} pada {kavippu.pada}
                          </strong>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </details>
              </>
            ) : (
              "unavailable"
            )}
          </div>

          {/* ── Eight Jama Grahas ring — collapsed detail view ── */}
          {jamaGrahaRing && (
            <details className="card" style={{ marginTop: 14 }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 15 }}>
                <span className="tamil">எட்டு ஜாமக்கிரகங்கள் (Eight Jama Grahas)</span>
                {" "}— calculation details
              </summary>
              <div style={{ fontSize: 12, color: "#9aa0c0", marginTop: 8, marginBottom: 8 }}>
                Vaidyanathan 45° ring — NOT actual planetary positions.
                Starting longitude θ:{" "}
                <strong>
                  {jamaGrahaRing.startingLongitude.degree}°
                  {String(jamaGrahaRing.startingLongitude.minute).padStart(2, "0")}′
                  {String(jamaGrahaRing.startingLongitude.second).padStart(2, "0")}″
                </strong>{" "}
                ({jamaGrahaRing.reference.direction.toLowerCase()}, {jamaGrahaRing.reference.movementRate}°/min)
              </div>

              {/* Graha table */}
              <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%" }}>
                <thead>
                  <tr style={{ color: "#9aa0c0", fontSize: 12 }}>
                    <th style={{ textAlign: "left", paddingRight: 10, paddingBottom: 4 }}>Graha</th>
                    <th style={{ textAlign: "left", paddingRight: 10 }}>Rasi</th>
                    <th style={{ textAlign: "left", paddingRight: 10 }}>Degree</th>
                    <th style={{ textAlign: "left", paddingRight: 10 }}>Nakshatra</th>
                    <th style={{ textAlign: "left", paddingRight: 10 }}>Pada</th>
                    <th style={{ textAlign: "right", fontSize: 11, color: "#666" }}>Offset</th>
                  </tr>
                </thead>
                <tbody>
                  {jamaGrahaRing.jamaGrahas.map((g) => (
                    <tr key={g.id}>
                      <td style={{ paddingRight: 10, paddingBottom: 2 }}>
                        {g.name}{" "}
                        <span className="tamil" style={{ fontSize: 11 }}>({g.tamil})</span>
                      </td>
                      <td style={{ paddingRight: 10 }}>
                        {g.rasi}{" "}
                        <span style={{ fontSize: 11, color: "#9aa0c0" }}>
                          lord: {g.rasiLord}
                        </span>
                      </td>
                      <td style={{ paddingRight: 10, fontVariantNumeric: "tabular-nums" }}>
                        {g.degree}°{String(g.minute).padStart(2, "0")}′
                        {String(g.second).padStart(2, "0")}″
                      </td>
                      <td style={{ paddingRight: 10 }}>
                        {g.nakshatra}{" "}
                        <span className="tamil" style={{ fontSize: 11 }}>({g.nakshatraTamil})</span>
                      </td>
                      <td style={{ paddingRight: 10 }}>{g.pada}</td>
                      <td style={{ textAlign: "right", color: "#9aa0c0", fontSize: 11 }}>
                        +{g.offset}°
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Expandable calculation details */}
              <details style={{ fontSize: 12, color: "#9aa0c0", marginTop: 8 }}>
                <summary style={{ cursor: "pointer" }}>Calculation details</summary>
                <table style={{ borderCollapse: "collapse", marginTop: 6, fontSize: 12, width: "100%" }}>
                  <tbody>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        1. Reference time
                      </td>
                      <td>{jamaGrahaRing.reference.time} local</td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        2. Reference UTC
                      </td>
                      <td>{jamaGrahaRing.reference.referenceUtc.toISOString()}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        3. Query UTC
                      </td>
                      <td>{input?.date.toISOString()}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        4. Elapsed time
                      </td>
                      <td>
                        {jamaGrahaRing.reference.elapsedMinutes} min{" "}
                        ({jamaGrahaRing.reference.elapsedSeconds} s total)
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        5. Starting θ
                      </td>
                      <td>
                        {jamaGrahaRing.startingLongitude.degree}°
                        {String(jamaGrahaRing.startingLongitude.minute).padStart(2, "0")}′
                        {String(jamaGrahaRing.startingLongitude.second).padStart(2, "0")}″{" "}
                        ({jamaGrahaRing.startingLongitude.totalLongitude.toFixed(4)}°)
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        6. Movement rate
                      </td>
                      <td>
                        {jamaGrahaRing.reference.movementRate}°/min = 30″/s{" "}
                        {jamaGrahaRing.reference.direction}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        7. Angular offsets
                      </td>
                      <td>
                        {jamaGrahaRing.jamaGrahas.map((g) => `${g.name} +${g.offset}°`).join(" · ")}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ paddingRight: 12, color: "#9aa0c0", whiteSpace: "nowrap" }}>
                        8. Final longitudes
                      </td>
                      <td>
                        {jamaGrahaRing.jamaGrahas
                          .map((g) => `${g.name} ${g.longitude.toFixed(2)}°`)
                          .join(" · ")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </details>
            </details>
          )}

          {arudhaPadas && (
            <table>
              <thead>
                <tr>
                  <th>House</th>
                  <th>Arudha Pada</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((house) => {
                  const rasi = RASIS[arudhaPadas[house]];
                  return (
                    <tr key={house}>
                      <td className="tamil">{ARUDHA_LABEL[house]}</td>
                      <td>
                        {rasi.nameEnglish} <span className="tamil">({rasi.nameTamil})</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
