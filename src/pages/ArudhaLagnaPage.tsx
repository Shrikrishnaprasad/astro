import { useEffect, useMemo, useState } from "react";
import type { ChartMarker } from "../components/SouthIndianChart";
import SouthIndianChart from "../components/SouthIndianChart";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import PlaceSelector from "../components/PlaceSelector";
import { JAMAGRAHAM_SEQUENCE } from "../data/jamagraham";
import { defaultPlace, type ResolvedPlace } from "../data/places";
import { PLANET_TAMIL_ABBR, PLANET_TAMIL_NAME } from "../data/planetsTamil";
import { RASIS } from "../data/rasis";
import { suryaVeedhiRasiIndex } from "../data/suryaVeedhi";
import { computeAllArudhaPadas } from "../engine/arudha";
import { calculateKavippu } from "../engine/kavippu";
import { getRetrogradeStatus, shouldShowRetrograde } from "../engine/retrograde";
import { computeJamagraham, computeMandhi } from "../engine/specialPoints";
import type { BirthInput } from "../engine/types";
import { PLANETS } from "../engine/types";
import { planetRasiIndexMap, useBirthChart } from "../hooks/useBirthChart";
import { useRefreshableNow } from "../hooks/useNow";
import { formatDegreeInRasi } from "../utils/format";

const ARUDHA_LABEL: Record<number, string> = {
  1: "ஆல்", 2: "அரு2", 3: "அரு3", 4: "அரு4", 5: "அரு5", 6: "அரு6",
  7: "அரு7", 8: "அரு8", 9: "அரு9", 10: "அரு10", 11: "அரு11", 12: "அரு12",
};

export default function ArudhaLagnaPage() {
  const [live, setLive] = useState(true);
  const [place, setPlace] = useState<ResolvedPlace>(defaultPlace());
  const [formInput, setFormInput] = useState<BirthInput | null>(null);
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
    () => (input ? computeMandhi(input.date, input.latitude, input.longitude) : null),
    [input],
  );

  const retrograde = useMemo(
    () => (input ? getRetrogradeStatus(input.date) : null),
    [input],
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
      udhayamRasiIndex: chart.lagnaRasiIndex,
      udhayamDegreeInRasi: chart.lagnaDegreeInRasi,
      aarudamRasiIndex: displayedArudhaLagnaRasi,
      aarudamDegreeInRasi: displayedArudhaLagnaDegree,
      suryaVeedhiRasiIndex: suryaVeedhiRasiIndex(chart.planetRasi.Sun.rasiIndex),
    });
  }, [chart, displayedArudhaLagnaRasi, displayedArudhaLagnaDegree]);

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
        label: "உத",
        kind: "lagna",
        title: "உதயம் (Udhayam / Lagna)",
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
        label: "மாந்",
        kind: "mandhi",
        title: "மாந்தி (Mandhi / Gulika)",
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

  // Show all 8 Jamagraham-sequence grahas on the outer ring at once, each at
  // its own real chart position, with the currently-active one highlighted.
  const outerMarkers = useMemo(() => {
    if (!chart) return {};
    const outer: Record<number, ChartMarker[]> = {};
    const push = (rasiIndex: number, marker: ChartMarker) => {
      (outer[rasiIndex] ??= []).push(marker);
    };
    for (const graha of JAMAGRAHAM_SEQUENCE) {
      const rasiIndex = chart.planetRasi[graha].rasiIndex;
      const isActive = jamagraham?.graha === graha;
      const isRetrograde = shouldShowRetrograde(graha, retrograde);
      push(rasiIndex, {
        label: PLANET_TAMIL_ABBR[graha],
        kind: isActive ? "jamagraham" : "jamagraham-inactive",
        title: `ஜாமகிரஹம் (Jamagraham): ${graha} / ${PLANET_TAMIL_NAME[graha]}${
          isActive ? " — active now" : ""
        }${isRetrograde ? " - Vakram (retrograde)" : ""}`,
        retrograde: isRetrograde,
      });
    }
    return outer;
  }, [chart, jamagraham, retrograde]);

  return (
    <div>
      <h2>ஜாமக்கோள் ஆரூடம் (Jamakkol Arudam)</h2>
      <EphemerisAccuracyNotice />
      <p className="tamil">உதயம், ஆரூடம், மாந்தி ஆகியவை தென்னிந்திய முறை ராசி சக்கரத்தில்.</p>

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
          onChange={setFormInput}
        />
      )}
      {!live && !chart && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter date, time, and place, then click <strong>Calculate Jamakkol Arudam</strong>.
        </p>
      )}

      {chart && (
        <>
          <SouthIndianChart cellContents={cellContents} outerMarkers={outerMarkers} />

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
                {RASIS[kavippu.rasiIndex].nameEnglish}{" "}
                <span className="tamil">({RASIS[kavippu.rasiIndex].nameTamil})</span>{" "}
                {kavippu.degreeInRasi !== undefined && formatDegreeInRasi(kavippu.degreeInRasi)}
                <details style={{ fontSize: 12, color: "#9aa0c0", marginTop: 4 }}>
                  <summary>Calculation trace (verified against 3 reference charts)</summary>
                  <ul style={{ margin: "4px 0 0 0", paddingLeft: 18 }}>
                    {kavippu.calculationTrace.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </details>
              </>
            ) : (
              "unavailable"
            )}
          </div>

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
