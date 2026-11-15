"use client";

import { useState } from "react";
import { AdminCheckbox } from "./AdminFormUI";

export function KunchanadaRegistrationControls({
  enabled,
  locked,
  lockSupported,
  submissionsEnabled = false,
  submissionsSupported = false,
}: {
  enabled: boolean;
  locked: boolean;
  lockSupported: boolean;
  submissionsEnabled?: boolean;
  submissionsSupported?: boolean;
}) {
  const [workSubmissionsEnabled, setWorkSubmissionsEnabled] = useState(
    submissionsEnabled && locked && enabled,
  );
  const [registrationEnabled, setRegistrationEnabled] = useState(enabled);
  const [submissionsLocked, setSubmissionsLocked] = useState(locked && enabled);

  return (
    <div className="space-y-[12px]">
      <AdminCheckbox
        name="contestant_registration_enabled"
        label="Enable contestant registration"
        checked={registrationEnabled}
        onChange={(event) => {
          setRegistrationEnabled(event.target.checked);
          if (!event.target.checked) {
            setSubmissionsLocked(false);
            setWorkSubmissionsEnabled(false);
          }
        }}
      />
      {lockSupported && <input type="hidden" name="submission_lock_supported" value="true" />}
      <AdminCheckbox
        name="contestant_submissions_locked"
        label="Lock contestant submissions"
        description={
          lockSupported
            ? "Keep registered contestants visible as a read-only list. Schools cannot add or edit submissions. Enable contestant registration to use this option."
            : "Apply the submission-lock database migration to enable this option."
        }
        checked={submissionsLocked}
        disabled={!registrationEnabled || !lockSupported}
        onChange={(event) => {
          setSubmissionsLocked(event.target.checked);
          if (!event.target.checked) setWorkSubmissionsEnabled(false);
        }}
      />
      {submissionsSupported && (
        <input type="hidden" name="work_submissions_supported" value="true" />
      )}
      <AdminCheckbox
        name="contestant_submissions_enabled"
        label="Enable Contestant Submissions"
        checked={workSubmissionsEnabled}
        disabled={!submissionsSupported || !registrationEnabled || !submissionsLocked}
        onChange={(event) => setWorkSubmissionsEnabled(event.target.checked)}
        description={
          submissionsSupported
            ? "Allow individual contestants to submit their work. Available only while contestant registration is locked."
            : "Apply the contestant work submissions migration to enable this option."
        }
      />
    </div>
  );
}
