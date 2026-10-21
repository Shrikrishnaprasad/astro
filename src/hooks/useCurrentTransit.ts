import { useEffect, useState } from "react";
import { useEphemerisSettings } from "../context/EphemerisSettingsContext";
import { getSiderealLongitudes } from "../engine/planetaryPositions";
import type { LongitudeMap } from "../engine/types";

export function useCurrentTransit(autoRefreshMs = 0) {
  const { resolved } = useEphemerisSettings();
  const [now, setNow] = useState(() => new Date());
  const [longitudes, setLongitudes] = useState<LongitudeMap>(() =>
    getSiderealLongitudes(new Date(), resolved),
  );

  const refresh = () => {
    const date = new Date();
    setNow(date);
    setLongitudes(getSiderealLongitudes(date, resolved));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved]);

  useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(refresh, autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, resolved]);

  return { now, longitudes, refresh };
}
