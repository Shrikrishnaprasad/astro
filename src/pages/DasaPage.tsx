import { useState } from "react";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { computeVimshottariDasa, type DasaPeriod } from "../engine/dasa";
import type { BirthInput } from "../engine/types";
import { useBirthChart } from "../hooks/useBirthChart";

// Tamil astrology's 4-level naming: Dasa -> Bhukti -> Andaram -> Sukshmam.
const LEVEL_LABELS = [
  "Mahadasa (Dasa)",
  "Bhukti (Antardasa)",
  "Antara (Andaram)",
  "Sukshma (Sukshmam)",
];

function DasaRow({
  period,
  depth,
  rowKey,
}: {
  period: DasaPeriod;
  depth: number;
  rowKey: string;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = period.bhuktis.length > 0;

  return (
    <>
      <tr>
        <td style={{ paddingLeft: depth * 20 }}>
          {hasChildren ? (
            <button onClick={() => setOpen(!open)} style={{ marginRight: 6, padding: "0 6px" }}>
              {open ? "−" : "+"}
            </button>
          ) : (
            <span style={{ display: "inline-block", width: 22 }} />
          )}
          {depth > 0 && "↳ "}
          {period.lord}
        </td>
        <td>{period.start.toLocaleDateString()}</td>
        <td>{period.end.toLocaleDateString()}</td>
        <td style={{ fontSize: 11, color: "#9aa0c0" }}>{LEVEL_LABELS[depth] ?? ""}</td>
      </tr>
      {open &&
        period.bhuktis.map((child, i) => (
          <DasaRow key={`${rowKey}-${i}`} period={child} depth={depth + 1} rowKey={`${rowKey}-${i}`} />
        ))}
    </>
  );
}

export default function DasaPage() {
  const [input, setInput] = useState<BirthInput | null>(null);
  const chart = useBirthChart(input);

  const mahadasas = chart && input ? computeVimshottariDasa(chart.planetLongitudes.Moon, input.date) : null;

  return (
    <div>
      <h2>Vimshottari Dasa - Bhukti - Antara - Sukshma</h2>
      <DateTimePlaceForm onChange={setInput} />
      {mahadasas && (
        <table>
          <thead>
            <tr>
              <th>Lord</th>
              <th>Start</th>
              <th>End</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {mahadasas.map((period, i) => (
              <DasaRow key={i} period={period} depth={0} rowKey={`${i}`} />
            ))}
          </tbody>
        </table>
      )}
      <p style={{ fontSize: 12, color: "#9aa0c0" }}>
        Each level subdivides its parent period using the same fixed 9-lord Vimshottari cycle,
        starting from the parent's own lord. Expand a row (+) to drill down to the next level.
      </p>
    </div>
  );
}
