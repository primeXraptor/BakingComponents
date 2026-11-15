"use client";
import {ThemeInitializer} from "./source/components/layout/ThemeInitializer";
import { useMemo } from "react";
import {
  SourceContestantRegistrationDashboard,
  type SourceContestantRegistrationDashboardProps,
} from "./source/components/sections/reg/ContestantRegistrationDashboard";
import {
  DashboardRuntimeProvider,
  unconfiguredRequest,
  type DashboardBranding,
  type DashboardRuntime,
} from "./runtime/context";
import "./styles/globals.css";
import "./styles/fonts.css";
export interface StyledDashboardProps
  extends SourceContestantRegistrationDashboardProps, DashboardBranding {
  request?: DashboardRuntime["request"];
  pdfAssetsUrl?: string;
  pdfWorkerUrl?: string;
  onRefresh?: DashboardRuntime["onRefresh"];
  onNavigate?: DashboardRuntime["onNavigate"];
  onLogout?: DashboardRuntime["onLogout"];
  smoothScrollRef?: DashboardRuntime["smoothScrollRef"];
}
/** The original dashboard markup, interaction state, CSS modules and mobile layout. */
export function ContestantRegistrationDashboard({
  event_name,
  school_logo,
  club_logo,
  event_logo,
  request = unconfiguredRequest,
  onRefresh,
  onNavigate,
  onLogout,
  smoothScrollRef,
  pdfAssetsUrl,
  pdfWorkerUrl,
  ...props
}: StyledDashboardProps) {
  const runtime = useMemo(
    () => ({
      event_name,
      school_logo,
      club_logo,
      event_logo,
      request,
      onRefresh,
      onNavigate,
      onLogout,
      smoothScrollRef,
      pdfAssetsUrl,
      pdfWorkerUrl,
    }),
    [
      event_name,
      school_logo,
      club_logo,
      event_logo,
      request,
      onRefresh,
      onNavigate,
      onLogout,
      smoothScrollRef,
      pdfAssetsUrl,
      pdfWorkerUrl,
    ],
  );
  return (
    <DashboardRuntimeProvider value={runtime}>
      <ThemeInitializer />
      <SourceContestantRegistrationDashboard key={`${props.contestantRegistrationEnabled}-${props.contestantSubmissionsLocked}`} {...props} />
    </DashboardRuntimeProvider>
  );
}

export type ContestantRegistrationDashboardProps = StyledDashboardProps;
