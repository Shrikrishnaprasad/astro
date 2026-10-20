import { useEffect, useState } from "react";

export function useNow(enabled: boolean, intervalMs = 30000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs]);

  useEffect(() => {
    if (enabled) setNow(new Date());
  }, [enabled]);

  return now;
}

export function useRefreshableNow(autoRefresh: boolean, intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date());
  const refresh = () => setNow(new Date());

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [autoRefresh, intervalMs]);

  return { now, refresh };
}
