"use client";
import {ThemeInitializer} from "./source/components/layout/ThemeInitializer";
import { useMemo, type ComponentProps } from "react";
import { KunchanadaManager } from "./source/components/admin/KunchanadaManager";
import {
  DashboardRuntimeProvider,
  unconfiguredRequest,
  type DashboardRuntime,
} from "./runtime/context";
import { MessagesManager } from "./source/components/admin/DashboardMessagesManager";
import { AdminActionFeedback } from "./runtime/admin";
import "./styles/globals.css";
import "./styles/fonts.css";
export interface DashboardAdminPanelProps extends ComponentProps<
  typeof KunchanadaManager
> {
  messages?: Record<string, unknown>[];
  actions: NonNullable<DashboardRuntime["actions"]>;
  request?: DashboardRuntime["request"];
  onRefresh?: () => void;
}
/** Only the school-dashboard admin manager: settings, rules, alerts, calendar and registration data/CSV. */
export function DashboardAdminPanel({
  actions,
  request = unconfiguredRequest,
  onRefresh,
  messages,
  ...props
}: DashboardAdminPanelProps) {
  const runtime = useMemo(
    () => ({
      event_name: "Event",
      school_logo: "",
      club_logo: "",
      event_logo: "",
      actions,
      request,
      onRefresh,
    }),
    [actions, request, onRefresh],
  );
  return (
    <DashboardRuntimeProvider value={runtime}>
      <ThemeInitializer />
      <section data-admin-surface className="p-[20px] sm:p-[32px]">
        <AdminActionFeedback>
          <KunchanadaManager {...props} />
          {messages && (
            <MessagesManager
              messages={messages.filter((message) =>
                Boolean(message.kunchanada_school_auth_user_id),
              )}
            />
          )}
        </AdminActionFeedback>
      </section>
    </DashboardRuntimeProvider>
  );
}
