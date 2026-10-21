import { useMemo, useState } from "react";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import {
  computeVimshottariDasa,
  findActiveMahadasaAndBhukti,
  type DasaPeriod,
} from "../engine/dasa";
import type { BirthInput } from "../engine/types";
import { useBirthChart } from "../hooks/useBirthChart";

// Tamil astrology's 4-level naming: Dasa -> Bhukti -> Andaram -> Sukshmam.
const LEVEL_LABELS = [
  "Mahadasa (Dasa)",
  "Bhukti (Antardasa)",
  "Antara (Andaram)",
  "Sukshma (Sukshmam)",
];

function dasaPeriodKey(period: DasaPeriod): string {
  return `${period.lord}-${period.start.getTime()}`;
}

function DasaRow({
  period,
  depth,
  rowKey,
  activeMahadasaKey,
  activeBhuktiKey,
  expandMahadasa,
}: {
  period: DasaPeriod;
  depth: number;
  rowKey: string;
  activeMahadasaKey: string | null;
  activeBhuktiKey: string | null;
  expandMahadasa: boolean;
}) {
  const key = dasaPeriodKey(period);
  const isCurrentMahadasa = depth === 0 && key === activeMahadasaKey;
  const isCurrentBhukti = depth === 1 && key === activeBhuktiKey;
  const isCurrent = isCurrentMahadasa || isCurrentBhukti;

  const [open, setOpen] = useState(expandMahadasa);
  const hasChildren = period.bhuktis.length > 0;

  return (
    <>
      <tr className={isCurrent ? "dasa-row--current" : undefined}>
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
          {isCurrent && <span className="dasa-row__here">You are here</span>}
        </td>
        <td>{period.start.toLocaleDateString()}</td>
        <td>{period.end.toLocaleDateString()}</td>
        <td style={{ fontSize: 11, color: "#9aa0c0" }}>{LEVEL_LABELS[depth] ?? ""}</td>
      </tr>
      {open &&
        period.bhuktis.map((child, i) => (
          <DasaRow
            key={`${rowKey}-${i}`}
            period={child}
            depth={depth + 1}
            rowKey={`${rowKey}-${i}`}
            activeMahadasaKey={activeMahadasaKey}
            activeBhuktiKey={activeBhuktiKey}
            expandMahadasa={false}
          />
        ))}
    </>
  );
}

export default function DasaPage() {
  const [input, setInput] = useState<BirthInput | null>(null);
  const chart = useBirthChart(input);

  const mahadasas = chart && input ? computeVimshottariDasa(chart.planetLongitudes.Moon, input.date) : null;

  const now = useMemo(() => new Date(), [mahadasas]);

  const { mahadasa: activeMahadasa, bhukti: activeBhukti } = useMemo(
    () => (mahadasas ? findActiveMahadasaAndBhukti(mahadasas, now) : { mahadasa: null, bhukti: null }),
    [mahadasas, now],
  );

  const activeMahadasaKey = activeMahadasa ? dasaPeriodKey(activeMahadasa) : null;
  const activeBhuktiKey = activeBhukti ? dasaPeriodKey(activeBhukti) : null;

  return (
    <div>
      <h2>Vimshottari Dasa - Bhukti - Antara - Sukshma</h2>
      <DateTimePlaceForm
        submitToCalculate
        submitLabel="Calculate Dasa"
        onChange={setInput}
      />
      {!chart && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter date, time, and place, then click <strong>Calculate Dasa</strong>.
        </p>
      )}
      {mahadasas && activeMahadasa && (
        <div className="card dasa-current-summary">
          <strong>Current period</strong> (as of {now.toLocaleDateString()}):{" "}
          {activeMahadasa.lord} Mahadasa
          {activeBhukti && (
            <>
              {" "}
              · {activeBhukti.lord} Bhukti (until {activeBhukti.end.toLocaleDateString()})
            </>
          )}
        </div>
      )}
      {mahadasas && !activeMahadasa && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Today&apos;s date is outside the generated Dasa timeline (one 120-year cycle from birth).
        </p>
      )}
      {mahadasas && (
        <table className="dasa-table">
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
              <DasaRow
                key={i}
                period={period}
                depth={0}
                rowKey={`${i}`}
                activeMahadasaKey={activeMahadasaKey}
                activeBhuktiKey={activeBhuktiKey}
                expandMahadasa={dasaPeriodKey(period) === activeMahadasaKey}
              />
            ))}
          </tbody>
        </table>
      )}
      <p style={{ fontSize: 12, color: "#9aa0c0" }}>
        Each level subdivides its parent period using the same fixed 9-lord Vimshottari cycle,
        starting from the parent&apos;s own lord. Expand a row (+) to drill down to the next level.
        Current Mahadasa and Bhukti are highlighted.
      </p>
    </div>
  );
}
