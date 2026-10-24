import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import PlaceSelector from "../components/PlaceSelector";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import {
  MUHURTA_ACTIVITIES,
  MUHURTA_CATEGORIES,
  muhurtaActivityById,
  type MuhurtaActivityId,
} from "../data/muhurtaActivities";
import { NAKSHATRAS } from "../data/nakshatras";
import { defaultPlace, type ResolvedPlace } from "../data/places";
import { RASIS } from "../data/rasis";
import {
  MAX_MUHURTA_RANGE_DAYS,
  searchMuhurtaDays,
  type MuhurtaDayResult,
  type MuhurtaSlotSystem,
} from "../engine/muhurtaPicker";
import type { BirthInput } from "../engine/types";
import { useBirthChart } from "../hooks/useBirthChart";

type PersonalMode = "none" | "manual" | "birth-chart";

function addDaysToIso(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const ms = Date.UTC(y, m - 1, d, 12, 0) + days * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString().slice(0, 10);
}

function diffDaysInclusive(startStr: string, endStr: string): number {
  const [sy, sm, sd] = startStr.split("-").map(Number);
  const [ey, em, ed] = endStr.split("-").map(Number);
  if (!sy || !sm || !sd || !ey || !em || !ed) return 60;
  const sMs = Date.UTC(sy, sm - 1, sd, 12, 0);
  const eMs = Date.UTC(ey, em - 1, ed, 12, 0);
  const diff = Math.round((eMs - sMs) / (24 * 60 * 60 * 1000)) + 1;
  return Math.min(Math.max(1, diff), MAX_MUHURTA_RANGE_DAYS);
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtSlot(start: Date, end: Date): string {
  return `${fmtTime(start)} – ${fmtTime(end)}`;
}

function exportMuhurtaCsv(rows: MuhurtaDayResult[], activityLabel: string, placeName: string) {
  const headers = [
    "Date",
    "Score",
    "Vara",
    "Tithi",
    "Nakshatra",
    "Nitya Yoga",
    "Karana",
    "Siddha/Marana Yoga",
    "Anandadi Yoga",
    "Special Yogas",
    "Mahadoshas",
    "Varjyam",
    "Amrita Kalam",
    "Moon Rasi",
    "P1 Tarabala",
    "P1 Chandrabala",
    "P2 Tarabala",
    "P2 Chandrabala",
    "P1 Dasa",
    "P2 Dasa",
    "Sade Sati",
    "Couple Porutham",
    "Why Picked (Day Summary)",
    "Notes",
    "Suggested Slots",
  ];
  const csvRows = [headers.join(",")];
  for (const r of rows) {
    const slotText = r.slots
      .map(
        (s) =>
          `${s.label} (${fmtSlot(s.start, s.end)} | ${s.specialDescription})`,
      )
      .join(" ; ");
    const cols = [
      r.dateStr,
      String(r.score),
      r.vara,
      r.tithiLabel,
      r.nakshatraName,
      r.yogaName,
      r.karanaName,
      r.dayYogas.siddhaYoga,
      r.dayYogas.anandadiYoga.name,
      r.dayYogas.specialYogas.map((y) => y.name).join("; "),
      r.mahadoshas.activeDoshas.join("; "),
      fmtSlot(r.varjyamWindow.start, r.varjyamWindow.end),
      fmtSlot(r.amritaWindow.start, r.amritaWindow.end),
      r.moonRasiName,
      r.tarabalaLabel ?? "",
      r.chandrabalaLabel ?? "",
      r.secondTarabalaLabel ?? "",
      r.secondChandrabalaLabel ?? "",
      r.natalDasaLabel ?? "",
      r.secondNatalDasaLabel ?? "",
      r.sadeSati ? "Yes" : "",
      r.couplePoruthamLabel ?? "",
      r.dayDescription,
      r.flags.join("; "),
      slotText,
    ].map((c) => `"${c.replace(/"/g, '""')}"`);
    csvRows.push(cols.join(","));
  }
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `muhurta-${activityLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${placeName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MuhurtaPage() {
  const { resolved } = useEphemerisSettings();
  const [place, setPlace] = useState<ResolvedPlace>(defaultPlace());
  const [startDateStr, setStartDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [rangeDays, setRangeDays] = useState(60);
  const [maxResults, setMaxResults] = useState(60);
  const [activityId, setActivityId] = useState<MuhurtaActivityId>("general");
  const [activitySearch, setActivitySearch] = useState("");
  const [slotSystem, setSlotSystem] = useState<MuhurtaSlotSystem>("both");
  const [includeNightSlots, setIncludeNightSlots] = useState(false);
  const [onlyCleanPanchaka, setOnlyCleanPanchaka] = useState(false);
  const [onlyAshtamaShuddhi, setOnlyAshtamaShuddhi] = useState(false);
  const [excludeMaranaAndMaudhya, setExcludeMaranaAndMaudhya] = useState(false);

  // Person 1
  const [personalMode, setPersonalMode] = useState<PersonalMode>("none");
  const [manualNakshatraIndex, setManualNakshatraIndex] = useState(0);
  const [manualRasiIndex, setManualRasiIndex] = useState(0);
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const birthChart = useBirthChart(personalMode === "birth-chart" ? birthInput : null);

  // Person 2 (Partner / Bride / Groom)
  const [secondMode, setSecondMode] = useState<PersonalMode>("none");
  const [secondManualNakIndex, setSecondManualNakIndex] = useState(0);
  const [secondManualRasiIndex, setSecondManualRasiIndex] = useState(0);
  const [secondBirthInput, setSecondBirthInput] = useState<BirthInput | null>(null);
  const secondBirthChart = useBirthChart(secondMode === "birth-chart" ? secondBirthInput : null);

  const [submitted, setSubmitted] = useState(false);

  const endDateStr = useMemo(
    () => addDaysToIso(startDateStr, Math.max(0, rangeDays - 1)),
    [startDateStr, rangeDays],
  );

  const activity = useMemo(() => muhurtaActivityById(activityId), [activityId]);

  const filteredActivities = useMemo(() => {
    const q = activitySearch.trim().toLowerCase();
    if (!q) return MUHURTA_ACTIVITIES;
    return MUHURTA_ACTIVITIES.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.hint.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
    );
  }, [activitySearch]);

  const effectiveBirthNakshatra = useMemo((): number | undefined => {
    if (personalMode === "manual") return manualNakshatraIndex;
    if (personalMode === "birth-chart" && birthChart) {
      return birthChart.planetRasi.Moon.nakshatraIndex;
    }
    return undefined;
  }, [personalMode, manualNakshatraIndex, birthChart]);

  const effectiveBirthRasi = useMemo((): number | undefined => {
    if (personalMode === "manual") return manualRasiIndex;
    if (personalMode === "birth-chart" && birthChart) {
      return birthChart.planetRasi.Moon.rasiIndex;
    }
    return undefined;
  }, [personalMode, manualRasiIndex, birthChart]);

  const effectiveSecondNakshatra = useMemo((): number | undefined => {
    if (secondMode === "manual") return secondManualNakIndex;
    if (secondMode === "birth-chart" && secondBirthChart) {
      return secondBirthChart.planetRasi.Moon.nakshatraIndex;
    }
    return undefined;
  }, [secondMode, secondManualNakIndex, secondBirthChart]);

  const effectiveSecondRasi = useMemo((): number | undefined => {
    if (secondMode === "manual") return secondManualRasiIndex;
    if (secondMode === "birth-chart" && secondBirthChart) {
      return secondBirthChart.planetRasi.Moon.rasiIndex;
    }
    return undefined;
  }, [secondMode, secondManualRasiIndex, secondBirthChart]);

  const rawResults = useMemo(() => {
    if (!submitted) return null;
    return searchMuhurtaDays({
      startDateStr,
      rangeDays,
      latitude: place.lat,
      longitude: place.lon,
      activity,
      birthNakshatraIndex: effectiveBirthNakshatra,
      birthRasiIndex: effectiveBirthRasi,
      secondBirthNakshatraIndex: effectiveSecondNakshatra,
      secondBirthRasiIndex: effectiveSecondRasi,
      natalChart: personalMode === "birth-chart" ? birthChart ?? undefined : undefined,
      natalBirthDate: personalMode === "birth-chart" ? birthInput?.date : undefined,
      secondNatalChart: secondMode === "birth-chart" ? secondBirthChart ?? undefined : undefined,
      secondNatalBirthDate: secondMode === "birth-chart" ? secondBirthInput?.date : undefined,
      includeNightSlots,
      slotSystem,
      maxResults,
      settings: resolved,
    });
  }, [
    submitted,
    startDateStr,
    rangeDays,
    place,
    activity,
    effectiveBirthNakshatra,
    effectiveBirthRasi,
    effectiveSecondNakshatra,
    effectiveSecondRasi,
    birthChart,
    birthInput,
    secondBirthChart,
    secondBirthInput,
    personalMode,
    secondMode,
    includeNightSlots,
    slotSystem,
    maxResults,
    resolved,
  ]);

  const results = useMemo(() => {
    if (!rawResults) return null;
    return rawResults
      .filter((r) => {
        if (!excludeMaranaAndMaudhya) return true;
        if (r.dayYogas.siddhaYoga === "Marana Yoga") return false;
        if (r.mahadoshas.guruMaudhya || r.mahadoshas.shukraMaudhya || r.mahadoshas.eclipseProximity) {
          return false;
        }
        return true;
      })
      .map((r) => ({
        ...r,
        slots: r.slots.filter((s) => {
          if (onlyCleanPanchaka && (!s.panchaka.isClean || s.isAshtamaLagna)) return false;
          if (
            onlyAshtamaShuddhi &&
            (!s.kundali.isAshtamaShuddhi || s.kundali.hasPapaKartari || s.kundali.hasBhriguShatka)
          ) {
            return false;
          }
          return true;
        }),
      }))
      .filter((r) => r.slots.length > 0);
  }, [rawResults, onlyCleanPanchaka, onlyAshtamaShuddhi, excludeMaranaAndMaudhya]);

  const hasPersonalBala =
    effectiveBirthNakshatra !== undefined ||
    effectiveBirthRasi !== undefined ||
    effectiveSecondNakshatra !== undefined ||
    effectiveSecondRasi !== undefined;

  return (
    <div>
      <h2>Muhurta Picker</h2>
      <EphemerisAccuracyNotice />
      <p style={{ fontSize: 14, color: "#9aa0c0", maxWidth: 820 }}>
        Complete Vedic &amp; South Indian <em>Muhurta Shastra</em> engine across up to{" "}
        <strong>365 days</strong> for <strong>{MUHURTA_ACTIVITIES.length} activities</strong>.
        Evaluates <strong>Tithi, Vara, Nakshatra, Nitya Yoga, Karana</strong>,{" "}
        <strong>Varjyam (Vishaghati) &amp; Amrita Kalam</strong>, <strong>Durmuhurtam</strong>,{" "}
        <strong>Tamil Siddha / Amrita / Marana &amp; 28-Anandadi Yogas</strong>,{" "}
        <strong>Sarvartha Siddhi / Amrita Siddhi / Tripushkara / Dagdha / Visha Yogas</strong>,{" "}
        <strong>21 Mahadoshas</strong> (five Maudhyas, Sankranti, Masa Shunya, local eclipse,
        Graha Yuddha, Vyatipata, Vaidhriti, Gandanta, Mrityu Bhaga, Kranti Samya, Ekargala,
        Bhadra, Dagdha, Visha, Latta, Vedha). Each day is judged at <strong>sunrise</strong>.{" "}
        <strong>Vishti windows</strong>, <strong>Pushkara</strong>, <strong>D9 shuddhi</strong>,{" "}
        <strong>Panchaka</strong>, and <strong>activity Hora &amp; Gowri</strong>. With a birth chart:{" "}
        <strong>Dasa–Bhukti–Antara, Kakshya, full Gochara, Sade Sati, and the Porutham report</strong>.
        Lahiri charts use nutation and the true node. This app calculates eclipses with astronomy-engine,
        not Swiss Ephemeris files.
      </p>

      <div className="card">
        <h3>1. Event Location, Date Range &amp; Activity</h3>
        <PlaceSelector onChange={setPlace} />

        <div className="field-row" style={{ marginTop: 10 }}>
          <label>
            From date
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
            />
          </label>
          <label>
            To date (up to 1 year)
            <input
              type="date"
              value={endDateStr}
              min={startDateStr}
              max={addDaysToIso(startDateStr, MAX_MUHURTA_RANGE_DAYS - 1)}
              onChange={(e) => {
                const days = diffDaysInclusive(startDateStr, e.target.value);
                setRangeDays(days);
              }}
            />
          </label>
          <label>
            Days to search (1–{MAX_MUHURTA_RANGE_DAYS})
            <input
              type="number"
              min={1}
              max={MAX_MUHURTA_RANGE_DAYS}
              value={rangeDays}
              onChange={(e) =>
                setRangeDays(
                  Math.min(MAX_MUHURTA_RANGE_DAYS, Math.max(1, Number(e.target.value) || 60)),
                )
              }
            />
          </label>
          <label>
            Max results shown
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
            >
              <option value={30}>Top 30 days</option>
              <option value={60}>Top 60 days</option>
              <option value={120}>Top 120 days</option>
              <option value={365}>All matching days (up to 365)</option>
            </select>
          </label>
        </div>

        <div className="chip-row" style={{ marginTop: 6 }}>
          <span style={{ fontSize: 12, color: "#9aa0c0" }}>Quick range:</span>
          {[
            { label: "14 Days", days: 14 },
            { label: "30 Days (1 Mo)", days: 30 },
            { label: "60 Days (2 Mo)", days: 60 },
            { label: "90 Days (3 Mo)", days: 90 },
            { label: "180 Days (6 Mo)", days: 180 },
            { label: "365 Days (1 Yr)", days: 365 },
          ].map((preset) => (
            <button
              key={preset.days}
              type="button"
              style={{
                padding: "4px 10px",
                fontSize: 12,
                opacity: rangeDays === preset.days ? 1 : 0.75,
              }}
              onClick={() => setRangeDays(preset.days)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="field-row" style={{ marginTop: 12 }}>
          <label style={{ flex: 1 }}>
            Filter activities (optional)
            <input
              type="text"
              placeholder="e.g. wedding, borewell, vehicle, baby, job, door..."
              value={activitySearch}
              onChange={(e) => {
                const val = e.target.value;
                setActivitySearch(val);
                const q = val.trim().toLowerCase();
                if (q) {
                  const firstMatch = MUHURTA_ACTIVITIES.find(
                    (a) =>
                      a.label.toLowerCase().includes(q) ||
                      a.hint.toLowerCase().includes(q) ||
                      a.category.toLowerCase().includes(q),
                  );
                  if (firstMatch) setActivityId(firstMatch.id);
                }
              }}
            />
          </label>
          <label style={{ flex: 2 }}>
            Activity / purpose ({filteredActivities.length} available)
            <select
              value={activityId}
              onChange={(e) => setActivityId(e.target.value as MuhurtaActivityId)}
            >
              {MUHURTA_CATEGORIES.map((category) => {
                const items = filteredActivities.filter((a) => a.category === category);
                if (items.length === 0) return null;
                return (
                  <optgroup key={category} label={category}>
                    {items.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </label>
          <label style={{ flex: 1 }}>
            Time slot system
            <select
              value={slotSystem}
              onChange={(e) => setSlotSystem(e.target.value as MuhurtaSlotSystem)}
            >
              <option value="both">Both (Choghadiya + Tamil Gowri)</option>
              <option value="gowri">Tamil Gowri Panchangam + Amrita</option>
              <option value="choghadiya">North Indian Choghadiya + Amrita</option>
            </select>
          </label>
        </div>

        <p style={{ fontSize: 12, color: "#9aa0c0", marginTop: 4 }}>
          <strong>{activity.category}:</strong> {activity.hint} ·{" "}
          <strong>Preferred Lagnas:</strong>{" "}
          {activity.preferredLagnaRasis.map((idx) => RASIS[idx].nameEnglish).join(", ")}
        </p>
        {activity.disclaimer && (
          <p style={{ fontSize: 12, color: "#c9a227", marginTop: 4 }}>{activity.disclaimer}</p>
        )}

        <div className="field-row" style={{ marginTop: 10 }}>
          <label>
            <input
              type="checkbox"
              checked={includeNightSlots}
              onChange={(e) => setIncludeNightSlots(e.target.checked)}
            />
            Include Night Choghadiya / Night Gowri &amp; Nishita Muhurta
          </label>
          <label>
            <input
              type="checkbox"
              checked={onlyCleanPanchaka}
              onChange={(e) => setOnlyCleanPanchaka(e.target.checked)}
            />
            Only Panchaka Rahita slots
          </label>
          <label>
            <input
              type="checkbox"
              checked={onlyAshtamaShuddhi}
              onChange={(e) => setOnlyAshtamaShuddhi(e.target.checked)}
            />
            Strict Lagna Kundali Shuddhi (empty 8th, no Papa Kartari/Bhrigu Shatka)
          </label>
          <label>
            <input
              type="checkbox"
              checked={excludeMaranaAndMaudhya}
              onChange={(e) => setExcludeMaranaAndMaudhya(e.target.checked)}
            />
            Exclude Marana Yoga &amp; Guru/Shukra Maudhya days
          </label>
        </div>
      </div>

      <div className="card">
        <h3>2. Personal &amp; Couple Bala — Birth chart, Tarabala, Dasa, SAV (Optional)</h3>
        <div className="field-row">
          <label>
            Person 1 (Primary / Bride / Groom)
            <select
              value={personalMode}
              onChange={(e) => setPersonalMode(e.target.value as PersonalMode)}
            >
              <option value="none">None (General Panchanga &amp; Lagna only)</option>
              <option value="manual">Select Janma Nakshatra &amp; Janma Rasi</option>
              <option value="birth-chart">Calculate from Birth Date, Time &amp; Place</option>
            </select>
          </label>
          <label>
            Person 2 (Optional — Partner / Groom / Bride)
            <select
              value={secondMode}
              onChange={(e) => setSecondMode(e.target.value as PersonalMode)}
            >
              <option value="none">None (Single person or general)</option>
              <option value="manual">Select Partner Janma Nakshatra &amp; Rasi</option>
              <option value="birth-chart">Calculate Partner from Birth Date, Time &amp; Place</option>
            </select>
          </label>
        </div>
        <p style={{ fontSize: 12, color: "#9aa0c0", marginTop: 6 }}>
          Manual mode uses Moon star/sign only (Tarabala &amp; Chandrabala). Birth-chart mode also
          scores Dasa–Bhukti, Ashtakavarga bindus, Sade Sati, Jupiter gochara, natal Lagna, Latta
          and Vedha. Two birth charts add couple Porutham for wedding/engagement.
        </p>

        {personalMode === "manual" && (
          <div className="field-row" style={{ marginTop: 8 }}>
            <label>
              Person 1 Janma Nakshatra
              <select
                value={manualNakshatraIndex}
                onChange={(e) => {
                  const nakIdx = Number(e.target.value);
                  setManualNakshatraIndex(nakIdx);
                  setManualRasiIndex(Math.min(11, Math.floor((nakIdx * 4) / 9)));
                }}
              >
                {NAKSHATRAS.map((n, i) => (
                  <option key={n.nameEnglish} value={i}>
                    {n.nameEnglish} ({n.nameTamil})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Person 1 Janma Rasi
              <select
                value={manualRasiIndex}
                onChange={(e) => setManualRasiIndex(Number(e.target.value))}
              >
                {RASIS.map((r, i) => (
                  <option key={r.nameEnglish} value={i}>
                    {r.nameEnglish} ({r.nameTamil})
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {personalMode === "birth-chart" && (
          <div style={{ marginTop: 8 }}>
            <strong>Person 1 Birth Details:</strong>
            <DateTimePlaceForm
              submitToCalculate
              submitLabel="Set Person 1 birth chart"
              onChange={(inp) => setBirthInput(inp)}
            />
            {birthChart && (
              <p style={{ fontSize: 13, color: "#8fd19e", marginTop: 6 }}>
                <strong>Person 1 Janma:</strong>{" "}
                {NAKSHATRAS[birthChart.planetRasi.Moon.nakshatraIndex].nameEnglish} (Pada{" "}
                {birthChart.planetRasi.Moon.pada}) ·{" "}
                <strong>Rasi:</strong>{" "}
                {RASIS[birthChart.planetRasi.Moon.rasiIndex].nameEnglish} (
                {RASIS[birthChart.planetRasi.Moon.rasiIndex].nameTamil})
              </p>
            )}
          </div>
        )}

        {secondMode === "manual" && (
          <div className="field-row" style={{ marginTop: 8 }}>
            <label>
              Person 2 Janma Nakshatra
              <select
                value={secondManualNakIndex}
                onChange={(e) => {
                  const nakIdx = Number(e.target.value);
                  setSecondManualNakIndex(nakIdx);
                  setSecondManualRasiIndex(Math.min(11, Math.floor((nakIdx * 4) / 9)));
                }}
              >
                {NAKSHATRAS.map((n, i) => (
                  <option key={n.nameEnglish} value={i}>
                    {n.nameEnglish} ({n.nameTamil})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Person 2 Janma Rasi
              <select
                value={secondManualRasiIndex}
                onChange={(e) => setSecondManualRasiIndex(Number(e.target.value))}
              >
                {RASIS.map((r, i) => (
                  <option key={r.nameEnglish} value={i}>
                    {r.nameEnglish} ({r.nameTamil})
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {secondMode === "birth-chart" && (
          <div style={{ marginTop: 8 }}>
            <strong>Person 2 Birth Details:</strong>
            <DateTimePlaceForm
              submitToCalculate
              submitLabel="Set Person 2 birth chart"
              onChange={(inp) => setSecondBirthInput(inp)}
            />
            {secondBirthChart && (
              <p style={{ fontSize: 13, color: "#8fd19e", marginTop: 6 }}>
                <strong>Person 2 Janma:</strong>{" "}
                {NAKSHATRAS[secondBirthChart.planetRasi.Moon.nakshatraIndex].nameEnglish} (Pada{" "}
                {secondBirthChart.planetRasi.Moon.pada}) ·{" "}
                <strong>Rasi:</strong>{" "}
                {RASIS[secondBirthChart.planetRasi.Moon.rasiIndex].nameEnglish} (
                {RASIS[secondBirthChart.planetRasi.Moon.rasiIndex].nameTamil})
              </p>
            )}
          </div>
        )}

        <div className="field-row" style={{ marginTop: 14 }}>
          <button type="button" className="btn-primary" onClick={() => setSubmitted(true)}>
            Find muhurtas ({startDateStr} to {endDateStr})
          </button>
          {results && results.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => exportMuhurtaCsv(results, activity.label, place.name)}
              >
                Export CSV
              </button>
              <button type="button" onClick={() => window.print()}>
                Print / Save PDF
              </button>
            </>
          )}
        </div>
      </div>

      {submitted && results && results.length === 0 && (
        <p className="card" style={{ color: "#9aa0c0" }}>
          No days in range matched all strict filters. Try relaxing one of the checkboxes above or
          increasing the date range.
        </p>
      )}

      {results && results.length > 0 && (
        <section className="card">
          <h3>
            Top Auspicious Days ({results.length} shown · {startDateStr} to {endDateStr})
          </h3>
          <p style={{ fontSize: 12, color: "#9aa0c0" }}>
            Event Place: <strong>{place.name}</strong> ({place.stateName}, {place.countryName}) ·
            Purpose: <strong>{activity.label}</strong>. All candidate windows have{" "}
            <strong>Rahu Kalam, Yamagandam, Gulika Kalam, Durmuhurtam, and Varjyam (Vishaghati)</strong>{" "}
            automatically sliced out. Click any date to inspect its full Panchangam.
          </p>
          <div className="chart-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date &amp; Score</th>
                  <th>Vara, Tithi &amp; Star</th>
                  <th>Siddha, Anandadi &amp; Special Yogas</th>
                  <th>Varjyam, Amrita &amp; Doshas</th>
                  {hasPersonalBala && <th>Tarabala, Dasa &amp; Natal</th>}
                  <th>Clean Sub-Windows (Lagna · 8th Shuddhi · Hora · Gowri · Panchaka)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={row.dateStr}>
                    <td>
                      <Link to={`/panchangam?date=${row.dateStr}`}>
                        <strong>{row.dateStr}</strong>
                      </Link>
                      <div style={{ fontSize: 13, marginTop: 4 }}>
                        Score: <strong>{row.score}</strong>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, maxWidth: 260 }}>
                      <div>
                        <strong>{row.vara}</strong> · {row.tithiLabel}
                      </div>
                      <div>
                        Star: <strong>{row.nakshatraName}</strong> (Moon: {row.moonRasiName})
                      </div>
                      <div className={row.isBadYoga ? "fail" : ""}>
                        Nitya Yoga: {row.yogaName} · Karana:{" "}
                        <span className={row.isBadKarana ? "fail" : ""}>{row.karanaName}</span>
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          padding: "5px 8px",
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 4,
                          color: "#d0d6f2",
                          lineHeight: 1.35,
                        }}
                      >
                        <strong>Why picked:</strong> {row.dayDescription}
                      </div>
                    </td>
                    <td style={{ fontSize: 12, maxWidth: 220 }}>
                      <div
                        className={
                          row.dayYogas.siddhaNature === "auspicious" ? "pass" : "fail"
                        }
                      >
                        <strong>{row.dayYogas.siddhaYoga}</strong>
                      </div>
                      <div
                        className={
                          row.dayYogas.anandadiYoga.nature === "auspicious"
                            ? "pass"
                            : row.dayYogas.anandadiYoga.nature === "inauspicious"
                              ? "fail"
                              : ""
                        }
                      >
                        Anandadi: {row.dayYogas.anandadiYoga.name}
                      </div>
                      {row.dayYogas.specialYogas.map((sy) => (
                        <div
                          key={sy.name}
                          className={sy.nature === "auspicious" ? "pass" : "fail"}
                          title={sy.description}
                        >
                          ★ {sy.name}
                        </div>
                      ))}
                    </td>
                    <td style={{ fontSize: 12, maxWidth: 230 }}>
                      <div className="pass">
                        Amrita: {fmtSlot(row.amritaWindow.start, row.amritaWindow.end)}
                      </div>
                      <div className="fail">
                        Varjyam: {fmtSlot(row.varjyamWindow.start, row.varjyamWindow.end)}
                      </div>
                      {row.durmuhurtamWindows.length > 0 && (
                        <div style={{ color: "#9aa0c0" }}>
                          Durmuhurtam:{" "}
                          {row.durmuhurtamWindows
                            .map((w) => fmtSlot(w.start, w.end))
                            .join(", ")}
                        </div>
                      )}
                      {row.mahadoshas.activeDoshas.length > 0 ? (
                        <div className="fail">
                          ⚠ {row.mahadoshas.activeDoshas.join(", ")}
                        </div>
                      ) : (
                        <div className="pass">No Mahadosha</div>
                      )}
                    </td>
                    {hasPersonalBala && (
                      <td style={{ fontSize: 12 }}>
                        {row.tarabalaLabel && (
                          <div className={row.tarabalaGood ? "pass" : "fail"}>
                            P1 Tara: {row.tarabalaLabel}
                          </div>
                        )}
                        {row.chandrabalaLabel && (
                          <div className={row.chandrabalaGood ? "pass" : "fail"}>
                            P1 Chandra: {row.chandrabalaLabel}
                          </div>
                        )}
                        {row.secondTarabalaLabel && (
                          <div
                            className={row.secondTarabalaGood ? "pass" : "fail"}
                            style={{ marginTop: 4 }}
                          >
                            P2 Tara: {row.secondTarabalaLabel}
                          </div>
                        )}
                        {row.secondChandrabalaLabel && (
                          <div className={row.secondChandrabalaGood ? "pass" : "fail"}>
                            P2 Chandra: {row.secondChandrabalaLabel}
                          </div>
                        )}
                        {row.natalDasaLabel && <div>P1 Dasa: {row.natalDasaLabel}</div>}
                        {row.secondNatalDasaLabel && <div>P2 Dasa: {row.secondNatalDasaLabel}</div>}
                        {row.sadeSati && <div className="fail">Sade Sati / Ashtama Sani</div>}
                        {row.couplePoruthamLabel && <div>Porutham: {row.couplePoruthamLabel}</div>}
                        {row.couplePoruthamSummary && (
                          <div style={{ marginTop: 4, color: "#b8bdd6" }}>{row.couplePoruthamSummary}</div>
                        )}
                      </td>
                    )}
                    <td style={{ fontSize: 12 }}>
                      <ul style={{ margin: 0, paddingLeft: 18 }}>
                        {row.slots.map((s) => (
                          <li
                            key={`${s.label}-${s.start.toISOString()}`}
                            style={{ marginBottom: 6 }}
                          >
                            <div>
                              <strong>{fmtSlot(s.start, s.end)}</strong> — {s.label}
                            </div>
                            <div style={{ color: "#9aa0c0" }}>
                              <span
                                className={
                                  s.isPreferredLagna
                                    ? "pass"
                                    : s.isAshtamaLagna
                                      ? "fail"
                                      : ""
                                }
                              >
                                Lagna: {s.lagnaName}
                                {s.isPreferredLagna ? " (Shubha)" : ""}
                                {s.isAshtamaLagna ? " (8th Janma!)" : ""}
                              </span>{" "}
                              ·{" "}
                              <span className={s.kundali.isAshtamaShuddhi ? "pass" : "fail"}>
                                {s.kundali.isAshtamaShuddhi
                                  ? "8th Clean"
                                  : `8th: ${s.kundali.planetsIn8th.join("+")}`}
                              </span>
                              {s.kundali.hasPapaKartari && (
                                <span className="fail"> · Papa Kartari</span>
                              )}
                              {s.kundali.hasBhriguShatka && (
                                <span className="fail"> · Bhrigu Shatka</span>
                              )}
                              {s.kundali.moonDusthana && (
                                <span className="fail"> · Moon {s.kundali.moonHouse}th</span>
                              )}
                              {s.pushkaraLagna && <span className="pass"> · Pushkara Lagna</span>}
                              {s.lagnaGandanta && <span className="fail"> · Lagna Gandanta</span>}
                              {s.lagnaMrityuBhaga && <span className="fail"> · Lagna Mrityu</span>}
                              {" · "}
                              D9 {s.navamsaLagnaName}
                              {s.vargottamaLagna ? " Vargottama" : ""}
                              {s.maleficInD9Lagna ? " · malefic in D9" : s.d9AshtamaShuddhi ? " · D9 8th clean" : " · D9 8th occupied"}
                              {" · "}Pada {s.nakshatraPada}
                              {" · "}
                              <span className={s.isPreferredHora ? "pass" : s.isBeneficHora ? "pass" : ""}>
                                Hora: {s.horaPlanet}
                              </span>
                              {s.gowriName && (
                                <>
                                  {" · "}
                                  <span className={s.gowriAuspicious ? "pass" : "fail"}>
                                    Gowri: {s.gowriName}
                                  </span>
                                </>
                              )}{" "}
                              ·{" "}
                              <span className={s.panchaka.isClean ? "pass" : "fail"}>
                                {s.panchaka.name}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#b6bee0",
                                marginTop: 2,
                                fontStyle: "italic",
                              }}
                            >
                              ✦ {s.specialDescription}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
