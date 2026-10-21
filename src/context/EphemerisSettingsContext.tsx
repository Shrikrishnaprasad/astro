import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_EPHEMERIS_SETTINGS,
  ephemerisSettingsLabel,
  resolveEphemerisSettings,
  type AyanamsaMode,
  type EphemerisSettings,
  type LunarNodeMode,
} from "../engine/ephemerisSettings";

const STORAGE_KEY = "astro-ephemeris-settings";

function loadSettings(): EphemerisSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EPHEMERIS_SETTINGS;
    return resolveEphemerisSettings(JSON.parse(raw) as Partial<EphemerisSettings>);
  } catch {
    return DEFAULT_EPHEMERIS_SETTINGS;
  }
}

interface EphemerisSettingsContextValue {
  settings: EphemerisSettings;
  resolved: EphemerisSettings;
  label: string;
  setAyanamsa: (mode: AyanamsaMode) => void;
  setNodeMode: (mode: LunarNodeMode) => void;
  setPreferHighPrecision: (on: boolean) => void;
}

const EphemerisSettingsContext = createContext<EphemerisSettingsContextValue | null>(null);

export function EphemerisSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<EphemerisSettings>(() => loadSettings());

  const persist = useCallback((next: EphemerisSettings) => {
    const resolved = resolveEphemerisSettings(next);
    setSettings(resolved);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resolved));
  }, []);

  const resolved = useMemo(() => resolveEphemerisSettings(settings), [settings]);

  const value = useMemo(
    (): EphemerisSettingsContextValue => ({
      settings,
      resolved,
      label: ephemerisSettingsLabel(resolved),
      setAyanamsa: (mode) => persist({ ...settings, ayanamsa: mode, preferHighPrecision: false }),
      setNodeMode: (mode) => persist({ ...settings, nodeMode: mode, preferHighPrecision: false }),
      setPreferHighPrecision: (on) => persist({ ...settings, preferHighPrecision: on }),
    }),
    [persist, resolved, settings],
  );

  return (
    <EphemerisSettingsContext.Provider value={value}>{children}</EphemerisSettingsContext.Provider>
  );
}

export function useEphemerisSettings(): EphemerisSettingsContextValue {
  const ctx = useContext(EphemerisSettingsContext);
  if (!ctx) {
    return {
      settings: DEFAULT_EPHEMERIS_SETTINGS,
      resolved: DEFAULT_EPHEMERIS_SETTINGS,
      label: ephemerisSettingsLabel(DEFAULT_EPHEMERIS_SETTINGS),
      setAyanamsa: () => {},
      setNodeMode: () => {},
      setPreferHighPrecision: () => {},
    };
  }
  return ctx;
}
