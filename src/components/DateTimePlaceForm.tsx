import { useEffect, useMemo, useState, type FormEvent } from "react";
import PlaceSelector from "./PlaceSelector";
import { defaultPlace, type ResolvedPlace } from "../data/places";
import type { BirthInput } from "../engine/types";

export interface BirthFormValue {
  dateStr: string; // yyyy-mm-dd
  timeStr: string; // HH:mm
  place: ResolvedPlace;
  manualLat: string;
  manualLon: string;
  manualTz: string;
  useManual: boolean;
}

const DEFAULT_VALUE: BirthFormValue = {
  dateStr: "2000-01-01",
  timeStr: "12:00",
  place: defaultPlace(),
  manualLat: "",
  manualLon: "",
  manualTz: "",
  useManual: false,
};

export function birthFormToInput(value: BirthFormValue): BirthInput | null {
  const [y, m, d] = value.dateStr.split("-").map(Number);
  const [hh, mm] = value.timeStr.split(":").map(Number);
  if (!y || !m || !d || hh === undefined || mm === undefined) return null;

  let lat: number;
  let lon: number;
  let tz: number;
  if (value.useManual) {
    lat = Number(value.manualLat);
    lon = Number(value.manualLon);
    tz = Number(value.manualTz);
    if (Number.isNaN(lat) || Number.isNaN(lon) || Number.isNaN(tz)) return null;
  } else {
    lat = value.place.lat;
    lon = value.place.lon;
    tz = value.place.tzOffsetHours;
  }

  const utcMs = Date.UTC(y, m - 1, d, hh, mm) - tz * 60 * 60 * 1000;
  return { date: new Date(utcMs), latitude: lat, longitude: lon };
}

export default function DateTimePlaceForm({
  onChange,
  submitToCalculate = false,
  submitLabel = "Calculate chart",
}: {
  onChange: (input: BirthInput | null, raw: BirthFormValue) => void;
  /** When true, call onChange only after the user clicks Submit (not on every edit). */
  submitToCalculate?: boolean;
  submitLabel?: string;
}) {
  const [value, setValue] = useState<BirthFormValue>(DEFAULT_VALUE);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const update = (patch: Partial<BirthFormValue>) => {
    setValue((prev) => ({ ...prev, ...patch }));
  };

  const computedInput = useMemo(() => birthFormToInput(value), [value]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    if (computedInput) {
      onChange(computedInput, value);
    }
  };

  // Live mode: recompute on every change (initial mount + geolocation fill, etc.).
  useEffect(() => {
    if (submitToCalculate) return;
    onChange(computedInput, value);
  }, [computedInput, value, submitToCalculate, onChange]);

  const showValidationError =
    !computedInput && (!submitToCalculate || submitAttempted);

  return (
    <form className="card birth-form" onSubmit={handleSubmit}>
      <div className="field-row">
        <label>
          Date
          <input
            type="date"
            value={value.dateStr}
            onChange={(e) => update({ dateStr: e.target.value })}
          />
        </label>
        <label>
          Time
          <input
            type="time"
            value={value.timeStr}
            onChange={(e) => update({ timeStr: e.target.value })}
          />
        </label>
      </div>

      <div className="field-row">
        <label>
          <input
            type="checkbox"
            checked={value.useManual}
            onChange={(e) => update({ useManual: e.target.checked })}
          />
          Enter lat/long/UTC-offset manually
        </label>
      </div>

      {value.useManual ? (
        <div className="field-row">
          <label>
            Latitude
            <input value={value.manualLat} onChange={(e) => update({ manualLat: e.target.value })} />
          </label>
          <label>
            Longitude
            <input value={value.manualLon} onChange={(e) => update({ manualLon: e.target.value })} />
          </label>
          <label>
            UTC offset (hours)
            <input value={value.manualTz} onChange={(e) => update({ manualTz: e.target.value })} />
          </label>
        </div>
      ) : (
        <PlaceSelector onChange={(place) => update({ place })} />
      )}

      {submitToCalculate && (
        <div className="field-row birth-form__actions">
          <button type="submit" className="birth-form__submit">
            {submitLabel}
          </button>
        </div>
      )}

      {showValidationError && (
        <p className="fail">Enter a valid date, time, and location.</p>
      )}
    </form>
  );
}
