"use client";
import { useDashboardRuntime } from "../../../runtime/context";
import { useState } from "react";

export function KunchanadaExportButton({ school }: { school?: string }) {
  const {request: fetch} = useDashboardRuntime();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/kunchanada/export${school ? `?school=${encodeURIComponent(school)}` : ""}`,
      );
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(
          result?.error || `Unable to export (HTTP ${response.status}). Please try again.`,
        );
      }
      if (!response.headers.get("Content-Type")?.includes("text/csv"))
        throw new Error("The export returned an unexpected response. Please reload and try again.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download =
        response.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ??
        "kunchanada.csv";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to export. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="my-3">
      <button
        type="button"
        disabled={busy}
        onClick={download}
        className="rounded-full border border-[var(--admin-border)] px-4 py-2 text-sm font-semibold text-[var(--admin-text)] disabled:opacity-50"
      >
        {busy ? "Exporting…" : school ? "Export contestants CSV" : "Export all data CSV"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
