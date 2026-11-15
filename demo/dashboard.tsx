import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ContestantRegistrationDashboard,
  calendarDateKey,
  type KunchanadaContestant,
  type DashboardMessage,
} from "../src/dashboard";
function Demo() {
  const [contestants, setContestants] = useState<KunchanadaContestant[]>([]),
    [messages, setMessages] = useState<DashboardMessage[]>([]);
  return (
    <ContestantRegistrationDashboard
      title="Contestant dashboard"
      profile={{
        schoolCode: "DEMO-001",
        schoolName: "Example School",
        schoolAddress: "Colombo",
        registrationDate: "15 November 2026",
        coordinatorName: "Example Coordinator",
        coordinatorEmail: "coordinator@example.com",
        coordinatorPhone: "0712345678",
        micName: "Example Teacher",
        micPhone: "0712345678",
      }}
      contestants={contestants}
      onContestantsChange={setContestants}
      onSaveContestant={async (input) => ({
        ...input,
        id: `${input.category}:${input.subcategory}:${input.slot_number}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })}
      messages={messages}
      onSendMessage={async (message) => {
        setMessages((current) => [
          ...current,
          {
            id: String(Date.now()),
            message,
            createdAt: new Date().toISOString(),
            status: "Sent (local demo)",
          },
        ]);
      }}
      alerts={[
        {
          id: "welcome",
          title: "Welcome",
          content:
            "This gallery uses in-memory callbacks. Reloading clears saved contestants and messages.",
        },
      ]}
      personalAlerts={[
        {
          id: "personal",
          message: "Please check your school details.",
          created_at: "2026-11-15T09:00:00Z",
        },
      ]}
      today={calendarDateKey(new Date())}
      calendarEvents={[
        {
          id: "event",
          title: "Registration workshop",
          starts_at: `${calendarDateKey(new Date())}T10:00:00+05:30`,
          ends_at: null,
          description: "Example event",
          location: "Main hall",
          color: "gray",
        },
      ]}
    />
  );
}
createRoot(document.getElementById("root")!).render(<Demo />);
