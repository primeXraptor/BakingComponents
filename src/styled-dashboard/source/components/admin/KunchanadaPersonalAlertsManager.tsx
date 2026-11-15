"use client";
import {useAdminActions} from "../../../runtime/admin";

import { useFormStatus } from "react-dom";
import type { KunchanadaPersonalAlert } from "../../lib/kunchanada-dashboard";
import { AdminPanel, AdminSelect, AdminTextarea } from "./AdminFormUI";

export interface AdminPersonalAlert extends KunchanadaPersonalAlert {
  school_auth_user_id: string;
}
export interface AlertRecipient {
  authUserId: string;
  schoolCode: string;
  schoolName: string;
}

export function KunchanadaPersonalAlertsManager({
  schools,
  alerts,
  ready,
}: {
  schools: AlertRecipient[];
  alerts: AdminPersonalAlert[];
  ready: boolean;
}) {
  const {sendKunchanadaPersonalAlert} = useAdminActions();
  return (
    <AdminPanel
      title="Personal alerts"
      description="Send a text alert to one registered school or all currently registered schools. Alerts appear in the Personal pane of their dashboard Alerts tab."
    >
      {!ready ? (
        <p role="status" className="text-sm text-[var(--admin-muted)]">
          Personal alerts are unavailable. Apply the personal-alerts and deadlines migration, then
          reload this page.
        </p>
      ) : (
        <div className="space-y-[20px]">
          <form action={sendKunchanadaPersonalAlert} className="space-y-[14px]">
            <AdminSelect
              label="Send to"
              name="school_auth_user_id"
              required
              defaultValue=""
              disabled={schools.length === 0}
            >
              <option value="" disabled>
                Choose a recipient
              </option>
              <option value="all">All registered schools</option>
              {schools.map((school) => (
                <option value={school.authUserId} key={school.authUserId}>
                  {school.schoolCode} — {school.schoolName}
                </option>
              ))}
            </AdminSelect>
            <AdminTextarea
              label="Alert text"
              name="message"
              required
              maxLength={5000}
              disabled={schools.length === 0}
            />
            {schools.length > 0 ? (
              <SendAlertButton />
            ) : (
              <p className="text-sm text-[var(--admin-muted)]">No registered schools yet.</p>
            )}
          </form>
          {alerts.length > 0 && (
            <section>
              <h3 className="mb-[12px] text-sm font-semibold">Recently sent</h3>
              <ul className="max-h-[360px] space-y-[12px] overflow-y-auto">
                {alerts.map((alert) => {
                  const school = schools.find(
                    (item) => item.authUserId === alert.school_auth_user_id,
                  );
                  return (
                    <li
                      key={alert.id}
                      className="rounded-lg border border-[var(--admin-border)] p-[12px] text-sm"
                    >
                      <p className="font-semibold">
                        {school ? `${school.schoolCode} — ${school.schoolName}` : "School account"}
                      </p>
                      <time
                        className="text-xs text-[var(--admin-muted)]"
                        dateTime={alert.created_at}
                      >
                        {new Intl.DateTimeFormat("en-LK", {
                          timeZone: "Asia/Colombo",
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(alert.created_at))}
                      </time>
                      <p className="mt-[8px] whitespace-pre-wrap break-words">{alert.message}</p>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </AdminPanel>
  );
}

function SendAlertButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-[42px] rounded-full bg-[var(--admin-action)] px-[20px] text-sm font-bold text-[var(--admin-action-text)] disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send personal alert"}
    </button>
  );
}
