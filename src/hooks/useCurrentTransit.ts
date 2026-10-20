import { useEffect, useState } from "react";
import { getSiderealLongitudes } from "../engine/planetaryPositions";
import type { LongitudeMap } from "../engine/types";

export function useCurrentTransit(autoRefreshMs = 0) {
  const [now, setNow] = useState(() => new Date());
  const [longitudes, setLongitudes] = useState<LongitudeMap>(() =>
    getSiderealLongitudes(new Date()),
  );

  const refresh = () => {
    const date = new Date();
    setNow(date);
    setLongitudes(getSiderealLongitudes(date));
  };

  useEffect(() => {
    if (!autoRefreshMs) return;
    const id = setInterval(refresh, autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs]);

  return { now, longitudes, refresh };
}
