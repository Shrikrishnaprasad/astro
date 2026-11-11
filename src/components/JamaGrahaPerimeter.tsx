/**
 * JamaGrahaPerimeter — places 8 Jama Graha badges around the South Indian
 * chart, each badge aligned exactly above/beside its rasi cell.
 *
 * Layout (CSS Grid, 3×3):
 *
 *        [. ]  [TOP strip — chart width  ]  [. ]
 *        [L  ]  [         CHART           ]  [R  ]
 *        [. ]  [BOT strip — chart width  ]  [. ]
 *
 * Each badge is positioned absolute within its strip at:
 *   top/bottom strip  → left = col × (cellW+gap) + (cellW−badgeW)/2
 *   left/right strip  → top  = row × (cellH+gap) + (cellH−badgeH)/2
 *
 * This guarantees the badge is centred over/beside the exact rasi cell
 * regardless of the number of grahas in the same side.
 */

import type { CSSProperties, ReactNode } from "react";
import type { JamaGrahaPosition } from "../engine/jamaGrahaRing";
import { RASIS } from "../data/rasis";
import JamaGrahaBox from "./JamaGrahaBox";

// ─── Re-exports ───────────────────────────────────────────────────────────────

export const PLANET_TO_RING_ID: Record<string, string> = {
  Sun:     "surya",
  Moon:    "chandra",
  Mars:    "sevvai",
  Mercury: "budhan",
  Jupiter: "guru",
  Venus:   "sukran",
  Saturn:  "sani",
  Rahu:    "rahu",
};

// ─── Grid layout (must match SouthIndianChart GRID) ──────────────────────────

const GRID: (number | null)[][] = [
  [11, 0,    1,    2],
  [10, null, null, 3],
  [9,  null, null, 4],
  [8,  7,    6,    5],
];

type RasiSide = "top" | "bottom" | "left" | "right";

interface RasiPos { row: number; col: number; side: RasiSide; }

function getRasiPos(rasiIndex: number): RasiPos {
  for (let row = 0; row < GRID.length; row++) {
    const col = GRID[row].indexOf(rasiIndex);
    if (col === -1) continue;
    let side: RasiSide;
    if (row === 0) side = "top";
    else if (row === 3) side = "bottom";
    else if (col === 0) side = "left";
    else side = "right";
    return { row, col, side };
  }
  throw new Error(`Rasi ${rasiIndex} not in grid`);
}

/**
 * CSS-calc positioning for a badge within its strip.
 *
 * Top/bottom strip: width = chart width → centre badge over its column.
 * Left/right strip: height = chart height → centre badge beside its row.
 */
function badgeStyle(pos: RasiPos): CSSProperties {
  const { row, col, side } = pos;

  // Centre badge horizontally over column `col` within a strip whose
  // width equals the chart width.
  const hLeft = `calc(${col} * (var(--chart-cell-w) + var(--chart-gap)) + (var(--chart-cell-w) - var(--jama-badge-w)) / 2)`;

  // Centre badge vertically beside row `row` within a strip whose
  // height equals the chart height.
  const vTop = `calc(${row} * (var(--chart-cell-h) + var(--chart-gap)) + (var(--chart-cell-h) - var(--jama-badge-h)) / 2)`;

  const base: CSSProperties = { position: "absolute" };

  switch (side) {
    case "top":    return { ...base, top: 0,    left: hLeft };
    case "bottom": return { ...base, bottom: 0, left: hLeft };
    case "left":   return { ...base, right: 0,  top: vTop  };
    case "right":  return { ...base, left: 0,   top: vTop  };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface JamaGrahaPerimeterProps {
  grahas: JamaGrahaPosition[];
  activeGrahaId?: string | null;
  children: ReactNode;
}

export default function JamaGrahaPerimeter({
  grahas,
  activeGrahaId = null,
  children,
}: JamaGrahaPerimeterProps) {
  const top: JamaGrahaPosition[]    = [];
  const bottom: JamaGrahaPosition[] = [];
  const left: JamaGrahaPosition[]   = [];
  const right: JamaGrahaPosition[]  = [];

  for (const g of grahas) {
    const { side } = getRasiPos(g.rasiIndex);
    if (side === "top")         top.push(g);
    else if (side === "bottom") bottom.push(g);
    else if (side === "left")   left.push(g);
    else                        right.push(g);
  }

  const badge = (g: JamaGrahaPosition) => (
    <JamaGrahaBox
      key={g.id}
      graha={g}
      rasiTamil={RASIS[g.rasiIndex].nameTamil}
      isActive={g.id === activeGrahaId}
      style={badgeStyle(getRasiPos(g.rasiIndex))}
    />
  );

  return (
    <div className="jama-rasi-perimeter">

      {/* TOP strip — same width as the chart (center grid column) */}
      <div className="jama-strip jama-strip--top">
        {top.map(badge)}
      </div>

      {/* MIDDLE row: left strip | chart | right strip */}
      <div className="jama-rasi-middle">
        <div className="jama-strip jama-strip--left">
          {left.map(badge)}
        </div>
        <div className="jama-rasi-chart">{children}</div>
        <div className="jama-strip jama-strip--right">
          {right.map(badge)}
        </div>
      </div>

      {/* BOTTOM strip — same width as the chart */}
      <div className="jama-strip jama-strip--bottom">
        {bottom.map(badge)}
      </div>

    </div>
  );
}
