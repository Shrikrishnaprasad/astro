import { useMemo, useState } from "react";
import {
  ASHTAKAVARGA_CONTRIBUTORS,
  KAKSHYA_LORDS,
  type AshtakavargaContributor,
} from "../data/ashtakavargaTables";
import { PLANET_TAMIL_ABBR } from "../data/planetsTamil";
import { RASIS } from "../data/rasis";
import {
  computeAshtakavarga,
  evaluateKakshyaPlacements,
} from "../engine/ashtakavarga";
import { rasiToHouseNumber } from "../engine/houses";
import { PLANETS, type ChartResult, type LongitudeMap, type Planet } from "../engine/types";
import { formatDegreeInRasi } from "../utils/format";

// Standard South Indian 4x4 grid rasi layout
const SOUTH_GRID: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];

export default function AshtakavargaPanel({
  chart,
  transitLongitudes,
}: {
  chart: ChartResult;
  transitLongitudes?: LongitudeMap;
}) {
  const [selectedView, setSelectedView] = useState<"SAV" | AshtakavargaContributor>("SAV");
  const [prastaraPlanet, setPrastaraPlanet] = useState<AshtakavargaContributor>("Sun");

  const av = useMemo(() => {
    const rasiMap = {} as Record<Planet, number>;
    for (const p of PLANETS) {
      rasiMap[p] = chart.planetRasi[p].rasiIndex;
    }
    return computeAshtakavarga(rasiMap, chart.lagnaRasiIndex);
  }, [chart]);

  const allBavs = useMemo(() => [...av.bhinna, av.lagnaBav], [av]);

  const activeBav = useMemo(
    () => (selectedView === "SAV" ? null : allBavs.find((b) => b.planet === selectedView) ?? null),
    [selectedView, allBavs],
  );

  const selectedPrastaraBav = useMemo(
    () => allBavs.find((b) => b.planet === prastaraPlanet) ?? av.bhinna[0],
    [allBavs, prastaraPlanet, av.bhinna],
  );

  const natalKakshyas = useMemo(
    () => evaluateKakshyaPlacements(chart.planetLongitudes, av),
    [chart.planetLongitudes, av],
  );

  const transitKakshyas = useMemo(
    () => (transitLongitudes ? evaluateKakshyaPlacements(transitLongitudes, av) : null),
    [transitLongitudes, av],
  );

  return (
    <div>
      <section className="card">
        <h3>Ashtakavarga — South Indian Bindu Chart &amp; Matrix (337 SAV Bindus)</h3>
        <p style={{ fontSize: 13, color: "#9aa0c0" }}>
          Classical Parashari Ashtakavarga with all 8 contributors (7 planets + Lagna). Total
          Sarvashtakavarga (SAV) = <strong>{av.sarvaTotal} bindus</strong> (Sun 48, Moon 49, Mars
          39, Mercury 54, Jupiter 56, Venus 52, Saturn 39) + Lagna BAV ({av.lagnaBav.total} bindus).
        </p>

        <div className="field-row" style={{ marginBottom: 12 }}>
          <label>
            Chart view:
            <select
              value={selectedView}
              onChange={(e) =>
                setSelectedView(e.target.value as "SAV" | AshtakavargaContributor)
              }
            >
              <option value="SAV">Sarvashtakavarga (SAV — {av.sarvaTotal} Bindus)</option>
              {allBavs.map((b) => (
                <option key={b.planet} value={b.planet}>
                  {b.planet} Bhinnashtakavarga ({b.total} Bindus)
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* South Indian Bindu Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(110px, 1fr))",
            gap: 4,
            maxWidth: 560,
            margin: "0 auto 18px",
            border: "2px solid #3a416f",
            padding: 4,
            borderRadius: 6,
            background: "#13172b",
          }}
        >
          {SOUTH_GRID.flatMap((row, rIdx) =>
            row.map((rasiIndex, cIdx) => {
              if (rasiIndex === null) {
                if (rIdx === 1 && cIdx === 1) {
                  return (
                    <div
                      key="center"
                      style={{
                        gridColumn: "2 / span 2",
                        gridRow: "2 / span 2",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 12,
                        textAlign: "center",
                        background: "#181d36",
                        borderRadius: 4,
                      }}
                    >
                      <strong style={{ fontSize: 15 }}>
                        {selectedView === "SAV"
                          ? "Sarvashtakavarga (SAV)"
                          : `${selectedView} BAV`}
                      </strong>
                      <span style={{ fontSize: 13, color: "#9aa0c0", marginTop: 4 }}>
                        Total:{" "}
                        <strong>
                          {selectedView === "SAV" ? av.sarvaTotal : activeBav?.total}
                        </strong>{" "}
                        Bindus
                      </span>
                      <span style={{ fontSize: 11, color: "#9aa0c0", marginTop: 4 }}>
                        {selectedView === "SAV"
                          ? "≥28 auspicious · <25 weak"
                          : "≥5 strong · ≤3 weak"}
                      </span>
                    </div>
                  );
                }
                return null;
              }

              const rasi = RASIS[rasiIndex];
              const house = rasiToHouseNumber(chart.lagnaRasiIndex, rasiIndex);
              const bindus =
                selectedView === "SAV"
                  ? av.sarvaByRasi[rasiIndex]
                  : (activeBav?.bindusByRasi[rasiIndex] ?? 0);
              const isStrong = selectedView === "SAV" ? bindus >= 28 : bindus >= 5;
              const isWeak = selectedView === "SAV" ? bindus < 25 : bindus <= 3;

              const occupants = PLANETS.filter(
                (p) => chart.planetRasi[p].rasiIndex === rasiIndex,
              );
              const isLagna = chart.lagnaRasiIndex === rasiIndex;

              return (
                <div
                  key={rasiIndex}
                  style={{
                    minHeight: 92,
                    padding: 8,
                    border: isLagna ? "2px solid #f0b429" : "1px solid #2b3158",
                    borderRadius: 4,
                    background: "#1b203d",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      color: "#9aa0c0",
                    }}
                  >
                    <span>
                      {rasi.nameEnglish} (H{house})
                    </span>
                    {isLagna && <strong style={{ color: "#f0b429" }}>லக்</strong>}
                  </div>
                  <div
                    className={isStrong ? "pass" : isWeak ? "fail" : ""}
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      textAlign: "center",
                      margin: "4px 0",
                    }}
                  >
                    {bindus}
                  </div>
                  <div style={{ fontSize: 11, color: "#c5cbe8", minHeight: 16 }}>
                    {occupants.map((p) => PLANET_TAMIL_ABBR[p]).join(" ")}
                  </div>
                </div>
              );
            }),
          )}
        </div>

        <h4>Complete Rasi × Bhinnashtakavarga &amp; SAV Matrix</h4>
        <div className="chart-scroll">
          <table>
            <thead>
              <tr>
                <th>Rasi</th>
                <th>House</th>
                {av.bhinna.map((b) => (
                  <th key={b.planet}>{b.planet}</th>
                ))}
                <th>Lagna BAV</th>
                <th>SAV</th>
                <th>SAV (Reduced)</th>
              </tr>
            </thead>
            <tbody>
              {RASIS.map((rasi, rIdx) => {
                const house = rasiToHouseNumber(chart.lagnaRasiIndex, rIdx);
                const savVal = av.sarvaByRasi[rIdx];
                return (
                  <tr key={rasi.nameEnglish}>
                    <td>
                      {rasi.nameEnglish} <span className="tamil">({rasi.nameTamil})</span>
                    </td>
                    <td>{house}</td>
                    {av.bhinna.map((b) => {
                      const val = b.bindusByRasi[rIdx];
                      return (
                        <td
                          key={b.planet}
                          className={val >= 5 ? "pass" : val <= 2 ? "fail" : ""}
                        >
                          {val}
                        </td>
                      );
                    })}
                    <td>{av.lagnaBav.bindusByRasi[rIdx]}</td>
                    <td className={savVal >= 28 ? "pass" : savVal < 25 ? "fail" : ""}>
                      <strong>{savVal}</strong>
                    </td>
                    <td>{av.sarvaReducedByRasi[rIdx]}</td>
                  </tr>
                );
              })}
              <tr style={{ fontWeight: 700, borderTop: "2px solid #3a416f" }}>
                <td colSpan={2}>Total Bindus</td>
                {av.bhinna.map((b) => (
                  <td key={b.planet}>{b.total}</td>
                ))}
                <td>{av.lagnaBav.total}</td>
                <td>{av.sarvaTotal}</td>
                <td>{av.sarvaReducedByRasi.reduce((a, b) => a + b, 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3>Shodhana (Trikona &amp; Ekadhipatya Reductions) &amp; Pinda Sadhana</h3>
        <p style={{ fontSize: 13, color: "#9aa0c0" }}>
          Classical BPHS reductions: <strong>Trikona Shodhana</strong> (trinal reduction) followed
          by <strong>Ekadhipatya Shodhana</strong> (dual-lordship reduction), multiplied by Rasi
          Gunakara and Graha Gunakara to yield <strong>Rasi Pinda</strong>,{" "}
          <strong>Graha Pinda</strong>, and total <strong>Sodhya Pinda</strong>.
        </p>
        <div className="chart-scroll">
          <table>
            <thead>
              <tr>
                <th>BAV Planet</th>
                <th>Raw Bindus</th>
                <th>After Trikona Shodhana</th>
                <th>After Ekadhipatya Shodhana</th>
                <th>Rasi Pinda</th>
                <th>Graha Pinda</th>
                <th>Sodhya Pinda (Total)</th>
              </tr>
            </thead>
            <tbody>
              {allBavs.map((b) => {
                const triTotal = b.trikonaReducedByRasi.reduce((x, y) => x + y, 0);
                const ekaTotal = b.ekadhipatyaReducedByRasi.reduce((x, y) => x + y, 0);
                return (
                  <tr key={b.planet}>
                    <td>
                      <strong>{b.planet}</strong>
                    </td>
                    <td>{b.total}</td>
                    <td>{triTotal}</td>
                    <td>{ekaTotal}</td>
                    <td>{b.rasiPinda}</td>
                    <td>{b.grahaPinda}</td>
                    <td>
                      <strong>{b.sodhyaPinda}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3>Prastarashtakavarga &amp; Kakshya (3°45&prime; Sub-Divisions)</h3>
        <p style={{ fontSize: 13, color: "#9aa0c0" }}>
          Each 30° sign is divided into 8 Kakshyas of 3°45&prime; ruled in order by{" "}
          <strong>Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon, and Lagna</strong>. A planet
          transiting or placed in a Kakshya whose lord contributes a Bindu (1) in that planet&apos;s
          Prastara table yields auspicious results.
        </p>

        <div className="field-row" style={{ marginBottom: 10 }}>
          <label>
            Inspect Prastara table for:
            <select
              value={prastaraPlanet}
              onChange={(e) => setPrastaraPlanet(e.target.value as AshtakavargaContributor)}
            >
              {ASHTAKAVARGA_CONTRIBUTORS.map((c) => (
                <option key={c} value={c}>
                  {c} Prastarashtakavarga
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="chart-scroll">
          <table>
            <thead>
              <tr>
                <th>Kakshya # &amp; Span</th>
                <th>Contributor / Kakshya Lord</th>
                {RASIS.map((r) => (
                  <th key={r.nameEnglish}>{r.nameEnglish.slice(0, 3)}</th>
                ))}
                <th>Row Total</th>
              </tr>
            </thead>
            <tbody>
              {KAKSHYA_LORDS.map((contributor, kIdx) => {
                const row = selectedPrastaraBav.prastara[contributor];
                const rowSum = row.reduce((a, b) => a + b, 0);
                const startDeg = kIdx * 3.75;
                const endDeg = (kIdx + 1) * 3.75;
                return (
                  <tr key={contributor}>
                    <td style={{ fontSize: 12 }}>
                      K{kIdx + 1} ({formatDegreeInRasi(startDeg)}–{formatDegreeInRasi(endDeg)})
                    </td>
                    <td>
                      <strong>{contributor}</strong>
                    </td>
                    {row.map((val, rIdx) => (
                      <td key={rIdx} className={val === 1 ? "pass" : "fail"}>
                        {val}
                      </td>
                    ))}
                    <td>
                      <strong>{rowSum}</strong>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ fontWeight: 700, borderTop: "2px solid #3a416f" }}>
                <td colSpan={2}>Total BAV in Rasi</td>
                {selectedPrastaraBav.bindusByRasi.map((v, rIdx) => (
                  <td key={rIdx}>{v}</td>
                ))}
                <td>{selectedPrastaraBav.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 style={{ marginTop: 16 }}>Natal &amp; Transit Kakshya Assessment</h4>
        <div className="chart-scroll">
          <table>
            <thead>
              <tr>
                <th>Planet</th>
                <th>Natal Rasi &amp; Degree</th>
                <th>Natal Kakshya Lord</th>
                <th>Natal Kakshya Status</th>
                <th>Natal BAV / SAV</th>
                {transitKakshyas && <th>Live Transit Rasi &amp; Kakshya</th>}
                {transitKakshyas && <th>Transit Kakshya Status</th>}
              </tr>
            </thead>
            <tbody>
              {natalKakshyas.map((nk, idx) => {
                const tk = transitKakshyas?.[idx];
                return (
                  <tr key={nk.planet}>
                    <td>
                      <strong>{nk.planet}</strong>
                    </td>
                    <td>
                      {RASIS[nk.rasiIndex].nameEnglish} {formatDegreeInRasi(nk.degreeInRasi)}
                    </td>
                    <td>
                      K{nk.kakshyaNumber} — {nk.kakshyaLord}
                    </td>
                    <td className={nk.hasBindu ? "pass" : "fail"}>
                      {nk.hasBindu ? "Bindu (1 — Auspicious)" : "Rekha (0 — Barren)"}
                    </td>
                    <td>
                      {nk.bavBindusInRasi} / {nk.savBindusInRasi}
                    </td>
                    {tk && (
                      <td>
                        {RASIS[tk.rasiIndex].nameEnglish} {formatDegreeInRasi(tk.degreeInRasi)} (K
                        {tk.kakshyaNumber}: {tk.kakshyaLord})
                      </td>
                    )}
                    {tk && (
                      <td className={tk.hasBindu ? "pass" : "fail"}>
                        {tk.hasBindu
                          ? `Bindu (1) · BAV ${tk.bavBindusInRasi}`
                          : `Rekha (0) · BAV ${tk.bavBindusInRasi}`}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
