"use client";
import { useState } from "react";
import type { DashboardAlert, DashboardProfile, DashboardView } from "./types";
import type { KunchanadaContestant } from "./contestants";
import { KUNCHANADA_CATEGORIES } from "./contestants";
import { dashboardLabels } from "./types";
import s from "./dashboard.module.css";
export function DashboardAccountMenu({
  profile,
  onProfile,
  onLogout,
}: {
  profile: DashboardProfile;
  onProfile: () => void;
  onLogout?: () => void | Promise<void>;
}) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  return (
    <details>
      <summary>{profile.schoolName}</summary>
      <div className={s.stack}>
        {profile.mediaUnitLogoUrl && (
          <div className={s.logos}>
            <img src={profile.mediaUnitLogoUrl} alt="Media unit logo" />
          </div>
        )}
        <span>{profile.coordinatorName}</span>
        <button type="button" onClick={onProfile}>
          View school profile
        </button>
        {onLogout && (
          <button
            type="button"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              setError("");
              try {
                await onLogout();
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : "Unable to sign out.",
                );
              } finally {
                setPending(false);
              }
            }}
          >
            {pending ? "Signing out…" : "Sign out"}
          </button>
        )}
        {error && <p role="alert">{error}</p>}
      </div>
    </details>
  );
}
export function DashboardSearch({
  contestants,
  alerts,
  onSelect,
  onCategorySelect,
}: {
  contestants: KunchanadaContestant[];
  alerts: DashboardAlert[];
  onSelect: (view: DashboardView) => void;
  onCategorySelect: (category: string) => void;
}) {
  const [query, setQuery] = useState("");
  const matches = (text: string) =>
    text.toLowerCase().includes(query.trim().toLowerCase());
  const pages = (Object.keys(dashboardLabels) as DashboardView[]).filter((id) =>
    matches(dashboardLabels[id]),
  );
  const categories = KUNCHANADA_CATEGORIES.filter((category) =>
    matches(category.label),
  );
  const rows = contestants.filter((c) => matches(c.contestant_name));
  const notices = alerts.filter((a) => matches(a.title));
  return (
    <div className={s.stack}>
      <label className={s.field}>
        Search
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      {!pages.length &&
        !categories.length &&
        !rows.length &&
        !notices.length && <p role="status">No results.</p>}
      <ul className={s.list}>
        {pages.map((id) => (
          <li key={id}>
            <button type="button" onClick={() => onSelect(id)}>
              {dashboardLabels[id]}
            </button>
          </li>
        ))}
        {categories.map((category) => (
          <li key={category.id}>
            <button type="button" onClick={() => onCategorySelect(category.id)}>
              {category.label}
            </button>
          </li>
        ))}
        {rows.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => onCategorySelect(c.category)}>
              {c.contestant_name}
            </button>
          </li>
        ))}
        {notices.map((a) => (
          <li key={a.id}>
            <button type="button" onClick={() => onSelect("alerts")}>
              {a.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
