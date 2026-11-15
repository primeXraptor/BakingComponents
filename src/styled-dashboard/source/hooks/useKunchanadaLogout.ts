import { useDashboardRuntime } from "../../runtime/context";
"use client";

import { useRef, useState } from "react";

export function useKunchanadaLogout() {
  const {request:fetch,onLogout,onNavigate} = useDashboardRuntime();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pending = useRef(false);

  async function logout() {
    if (pending.current) return;
    pending.current = true;
    setLoggingOut(true);
    setError(null);
    try {
      if (onLogout) { await onLogout(); pending.current=false; setLoggingOut(false); return; }
      const response = await fetch("/api/kunchanada/logout", { method: "POST" });
      const result = (await response.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;
      if (!response.ok || !result?.success) throw new Error("Logout failed");
      // A full navigation also discards cached dashboard content and drafts.
      onNavigate?.("/events/kunchanada/login");
    } catch {
      setError("Could not log out. Please try again.");
      pending.current = false;
      setLoggingOut(false);
    }
  }

  return { loggingOut, error, logout };
}
