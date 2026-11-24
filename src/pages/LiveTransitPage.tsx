import { useMemo, useState } from "react";
import type { ChartMarker } from "../components/SouthIndianChart";
import SouthIndianChart from "../components/SouthIndianChart";
import { EphemerisAccuracyNotice } from "../components/EphemerisAccuracyPanel";
import PlaceSelector from "../components/PlaceSelector";
import PlanetTable from "../components/PlanetTable";
import {
  GULIKA_TAMIL,
  LAGNA_TAMIL,
  MANDHI_TAMIL,
  PLANET_TAMIL_ABBR,
  PLANET_TAMIL_NAME,
} from "../data/planetsTamil";
import type { ResolvedPlace } from "../data/places";
import { defaultPlace } from "../data/places";
import { getSiderealAscendant } from "../engine/ascendant";
import { getRetrogradeStatus, shouldShowRetrograde } from "../engine/retrograde";
import { computeGulikaMandhi } from "../engine/specialPoints";
import { PLANETS } from "../engine/types";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import { useCurrentTransit } from "../hooks/useCurrentTransit";

export default function LiveTransitPage() {
  const { resolved } = useEphemerisSettings();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [place, setPlace] = useState<ResolvedPlace>(defaultPlace());
  const { now, longitudes, refresh } = useCurrentTransit(autoRefresh ? 60000 : 0);

  const retrograde = useMemo(
    () => getRetrogradeStatus(now, undefined, resolved),
    [now, resolved],
  );

  const lagna = useMemo(
    () => getSiderealAscendant(now, place.lat, place.lon, resolved),
    [now, place, resolved],
  );
  const gulikaMandhi = useMemo(
    () => computeGulikaMandhi(now, place.lat, place.lon, resolved),
    [now, place, resolved],
  );

  const cellContents = useMemo(() => {
    const cells: Record<number, ChartMarker[]> = {};
    const push = (rasiIndex: number, marker: ChartMarker) => {
      (cells[rasiIndex] ??= []).push(marker);
    };
    for (const planet of PLANETS) {
      const longitude = longitudes[planet];
      const rasiIndex = Math.floor(longitude / 30);
      const degreeInRasi = longitude - rasiIndex * 30;
      const isRetrograde = shouldShowRetrograde(planet, retrograde);
      push(rasiIndex, {
        label: PLANET_TAMIL_ABBR[planet],
        kind: "planet",
        title: `${planet} (${PLANET_TAMIL_NAME[planet]})${isRetrograde ? " - Vakram (retrograde)" : ""}`,
        degree: degreeInRasi,
        retrograde: isRetrograde,
      });
    }
    const lagnaRasiIndex = Math.floor(lagna / 30);
    push(lagnaRasiIndex, {
      label: LAGNA_TAMIL,
      kind: "lagna",
      title: "ல (Lagna)",
      degree: lagna - lagnaRasiIndex * 30,
    });
    if (gulikaMandhi) {
      push(gulikaMandhi.gulika.rasiIndex, {
        label: GULIKA_TAMIL,
        kind: "gulika",
        title: "குளி (Gulika — start of Saturn's portion)",
        degree: gulikaMandhi.gulika.longitude - gulikaMandhi.gulika.rasiIndex * 30,
      });
      push(gulikaMandhi.mandhi.rasiIndex, {
        label: MANDHI_TAMIL,
        kind: "mandhi",
        title: "மாந் (Mandhi — mid of Saturn's portion)",
        degree: gulikaMandhi.mandhi.longitude - gulikaMandhi.mandhi.rasiIndex * 30,
      });
    }
    return cells;
  }, [longitudes, retrograde, lagna, gulikaMandhi]);

  return (
    <div>
      <h2>Current Live Transit (Gochara)</h2>
      <EphemerisAccuracyNotice />
      <div className="card">
        <p>As of: {now.toLocaleString()}</p>
        <div className="field-row">
          <button onClick={refresh}>Refresh now</button>
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh every minute
          </label>
        </div>
      </div>
      <PlaceSelector onChange={setPlace} />
      <SouthIndianChart cellContents={cellContents} />
      <PlanetTable longitudes={longitudes} date={now} />
    </div>
  );
}
