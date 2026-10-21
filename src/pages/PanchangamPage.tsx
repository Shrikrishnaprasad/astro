import { useMemo, useState } from "react";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import PlaceSelector from "../components/PlaceSelector";
import { defaultPlace, type ResolvedPlace } from "../data/places";
import { PLANET_TAMIL_NAME } from "../data/planetsTamil";
import { RASIS } from "../data/rasis";
import { CHOGHADIYA_NATURE } from "../data/muhurtaRules";
import { getSiderealAscendant } from "../engine/ascendant";
import { computePanchangam, type TimeWindow } from "../engine/panchanga";
import { computeChoghadiya, computeMuhurtas, getDishaShool } from "../engine/muhurtas";
import { getSiderealLongitudes } from "../engine/planetaryPositions";
import {
  computePushkaraForLongitude,
  computePushkaraNavamsaWindowsFor,
  type PushkaraWindow,
} from "../engine/pushkara";
import { getSunriseSunset } from "../engine/sunTimes";
import { computeSamvatsara } from "../engine/samvatsara";
import { PLANETS } from "../engine/types";
import { formatDegreeInRasi } from "../utils/format";

function fmtTime(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtWindow(w: TimeWindow | null): string {
  if (!w) return "—";
  return `${fmtTime(w.start)} – ${fmtTime(w.end)}`;
}

function fmtEndsAt(d: Date | null): string {
  if (!d) return "";
  return ` (ends ${d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })})`;
}

export default function PanchangamPage() {
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [city, setCity] = useState<ResolvedPlace>(defaultPlace());

  const date = useMemo(() => {
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(Date.UTC(y, m - 1, d, 12, 0));
  }, [dateStr]);

  const panchangam = useMemo(
    () => (date ? computePanchangam(date, city.lat, city.lon) : null),
    [date, city],
  );

  const muhurtas = useMemo(
    () => (date ? computeMuhurtas(date, city.lat, city.lon) : null),
    [date, city],
  );

  const choghadiya = useMemo(
    () => (date ? computeChoghadiya(date, city.lat, city.lon) : null),
    [date, city],
  );

  const dishaShool = date ? getDishaShool(date) : null;
  const samvatsara = date ? computeSamvatsara(date) : null;

  // Pushkara Navamsa / Bhaga for the Lagna and every graha, not just the Moon.
  // "Current" pada/status is a snapshot at the Panchangam's reference instant
  // (same moment used for the Sun/Moon rasi rows above); the timing windows
  // below search the whole day for each body independently.
  const pushkaraEntities = useMemo(() => {
    if (!date) return [];
    const longitudes = getSiderealLongitudes(date);
    const lagnaLongitude = getSiderealAscendant(date, city.lat, city.lon);
    return [
      {
        key: "Lagna",
        label: "Lagna (Ascendant)",
        longitude: lagnaLongitude,
        // The Lagna sweeps 360°/day (~0.25°/min), so it needs a much finer
        // sampling step than a planet to not skip over a ~13-minute-wide
        // Pushkara Navamsa window between samples.
        longitudeAt: (d: Date) => getSiderealAscendant(d, city.lat, city.lon),
        stepMinutes: 2,
      },
      ...PLANETS.map((planet) => ({
        key: planet,
        label: `${planet} (${PLANET_TAMIL_NAME[planet]})`,
        longitude: longitudes[planet],
        longitudeAt: (d: Date) => getSiderealLongitudes(d)[planet],
        stepMinutes: 10,
      })),
    ];
  }, [date, city]);

  // Pushkara Navamsa window(s) for the Panchangam day (sunrise to next sunrise,
  // falling back to the UTC calendar day when sunrise can't be resolved).
  const pushkaraDaySpan = useMemo((): TimeWindow | null => {
    if (!date) return null;
    if (panchangam?.sunrise) {
      const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const { sunrise: nextSunrise } = getSunriseSunset(nextDay, city.lat, city.lon);
      const start = panchangam.sunrise;
      const end = nextSunrise ?? new Date(start.getTime() + 24 * 60 * 60 * 1000);
      return { start, end };
    }
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    return { start, end };
  }, [date, panchangam?.sunrise, city]);

  const pushkaraRows = useMemo(() => {
    if (!pushkaraDaySpan) return [];
    return pushkaraEntities.map((entity) => ({
      key: entity.key,
      label: entity.label,
      result: computePushkaraForLongitude(entity.longitude),
      windows: computePushkaraNavamsaWindowsFor(
        entity.longitudeAt,
        pushkaraDaySpan.start,
        pushkaraDaySpan.end,
        entity.stepMinutes,
      ),
    }));
  }, [pushkaraEntities, pushkaraDaySpan]);

  const bodiesInPushkaraNavamsaToday = pushkaraRows.filter((row) => row.windows.length > 0);

  return (
    <div>
      <h2>Panchangam</h2>
      <EphemerisAccuracyNotice />
      <div className="card field-row">
        <label>
          Date
          <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} />
        </label>
      </div>
      <PlaceSelector onChange={setCity} />

      {panchangam && (
        <>
          <table>
            <tbody>
              <tr>
                <th>Vara (Weekday)</th>
                <td>{panchangam.vara}</td>
              </tr>
              <tr>
                <th>Tithi</th>
                <td>
                  {panchangam.tithiName} ({panchangam.paksha} Paksha)
                  {fmtEndsAt(panchangam.tithiEndsAt)}
                </td>
              </tr>
              <tr>
                <th>Nakshatra</th>
                <td>
                  {panchangam.nakshatraName}
                  {fmtEndsAt(panchangam.nakshatraEndsAt)}
                </td>
              </tr>
              <tr>
                <th>Yoga</th>
                <td>
                  {panchangam.yogaName}
                  {fmtEndsAt(panchangam.yogaEndsAt)}
                </td>
              </tr>
              <tr>
                <th>Karana</th>
                <td>
                  {panchangam.karanaName}
                  {fmtEndsAt(panchangam.karanaEndsAt)}
                </td>
              </tr>
              <tr>
                <th>Sun Rasi</th>
                <td>
                  {RASIS[panchangam.sunRasiIndex].nameEnglish}{" "}
                  <span className="tamil">({RASIS[panchangam.sunRasiIndex].nameTamil})</span>{" "}
                  {formatDegreeInRasi(panchangam.sunDegreeInRasi)}
                </td>
              </tr>
              <tr>
                <th>Moon Rasi</th>
                <td>
                  {RASIS[panchangam.moonRasiIndex].nameEnglish}{" "}
                  <span className="tamil">({RASIS[panchangam.moonRasiIndex].nameTamil})</span>{" "}
                  {formatDegreeInRasi(panchangam.moonDegreeInRasi)}
                </td>
              </tr>
              <tr>
                <th>Tamil Masa</th>
                <td>{panchangam.tamilMasa}</td>
              </tr>
              <tr>
                <th>Ritu (Season)</th>
                <td>{panchangam.ritu}</td>
              </tr>
              <tr>
                <th>Ayana</th>
                <td>{panchangam.ayana}</td>
              </tr>
              {samvatsara && (
                <tr>
                  <th>Samvatsara / Year</th>
                  <td>
                    Shaka {samvatsara.shaka} · Vikram {samvatsara.vikram}
                  </td>
                </tr>
              )}
              {dishaShool && (
                <tr>
                  <th>Disha Shool</th>
                  <td>Avoid travel toward {dishaShool}</td>
                </tr>
              )}
            </tbody>
          </table>

          <h3>Sun &amp; Moon Timings</h3>
          <table>
            <tbody>
              <tr>
                <th>Sunrise</th>
                <td>{fmtTime(panchangam.sunrise)}</td>
              </tr>
              <tr>
                <th>Sunset</th>
                <td>{fmtTime(panchangam.sunset)}</td>
              </tr>
              <tr>
                <th>Moonrise</th>
                <td>{fmtTime(panchangam.moonrise)}</td>
              </tr>
              <tr>
                <th>Moonset</th>
                <td>{fmtTime(panchangam.moonset)}</td>
              </tr>
            </tbody>
          </table>

          <h3>Pushkara Navamsa / Bhaga (Lagna &amp; Grahas)</h3>
          <p style={{ fontSize: 12, color: "#9aa0c0" }}>
            {bodiesInPushkaraNavamsaToday.length ? (
              <>
                Occurs today for:{" "}
                {bodiesInPushkaraNavamsaToday.map((row) => row.label).join(", ")}.
              </>
            ) : (
              "Doesn't occur today for the Lagna or any graha."
            )}
          </p>
          <table>
            <thead>
              <tr>
                <th>Lagna / Graha</th>
                <th>Navamsa Pada</th>
                <th>Pushkara Navamsa</th>
                <th>Pushkara Bhaga</th>
                <th>Timing (today)</th>
              </tr>
            </thead>
            <tbody>
              {pushkaraRows.map((row) => (
                <tr key={row.key}>
                  <th>{row.label}</th>
                  <td>{row.result.navamsaPada} / 9</td>
                  <td className={row.result.isPushkaraNavamsa ? "pass" : "fail"}>
                    {row.result.isPushkaraNavamsa ? "Yes" : "No"}
                  </td>
                  <td className={row.result.isNearPushkaraBhaga ? "pass" : "fail"}>
                    {row.result.isNearPushkaraBhaga ? "Yes" : "No"} (
                    {Math.abs(row.result.degreeFromBhaga).toFixed(2)}° from{" "}
                    {row.result.pushkaraBhagaDegree}°)
                  </td>
                  <td className={row.windows.length ? "pass" : "fail"}>
                    {row.windows.length === 0 && "0 times"}
                    {row.windows.length > 0 &&
                      row.windows.length <= 4 &&
                      `${row.windows.length} time${row.windows.length > 1 ? "s" : ""}: ${row.windows
                        .map((w: PushkaraWindow) => fmtWindow(w))
                        .join(", ")}`}
                    {row.windows.length > 4 && (
                      <details>
                        <summary>
                          {row.windows.length} times today — first: {fmtWindow(row.windows[0])}
                        </summary>
                        {row.windows.map((w: PushkaraWindow) => fmtWindow(w)).join(", ")}
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Muhurtha</h3>
          <table>
            <tbody>
              {muhurtas?.brahmaMuhurta && (
                <tr>
                  <th className="pass">Brahma Muhurta</th>
                  <td>{fmtWindow(muhurtas.brahmaMuhurta)}</td>
                </tr>
              )}
              {panchangam.abhijitMuhurta && (
                <tr>
                  <th className="pass">Abhijit Muhurta</th>
                  <td>{fmtWindow(panchangam.abhijitMuhurta)}</td>
                </tr>
              )}
              {muhurtas?.vijayaMuhurta && (
                <tr>
                  <th className="pass">Vijaya Muhurta</th>
                  <td>{fmtWindow(muhurtas.vijayaMuhurta)}</td>
                </tr>
              )}
              {muhurtas?.godhuliMuhurta && (
                <tr>
                  <th className="pass">Godhuli Muhurta</th>
                  <td>{fmtWindow(muhurtas.godhuliMuhurta)}</td>
                </tr>
              )}
              {muhurtas?.nishitaMuhurta && (
                <tr>
                  <th className="pass">Nishita Muhurta</th>
                  <td>{fmtWindow(muhurtas.nishitaMuhurta)}</td>
                </tr>
              )}
              <tr>
                <th className="fail">Rahu Kalam</th>
                <td>{fmtWindow(panchangam.rahuKalam)}</td>
              </tr>
              <tr>
                <th className="fail">Yamagandam</th>
                <td>{fmtWindow(panchangam.yamagandam)}</td>
              </tr>
              <tr>
                <th className="fail">Gulika Kalam</th>
                <td>{fmtWindow(panchangam.gulikaKalam)}</td>
              </tr>
            </tbody>
          </table>

          {choghadiya && (
            <>
              <h3>Choghadiya (Day)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Name</th>
                    <th>Nature</th>
                  </tr>
                </thead>
                <tbody>
                  {choghadiya.day.map((slot, i) => (
                    <tr key={i}>
                      <td>{fmtWindow(slot)}</td>
                      <td>{slot.name}</td>
                      <td className={CHOGHADIYA_NATURE[slot.name] === "inauspicious" ? "fail" : "pass"}>
                        {CHOGHADIYA_NATURE[slot.name]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3>Choghadiya (Night)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Name</th>
                    <th>Nature</th>
                  </tr>
                </thead>
                <tbody>
                  {choghadiya.night.map((slot, i) => (
                    <tr key={i}>
                      <td>{fmtWindow(slot)}</td>
                      <td>{slot.name}</td>
                      <td className={CHOGHADIYA_NATURE[slot.name] === "inauspicious" ? "fail" : "pass"}>
                        {CHOGHADIYA_NATURE[slot.name]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
      <p style={{ fontSize: 12, color: "#9aa0c0" }}>
        Tithi/Nakshatra/Yoga/Karana computed from sidereal Lahiri positions; end times found by
        numeric search rather than a closed-form solution. Sunrise/sunset-dependent periods use
        the selected city's coordinates. Brahma/Vijaya/Godhuli/Nishita Muhurta, Pushkara
        Navamsa/Bhaga, Choghadiya, Disha Shool and Samvatsara use commonly-cited definitions that
        vary somewhat between traditional texts — treat all of the above as approximate guidance,
        not publication-grade precision.
      </p>
    </div>
  );
}
