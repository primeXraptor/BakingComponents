"use client";
import {
  createContext,
  useContext,
  type ReactNode,
  type RefObject,
} from "react";
export type DashboardLogo = string | { light: string; dark?: string };
export const logoSource = (logo: DashboardLogo, dark = false) =>
  typeof logo === "string" ? logo : dark ? logo.dark || logo.light : logo.light;
export interface DashboardBranding {
  event_name: string;
  school_logo: DashboardLogo;
  club_logo: DashboardLogo;
  event_logo: DashboardLogo;
}
export type DashboardRequest = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;
export type DashboardAdminAction =
  | "saveSettings"
  | "saveCalendarEvent"
  | "deleteCalendarEvent"
  | "sendPersonalAlert"
  | "replyToMessage";
export interface DashboardRuntime extends DashboardBranding {
  request: DashboardRequest;
  pdfAssetsUrl?: string;
  pdfWorkerUrl?: string;
  onRefresh?: () => void;
  onNavigate?: (href: string) => void;
  onLogout?: () => Promise<void>;
  actions?: Partial<
    Record<DashboardAdminAction, (data: FormData) => Promise<void>>
  >;
  smoothScrollRef?: RefObject<{
    isStopped?: boolean;
    stop: () => void;
    start: () => void;
  } | null>;
}
const Context = createContext<DashboardRuntime | null>(null);
export function DashboardRuntimeProvider({
  value,
  children,
}: {
  value: DashboardRuntime;
  children: ReactNode;
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useDashboardRuntime() {
  const value = useContext(Context);
  if (!value)
    throw new Error("Dashboard components require a DashboardRuntimeProvider.");
  return value;
}
export const unconfiguredRequest: DashboardRequest = async () => {
  throw new Error("Connect the dashboard request adapter to your backend.");
};
