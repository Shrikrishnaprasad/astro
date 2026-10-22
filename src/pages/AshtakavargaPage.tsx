import { useState } from "react";
import AshtakavargaPanel from "../components/AshtakavargaPanel";
import DateTimePlaceForm from "../components/DateTimePlaceForm";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import type { BirthInput } from "../engine/types";
import { useBirthChart } from "../hooks/useBirthChart";
import { useCurrentTransit } from "../hooks/useCurrentTransit";

export default function AshtakavargaPage() {
  const [input, setInput] = useState<BirthInput | null>(null);
  const chart = useBirthChart(input);
  const { longitudes: transitLongitudes } = useCurrentTransit(0);

  return (
    <div>
      <h2>Ashtakavarga (SAV, BAV, Reductions &amp; Kakshya)</h2>
      <EphemerisAccuracyNotice />
      <p style={{ fontSize: 14, color: "#9aa0c0", maxWidth: 780 }}>
        Complete Parashari <strong>Ashtakavarga</strong> system: <strong>337-bindu Sarvashtakavarga (SAV)</strong>,{" "}
        <strong>7 Planetary Bhinnashtakavargas + Lagna BAV</strong>, interactive South Indian Bindu
        Rasi Chart, <strong>Trikona &amp; Ekadhipatya Shodhana</strong>,{" "}
        <strong>Rasi / Graha / Sodhya Pinda</strong>, 8×12 <strong>Prastarashtakavarga</strong>, and{" "}
        <strong>Kakshya (3°45&prime;)</strong> natal &amp; transit strength.
      </p>

      <DateTimePlaceForm
        submitToCalculate
        submitLabel="Calculate Ashtakavarga"
        onChange={setInput}
      />

      {!chart && (
        <p className="card" style={{ color: "#9aa0c0", fontSize: 14 }}>
          Enter birth date, time, and place, then click <strong>Calculate Ashtakavarga</strong>.
        </p>
      )}

      {chart && <AshtakavargaPanel chart={chart} transitLongitudes={transitLongitudes} />}
    </div>
  );
}
