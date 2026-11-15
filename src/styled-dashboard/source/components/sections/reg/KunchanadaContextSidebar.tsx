import { RegistrationCountdowns } from "./RegistrationCountdowns";
import { CALENDAR_TIME_ZONE } from "../../../lib/kunchanada-calendar";
import type { KunchanadaDeadlines, KunchanadaPersonalAlert } from "../../../lib/kunchanada-dashboard";
import styles from "./KunchanadaContextSidebar.module.css";

export type DashboardContextView =
  | "school-profile"
  | "rules-and-regulations"
  | "contact"
  | "alerts"
  | "calendar";

interface ContextSidebarProps {
  view: DashboardContextView;
  personalAlerts: KunchanadaPersonalAlert[];
  personalAlertsAvailable: boolean;
  deadlines: KunchanadaDeadlines;
}

const timestampFormatter = new Intl.DateTimeFormat("en-LK", {
  timeZone: CALENDAR_TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

export function KunchanadaContextSidebar({
  view,
  personalAlerts,
  personalAlertsAvailable,
  deadlines,
}: ContextSidebarProps) {
  if (view === "school-profile" || view === "rules-and-regulations" || view === "contact")
    return null;
  const title = view === "alerts" ? "Personal Alerts" : "Registration and event dates";
  return (
    <aside key={view} aria-label={title} data-lenis-prevent className={styles.panel}>
      {view === "alerts" && (
        <PersonalAlertsList alerts={personalAlerts} available={personalAlertsAvailable} />
      )}
      {view === "calendar" && (
        <div className={styles.deadlines}>
          <RegistrationCountdowns
            dates={{
              schoolRegistrationOpensAt: deadlines.schoolRegistrationOpensAt ?? null,
              schoolRegistrationClosesAt: deadlines.schoolRegistrationClosesAt,
              contestantRegistrationOpensAt: deadlines.contestantRegistrationOpensAt ?? null,
              contestantRegistrationClosesAt: deadlines.contestantRegistrationClosesAt,
            }}
          />
          <Deadline title="Kunchanada Event Starts" value={deadlines.eventStartsAt} />
        </div>
      )}
    </aside>
  );
}

export function PersonalAlertsList({
  alerts,
  available,
}: {
  alerts: KunchanadaPersonalAlert[];
  available: boolean;
}) {
  if (alerts.length === 0) return null;
  return (
    <section className={styles.section}>
      <h2>Personal Alerts</h2>
      {!available ? (
        <p>Personal alerts are temporarily unavailable.</p>
      ) : (
        <ul className={styles.list}>
          {alerts.map((alert) => (
            <li key={alert.id}>
              <p>{alert.message}</p>
              <time dateTime={alert.created_at}>
                {timestampFormatter.format(new Date(alert.created_at))}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Deadline({ title, value }: { title: string; value: string | null }) {
  const valid = value && Number.isFinite(new Date(value).getTime());
  return (
    <section>
      <h2>{title}</h2>
      {valid ? (
        <time dateTime={value}>{timestampFormatter.format(new Date(value))}</time>
      ) : (
        <p>Not announced</p>
      )}
    </section>
  );
}
