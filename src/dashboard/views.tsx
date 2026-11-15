"use client";
import { useEffect, useState, type ReactNode } from "react";
import type {
  DashboardProfile,
  DashboardAlert,
  DashboardPersonalAlert,
  DashboardDeadlines,
  DashboardMessage,
} from "./types";
import s from "./dashboard.module.css";
const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Colombo",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date)
    : "Invalid date";
};
export function SchoolProfile({
  profile,
  registeredContestants,
}: {
  profile: DashboardProfile;
  registeredContestants: number;
}) {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState("");
  const fields = {
    "Name of the School": profile.schoolName,
    "Identification Code of the School": profile.schoolCode,
    "Address of the School": profile.schoolAddress,
    "Name of the Coordinator": profile.coordinatorName,
    "E-Mail of the Coordinator": profile.coordinatorEmail,
    "Phone of the Coordinator": profile.coordinatorPhone,
    "Name of the Master-in-Charge (MIC)": profile.micName,
    "Phone of the Master-in-Charge (MIC)": profile.micPhone,
    "Date of Registration": profile.registrationDate,
    "Number of Registered Contestants": registeredContestants,
  };
  return (
    <section className={s.stack}>
      {profile.banner && <div className={s.banner}>{profile.banner}</div>}
      <div className={s.logos}>
        {profile.schoolLogoUrl && (
          <img
            src={profile.schoolLogoUrl}
            alt={`${profile.schoolName} school logo`}
          />
        )}
        {profile.mediaUnitLogoUrl && (
          <img src={profile.mediaUnitLogoUrl} alt="Media unit logo" />
        )}
      </div>
      <h2>{profile.schoolName}</h2>
      <div className={s.row}>
        <code>{profile.schoolCode}</code>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(profile.schoolCode);
              setCopied(true);
              setError("");
            } catch {
              setError("Unable to copy school code.");
            }
          }}
        >
          {copied ? "School code copied" : "Copy school code"}
        </button>
        {profile.coordinatorGroupUrl && (
          <a href={profile.coordinatorGroupUrl}>Join coordinators group</a>
        )}
      </div>
      {error && <p role="alert">{error}</p>}
      <p>
        Please verify the information and request any corrections, if required.
      </p>
      <dl className={s.fields}>
        {Object.entries(fields).map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value ?? "Not provided"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
export function DashboardAlerts({
  alerts,
  available = true,
  onMention,
}: {
  alerts: DashboardAlert[];
  available?: boolean;
  onMention?: (mention: string) => void;
}) {
  if (!available)
    return <p role="alert">Alerts are temporarily unavailable.</p>;
  return (
    <section className={s.stack}>
      <h2>Alerts</h2>
      {!alerts.length && <p>No alerts.</p>}
      {alerts.map((alert) => (
        <article key={alert.id} className={s.panel}>
          {alert.imageUrl && (
            <img src={alert.imageUrl} alt="" className={s.image} />
          )}
          <h3>{alert.title}</h3>
          <div className={s.status}>{alert.content}</div>
          {onMention && (
            <button
              type="button"
              onClick={() => onMention(`Regarding ${alert.title}: `)}
            >
              Ask about this alert
            </button>
          )}
        </article>
      ))}
    </section>
  );
}
export function PersonalAlertsList({
  alerts,
  available = true,
}: {
  alerts: DashboardPersonalAlert[];
  available?: boolean;
}) {
  return (
    <section>
      <h2>Personal alerts</h2>
      {!available ? (
        <p role="alert">Personal alerts are temporarily unavailable.</p>
      ) : !alerts.length ? (
        <p>No personal alerts.</p>
      ) : (
        <ul className={s.list}>
          {alerts.map((alert) => (
            <li key={alert.id}>
              <p className={s.status}>{alert.message}</p>
              <time dateTime={alert.created_at}>
                {formatDate(alert.created_at)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
export function RegistrationCountdowns({
  deadlines,
}: {
  deadlines: DashboardDeadlines;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const remaining = (value: string) => {
    const delta = new Date(value).getTime() - now;
    if (!Number.isFinite(delta)) return "";
    if (delta <= 0) return "Date reached";
    const seconds = Math.floor(delta / 1000);
    return `${Math.floor(seconds / 86400)}d ${Math.floor(seconds / 3600) % 24}h ${Math.floor(seconds / 60) % 60}m ${seconds % 60}s remaining`;
  };
  const labels: Record<keyof DashboardDeadlines, string> = {
    schoolRegistrationOpensAt: "School registration opens",
    schoolRegistrationClosesAt: "School registration closes",
    contestantRegistrationOpensAt: "Contestant registration opens",
    contestantRegistrationClosesAt: "Contestant registration closes",
    eventStartsAt: "Event starts",
  };
  return (
    <section>
      <h2>Registration and event dates</h2>
      <dl className={s.stack}>
        {(Object.keys(labels) as (keyof DashboardDeadlines)[]).map((key) => (
          <div key={key}>
            <dt>{labels[key]}</dt>
            <dd>
              {deadlines[key] ? (
                <time dateTime={deadlines[key]!}>
                  {formatDate(deadlines[key]!)} · {remaining(deadlines[key]!)}
                </time>
              ) : (
                "Not announced"
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
export function DashboardRules({
  url,
  renderRules,
}: {
  url?: string | null;
  renderRules?: (url: string) => ReactNode;
}) {
  return (
    <section>
      <h2>Rules and Regulations</h2>
      {url ? (
        <>
          {renderRules ? (
            renderRules(url)
          ) : (
            <iframe
              title="Rules and regulations PDF"
              src={url}
              className={s.pdf}
            />
          )}
          <a href={url} target="_blank" rel="noreferrer">
            Open rules document
          </a>
        </>
      ) : (
        <p>Rules and regulations have not been uploaded yet.</p>
      )}
    </section>
  );
}
export function DashboardMessages({
  messages,
  draft,
  onDraftChange,
  onSend,
  available = true,
}: {
  messages: DashboardMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend?: (message: string) => Promise<void>;
  available?: boolean;
}) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  return (
    <section className={s.stack}>
      <h2>Messages</h2>
      {!available && <p role="alert">Messages are temporarily unavailable.</p>}
      <ol className={s.list}>
        {[...messages]
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map((message) => (
            <li key={message.id}>
              <article>
                <h3>You</h3>
                <time dateTime={message.createdAt}>
                  {formatDate(message.createdAt)}
                </time>
                <p className={s.status}>{message.message}</p>
                {message.status && <p>{message.status}</p>}
                {message.adminReply && (
                  <blockquote>
                    <h4>Administrator</h4>
                    {message.repliedAt && (
                      <time dateTime={message.repliedAt}>
                        {formatDate(message.repliedAt)}
                      </time>
                    )}
                    <p className={s.status}>{message.adminReply}</p>
                  </blockquote>
                )}
              </article>
            </li>
          ))}
      </ol>
      {!messages.length && available && <p>No messages yet.</p>}
      <form
        className={s.stack}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!onSend || pending || !available) return;
          const text = draft.trim();
          if (!text || text.length > 5000) {
            setError("Enter a message of 1–5,000 characters.");
            return;
          }
          setPending(true);
          setError("");
          try {
            await onSend(text);
            onDraftChange("");
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Unable to send message.",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        <fieldset disabled={pending || !onSend || !available}>
          <legend>Message composer</legend>
          <div className={s.row}>
            {["@President", "@Secretary", "@Organizer", "@Developer"].map(
              (mention) => (
                <button
                  type="button"
                  key={mention}
                  onClick={() =>
                    onDraftChange(
                      `${draft}${draft && !/\s$/.test(draft) ? " " : ""}${mention} `,
                    )
                  }
                >
                  {mention}
                </button>
              ),
            )}
          </div>
          <label className={s.field}>
            Message
            <textarea
              required
              maxLength={5000}
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
            />
          </label>
          <button type="submit">{pending ? "Sending…" : "Send message"}</button>
        </fieldset>
        {!onSend && <p>Message sending is not configured.</p>}
        {error && <p role="alert">{error}</p>}
      </form>
    </section>
  );
}
