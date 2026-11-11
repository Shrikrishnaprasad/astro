/**
 * JamaGrahaBox — tiny perimeter badge for a single Jama Graha.
 *
 *  ┌──────────────┐
 *  │ சூரி   12.45 │
 *  │ மே           │
 *  └──────────────┘
 */

import type { CSSProperties } from "react";
import type { JamaGrahaPosition } from "../engine/jamaGrahaRing";

const DISPLAY_TAMIL: Record<string, string> = {
  surya:   "சூரி",
  rahu:    "ராகு",
  chandra: "சந்",
  sani:    "சனி",
  sukran:  "சுக்",
  budhan:  "புத",
  guru:    "குரு",
  sevvai:  "செவ்",
};

export interface JamaGrahaBoxProps {
  graha: JamaGrahaPosition;
  rasiTamil: string;
  isActive?: boolean;
  retrograde?: boolean;
  style?: CSSProperties;
}

/** Invisible spacer — holds layout space when no graha occupies a slot. */
export function JamaGrahaEmptySlot({ rasiTamil }: { rasiTamil: string }) {
  return (
    <div
      className="jama-graha-box jama-graha-box--empty-slot"
      aria-hidden="true"
      data-rasi={rasiTamil}
    />
  );
}

export default function JamaGrahaBox({
  graha,
  rasiTamil,
  isActive = false,
  retrograde = false,
  style,
}: JamaGrahaBoxProps) {
  const name = DISPLAY_TAMIL[graha.id] ?? graha.tamil;
  const deg  = `${graha.degree}.${String(graha.minute).padStart(2, "0")}`;

  return (
    <div
      className={`jama-graha-box${isActive ? " jama-graha-box--active" : ""}`}
      title={`${graha.name} — ${graha.rasi} ${deg}° | ${graha.nakshatra} p${graha.pada}`}
      style={style}
    >
      <span className="jgb-name tamil">{name}{retrograde && " ⟲"}</span>
      <span className="jgb-deg">{deg}</span>
      <span className="jgb-rasi tamil">{rasiTamil}</span>
    </div>
  );
}
