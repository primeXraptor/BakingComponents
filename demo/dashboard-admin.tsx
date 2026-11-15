import React from "react";
import { createRoot } from "react-dom/client";
import { DashboardAdminPanel } from "../src/styled-dashboard/admin-index";
const settings = {
  school_registration_locked: false,
  contestant_registration_enabled: true,
  contestant_submissions_locked: false,
  contestant_submissions_enabled: false,
  contestant_registration_opens_at: null,
  school_registration_closes_at: null,
  contestant_registration_closes_at: null,
  contestant_registration_opening_at: null,
  alerts_news_tag: "Kunchanada",
  rules_pdf_url: "",
};
const save = async () => {};
createRoot(document.getElementById("root")!).render(
  <DashboardAdminPanel
    settings={settings}
    schools={[]}
    contestants={[]}
    newsTags={["Kunchanada"]}
    calendarEvents={[]}
    calendarReady
    personalAlerts={[]}
    personalAlertsReady
    actions={{
      saveSettings: save,
      saveCalendarEvent: save,
      deleteCalendarEvent: save,
      sendPersonalAlert: save,
    }}
    request={async () =>
      new Response("school_code,school_name\nDEMO-001,Example School", {
        headers: { "Content-Type": "text/csv" },
      })
    }
  />,
);
