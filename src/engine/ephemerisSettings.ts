/** User-selectable sidereal frame options (persisted in UI). */
export type AyanamsaMode = "lahiri-mean" | "lahiri-true" | "raman" | "kp" | "krishnamurti";

export type LunarNodeMode = "mean" | "true";

export interface EphemerisSettings {
  ayanamsa: AyanamsaMode;
  nodeMode: LunarNodeMode;
  /**
   * Enables lahiri-true + true node — best available in this app (still not Swiss Ephemeris).
   */
  preferHighPrecision: boolean;
}

export const DEFAULT_EPHEMERIS_SETTINGS: EphemerisSettings = {
  ayanamsa: "lahiri-mean",
  nodeMode: "mean",
  preferHighPrecision: false,
};

export function resolveEphemerisSettings(partial?: Partial<EphemerisSettings>): EphemerisSettings {
  const base = { ...DEFAULT_EPHEMERIS_SETTINGS, ...partial };
  if (base.ayanamsa === "krishnamurti") {
    base.ayanamsa = "kp";
  }
  if (base.preferHighPrecision) {
    return { ...base, ayanamsa: "lahiri-true", nodeMode: "true" };
  }
  return base;
}

export function ephemerisSettingsLabel(settings: EphemerisSettings): string {
  const ayanamsaLabels: Record<AyanamsaMode, string> = {
    "lahiri-mean": "Lahiri (mean)",
    "lahiri-true": "Lahiri (mean + nutation)",
    raman: "Raman",
    kp: "KP (Krishnamurti)",
    krishnamurti: "KP (Krishnamurti)",
  };
  return `${ayanamsaLabels[settings.ayanamsa]} · ${settings.nodeMode === "true" ? "true" : "mean"} node`;
}
