import { useMemo, useState } from "react";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import AshtakavargaPanel from "../components/AshtakavargaPanel";
import ShodashavargaPanel from "../components/ShodashavargaPanel";
import { NAKSHATRAS } from "../data/nakshatras";
import { computeAvayogi, computeYogi } from "../engine/jaiminiPoints";
import { kpLordChainsForChart } from "../engine/kp";
import { computePanchangam } from "../engine/panchanga";
import { computePartialShadbala } from "../engine/shadbala";
import { computeTithiShunya } from "../engine/tithiShunya";
import { computeYogaDoshaPack } from "../engine/yogaDosha";
import type { BirthInput } from "../engine/types";
import { PLANETS } from "../engine/types";
import { planetHouses } from "../engine/houses";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import { useBirthChart } from "../hooks/useBirthChart";

export default function AdvancedJyotishPage() {
  const { resolved } = useEphemerisSettings();
  const [input, setInput] = useState<BirthInput | null>(null);
  const chart = useBirthChart(input);

  const yogi = useMemo(
    () => (chart ? computeYogi(chart.planetLongitudes.Sun, chart.planetLongitudes.Moon) : null),
    [chart],
  );
  const avayogi = useMemo(
    () => (chart ? computeAvayogi(chart.planetLongitudes.Sun, chart.planetLongitudes.Moon) : null),
    [chart],
  );

  const tithiShunya = useMemo(() => {
    if (!chart || !input) return null;
    const p = computePanchangam(input.date, input.latitude, input.longitude, resolved);
    return computeTithiShunya(p.tithiIndex, chart.planetRasi.Moon.nakshatraIndex);
  }, [chart, input, resolved]);

  const shadbala = useMemo(() => {
    if (!chart) return null;
    const rasiMap = {} as Record<(typeof PLANETS)[number], number>;
    for (const p of PLANETS) rasiMap[p] = chart.planetRasi[p].rasiIndex;
    const houses = planetHouses(chart.lagnaRasiIndex, rasiMap);
    return computePartialShadbala(rasiMap, houses);
  }, [chart]);

  const kp = useMemo(() => (chart ? kpLordChainsForChart(chart.planetLongitudes) : null), [chart]);
  const dosha = useMemo(() => (chart ? computeYogaDoshaPack(chart) : null), [chart]);

  return (
    <div>
      <h2>Advanced Jyotish</h2>
      <EphemerisAccuracyNotice />
      <p style={{ fontSize: 14, color: "#9aa0c0" }}>
        Yogi / Avayogi sphutas, Tithi Shunya nakshatras, partial Shadbala (dignity), Parashari
        Ashtakavarga, Mangal dosha, and KP sublords for one birth chart.
      </p>
      <DateTimePlaceForm submitToCalculate submitLabel="Calculate chart" onChange={setInput} />

      {!chart && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter birth data and click <strong>Calculate chart</strong>.
        </p>
      )}

      {yogi && avayogi && (
        <section className="card">
          <h3>Yogi &amp; Avayogi</h3>
          <table>
            <tbody>
              <tr>
                <th>Yogi graha</th>
                <td>
                  {yogi.yogiGraha} — {NAKSHATRAS[yogi.yogiNakshatraIndex].nameEnglish}
                </td>
              </tr>
              <tr>
                <th>Duplicate Yogi</th>
                <td>{yogi.duplicateYogiGraha} (sign lord of Yogi point)</td>
              </tr>
              <tr>
                <th>Avayogi graha</th>
                <td>
                  {avayogi.avayogiGraha} — {NAKSHATRAS[avayogi.avayogiNakshatraIndex].nameEnglish}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {tithiShunya && (
        <section className="card">
          <h3>Tithi Shunya Nakshatra</h3>
          <p>
            Tithi #{tithiShunya.tithiNumberInPaksha} in paksha — shunya nakshatras:{" "}
            {tithiShunya.hasShunyaList ? tithiShunya.shunyaNakshatraNames.join(", ") : "none in table"}
          </p>
          <p className={tithiShunya.moonIsShunya ? "fail" : "pass"}>
            Moon nakshatra {NAKSHATRAS[chart!.planetRasi.Moon.nakshatraIndex].nameEnglish}:{" "}
            {tithiShunya.moonIsShunya ? "Shunya (avoid for auspicious beginnings)" : "Not shunya"}
          </p>
        </section>
      )}

      {dosha && (
        <section className="card">
          <h3>Yoga &amp; dosha pack</h3>
          <p>
            <strong>Mangal dosha:</strong>{" "}
            {dosha.mangalDosha.present
              ? dosha.mangalDosha.activeAfterCancellation
                ? "Present (active)"
                : "Present but commonly cancelled"
              : "Not present"}
          </p>
          {dosha.mangalDosha.references.length > 0 && (
            <ul>
              {dosha.mangalDosha.references.map((r) => (
                <li key={r.from}>
                  Mars in house {r.house} from {r.from}
                </li>
              ))}
            </ul>
          )}
          {dosha.mangalDosha.cancellations.length > 0 && (
            <p style={{ fontSize: 13, color: "#9aa0c0" }}>
              Cancellations / notes: {dosha.mangalDosha.cancellations.join("; ")}
            </p>
          )}
          <p style={{ fontSize: 12, color: "#9aa0c0" }}>{dosha.otherYogasNote}</p>
        </section>
      )}

      {shadbala && (
        <section className="card">
          <h3>Shadbala (partial — Sthana / dignity)</h3>
          <table>
            <thead>
              <tr>
                <th>Planet</th>
                <th>House</th>
                <th>Score</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {shadbala.map((row) => (
                <tr key={row.planet}>
                  <td>{row.planet}</td>
                  <td>{row.house}</td>
                  <td>{(row.sthanaScore * 100).toFixed(0)}%</td>
                  <td>{row.notes.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 12, color: "#9aa0c0" }}>
            Full BPHS Shadbala (six balas, virupas) is not computed — only a dignity proxy.
          </p>
        </section>
      )}

      {chart && (
        <>
          <AshtakavargaPanel chart={chart} />
          <ShodashavargaPanel chart={chart} />
        </>
      )}

      {kp && (
        <section className="card">
          <h3>KP sublords</h3>
          <table>
            <thead>
              <tr>
                <th>Planet</th>
                <th>Star lord</th>
                <th>Sub lord</th>
                <th>Sub-sub lord</th>
              </tr>
            </thead>
            <tbody>
              {PLANETS.map((p) => (
                <tr key={p}>
                  <td>{p}</td>
                  <td>{kp[p].nakshatraLord}</td>
                  <td>{kp[p].subLord}</td>
                  <td>{kp[p].subSubLord}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
