import type { ReactNode } from "react";
import type { KunchanadaContestant } from "./contestants";
import type { KunchanadaCalendarEvent } from "./calendar";
export type DashboardView =
  | "school-profile"
  | "contestant-registration"
  | "rules-and-regulations"
  | "contact"
  | "alerts"
  | "calendar";
export const dashboardLabels: Record<DashboardView, string> = {
  "school-profile": "School Profile",
  "contestant-registration": "Contestant Registration",
  "rules-and-regulations": "Rules and Regulations",
  contact: "Messages",
  alerts: "Alerts",
  calendar: "Calendar",
};
export interface DashboardProfile {
  schoolCode: string;
  schoolName: string;
  schoolAddress: string;
  registrationDate: string;
  coordinatorName: string;
  coordinatorEmail?: string | null;
  coordinatorPhone: string;
  micName: string;
  micPhone: string;
  schoolLogoUrl?: string | null;
  mediaUnitLogoUrl?: string | null;
  banner?: ReactNode;
  coordinatorGroupUrl?: string;
}
export interface DashboardAlert {
  id: string;
  title: string;
  content: ReactNode;
  imageUrl?: string;
}
export interface DashboardPersonalAlert {
  id: string;
  message: string;
  created_at: string;
}
export interface DashboardMessage {
  id: string;
  message: string;
  createdAt: string;
  adminReply?: string | null;
  repliedAt?: string | null;
  status?: string;
}
export interface DashboardDeadlines {
  schoolRegistrationOpensAt?: string | null;
  schoolRegistrationClosesAt?: string | null;
  contestantRegistrationOpensAt?: string | null;
  contestantRegistrationClosesAt?: string | null;
  eventStartsAt?: string | null;
}
export type ContestantInput = Pick<
  KunchanadaContestant,
  | "category"
  | "subcategory"
  | "slot_number"
  | "contestant_name"
  | "date_of_birth"
  | "contact_number"
  | "short_film_link"
>;
export interface ContestantSlot {
  category: string;
  subcategory: string;
  slot_number: 1 | 2;
}
export interface StructuralContestantDashboardProps {
  profile: DashboardProfile;
  contestants: KunchanadaContestant[];
  onSaveContestant?: (input: ContestantInput) => Promise<KunchanadaContestant>;
  onContestantsChange?: (contestants: KunchanadaContestant[]) => void;
  registrationEnabled?: boolean;
  submissionsLocked?: boolean;
  registrationOpensAt?: string | null;
  databaseReady?: boolean;
  alerts?: DashboardAlert[];
  personalAlerts?: DashboardPersonalAlert[];
  alertsAvailable?: boolean;
  messages?: DashboardMessage[];
  onSendMessage?: (message: string) => Promise<void>;
  messagesAvailable?: boolean;
  calendarEvents?: KunchanadaCalendarEvent[];
  calendarAvailable?: boolean;
  today?: string;
  deadlines?: DashboardDeadlines;
  rulesPdfUrl?: string | null;
  renderRules?: (url: string) => ReactNode;
  homeLinks?: { label: string; href: string; icon?: ReactNode }[];
  onLogout?: () => void | Promise<void>;
  initialView?: DashboardView;
  view?: DashboardView;
  onViewChange?: (view: DashboardView) => void;
  className?: string;
  title?: string;
}
