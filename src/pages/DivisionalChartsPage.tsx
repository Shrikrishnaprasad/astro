import { useMemo, useState } from "react";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import ShodashavargaPanel from "../components/ShodashavargaPanel";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import { getRetrogradeStatus } from "../engine/retrograde";
import type { BirthInput } from "../engine/types";
import { useBirthChart } from "../hooks/useBirthChart";

export default function DivisionalChartsPage() {
  const { resolved } = useEphemerisSettings();
  const [input, setInput] = useState<BirthInput | null>(null);
  const chart = useBirthChart(input);

  const retrograde = useMemo(
    () => (input ? getRetrogradeStatus(input.date, undefined, resolved) : null),
    [input, resolved],
  );

  return (
    <div>
      <h2>Divisional Charts — Shodashavarga (D1–D60)</h2>
      <EphemerisAccuracyNotice />
      <p style={{ fontSize: 14, color: "#9aa0c0", maxWidth: 780 }}>
        Complete 16 Parashari Divisional Charts (<em>Shodashavarga</em>):{" "}
        <strong>
          D1 (Rasi), D2 (Hora), D3 (Drekkana), D4 (Chaturthamsa), D7 (Saptamsa), D9 (Navamsa), D10
          (Dasamsa), D12 (Dwadasamsa), D16 (Shodasamsa), D20 (Vimsamsa), D24 (Chaturvimsamsa), D27
          (Saptavimsamsa), D30 (Trimsamsa), D40 (Khavedamsa), D45 (Akshavedamsa), and D60
          (Shashtiamsa)
        </strong>
        , with Vargottama indicators, D60 Shashtiamsa Deities, and 20-point{" "}
        <strong>Vimshopaka Bala</strong>.
      </p>

      <DateTimePlaceForm
        submitToCalculate
        submitLabel="Calculate divisional charts"
        onChange={setInput}
      />

      {!chart && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter birth date, time, and place, then click{" "}
          <strong>Calculate divisional charts</strong>.
        </p>
      )}

      {chart && <ShodashavargaPanel chart={chart} retrograde={retrograde} />}
    </div>
  );
}
