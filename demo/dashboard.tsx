import React, { useCallback, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ContestantRegistrationDashboard,
  sourceDashboardBranding,
  type DashboardRequest,
} from "../src/styled-dashboard";
import { calendarDateKey } from "../src/dashboard/calendar";
import type { KunchanadaContestant } from "../src/dashboard/contestants";
export function DashboardDemo() {
  const storedMessages = useRef<Record<string, unknown>[]>([]);
  const [rows, setRows] = useState<KunchanadaContestant[]>([]);
  const request = useCallback<DashboardRequest>(async (input, init) => {
    const path = String(input),
      body = init?.body ? JSON.parse(String(init.body)) : {};
    if (path.endsWith("/contestants")) {
      const row = {
        ...body,
        id: `${body.category}:${body.subcategory}:${body.slot_number}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setRows((current) => [...current.filter((c) => c.id !== row.id), row]);
      return Response.json({ contestant: row });
    }
    if (path.endsWith("/contact")) {
      if (init?.method === "POST") {
        const message = {
          id: crypto.randomUUID(),
          message: body.message,
          status: "sent",
          createdAt: new Date().toISOString(),
          adminReply: null,
          repliedAt: null,
        };
        storedMessages.current.push(message);
        return Response.json({ success: true, message });
      }
      return Response.json({ messages: storedMessages.current });
    }
    if (path.endsWith("/submission-status"))
      return Response.json({ contestants: [] });
    if (path.endsWith("/logout")) return Response.json({ success: true });
    return Response.json({});
  }, []);
  return (
    <ContestantRegistrationDashboard
      {...sourceDashboardBranding}
      event_name={
        new URLSearchParams(location.search).get("event") ?? "Kunchanada"
      }
      events={[]}
      schoolCode="DEMO-001"
      schoolName="Example School"
      schoolAddress="Colombo"
      registrationDate="15 November 2026"
      coordinatorName="Example Coordinator"
      coordinatorEmail="coordinator@example.com"
      coordinatorPhone="0712345678"
      micName="Example Teacher"
      micPhone="0712345678"
      schoolLogoUrl={
        typeof sourceDashboardBranding.school_logo === "string"
          ? sourceDashboardBranding.school_logo
          : sourceDashboardBranding.school_logo.light
      }
      mediaUnitLogoUrl={
        typeof sourceDashboardBranding.club_logo === "string"
          ? sourceDashboardBranding.club_logo
          : sourceDashboardBranding.club_logo.light
      }
      contestantRegistrationEnabled
      contestantSubmissionsLocked={false}
      contestantRegistrationOpensAt={null}
      rulesPdfUrl={new URLSearchParams(location.search).get("rules")}
      pdfAssetsUrl="/dist/pdf-assets/"
      initialContestants={rows}
      databaseReady
      alerts={[
        {
          id: "welcome",
          title: "Welcome",
          content: "This demo uses in-memory data. No server writes occur.",
          featured_image: null,
        },
      ]}
      personalAlerts={[
        {
          id: "personal",
          message: "Please check your school details.",
          created_at: "2026-11-15T09:00:00Z",
        },
      ]}
      calendarEvents={[]}
      calendarAvailable
      calendarToday={calendarDateKey(new Date())}
      request={request}
    />
  );
}
createRoot(document.getElementById("root")!).render(<DashboardDemo />);
