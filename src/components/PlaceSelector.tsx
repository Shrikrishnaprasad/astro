import { useEffect, useMemo, useState } from "react";
import {
  COUNTRIES,
  DEFAULT_CITY_NAME,
  DEFAULT_COUNTRY_NAME,
  DEFAULT_STATE_NAME,
  defaultPlace,
  nearestPlace,
  type ResolvedPlace,
} from "../data/places";

type GeoStatus = "idle" | "locating" | "located" | "denied" | "unsupported";

function resolve(countryName: string, stateName: string, cityName: string): ResolvedPlace {
  const country = COUNTRIES.find((c) => c.name === countryName) ?? COUNTRIES[0];
  const state = country.states.find((s) => s.name === stateName) ?? country.states[0];
  const city = state.cities.find((c) => c.name === cityName) ?? state.cities[0];
  return { ...city, countryName: country.name, stateName: state.name };
}

export default function PlaceSelector({
  onChange,
}: {
  onChange: (place: ResolvedPlace) => void;
}) {
  const [countryName, setCountryName] = useState(DEFAULT_COUNTRY_NAME);
  const [stateName, setStateName] = useState(DEFAULT_STATE_NAME);
  const [cityName, setCityName] = useState(DEFAULT_CITY_NAME);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");

  const country = useMemo(
    () => COUNTRIES.find((c) => c.name === countryName) ?? COUNTRIES[0],
    [countryName],
  );
  const state = useMemo(
    () => country.states.find((s) => s.name === stateName) ?? country.states[0],
    [country, stateName],
  );

  const applyPlace = (place: ResolvedPlace) => {
    setCountryName(place.countryName);
    setStateName(place.stateName);
    setCityName(place.name);
    onChange(place);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyPlace(nearestPlace(pos.coords.latitude, pos.coords.longitude));
        setGeoStatus("located");
      },
      () => setGeoStatus("denied"),
      { timeout: 8000 },
    );
  };

  // Auto-detect once on mount, starting from the India/Tamil Nadu/Coimbatore
  // default; silently keeps that default if permission is denied/unavailable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    onChange(defaultPlace());
    detectLocation();
  }, []);

  const handleCountryChange = (name: string) => {
    const nextCountry = COUNTRIES.find((c) => c.name === name) ?? COUNTRIES[0];
    const nextState = nextCountry.states[0];
    const nextCity = nextState.cities[0];
    setCountryName(nextCountry.name);
    setStateName(nextState.name);
    setCityName(nextCity.name);
    onChange({ ...nextCity, countryName: nextCountry.name, stateName: nextState.name });
  };

  const handleStateChange = (name: string) => {
    const nextState = country.states.find((s) => s.name === name) ?? country.states[0];
    const nextCity = nextState.cities[0];
    setStateName(nextState.name);
    setCityName(nextCity.name);
    onChange({ ...nextCity, countryName: country.name, stateName: nextState.name });
  };

  const handleCityChange = (name: string) => {
    setCityName(name);
    onChange(resolve(country.name, state.name, name));
  };

  return (
    <div className="place-selector">
      <div className="field-row">
        <label>
          Country
          <select value={country.name} onChange={(e) => handleCountryChange(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          State
          <select value={state.name} onChange={(e) => handleStateChange(e.target.value)}>
            {country.states.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          City
          <select value={cityName} onChange={(e) => handleCityChange(e.target.value)}>
            {state.cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={detectLocation} disabled={geoStatus === "locating"}>
          {geoStatus === "locating" ? "Locating…" : "📍 Use my location"}
        </button>
      </div>
      {geoStatus === "located" && (
        <p style={{ fontSize: 12, color: "#9aa0c0" }}>
          Auto-detected nearest bundled location from your device's location.
        </p>
      )}
      {geoStatus === "denied" && (
        <p style={{ fontSize: 12, color: "#9aa0c0" }}>
          Location access denied/unavailable — showing default: Coimbatore, Tamil Nadu, India.
        </p>
      )}
      {geoStatus === "unsupported" && (
        <p style={{ fontSize: 12, color: "#9aa0c0" }}>
          Location detection isn't supported here — showing default: Coimbatore, Tamil Nadu,
          India.
        </p>
      )}
    </div>
  );
}
