import { useEffect, useState, type CSSProperties } from "react";
import { formatDegreeInRasi } from "../utils/format";

export type ChartMarkerKind =
  | "planet"
  | "lagna"
  | "arudha"
  | "mandhi"
  | "kavippu"
  | "jamagraham"
  | "jamagraham-inactive"
  | "transit";

export interface ChartMarker {
  label: string;
  kind: ChartMarkerKind;
  title?: string;
  degree?: number; // degree within the rasi (0-30), shown under the label if given
  retrograde?: boolean; // vakram - shown as "(R)" next to the label
}

// Fixed South Indian chart layout: signs occupy fixed boxes, clockwise from
// Mesha at (row 0, col 1); the center 2x2 is left blank.
const GRID: (number | null)[][] = [
  [11, 0, 1, 2],
  [10, null, null, 3],
  [9, null, null, 4],
  [8, 7, 6, 5],
];

type Edge = "top" | "right" | "bottom" | "left";

// Which outer edge of the chart each rasi's box touches, used to place
// outer-ring markers (e.g. Jamagraham) just outside that box.
const RASI_OUTER_EDGE: Record<number, Edge> = {
  11: "top", 0: "top", 1: "top", 2: "top",
  3: "right", 4: "right",
  5: "bottom", 6: "bottom", 7: "bottom", 8: "bottom",
  9: "left", 10: "left",
};

interface ChartCellMetrics {
  w: number;
  h: number;
  gap: number;
}

const DESKTOP_METRICS: ChartCellMetrics = { w: 130, h: 110, gap: 2 };

function useChartCellMetrics(chart: HTMLElement | null): ChartCellMetrics {
  const [metrics, setMetrics] = useState(DESKTOP_METRICS);
  useEffect(() => {
    if (!chart) return;
    const update = () => {
      const cell = chart.querySelector(".chart-cell");
      if (!cell) return;
      const rect = cell.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(chart).columnGap || "2");
      if (rect.width > 0 && rect.height > 0) {
        setMetrics({
          w: rect.width,
          h: rect.height,
          gap: Number.isFinite(gap) ? gap : 2,
        });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(chart);
    return () => observer.disconnect();
  }, [chart]);
  return metrics;
}

function cellPosition(rasiIndex: number): { row: number; col: number } {
  for (let row = 0; row < GRID.length; row++) {
    const col = GRID[row].indexOf(rasiIndex);
    if (col !== -1) return { row, col };
  }
  throw new Error(`Rasi ${rasiIndex} not found in grid`);
}

const KIND_CLASS: Record<ChartMarkerKind, string> = {
  planet: "chart-marker-planet",
  lagna: "chart-marker-lagna",
  arudha: "chart-marker-arudha",
  mandhi: "chart-marker-mandhi",
  kavippu: "chart-marker-kavippu",
  jamagraham: "chart-marker-jamagraham",
  "jamagraham-inactive": "chart-marker-jamagraham-inactive",
  transit: "chart-marker-transit",
};

// Spreads multiple outer markers along the tangential axis of the edge so
// they don't stack on top of each other (e.g. several transiting planets
// landing in the same rasi).
function outerTagOffset(index: number, total: number, cellW: number): number {
  if (total <= 1) return 0;
  const spacing = Math.max(22, cellW * 0.26);
  return (index - (total - 1) / 2) * spacing;
}

function outerTagStyle(
  rasiIndex: number,
  metrics: ChartCellMetrics,
  index = 0,
  total = 1,
): CSSProperties {
  const { w: cellW, h: cellH, gap } = metrics;
  const { row, col } = cellPosition(rasiIndex);
  const left = col * (cellW + gap);
  const top = row * (cellH + gap);
  const edge = RASI_OUTER_EDGE[rasiIndex];
  const offset = outerTagOffset(index, total, cellW);
  const pad = Math.max(10, cellW * 0.11);

  switch (edge) {
    case "top":
      return {
        left: left + cellW / 2 + offset,
        top: -pad,
        transform: "translate(-50%, -100%)",
      };
    case "bottom":
      return {
        left: left + cellW / 2 + offset,
        top: top + cellH + pad,
        transform: "translate(-50%, 0)",
      };
    case "left":
      return {
        left: -pad,
        top: top + cellH / 2 + offset,
        transform: "translate(-100%, -50%)",
      };
    case "right":
      return {
        left: left + cellW + pad,
        top: top + cellH / 2 + offset,
        transform: "translate(0, -50%)",
      };
  }
}

export default function SouthIndianChart({
  cellContents,
  outerMarkers = {},
}: {
  cellContents: Record<number, ChartMarker[]>;
  outerMarkers?: Record<number, ChartMarker[]>;
}) {
  const [chartEl, setChartEl] = useState<HTMLDivElement | null>(null);
  const cellMetrics = useChartCellMetrics(chartEl);

  return (
    <div className="chart-scroll" aria-label="Rasi chart">
    <div className="south-indian-chart-wrap">
      <div className="south-indian-chart" ref={setChartEl}>
        {GRID.flatMap((row, rowIndex) =>
          row.map((rasiIndex, colIndex) => {
            const key = `${rowIndex}-${colIndex}`;
            if (rasiIndex === null) {
              return <div key={key} className="chart-cell chart-cell-blank" />;
            }
            const markers = cellContents[rasiIndex] ?? [];
            return (
              <div key={key} className="chart-cell">
                <div className="chart-cell-markers">
                  {markers.map((marker, i) => (
                    <span
                      key={i}
                      className={`chart-marker ${KIND_CLASS[marker.kind]}`}
                      title={marker.title}
                    >
                      <span className="tamil">
                        {marker.label}
                        {marker.retrograde && <span className="chart-marker-retrograde"> (R)</span>}
                      </span>
                      {marker.degree !== undefined && (
                        <span className="chart-marker-degree">
                          {formatDegreeInRasi(marker.degree)}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            );
          }),
        )}
      </div>
      {Object.entries(outerMarkers).flatMap(([rasiIndexStr, markers]) => {
        const rasiIndex = Number(rasiIndexStr);
        return markers.map((marker, i) => (
          <span
            key={`${rasiIndex}-${i}`}
            className={`chart-marker chart-outer-marker ${KIND_CLASS[marker.kind]}`}
            style={outerTagStyle(rasiIndex, cellMetrics, i, markers.length)}
            title={marker.title}
          >
            <span className="tamil">
              {marker.label}
              {marker.retrograde && <span className="chart-marker-retrograde"> (R)</span>}
            </span>
            {marker.degree !== undefined && (
              <span className="chart-marker-degree">{formatDegreeInRasi(marker.degree)}</span>
            )}
          </span>
        ));
      })}
    </div>
    </div>
  );
}
