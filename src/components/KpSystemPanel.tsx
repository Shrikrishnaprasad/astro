import { useMemo } from "react";
import { PLANET_TAMIL_ABBR, PLANET_TAMIL_NAME } from "../data/planetsTamil";
import { RASIS } from "../data/rasis";
import type { KpSystemResult } from "../engine/kp";
import { PLANETS } from "../engine/types";
import { formatDegreeInRasi, formatSiderealLongitude } from "../utils/format";
import SouthIndianChart, { type ChartMarker } from "./SouthIndianChart";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export default function KpSystemPanel({
  kp,
  onRefreshRulingPlanets,
}: {
  kp: KpSystemResult;
  onRefreshRulingPlanets?: () => void;
}) {
  // Chart 1: Rasi Chart with Planet markers + 12 Placidus Cusp markers
  const rasiAndCuspCells = useMemo(() => {
    const cells: Record<number, ChartMarker[]> = {};
    const push = (rasiIndex: number, marker: ChartMarker) => {
      (cells[rasiIndex] ??= []).push(marker);
    };

    for (const c of kp.cusps) {
      push(c.rasiIndex, {
        label: c.cuspNumber === 1 ? "லக் (I)" : ROMAN[c.cuspNumber - 1],
        kind: c.cuspNumber === 1 ? "lagna" : "arudha",
        title: `Cusp ${c.cuspNumber} (${ROMAN[c.cuspNumber - 1]}) — ${RASIS[c.rasiIndex].nameEnglish} ${formatDegreeInRasi(c.degreeInRasi)} | Star: ${c.nakshatraLord} | Sub: ${c.subLord}`,
        degree: c.degreeInRasi,
      });
    }

    for (const planet of PLANETS) {
      const p = kp.planets[planet];
      push(p.rasiIndex, {
        label: PLANET_TAMIL_ABBR[planet],
        kind: "planet",
        title: `${planet} (${PLANET_TAMIL_NAME[planet]}) — Bhava ${p.bhavaHouse} | Star: ${p.nakshatraLord} | Sub: ${p.subLord}`,
        degree: p.degreeInRasi,
        retrograde: p.isRetrograde,
      });
    }

    return cells;
  }, [kp]);

  // Chart 2: Bhava Chalit (Placidus Bhava placement mapped to each Bhava's cusp sign)
  const bhavaChalitCells = useMemo(() => {
    const cells: Record<number, ChartMarker[]> = {};
    const push = (rasiIndex: number, marker: ChartMarker) => {
      (cells[rasiIndex] ??= []).push(marker);
    };

    for (const c of kp.cusps) {
      push(c.rasiIndex, {
        label: `B${c.cuspNumber}`,
        kind: c.cuspNumber === 1 ? "lagna" : "arudha",
        title: `Bhava ${c.cuspNumber} Cusp in ${RASIS[c.rasiIndex].nameEnglish} (${formatDegreeInRasi(c.degreeInRasi)})`,
        degree: c.degreeInRasi,
      });
    }

    for (const planet of PLANETS) {
      const p = kp.planets[planet];
      const cuspSignForBhava = kp.cusps[p.bhavaHouse - 1].rasiIndex;
      push(cuspSignForBhava, {
        label: `${PLANET_TAMIL_ABBR[planet]}(H${p.bhavaHouse})`,
        kind: "planet",
        title: `${planet} in Placidus Bhava ${p.bhavaHouse} (Rasi: ${RASIS[p.rasiIndex].nameEnglish})`,
        degree: p.degreeInRasi,
        retrograde: p.isRetrograde,
      });
    }

    return cells;
  }, [kp]);

  return (
    <div>
      {kp.horaryEntry && (
        <div className="card" style={{ borderLeft: "4px solid #f0b429" }}>
          <strong>KP Horary Number #{kp.horaryEntry.number} / 249:</strong>{" "}
          {kp.horaryEntry.rasiName} (Sign Lord: <strong>{kp.horaryEntry.rasiLord}</strong>) ·{" "}
          Nakshatra: <strong>{kp.horaryEntry.nakshatraName}</strong> (Star Lord:{" "}
          <strong>{kp.horaryEntry.starLord}</strong>) · Sub-Lord:{" "}
          <strong>{kp.horaryEntry.subLord}</strong> · Span:{" "}
          {formatSiderealLongitude(kp.horaryEntry.startLongitude)} –{" "}
          {formatSiderealLongitude(kp.horaryEntry.endLongitude)}
        </div>
      )}

      <div className="chart-pair">
        <div className="chart-pair__item">
          <h3 className="chart-pair__title">KP Rasi &amp; 12 Placidus Cusps (I–XII)</h3>
          <SouthIndianChart cellContents={rasiAndCuspCells} />
          <p className="chart-pair__hint">
            Roman numerals (I–XII) show Placidus Bhava Cusp degrees in each Rasi
          </p>
        </div>
        <div className="chart-pair__item">
          <h3 className="chart-pair__title">KP Placidus Bhava Chalit (Nirayana Bhava)</h3>
          <SouthIndianChart cellContents={bhavaChalitCells} />
          <p className="chart-pair__hint">
            Planets grouped by their Placidus Bhava house (H1–H12)
          </p>
        </div>
      </div>

      {/* 1. 12 KP Placidus Cusps Table */}
      <section className="card">
        <h3>12 KP Placidus House Cusps (Sign · Star · Sub · Sub-Sub · Prana)</h3>
        <div className="chart-scroll">
          <table>
            <thead>
              <tr>
                <th>Cusp</th>
                <th>Sidereal λ</th>
                <th>Rasi &amp; Degree</th>
                <th>Sign Lord</th>
                <th>Nakshatra (Pada)</th>
                <th>Star Lord</th>
                <th>Sub-Lord</th>
                <th>Sub-Sub-Lord (SSL)</th>
                <th>Prana-Lord</th>
              </tr>
            </thead>
            <tbody>
              {kp.cusps.map((c) => (
                <tr key={c.cuspNumber}>
                  <td>
                    <strong>
                      {ROMAN[c.cuspNumber - 1]} (House {c.cuspNumber})
                    </strong>
                  </td>
                  <td>{formatSiderealLongitude(c.longitude)}</td>
                  <td>
                    {RASIS[c.rasiIndex].nameEnglish}{" "}
                    <span className="tamil">({RASIS[c.rasiIndex].nameTamil})</span>{" "}
                    {formatDegreeInRasi(c.degreeInRasi)}
                  </td>
                  <td>{c.rasiLord}</td>
                  <td>
                    {c.nakshatraName} ({c.pada})
                  </td>
                  <td>
                    <strong>{c.nakshatraLord}</strong>
                  </td>
                  <td className="pass">
                    <strong>{c.subLord}</strong>
                  </td>
                  <td>{c.subSubLord}</td>
                  <td>{c.pranaLord}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. 9 KP Planets Table */}
      <section className="card">
        <h3>KP Planetary Positions, Placidus Bhava &amp; Sub-Lords</h3>
        <p style={{ fontSize: 12, color: "#9aa0c0" }}>
          <strong>★ Untenanted</strong> means no planet occupies that planet&apos;s Nakshatras — in
          KP, an untenanted planet becomes a strong self-significator for the houses it occupies and
          owns.
        </p>
        <div className="chart-scroll">
          <table>
            <thead>
              <tr>
                <th>Planet</th>
                <th>Sidereal λ</th>
                <th>Rasi &amp; Degree</th>
                <th>Placidus Bhava</th>
                <th>Sign Lord</th>
                <th>Nakshatra (Pada)</th>
                <th>Star Lord</th>
                <th>Sub-Lord</th>
                <th>Sub-Sub-Lord</th>
                <th>Tenancy</th>
              </tr>
            </thead>
            <tbody>
              {PLANETS.map((planet) => {
                const p = kp.planets[planet];
                return (
                  <tr key={planet}>
                    <td>
                      <strong>{planet}</strong>{" "}
                      <span className="tamil">({PLANET_TAMIL_NAME[planet]})</span>
                      {p.isRetrograde && (
                        <span className="retrograde-tag" title="Vakram (retrograde)">
                          {" "}
                          (R)
                        </span>
                      )}
                    </td>
                    <td>{formatSiderealLongitude(p.longitude)}</td>
                    <td>
                      {RASIS[p.rasiIndex].nameEnglish} {formatDegreeInRasi(p.degreeInRasi)}
                    </td>
                    <td>
                      <strong>House {p.bhavaHouse}</strong>
                    </td>
                    <td>{p.rasiLord}</td>
                    <td>
                      {p.nakshatraName} ({p.pada})
                    </td>
                    <td>
                      <strong>{p.nakshatraLord}</strong>
                    </td>
                    <td className="pass">
                      <strong>{p.subLord}</strong>
                    </td>
                    <td>{p.subSubLord}</td>
                    <td className={p.isUntenanted ? "pass" : ""}>
                      {p.isUntenanted ? "★ Untenanted" : "Tenanted"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. 4-Fold KP Significators (House-wise & Planet-wise) */}
      <section className="card">
        <h3>KP 4-Fold Significators — Planet-wise (with Star/Sub Hierarchy &amp; Node Rules)</h3>
        <p style={{ fontSize: 12, color: "#9aa0c0" }}>
          Hierarchy of strength: <strong>Level A</strong> (in star of occupant) &gt;{" "}
          <strong>Level B</strong> (occupant) &gt; <strong>Level C</strong> (in star of cusp owner)
          &gt; <strong>Level D</strong> (cusp owner). In KP, a planet gives results of its{" "}
          <strong>Star Lord&apos;s houses</strong>, decided/filtered by its{" "}
          <strong>Sub-Lord&apos;s houses</strong>.
        </p>
        <div className="chart-scroll">
          <table>
            <thead>
              <tr>
                <th>Planet</th>
                <th>Star Lord (Houses)</th>
                <th>Sub-Lord (Houses)</th>
                <th>Level A (Star of Occ.)</th>
                <th>Level B (Occupant)</th>
                <th>Level C (Star of Owner)</th>
                <th>Level D (Cusp Owner)</th>
                <th>Total Signified Houses</th>
              </tr>
            </thead>
            <tbody>
              {kp.planetSignificators.map((row) => (
                <tr key={row.planet}>
                  <td>
                    <strong>{row.planet}</strong>
                    {row.isUntenanted && (
                      <span className="pass" style={{ fontSize: 11 }}>
                        {" "}
                        ★
                      </span>
                    )}
                    {row.nodeAgentNote && (
                      <div style={{ fontSize: 11, color: "#9aa0c0" }}>{row.nodeAgentNote}</div>
                    )}
                  </td>
                  <td>
                    <strong>{row.starLord}</strong> [{row.starLordHouses.join(", ")}]
                  </td>
                  <td>
                    <strong className="pass">{row.subLord}</strong> [{row.subLordHouses.join(", ")}]
                  </td>
                  <td>{row.levelAHouses.join(", ") || "—"}</td>
                  <td>{row.levelBHouses.join(", ") || "—"}</td>
                  <td>{row.levelCHouses.join(", ") || "—"}</td>
                  <td>{row.levelDHouses.join(", ") || "—"}</td>
                  <td>
                    <strong>{row.allHouses.join(", ")}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 style={{ marginTop: 18 }}>KP House-wise Significators (Bhavas I–XII)</h4>
        <div className="chart-scroll">
          <table>
            <thead>
              <tr>
                <th>Bhava</th>
                <th>Cusp Sign / Star / Sub</th>
                <th>Level A (In Star of Occupant)</th>
                <th>Level B (Occupants)</th>
                <th>Level C (In Star of Owner)</th>
                <th>Level D (Owner)</th>
                <th>Combined Significators (Priority Order)</th>
              </tr>
            </thead>
            <tbody>
              {kp.houseSignificators.map((hs) => (
                <tr key={hs.house}>
                  <td>
                    <strong>House {hs.house}</strong> ({ROMAN[hs.house - 1]})
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {hs.cuspSignLord} / {hs.cuspStarLord} /{" "}
                    <strong className="pass">{hs.cuspSubLord}</strong>
                  </td>
                  <td>{hs.levelA.join(", ") || "—"}</td>
                  <td>{hs.levelB.join(", ") || "—"}</td>
                  <td>{hs.levelC.join(", ") || "—"}</td>
                  <td>{hs.levelD.join(", ")}</td>
                  <td>
                    <strong>{hs.allSignificators.join(", ")}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. KP Cuspal Sub-Lord Event Promise Analyzer */}
      <section className="card">
        <h3>KP Cuspal Sub-Lord Event Promise Analyzer</h3>
        <p style={{ fontSize: 12, color: "#9aa0c0" }}>
          Evaluates whether each life matter is promised by the{" "}
          <strong>Primary Cusp&apos;s Sub-Lord</strong> (and its Star Lord) connecting to favorable
          houses vs. negating houses.
        </p>
        <div className="chart-scroll">
          <table>
            <thead>
              <tr>
                <th>Life Topic</th>
                <th>Primary Cusp &amp; Sub-Lord</th>
                <th>Favorable Houses</th>
                <th>Negating Houses</th>
                <th>Sub-Lord Signifies</th>
                <th>KP Verdict</th>
                <th>Detailed Explanation</th>
              </tr>
            </thead>
            <tbody>
              {kp.eventPromises.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    <strong>{ev.topic}</strong>
                  </td>
                  <td>
                    Cusp {ev.primaryCusp}: <strong className="pass">{ev.cuspSubLord}</strong> (Star:{" "}
                    {ev.cuspSubLordStarLord})
                  </td>
                  <td className="pass">{ev.favorableHouses.join(", ")}</td>
                  <td className="fail">{ev.negatingHouses.join(", ")}</td>
                  <td>
                    <strong>[{ev.subLordSignifiedHouses.join(", ")}]</strong>
                  </td>
                  <td
                    className={
                      ev.verdict === "Promised (Strong)"
                        ? "pass"
                        : ev.verdict === "Denied / Unfavorable"
                          ? "fail"
                          : ""
                    }
                  >
                    <strong>{ev.verdict}</strong>
                  </td>
                  <td style={{ fontSize: 12, maxWidth: 320 }}>{ev.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. KP Ruling Planets (RP) */}
      <section className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <h3 style={{ margin: 0 }}>
            KP Ruling Planets (RP) — as of {kp.rulingPlanets.instant.toLocaleString()}
          </h3>
          {onRefreshRulingPlanets && (
            <button type="button" onClick={onRefreshRulingPlanets}>
              Refresh Ruling Planets to Now
            </button>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#9aa0c0", marginTop: 6 }}>
          In Krishnamurti Paddhati, Ruling Planets at the moment of judgment confirm and time events
          promised by the natal/horary chart.
        </p>
        <div className="field-row" style={{ alignItems: "flex-start" }}>
          <table style={{ flex: 1 }}>
            <thead>
              <tr>
                <th>RP Role (Strength Order)</th>
                <th>Ruling Planet</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1. Lagna Sub-Lord (Strongest)</td>
                <td className="pass">
                  <strong>{kp.rulingPlanets.lagnaSubLord}</strong>
                </td>
              </tr>
              <tr>
                <td>2. Lagna Star-Lord</td>
                <td>
                  <strong>{kp.rulingPlanets.lagnaStarLord}</strong>
                </td>
              </tr>
              <tr>
                <td>3. Moon Sub-Lord</td>
                <td className="pass">
                  <strong>{kp.rulingPlanets.moonSubLord}</strong>
                </td>
              </tr>
              <tr>
                <td>4. Moon Star-Lord</td>
                <td>
                  <strong>{kp.rulingPlanets.moonStarLord}</strong>
                </td>
              </tr>
              <tr>
                <td>5. Lagna Sign-Lord</td>
                <td>{kp.rulingPlanets.lagnaRasiLord}</td>
              </tr>
              <tr>
                <td>6. Moon Sign-Lord</td>
                <td>{kp.rulingPlanets.moonRasiLord}</td>
              </tr>
              <tr>
                <td>7. Day (Vara) Lord</td>
                <td>{kp.rulingPlanets.dayLord}</td>
              </tr>
            </tbody>
          </table>

          <table style={{ flex: 1 }}>
            <thead>
              <tr>
                <th>Ranked Ruling Planet</th>
                <th>Active RP Roles</th>
              </tr>
            </thead>
            <tbody>
              {kp.rulingPlanets.rankedUnique.map((rp) => (
                <tr key={rp.planet}>
                  <td>
                    <strong className={rp.roles.length >= 2 ? "pass" : ""}>
                      {rp.planet}
                    </strong>{" "}
                    ({rp.roles.length}×)
                  </td>
                  <td style={{ fontSize: 12 }}>{rp.roles.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
