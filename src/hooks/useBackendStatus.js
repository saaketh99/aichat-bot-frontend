import { useState, useEffect } from "react";

export function useBackendStatus() {
  const [status, setStatus] = useState("checking"); // "checking" | "online" | "offline"

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/chat/health", { signal: AbortSignal.timeout(4000) });
        if (!cancelled) setStatus(res.ok ? "online" : "offline");
      } catch {
        if (!cancelled) setStatus("offline");
      }
    }

    check();
    const interval = setInterval(check, 30_000); // re-check every 30s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return status;
}
