import { useMemo, useState } from "react";
import { LAGNA_TAMIL, PLANET_TAMIL_ABBR, PLANET_TAMIL_NAME } from "../data/planetsTamil";
import { RASIS, rasiLord } from "../data/rasis";
import { rasiToHouseNumber } from "../engine/houses";
import { shouldShowRetrograde, type RetrogradeMap } from "../engine/retrograde";
import { PLANETS, type ChartResult } from "../engine/types";
import {
  computeAllShodashavarga,
  computeVimshopakaBala,
  SHODASHAVARGA_DEFS,
  type VargaChart,
  type VargaId,
} from "../engine/vargas";
import SouthIndianChart, { type ChartMarker } from "./SouthIndianChart";

type VargaViewMode = "pair" | "key6" | "all16";

const KEY_6_VARGAS: VargaId[] = ["D1", "D2", "D3", "D9", "D10", "D12"];

function buildVargaCells(
  vc: VargaChart,
  retrograde: RetrogradeMap | null,
): Record<number, ChartMarker[]> {
  const cells: Record<number, ChartMarker[]> = {};
  const push = (rasiIndex: number, marker: ChartMarker) => {
    (cells[rasiIndex] ??= []).push(marker);
  };

  for (const planet of PLANETS) {
    const pl = vc.planets[planet];
    const isRetrograde = shouldShowRetrograde(planet, retrograde);
    push(pl.rasiIndex, {
      label: PLANET_TAMIL_ABBR[planet],
      kind: "planet",
      title: `${planet} (${PLANET_TAMIL_NAME[planet]}) in ${vc.def.id} (${vc.def.nameSanskrit})${pl.isVargottama && vc.def.id !== "D1" ? " — Vargottama ★" : ""}${isRetrograde ? " - Vakram" : ""}`,
      retrograde: isRetrograde,
    });
  }

  push(vc.lagnaRasiIndex, {
    label: LAGNA_TAMIL,
    kind: "lagna",
    title: `${vc.def.id} Lagna (${RASIS[vc.lagnaRasiIndex].nameEnglish})`,
  });

  return cells;
}

export default function ShodashavargaPanel({
  chart,
  retrograde = null,
}: {
  chart: ChartResult;
  retrograde?: RetrogradeMap | null;
}) {
  const [viewMode, setViewMode] = useState<VargaViewMode>("pair");
  const [selectedVarga, setSelectedVarga] = useState<VargaId>("D9");

  const vargas = useMemo(
    () => computeAllShodashavarga(chart.planetLongitudes, chart.lagnaLongitude),
    [chart.planetLongitudes, chart.lagnaLongitude],
  );

  const vimshopaka = useMemo(() => computeVimshopakaBala(vargas), [vargas]);

  const activeVargaChart = vargas[selectedVarga];

  const chartsToRender: VargaId[] =
    viewMode === "pair"
      ? ["D1", selectedVarga]
      : viewMode === "key6"
        ? KEY_6_VARGAS
        : SHODASHAVARGA_DEFS.map((d) => d.id);

  return (
    <div>
      <section className="card">
        <h3>Shodashavarga — 16 Parashari Divisional Charts (D1–D60)</h3>
        <p style={{ fontSize: 13, color: "#9aa0c0" }}>
          Inspect any of the 16 classical BPHS divisional charts (<em>Shodashavarga</em>) from{" "}
          <strong>D1 (Rasi)</strong> through <strong>D60 (Shashtiamsa)</strong>, compare side-by-side
          with D1, or view all 16 charts together. Placements matching their D1 sign are marked{" "}
          <strong>★ Vargottama</strong>.
        </p>

        <div className="field-row" style={{ marginBottom: 14 }}>
          <label>
            Layout mode:
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as VargaViewMode)}
            >
              <option value="pair">Side-by-Side (D1 + Selected Divisional Chart)</option>
              <option value="key6">Key 6 Vargas Grid (D1, D2, D3, D9, D10, D12)</option>
              <option value="all16">All 16 Shodashavarga Charts Grid (D1–D60)</option>
            </select>
          </label>

          <label>
            Inspect Varga Details:
            <select
              value={selectedVarga}
              onChange={(e) => setSelectedVarga(e.target.value as VargaId)}
            >
              {SHODASHAVARGA_DEFS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id} — {d.nameSanskrit} ({d.nameEnglish})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="chart-pair">
          {chartsToRender.map((vid) => {
            const vc = vargas[vid];
            return (
              <div key={vid} className="chart-pair__item">
                <h4 className="chart-pair__title">
                  {vc.def.id} — {vc.def.nameSanskrit} ({vc.def.nameEnglish})
                </h4>
                <SouthIndianChart cellContents={buildVargaCells(vc, retrograde)} />
                <p className="chart-pair__hint">{vc.def.signification}</p>
              </div>
            );
          })}
        </div>

        {/* Detailed table for the currently selected Varga */}
        <h4 style={{ marginTop: 18 }}>
          {activeVargaChart.def.id} ({activeVargaChart.def.nameSanskrit}) — Detailed Graha
          Placements
        </h4>
        <p style={{ fontSize: 12, color: "#9aa0c0" }}>
          <strong>Signification:</strong> {activeVargaChart.def.signification} ·{" "}
          <strong>{activeVargaChart.def.id} Lagna:</strong>{" "}
          {RASIS[activeVargaChart.lagnaRasiIndex].nameEnglish} (
          {RASIS[activeVargaChart.lagnaRasiIndex].nameTamil}) — Part #{activeVargaChart.lagnaPart}/
          {activeVargaChart.def.division}
        </p>
        <div className="chart-scroll">
          <table>
            <thead>
              <tr>
                <th>Graha</th>
                <th>D1 Natal Rasi</th>
                <th>{activeVargaChart.def.id} Rasi</th>
                <th>{activeVargaChart.def.id} Rasi Lord</th>
                <th>House from {activeVargaChart.def.id} Lagna</th>
                <th>Division Part</th>
                <th>Vargottama</th>
                {selectedVarga === "D60" && <th>D60 Shashtiamsa Deity &amp; Nature</th>}
              </tr>
            </thead>
            <tbody>
              {PLANETS.map((planet) => {
                const d1Rasi = chart.planetRasi[planet].rasiIndex;
                const vp = activeVargaChart.planets[planet];
                const house = rasiToHouseNumber(activeVargaChart.lagnaRasiIndex, vp.rasiIndex);
                return (
                  <tr key={planet}>
                    <td>
                      <strong>{planet}</strong>{" "}
                      <span className="tamil">({PLANET_TAMIL_NAME[planet]})</span>
                    </td>
                    <td>{RASIS[d1Rasi].nameEnglish}</td>
                    <td>
                      <strong>{RASIS[vp.rasiIndex].nameEnglish}</strong>{" "}
                      <span className="tamil">({RASIS[vp.rasiIndex].nameTamil})</span>
                    </td>
                    <td>{rasiLord(vp.rasiIndex)}</td>
                    <td>House {house}</td>
                    <td>
                      {vp.partNumber} / {activeVargaChart.def.division}
                    </td>
                    <td className={vp.isVargottama ? "pass" : ""}>
                      {vp.isVargottama ? "★ Vargottama" : "—"}
                    </td>
                    {selectedVarga === "D60" && (
                      <td className={vp.deityNature === "benefic" ? "pass" : "fail"}>
                        {vp.deityName} ({vp.deityNature})
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3>Complete Shodashavarga Summary Matrix (D1–D60)</h3>
        <p style={{ fontSize: 12, color: "#9aa0c0" }}>
          All 16 divisional signs at a glance. <strong>★</strong> indicates{" "}
          <strong>Vargottama</strong> (same sign as D1 Natal Rasi).
        </p>
        <div className="chart-scroll">
          <table>
            <thead>
              <tr>
                <th>Body</th>
                {SHODASHAVARGA_DEFS.map((d) => (
                  <th key={d.id} title={`${d.nameSanskrit} — ${d.nameEnglish}`}>
                    {d.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Lagna</strong>
                </td>
                {SHODASHAVARGA_DEFS.map((d) => {
                  const rIdx = vargas[d.id].lagnaRasiIndex;
                  const isVarg = d.id !== "D1" && rIdx === vargas.D1.lagnaRasiIndex;
                  return (
                    <td key={d.id} className={isVarg ? "pass" : ""}>
                      {RASIS[rIdx].nameEnglish.slice(0, 3)}
                      {isVarg ? "★" : ""}
                    </td>
                  );
                })}
              </tr>
              {PLANETS.map((planet) => (
                <tr key={planet}>
                  <td>
                    <strong>{planet}</strong>
                  </td>
                  {SHODASHAVARGA_DEFS.map((d) => {
                    const vp = vargas[d.id].planets[planet];
                    const showStar = d.id !== "D1" && vp.isVargottama;
                    return (
                      <td key={d.id} className={showStar ? "pass" : ""}>
                        {RASIS[vp.rasiIndex].nameEnglish.slice(0, 3)}
                        {showStar ? "★" : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3>Vimshopaka Bala (20-Point Composite Varga Strength)</h3>
        <p style={{ fontSize: 13, color: "#9aa0c0" }}>
          Classical BPHS composite planetary strength out of <strong>20 points</strong> across{" "}
          <strong>Shadvarga (6)</strong>, <strong>Saptavarga (7)</strong>,{" "}
          <strong>Dasavarga (10)</strong>, and <strong>Shodashavarga (16)</strong>. Scores ≥ 15
          indicate high benefic potency; ≥ 10 moderate; &lt; 10 weak in divisional charts.
        </p>
        <div className="chart-scroll">
          <table>
            <thead>
              <tr>
                <th>Planet</th>
                <th>Shadvarga (6)</th>
                <th>Saptavarga (7)</th>
                <th>Dasavarga (10)</th>
                <th>Shodashavarga (16)</th>
                <th>Vargottama Count (of 15)</th>
              </tr>
            </thead>
            <tbody>
              {vimshopaka.map((row) => (
                <tr key={row.planet}>
                  <td>
                    <strong>{row.planet}</strong>{" "}
                    <span className="tamil">({PLANET_TAMIL_NAME[row.planet]})</span>
                  </td>
                  <td className={row.shadvarga >= 15 ? "pass" : row.shadvarga < 10 ? "fail" : ""}>
                    {row.shadvarga} / 20
                  </td>
                  <td className={row.saptavarga >= 15 ? "pass" : row.saptavarga < 10 ? "fail" : ""}>
                    {row.saptavarga} / 20
                  </td>
                  <td className={row.dasavarga >= 15 ? "pass" : row.dasavarga < 10 ? "fail" : ""}>
                    {row.dasavarga} / 20
                  </td>
                  <td
                    className={
                      row.shodashavarga >= 15 ? "pass" : row.shodashavarga < 10 ? "fail" : ""
                    }
                  >
                    <strong>{row.shodashavarga} / 20</strong>
                  </td>
                  <td className={row.vargottamaCount >= 2 ? "pass" : ""}>
                    {row.vargottamaCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
