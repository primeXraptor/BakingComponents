"use client";
import wheelClick from "../../../../assets/click-soft.mp3?url";
import { logoSource, useDashboardRuntime } from "../../../../runtime/context";

import { type CSSProperties, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "../../../../runtime/Image";
import { EventLogo } from "../../ui/EventLogo";
import { useRouter } from "../../../../runtime/navigation";
import { KunchanadaMainCategories } from "./KunchanadaMainCategories";
import { useKunchanadaLogout } from "../../../hooks/useKunchanadaLogout";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  insertKunchanadaMention,
  type KunchanadaDeadlines,
  type KunchanadaPersonalAlert,
  type QuickResponseMention,
} from "../../../lib/kunchanada-dashboard";
import {
  KunchanadaContextSidebar,
  PersonalAlertsList,
  type DashboardContextView,
} from "./KunchanadaContextSidebar";
import { KunchanadaSearchDialog } from "./KunchanadaSearchDialog";
import { KunchanadaAccountMenu } from "./KunchanadaAccountMenu";
import { KunchanadaCalendar } from "./KunchanadaCalendar";
import type { KunchanadaCalendarEvent } from "../../../lib/kunchanada-calendar";
import { LockedContestantsTree } from "./LockedContestantsTree";
import "./KunchanadaDashboardTheme.css";
import Link from "../../../../runtime/Link";
import { useLenisInstance } from "../../layout/LenisProvider";
import type { Event } from "../../../types/index";
import type { Article } from "../../../types/index";
import {
  Heading,
} from "react-aria-components";
import { DashboardMobileHeader, DashboardMobileBottomNavigation } from "./DashboardMobileNavigation";
import {
  AlertCircle,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Check,
  Copy,
  Download,
  Home,
  Info,
  Newspaper,
  Images,
  Mail,
  LogOut,
  LoaderCircle,
  MessageCircle,
  Search,
  UserPlus,
  UserRound,
} from "lucide-react";
import { Edit01, Plus } from "@untitledui/icons";
import BreadCrumbPDFApp from "../../BreadCrumbPDF/BreadCrumbPDFApp";
import { Badge } from "../../base/badges/badges";
import { Button } from "../../base/buttons/button";
import { Input } from "../../base/input/input";

import { CountdownTimer } from "../../ui/CountdownTimer";
import GlassSurface from "../../ui/GlassSurface";
import OptionWheel from "../../ui/OptionWheel";
import { KunchanadaContactForm } from "./KunchanadaContactForm";
import { PopUpModel } from "../../ui/pop-up-model";
import {
  KunchanadaDashboardNotifications,
  showKunchanadaSuccessNotification,
} from "./KunchanadaDashboardNotifications";
import {
  CONTESTANT_AGE_RANGES,
  KUNCHANADA_CATEGORIES,
  KUNCHANADA_CONTESTANT_LIMIT,
  type KunchanadaContestant,
  type KunchanadaContestantSlot,
  findKunchanadaCategory,
  findKunchanadaSubcategory,
  getKunchanadaContestantSlots,
  isKunchanadaContestantSlotAllowed,
  validateContestantAge,
  validateShortFilmLink,
} from "../../../lib/kunchanada-contestants";

type DashboardAlert = Pick<Article, "id" | "title" | "content" | "featured_image">;



export interface SourceContestantRegistrationDashboardProps {
  events: Event[];
  schoolCode: string;
  schoolName: string;
  schoolAddress: string;
  registrationDate: string;
  coordinatorName: string;
  coordinatorEmail: string | null;
  coordinatorPhone: string;
  micName: string;
  micPhone: string;
  schoolLogoUrl: string | null;
  mediaUnitLogoUrl: string | null;
  contestantRegistrationEnabled: boolean;
  contestantSubmissionsLocked: boolean;
  contestantRegistrationOpensAt: string | null;
  rulesPdfUrl: string | null;
  initialContestants: KunchanadaContestant[];
  databaseReady: boolean;
  alerts: DashboardAlert[];
  personalAlerts?: KunchanadaPersonalAlert[];
  personalAlertsAvailable?: boolean;
  deadlines?: KunchanadaDeadlines;
  calendarEvents: KunchanadaCalendarEvent[];
  calendarAvailable: boolean;
  calendarToday: string;
}

interface ActiveSlot {
  categoryId: string;
  subcategoryId: string;
  slotNumber: KunchanadaContestantSlot;
}

type DashboardView = DashboardContextView | "contestant-registration";
type DashboardNavigation = DashboardView | "search";

type MobileSheet = "more" | "notifications" | null;

const FIELD_CLASS_NAME = "[&_[data-label]]:text-[var(--auth-text)]";
const FIELD_WRAPPER_CLASS_NAME =
  "rounded-xl bg-[var(--auth-field-background)] shadow-none ring-1 ring-[var(--auth-border)] focus-within:ring-2 focus-within:ring-[var(--auth-focus)]";
const FIELD_INPUT_CLASS_NAME =
  "px-[14px] py-[11px] text-[15px] text-[var(--auth-text)] placeholder:text-[var(--auth-placeholder)]";
const PRIMARY_BUTTON_CLASS_NAME =
  "h-[46px] w-full rounded-full! bg-[var(--auth-action-background)] px-6 py-[11px] text-[var(--auth-action-text)] shadow-sm ring-0 hover:bg-[var(--auth-action-background-hover)] hover:text-[var(--auth-action-text)] focus-visible:outline-[var(--auth-focus)] before:rounded-full!";
const SUBCATEGORY_DISPLAY_ORDER = ["junior", "intermediate", "senior"];
const categoryLabels = KUNCHANADA_CATEGORIES.map((category) => category.label);
const DASHBOARD_SPACING_STYLE = {
  "--spacing-1": "4px",
  "--spacing-2": "8px",
  "--spacing-3": "12px",
  "--spacing-4": "16px",
  "--spacing-5": "20px",
  "--spacing-6": "24px",
  "--spacing-7": "28px",
  "--spacing-8": "32px",
  "--spacing-10": "40px",
  "--spacing-12": "48px",
  "--spacing-15": "60px",
} as CSSProperties;
const PROFILE_BANNER_URL =
  "https://res.cloudinary.com/maliyadevamediaunit/image/upload/v1792613610/screen_c5afxi.png";

const dashboardLabels: Record<DashboardNavigation, string> = {
  "school-profile": "School Profile",
  "contestant-registration": "Contestant Registration",
  "rules-and-regulations": "Rules and Regulations",
  contact: "Messages",
  alerts: "Alerts",
  search: "Search",
  calendar: "Calendar",
};

function contestantSlotKey(
  categoryId: string,
  subcategoryId: string,
  slotNumber: KunchanadaContestantSlot,
) {
  return `${categoryId}:${subcategoryId}:${slotNumber}`;
}

function subcategoryDisplayRank(subcategoryId: string) {
  const rank = SUBCATEGORY_DISPLAY_ORDER.indexOf(subcategoryId);
  return rank === -1 ? SUBCATEGORY_DISPLAY_ORDER.length : rank;
}

function DashboardViewIcon({
  view,
  className = "size-4",
}: {
  view: DashboardNavigation;
  className?: string;
}) {
  switch (view) {
    case "school-profile":
      return <UserRound className={className} aria-hidden="true" />;
    case "contestant-registration":
      return <UserPlus className={className} aria-hidden="true" />;
    case "rules-and-regulations":
      return <BookOpen className={className} aria-hidden="true" />;
    case "contact":
      return <Mail className={className} aria-hidden="true" />;
    case "alerts":
      return <Bell className={className} aria-hidden="true" />;
    case "calendar":
      return <CalendarDays className={className} aria-hidden="true" />;
    case "search":
      return <Search className={className} aria-hidden="true" />;
  }
}

export function SidebarButton({
  view,
  selectedView,
  label,
  badge,
  badgeLoading = false,
  onSelect,
}: {
  view: DashboardNavigation;
  selectedView: DashboardView | null;
  label?: string;
  badge?: number;
  badgeLoading?: boolean;
  onSelect: (view: DashboardNavigation) => void;
}) {
  const isSelected = selectedView === view;
  const resolvedLabel = label ?? dashboardLabels[view];

  if (view === "search")
    return (
      <button
        type="button"
        onClick={() => onSelect(view)}
        aria-label="Search dashboard"
        aria-haspopup="dialog"
        title="Search dashboard"
        className="flex h-8 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 text-left text-xs text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:focus-visible:outline-amber-300 xl:justify-start"
      >
        <Search className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="hidden xl:block">Search…</span>
      </button>
    );

  return (
    <button
      type="button"
      onClick={() => onSelect(view)}
      aria-current={isSelected ? "page" : undefined}
      title={resolvedLabel}
      className={`group flex min-h-9 w-full items-center justify-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-amber-300 xl:justify-start xl:px-3 ${
        isSelected
          ? "bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-100"
          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-slate-100"
      }`}
    >
      <DashboardViewIcon
        view={view}
        className={`size-[15px] shrink-0 ${isSelected ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"}`}
      />
      <span className="hidden min-w-0 flex-1 whitespace-normal break-words xl:block">
        {resolvedLabel}
      </span>
      {badgeLoading ? (
        <span
          aria-label="Loading contestant count"
          aria-busy="true"
          className="hidden h-5 w-6 shrink-0 rounded bg-slate-200 dark:bg-slate-700 motion-safe:animate-pulse xl:block"
        />
      ) : (
        badge !== undefined && (
          <span className="hidden min-w-6 rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 text-center text-[10px] font-semibold text-slate-600 dark:text-slate-300 xl:block">
            {badge}
          </span>
        )
      )}
    </button>
  );
}

export function DashboardSidebar({
  events,
  schoolName,
  mediaUnitLogoUrl,
  coordinatorName,
  selectedView,
  remainingContestants,
  registrationEnabled,
  onSelect,
}: {
  coordinatorName: string;
  selectedView: DashboardView | null;
  remainingContestants: number;
  registrationEnabled: boolean;
  onSelect: (view: DashboardNavigation) => void;
  schoolName: string;
  mediaUnitLogoUrl: string | null;
  events: Event[];
}) {
  const {event_name,event_logo} = useDashboardRuntime();
  const KUNCHANADA_LOGO = {name:event_name,logoPath:logoSource(event_logo),darkLogoPath:logoSource(event_logo,true)};
  const [section, setSection] = useState<"home" | "kunchanada">("kunchanada");
  const reducedMotion = useReducedMotion();
  const direction = section === "kunchanada" ? 1 : -1;
  return (
    <aside
      data-lenis-prevent
      className="sticky top-0 hidden h-[100dvh] min-h-0 flex-col overflow-y-auto overscroll-contain border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-4 md:flex xl:px-4"
    >
      <KunchanadaAccountMenu schoolName={schoolName} mediaUnitLogoUrl={mediaUnitLogoUrl} />
      <nav aria-label="Dashboard navigation" className="mt-4 space-y-1">
        <SidebarButton view="search" selectedView={selectedView} onSelect={onSelect} />
        <div
          role="tablist"
          aria-label="Dashboard sections"
          className="flex flex-col gap-1 py-1 xl:flex-row"
        >
          {(["home", "kunchanada"] as const).map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={section === item}
              onClick={() => setSection(item)}
              title={item === "home" ? "Home" : event_name}
              className={`flex h-8 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-amber-300 ${section === item ? "bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-slate-100" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60"}`}
            >
              {item === "home" ? (
                <Home className="size-3.5 shrink-0" aria-hidden="true" />
              ) : (
                <EventLogo
                  event={KUNCHANADA_LOGO}
                  width={16}
                  height={16}
                  className="size-4 shrink-0 object-contain"
                />
              )}
              <span className="hidden xl:block">{item === "home" ? "Home" : event_name}</span>
            </button>
          ))}
        </div>
      </nav>
      <div className="overflow-hidden">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={section}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: reducedMotion ? 0 : dir * 32,
                opacity: reducedMotion ? 1 : 0,
              }),
              visible: { x: 0, opacity: 1 },
              exit: (dir: number) => ({
                x: reducedMotion ? 0 : -dir * 32,
                opacity: reducedMotion ? 1 : 0,
              }),
            }}
            initial="enter"
            animate="visible"
            exit="exit"
            transition={{ duration: reducedMotion ? 0 : 0.18, ease: "easeOut" }}
            className="space-y-1"
          >
            {section === "home" && (
              <>
                {events.map((event) => (
                  <Link
                    key={event.slug}
                    href={`/events/${event.slug}`}
                    title={event.name}
                    className="flex min-h-9 items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60 xl:justify-start xl:px-3"
                  >
                    <EventLogo
                      event={event}
                      width={18}
                      height={18}
                      className="size-[18px] shrink-0 object-contain"
                    />
                    <span className="hidden xl:block">{event.name}</span>
                  </Link>
                ))}
                {[
                  { label: "News", href: "/news", icon: Newspaper },
                  { label: "Gallery", href: "/gallery", icon: Images },
                  { label: "Contact", href: "/contact", icon: Mail },
                ].map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    title={label}
                    className="flex min-h-9 items-center justify-center gap-2 rounded-lg px-2 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60 xl:justify-start xl:px-3"
                  >
                    <Icon className="size-[15px] shrink-0" aria-hidden="true" />
                    <span className="hidden xl:block">{label}</span>
                  </Link>
                ))}
              </>
            )}
            {section === "kunchanada" && (
              <>
                <SidebarButton view="contact" selectedView={selectedView} onSelect={onSelect} />
                <SidebarButton view="alerts" selectedView={selectedView} onSelect={onSelect} />
                <SidebarButton view="calendar" selectedView={selectedView} onSelect={onSelect} />
                <SidebarButton
                  view="rules-and-regulations"
                  selectedView={selectedView}
                  onSelect={onSelect}
                />
              </>
            )}

            {section === "kunchanada" && (
              <>
                <div className="mt-6">
                  <div className="hidden items-center justify-between px-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 xl:flex">
                    <span className="truncate">{coordinatorName}</span>
                    <ChevronDown className="size-3" aria-hidden="true" />
                  </div>
                  <div className="mt-2 space-y-1">
                    <SidebarButton
                      view="school-profile"
                      selectedView={selectedView}
                      onSelect={onSelect}
                    />
                    <SidebarButton
                      view="contestant-registration"
                      selectedView={selectedView}
                      badge={remainingContestants}
                      badgeLoading={!registrationEnabled}
                      onSelect={onSelect}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <div className="hidden items-center justify-between px-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 xl:flex">
                    <span>Contestants</span>
                    <ChevronDown className="size-3" aria-hidden="true" />
                  </div>
                  <button
                    type="button"
                    disabled
                    title="Export"
                    className="mt-2 flex h-9 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg px-2 text-[12px] font-medium text-slate-400 dark:text-slate-400 opacity-60 xl:justify-start xl:px-3"
                  >
                    <Download className="size-[15px] shrink-0" aria-hidden="true" />
                    <span className="hidden xl:block">Export</span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-auto border-t border-slate-100 dark:border-slate-800 pt-3">
        <p className="mt-2 hidden px-2 text-[10px] text-slate-400 dark:text-slate-400 xl:block">
          © Senuth Dayawansa.
        </p>
      </div>
    </aside>
  );
}

export function StatusSidebar({
  coordinatorName,
  registrationEnabled,
  submissionsLocked,
  remainingByCategory,
  selectedCategory,
  onSelectCategory,
}: {
  coordinatorName: string;
  registrationEnabled: boolean;
  submissionsLocked: boolean;
  remainingByCategory: number[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}) {
  const {event_name} = useDashboardRuntime();
  return (
    <aside
      data-lenis-prevent
      className="sticky top-0 hidden h-[100dvh] min-h-0 overflow-y-auto overscroll-contain border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-6 xl:block"
    >
      <h2 className="text-[13px] font-semibold text-slate-950 dark:text-slate-100">
        {event_name} Registration Status
      </h2>
      <dl className="mt-4 space-y-3 text-[12px]">
        <div className="flex items-center gap-2">
          <UserRound
            className="size-[15px] shrink-0 text-slate-400 dark:text-slate-400"
            aria-hidden="true"
          />
          <dt className="text-slate-500 dark:text-slate-400">Registration by</dt>
          <dd className="ml-auto max-w-[120px] truncate text-right font-medium text-slate-800 dark:text-slate-200">
            {coordinatorName}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle
            className="size-[15px] shrink-0 text-slate-400 dark:text-slate-400"
            aria-hidden="true"
          />
          <dt className="text-slate-500 dark:text-slate-400">Status</dt>
          <dd
            className={`ml-auto font-medium ${registrationEnabled && !submissionsLocked ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-300"}`}
          >
            {submissionsLocked ? "Submissions locked" : registrationEnabled ? "Open" : "Closed"}
          </dd>
        </div>
      </dl>

      <div className="my-4 h-px bg-slate-100 dark:bg-slate-800" />
      <h2 className="text-[13px] font-semibold text-slate-950 dark:text-slate-100">
        Main Categories
      </h2>
      <KunchanadaMainCategories
        loading={!registrationEnabled}
        disabled={submissionsLocked}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        counts={remainingByCategory}
      />
    </aside>
  );
}

function MobileHeader(props: {
  selectedView: DashboardView;
  onSelect: (view: DashboardNavigation) => void;
  onOpenNotifications: () => void;
}) {
  return (
    <DashboardMobileHeader<DashboardNavigation>
      {...props}
      searchView="search"
      labels={dashboardLabels}
      Icon={DashboardViewIcon}
      primaryView="contestant-registration"
    />
  );
}
function MobileBottomNavigation(props: {
  selectedView: DashboardView;
  onSelect: (view: DashboardNavigation) => void;
  onOpenMore: () => void;
}) {
  return (
    <DashboardMobileBottomNavigation<DashboardNavigation>
      {...props}
      primaryView="contestant-registration"
      rulesView="rules-and-regulations"
      primaryLabel="Contestant Registrations"
    />
  );
}

export function MobileMoreSheet({
  selectedView,
  onSelect,
  onClose,
}: {
  selectedView: DashboardView;
  onSelect: (view: DashboardNavigation) => void;
  onClose: () => void;
}) {
  const { loggingOut, error, logout } = useKunchanadaLogout();
  const options: Array<{
    label: string;
    view?: DashboardNavigation;
    href?: string;
    icon: typeof Home;
    disabled?: boolean;
    action?: () => void;
    pending?: boolean;
  }> = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", view: "search", icon: Search },
    { label: "Messages", view: "contact", icon: Mail },
    { label: "Calendar", view: "calendar", icon: CalendarDays },
    { label: "Profile", view: "school-profile", icon: UserRound },
    { label: "Export", icon: Download, disabled: true },
    {
      label: loggingOut ? "Logging out…" : "Logout",
      icon: loggingOut ? LoaderCircle : LogOut,
      disabled: loggingOut,
      pending: loggingOut,
      action: () => void logout(),
    },
  ];

  return (
    <div data-lenis-prevent style={DASHBOARD_SPACING_STYLE}>
      <Heading slot="title" className="sr-only">
        More dashboard options
      </Heading>

      <div className="mt-5 grid grid-cols-4 gap-x-2 gap-y-4">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = option.view === selectedView;
          const itemClass = `flex min-w-0 flex-col items-center gap-1.5 rounded-xl p-2 text-center transition active:scale-95 ${
            option.disabled
              ? "cursor-not-allowed opacity-40"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
          }`;
          const content = (
            <>
              <span
                className={`flex size-10 items-center justify-center rounded-full border ${
                  isSelected
                    ? "border-slate-950 dark:border-slate-500 bg-slate-950 dark:bg-slate-700 text-white"
                    : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                }`}
              >
                <Icon
                  className={`size-5 ${option.pending ? "animate-spin motion-reduce:animate-none" : ""}`}
                  aria-hidden="true"
                />
              </span>
              <span
                className={`whitespace-nowrap text-[11px] ${isSelected ? "font-bold text-slate-950 dark:text-slate-100" : "font-medium text-slate-600 dark:text-slate-300"}`}
              >
                {option.label}
              </span>
            </>
          );

          if (option.href) {
            return (
              <Link key={option.label} href={option.href} className={itemClass} onClick={onClose}>
                {content}
              </Link>
            );
          }

          return (
            <button
              key={option.label}
              type="button"
              disabled={option.disabled}
              aria-busy={option.pending || undefined}
              aria-haspopup={option.view === "search" ? "dialog" : undefined}
              title={
                option.disabled && !option.pending
                  ? `${option.label} is under construction`
                  : option.label
              }
              className={itemClass}
              onClick={() => {
                if (option.action) {
                  option.action();
                  return;
                }
                if (option.view) onSelect(option.view);
                onClose();
              }}
            >
              {content}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function DashboardAlerts({
  alerts,
  personalAlerts,
  personalAlertsAvailable = true,
}: {
  alerts: DashboardAlert[];
  personalAlerts?: KunchanadaPersonalAlert[];
  personalAlertsAvailable?: boolean;
}) {
  return (
    <div
      role="region"
      aria-label="Dashboard alerts"
      tabIndex={0}
      data-lenis-prevent
      className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain rounded-2xl focus-visible:outline-2 focus-visible:outline-blue-500"
    >
      {alerts.length === 0 && !personalAlerts?.length && (
        <div
          className="flex min-h-48 flex-1 flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400"
          role="status"
        >
          <Bell aria-hidden="true" className="size-8" />
          <p className="text-sm font-medium">
            {personalAlertsAvailable ? "No Alerts" : "Alerts are temporarily unavailable."}
          </p>
        </div>
      )}
      {!!personalAlerts?.length && (
        <div className="xl:hidden">
          <PersonalAlertsList alerts={personalAlerts} available={personalAlertsAvailable} />
        </div>
      )}
      {alerts.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Alerts</h2>
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm"
            >
              <div className="flex items-stretch gap-3">
                {alert.featured_image && (
                  <div className="relative w-10 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={alert.featured_image}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="min-w-0 text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">
                  {alert.title}
                </h3>
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                {alert.content}
              </p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export function NotificationsSheet({
  alerts,
  personalAlerts,
  personalAlertsAvailable,
}: {
  alerts: DashboardAlert[];
  personalAlerts: KunchanadaPersonalAlert[];
  personalAlertsAvailable: boolean;
}) {
  return (
    <div data-lenis-prevent style={DASHBOARD_SPACING_STYLE} className="flex max-h-[60dvh] flex-col">
      <Heading slot="title" className="sr-only">
        Notifications
      </Heading>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-5">
        <DashboardAlerts
          alerts={alerts}
          personalAlerts={personalAlerts}
          personalAlertsAvailable={personalAlertsAvailable}
        />
      </div>
    </div>
  );
}

export function SourceContestantRegistrationDashboard({
  events,
  schoolCode,
  schoolName,
  schoolAddress,
  registrationDate,
  coordinatorName,
  coordinatorEmail,
  coordinatorPhone,
  micName,
  micPhone,
  schoolLogoUrl,
  mediaUnitLogoUrl,
  contestantRegistrationEnabled,
  contestantSubmissionsLocked,
  contestantRegistrationOpensAt,
  rulesPdfUrl,
  initialContestants,
  databaseReady,
  alerts,
  personalAlerts = [],
  personalAlertsAvailable = true,
  deadlines = {
    schoolRegistrationClosesAt: null,
    contestantRegistrationClosesAt: null,
    eventStartsAt: null,
  },
  calendarEvents,
  calendarAvailable,
  calendarToday,
}: SourceContestantRegistrationDashboardProps) {
  const {request: fetch,event_name,school_logo,club_logo,event_logo} = useDashboardRuntime();
  const KUNCHANADA_LOGO = {name:event_name,logoPath:logoSource(event_logo),darkLogoPath:logoSource(event_logo,true)};
  const panelRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [messageFocusRequest, setMessageFocusRequest] = useState<{ caret: number } | null>(null);
  const reduceMotion = useReducedMotion();
  const [selectedDashboardView, setSelectedDashboardView] =
    useState<DashboardView>("contestant-registration");
  const [openTabs, setOpenTabs] = useState<DashboardView[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(KUNCHANADA_CATEGORIES[0].id);
  const [contestants, setContestants] = useState(initialContestants);
  const [activeSlot, setActiveSlot] = useState<ActiveSlot | null>(null);
  const [contestantName, setContestantName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [shortFilmLink, setShortFilmLink] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mobileSheet, setMobileSheet] = useState<MobileSheet>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lockedByServer, setLockedByServer] = useState(false);
  const submissionsLocked = contestantSubmissionsLocked || lockedByServer;
  const hasRightPane =
    openTabs.length > 0 &&
    selectedDashboardView !== "contact" &&
    selectedDashboardView !== "school-profile" &&
    selectedDashboardView !== "rules-and-regulations" &&
    (selectedDashboardView !== "alerts" || personalAlerts.length > 0);
  const router = useRouter();

  useEffect(() => {
    // Refresh admin controls for dashboards left open, including when a
    // school returns to the tab. The API and database enforce immediately.
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const interval = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);

  const lenisRef = useLenisInstance();
  const isModalOpen = Boolean(activeSlot) || mobileSheet !== null || searchOpen;

  useEffect(() => {
    if (!isModalOpen) return;
    // React Aria locks native scrolling; stop smooth scrolling as well.
    const lenis = lenisRef?.current;
    const wasStopped = lenis?.isStopped;
    lenis?.stop();
    return () => {
      if (!wasStopped) lenis?.start();
    };
  }, [isModalOpen, lenisRef]);

  const currentCategory = findKunchanadaCategory(selectedCategory) ?? KUNCHANADA_CATEGORIES[0];
  const existingContestant = activeSlot
    ? contestants.find(
        (contestant) =>
          contestant.category === activeSlot.categoryId &&
          contestant.subcategory === activeSlot.subcategoryId &&
          contestant.slot_number === activeSlot.slotNumber,
      )
    : undefined;
  const activeSubcategory = activeSlot
    ? findKunchanadaSubcategory(activeSlot.categoryId, activeSlot.subcategoryId)
    : undefined;
  const activeCategory = activeSlot ? findKunchanadaCategory(activeSlot.categoryId) : undefined;
  const ageValidation =
    activeSlot && dateOfBirth ? validateContestantAge(activeSlot.subcategoryId, dateOfBirth) : null;
  const shortFilmLinkValidation =
    activeSlot?.categoryId === "short-film" && shortFilmLink
      ? validateShortFilmLink(shortFilmLink)
      : null;
  const ageRange = activeSlot
    ? CONTESTANT_AGE_RANGES[activeSlot.subcategoryId as keyof typeof CONTESTANT_AGE_RANGES]
    : undefined;
  const registeredBySlot = useMemo(
    () =>
      new Map(
        contestants.map((contestant) => [
          contestantSlotKey(contestant.category, contestant.subcategory, contestant.slot_number),
          contestant,
        ]),
      ),
    [contestants],
  );
  const activeContestants = useMemo(
    () =>
      contestants.filter((contestant) =>
        isKunchanadaContestantSlotAllowed(contestant.category, contestant.slot_number),
      ),
    [contestants],
  );
  const remainingContestants = Math.max(0, KUNCHANADA_CONTESTANT_LIMIT - activeContestants.length);
  const remainingContestantsByCategory = useMemo(
    () =>
      KUNCHANADA_CATEGORIES.map((category) => {
        const categoryLimit =
          category.subcategories.length * getKunchanadaContestantSlots(category.id).length;
        const registeredInCategory = activeContestants.filter(
          (contestant) => contestant.category === category.id,
        ).length;
        return Math.max(0, categoryLimit - registeredInCategory);
      }),
    [activeContestants],
  );

  function addMessageMention(
    mention: QuickResponseMention,
    selectionStart?: number,
    selectionEnd?: number,
  ) {
    const input = messageInputRef.current;
    if (input?.disabled) return;
    try {
      const next = insertKunchanadaMention(
        messageDraft,
        mention,
        selectionStart ?? input?.selectionStart,
        selectionEnd ?? input?.selectionEnd,
      );
      setMessageDraft(next.message);
      setMessageFocusRequest({ caret: next.caret });
    } catch {
      input?.focus({ preventScroll: true });
    }
  }

  function selectDashboardView(view: DashboardNavigation) {
    if (view === "search") {
      setMobileSheet(null);
      setSearchOpen(true);
      return;
    }
    setOpenTabs((tabs) => (tabs.includes(view) ? tabs : [...tabs, view]));
    setSelectedDashboardView(view);
    setMobileSheet(null);
    panelRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function closeDashboardTab(view: DashboardView) {
    const index = openTabs.indexOf(view);
    const remaining = openTabs.filter((tab) => tab !== view);
    setOpenTabs(remaining);
    if (selectedDashboardView === view && remaining.length) {
      setSelectedDashboardView(remaining[Math.min(index, remaining.length - 1)]);
    }
  }

  function openSlot(
    categoryId: string,
    subcategoryId: string,
    slotNumber: KunchanadaContestantSlot,
  ) {
    if (submissionsLocked || !contestantRegistrationEnabled) {
      selectDashboardView("contestant-registration");
      return;
    }
    const contestant = registeredBySlot.get(
      contestantSlotKey(categoryId, subcategoryId, slotNumber),
    );
    setActiveSlot({ categoryId, subcategoryId, slotNumber });
    setContestantName(contestant?.contestant_name ?? "");
    setDateOfBirth(contestant?.date_of_birth ?? "");
    setContactNumber(contestant?.contact_number ?? "");
    setShortFilmLink(contestant?.short_film_link ?? "");
    setFormError(null);
  }


  function closeModal() {
    if (isSaving) return;
    setActiveSlot(null);
    setFormError(null);
  }

  async function saveContestant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeSlot || submissionsLocked || !contestantRegistrationEnabled) return;

    const trimmedName = contestantName.trim();
    const trimmedShortFilmLink = shortFilmLink.trim();

    if (trimmedName.length < 2) {
      setFormError("Enter the contestant's full name.");
      return;
    }

    const validation = validateContestantAge(activeSlot.subcategoryId, dateOfBirth);
    if (!validation.valid) {
      setFormError(validation.message);
      return;
    }

    if (activeSlot.categoryId === "short-film") {
      const linkValidation = validateShortFilmLink(trimmedShortFilmLink);
      if (!linkValidation.valid) {
        setFormError(linkValidation.message);
        return;
      }
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const response = await fetch("/api/kunchanada/contestants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: activeSlot.categoryId,
          subcategory: activeSlot.subcategoryId,
          slot_number: activeSlot.slotNumber,
          contestant_name: trimmedName,
          date_of_birth: dateOfBirth,
          contact_number: contactNumber,
          short_film_link: activeSlot.categoryId === "short-film" ? trimmedShortFilmLink : null,
        }),
      });
      const result = (await response.json()) as {
        contestant?: KunchanadaContestant;
        error?: string;
        submissionsLocked?: boolean;
      };
      if (result.submissionsLocked) {
        setLockedByServer(true);
        setActiveSlot(null);
        selectDashboardView("contestant-registration");
        router.refresh();
        return;
      }

      if (!response.ok || !result.contestant) {
        throw new Error(result.error || "The contestant could not be saved.");
      }

      setContestants((current) => {
        const withoutCurrentSlot = current.filter(
          (contestant) =>
            contestant.category !== result.contestant?.category ||
            contestant.subcategory !== result.contestant?.subcategory ||
            contestant.slot_number !== result.contestant?.slot_number,
        );
        return [...withoutCurrentSlot, result.contestant as KunchanadaContestant];
      });
      showKunchanadaSuccessNotification(
        "Contestant saved",
        `${trimmedName} was saved under ${activeSubcategory?.label ?? "the selected category"}.`,
      );
      setActiveSlot(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "The contestant could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      data-kunchanada-auth
      data-kunchanada-dashboard
      data-dashboard-view={selectedDashboardView}
      style={DASHBOARD_SPACING_STYLE}
      className="min-h-[100dvh] bg-[#f8fafc] dark:bg-slate-900 text-slate-900 dark:text-slate-100"
    >
      <MobileHeader
        selectedView={selectedDashboardView}
        onSelect={selectDashboardView}
        onOpenNotifications={() => setMobileSheet("notifications")}
      />

      <div
        data-dashboard-grid
        className={`min-h-[100dvh] md:grid md:grid-cols-[72px_minmax(0,1fr)] ${hasRightPane ? "xl:grid-cols-[264px_minmax(0,1fr)_276px]" : "xl:grid-cols-[264px_minmax(0,1fr)]"}`}
      >
        <DashboardSidebar
          events={events}
          schoolName={schoolName}
          mediaUnitLogoUrl={mediaUnitLogoUrl}
          coordinatorName={coordinatorName}
          selectedView={openTabs.length > 0 ? selectedDashboardView : null}
          remainingContestants={remainingContestants}
          registrationEnabled={contestantRegistrationEnabled}
          onSelect={selectDashboardView}
        />

        <div className="min-w-0 bg-[#f8fafc] dark:bg-slate-900">
          {openTabs.length > 0 && (
            <nav
              aria-label="Open dashboard tabs"
              data-lenis-prevent
              className="hidden md:flex min-h-10 w-full items-end gap-1 overflow-x-auto border-b border-slate-200 bg-slate-100 px-2 pt-1 dark:border-slate-700 dark:bg-slate-950"
            >
              {openTabs.map((view) => (
                <div
                  key={view}
                  className={`flex shrink-0 items-center gap-2 rounded-t-lg border border-b-0 px-3 ${view === selectedDashboardView ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" : "border-transparent bg-slate-200/50 dark:bg-slate-800/50"}`}
                >
                  <button
                    type="button"
                    aria-label={`Close ${dashboardLabels[view]} tab`}
                    onClick={() => closeDashboardTab(view)}
                    className="group flex size-5 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                  >
                    <span className="flex size-2 items-center justify-center rounded-full bg-[#ff5f57] text-[8px] leading-none text-red-950 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.1)]">
                      <span
                        className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                        aria-hidden="true"
                      >
                        ×
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-current={view === selectedDashboardView ? "page" : undefined}
                    onClick={() => selectDashboardView(view)}
                    className="flex h-9 items-center gap-2 whitespace-nowrap text-xs text-slate-800 dark:text-slate-200"
                  >
                    <DashboardViewIcon view={view} className="size-3.5" />
                    {dashboardLabels[view]}
                  </button>
                </div>
              ))}
            </nav>
          )}
          {openTabs.length === 0 && (
            <div
              aria-label={`School, club and ${event_name}`}
              className="hidden md:flex min-h-[70dvh] items-center justify-center gap-6 px-6 sm:gap-12"
            >
              <Image
                src={logoSource(school_logo)}
                alt="School logo"
                width={100}
                height={120}
                className="h-24 w-20 object-contain sm:h-32 sm:w-28 dark:hidden"
              />
              <Image
                src={logoSource(school_logo,true)}
                alt="School logo"
                width={100}
                height={120}
                className="hidden h-24 w-20 object-contain sm:h-32 sm:w-28 dark:block"
              />
              <Image
                src={logoSource(club_logo)}
                alt="Club logo"
                width={100}
                height={120}
                className="h-24 w-20 object-contain sm:h-32 sm:w-28 dark:hidden"
              />
              <Image
                src={logoSource(club_logo,true)}
                alt="Club logo"
                width={100}
                height={120}
                className="hidden h-24 w-20 object-contain sm:h-32 sm:w-28 dark:block"
              />
              <EventLogo
                event={KUNCHANADA_LOGO}
                width={100}
                height={120}
                className="h-24 w-20 object-contain sm:h-32 sm:w-28"
              />
            </div>
          )}

          <div
            data-dashboard-content
            data-dashboard-empty={openTabs.length === 0}
            data-dashboard-view={selectedDashboardView}
            className={`${openTabs.length === 0 ? "md:hidden" : ""} ${selectedDashboardView === "school-profile" ? "mr-auto" : "mx-auto"} min-h-[100dvh] w-full ${selectedDashboardView === "school-profile" ? "max-w-[1050px]" : ["rules-and-regulations", "contact", "contestant-registration"].includes(selectedDashboardView) ? "max-w-none" : "max-w-[1194px]"} px-3.5 pb-28 pt-4 sm:px-6 md:px-7 md:pb-12 md:pt-7 xl:px-8`}
          >
            <div className="mb-4 hidden shrink-0 items-center gap-2 md:flex">
              <DashboardViewIcon
                view={selectedDashboardView}
                className="size-4 text-slate-600 dark:text-[var(--heading)]"
              />
              <h1 className="text-[14px] font-semibold text-slate-950 dark:text-slate-100">
                {dashboardLabels[selectedDashboardView]}
              </h1>
            </div>

            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={selectedDashboardView}
                ref={panelRef}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: reduceMotion ? 1 : 0,
                  transition: { duration: reduceMotion ? 0 : 0.1 },
                }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                data-dashboard-panel
                data-lenis-prevent
                role="region"
                aria-label={`${dashboardLabels[selectedDashboardView]} content`}
                tabIndex={0}
                className={`min-h-0 flex-1 overscroll-contain focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--auth-focus)] ${["contact", "alerts", "rules-and-regulations"].includes(selectedDashboardView) || (selectedDashboardView === "contestant-registration" && contestantRegistrationEnabled && !submissionsLocked) ? "flex flex-col overflow-hidden" : "overflow-y-auto"}`}
              >
                {selectedDashboardView === "school-profile" && (
                  <SchoolProfile
                    schoolCode={schoolCode}
                    schoolName={schoolName}
                    schoolAddress={schoolAddress}
                    registrationDate={registrationDate}
                    coordinatorName={coordinatorName}
                    coordinatorEmail={coordinatorEmail}
                    coordinatorPhone={coordinatorPhone}
                    micName={micName}
                    micPhone={micPhone}
                    schoolLogoUrl={schoolLogoUrl}
                    mediaUnitLogoUrl={mediaUnitLogoUrl}
                    registeredContestants={`${activeContestants.length} / ${KUNCHANADA_CONTESTANT_LIMIT}`}
                  />
                )}

                {selectedDashboardView === "contestant-registration" &&
                  (submissionsLocked ? (
                    <LockedContestantsTree
                      contestants={contestants}
                      databaseReady={databaseReady}
                    />
                  ) : (
                    <ContestantRegistrationView
                      selectedCategory={selectedCategory}
                      onSelectCategory={setSelectedCategory}
                      currentCategory={currentCategory}
                      remainingContestantsByCategory={remainingContestantsByCategory}
                      registeredBySlot={registeredBySlot}
                      databaseReady={databaseReady}
                      registrationEnabled={contestantRegistrationEnabled}
                      registrationOpensAt={contestantRegistrationOpensAt}
                      onOpenSlot={openSlot}
                    />
                  ))}

                {selectedDashboardView === "rules-and-regulations" && (
                  <div
                    data-lenis-prevent
                    className="h-full min-h-0 w-full overflow-hidden [&>.bc-viewer]:h-full [&>.bc-viewer]:min-h-0"
                  >
                    {rulesPdfUrl ? (
                      <BreadCrumbPDFApp key={rulesPdfUrl} src={rulesPdfUrl} />
                    ) : (
                      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center text-sm text-slate-600 dark:text-slate-300">
                        Rules and regulations have not been uploaded yet.
                      </div>
                    )}
                  </div>
                )}

                {selectedDashboardView === "contact" && (
                  <div className="min-h-0 w-full flex-1">
                    <KunchanadaContactForm
                      coordinatorEmail={coordinatorEmail}
                      coordinatorName={coordinatorName}
                      inputRef={messageInputRef}
                      draft={messageDraft}
                      onDraftChange={setMessageDraft}
                      onMention={addMessageMention}
                      focusRequest={messageFocusRequest}
                    />
                  </div>
                )}

                {selectedDashboardView === "calendar" && (
                  <KunchanadaCalendar
                    events={calendarEvents}
                    available={calendarAvailable}
                    today={calendarToday}
                  />
                )}

                {selectedDashboardView === "alerts" && (
                  <DashboardAlerts
                    alerts={alerts}
                    personalAlerts={personalAlerts}
                    personalAlertsAvailable={personalAlertsAvailable}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {openTabs.length > 0 && selectedDashboardView === "contestant-registration" ? (
          <StatusSidebar
            coordinatorName={coordinatorName}
            registrationEnabled={contestantRegistrationEnabled}
            submissionsLocked={submissionsLocked}
            remainingByCategory={remainingContestantsByCategory}
            selectedCategory={selectedCategory}
            onSelectCategory={(categoryId) => {
              setSelectedCategory(categoryId);
              selectDashboardView("contestant-registration");
            }}
          />
        ) : hasRightPane && selectedDashboardView !== "contestant-registration" ? (
          <KunchanadaContextSidebar
            view={selectedDashboardView}
            personalAlerts={personalAlerts}
            personalAlertsAvailable={personalAlertsAvailable}
            deadlines={deadlines}
          />
        ) : null}
      </div>

      <MobileBottomNavigation
        selectedView={selectedDashboardView}
        onSelect={selectDashboardView}
        onOpenMore={() => setMobileSheet("more")}
      />

      <KunchanadaSearchDialog
        alerts={alerts}
        personalAlerts={personalAlerts}
        onSelectSection={selectDashboardView}
        registrationEnabled={contestantRegistrationEnabled}
        isOpen={searchOpen}
        onOpenChange={setSearchOpen}
        contestants={activeContestants}
        onSelectMention={(mention) => {
          selectDashboardView("contact");
          addMessageMention(mention);
        }}
        onSelectCategory={(categoryId) => {
          setSelectedCategory(categoryId);
          selectDashboardView("contestant-registration");
        }}
        onOpenContestant={(contestant) => {
          setSelectedCategory(contestant.category);
          selectDashboardView("contestant-registration");
          openSlot(contestant.category, contestant.subcategory, contestant.slot_number);
        }}
      />

      <PopUpModel
        isOpen={mobileSheet === "more"}
        isDismissable
        onOpenChange={(isOpen) => {
          if (!isOpen) setMobileSheet(null);
        }}
      >
        <MobileMoreSheet
          selectedView={selectedDashboardView}
          onSelect={selectDashboardView}
          onClose={() => setMobileSheet(null)}
        />
      </PopUpModel>

      <PopUpModel
        isOpen={mobileSheet === "notifications"}
        isDismissable
        onOpenChange={(isOpen) => {
          if (!isOpen) setMobileSheet(null);
        }}
      >
        <NotificationsSheet
          alerts={alerts}
          personalAlerts={personalAlerts}
          personalAlertsAvailable={personalAlertsAvailable}
        />
      </PopUpModel>

      <PopUpModel
        isOpen={Boolean(activeSlot) && !submissionsLocked && contestantRegistrationEnabled}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeModal();
        }}
        isDismissable={!isSaving}
      >
        <form data-lenis-prevent onSubmit={saveContestant} style={DASHBOARD_SPACING_STYLE}>
          <div className="flex flex-col items-center text-center">
            <Heading
              slot="title"
              className="mt-1 text-center font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--auth-heading)]"
            >
              {existingContestant ? "Update Contestant" : "Add Contestant"}
            </Heading>
            <p className="mt-1 text-center font-[family-name:var(--font-display)] text-xs font-semibold tracking-[0.16em] text-[var(--auth-muted)]">
              {activeCategory?.label}
            </p>
            {activeSubcategory && (
              <div className="mt-3 flex w-full justify-center">
                <Badge
                  size="sm"
                  color="gray"
                  className="bg-[var(--auth-switch-background)] text-center text-[var(--auth-heading)] ring-[var(--auth-border)]"
                >
                  {activeSubcategory.label} · Contestant {activeSlot?.slotNumber}
                </Badge>
              </div>
            )}
          </div>

          <div className="mt-7 space-y-5">
            <Input
              isRequired
              label="Name of the Contestant"
              placeholder="Enter the contestant's full name"
              value={contestantName}
              onChange={setContestantName}
              autoComplete="name"
              className={FIELD_CLASS_NAME}
              wrapperClassName={FIELD_WRAPPER_CLASS_NAME}
              inputClassName={FIELD_INPUT_CLASS_NAME}
            />
            <Input
              isRequired
              type="date"
              label="Date of Birth"
              value={dateOfBirth}
              onChange={setDateOfBirth}
              isInvalid={Boolean(dateOfBirth && ageValidation && !ageValidation.valid)}
              hint={
                dateOfBirth && ageValidation?.age !== null
                  ? ageValidation?.message || `Current age: ${ageValidation?.age} years.`
                  : ageRange
                    ? `Eligible age: ${ageRange.min}–${ageRange.max} years.`
                    : "Enter the contestant's date of birth."
              }
              className={`${FIELD_CLASS_NAME} [&_[slot=description]]:text-[var(--auth-muted)]`}
              wrapperClassName={FIELD_WRAPPER_CLASS_NAME}
              inputClassName={FIELD_INPUT_CLASS_NAME}
            />
            <Input
              label="Contact Number"
              type="tel"
              autoComplete="tel"
              isRequired
              value={contactNumber}
              onChange={setContactNumber}
              placeholder="use format: 0717200410"
              hint="Enter a valid contact number that is connected with WhatsApp"
              className={FIELD_CLASS_NAME}
              wrapperClassName={FIELD_WRAPPER_CLASS_NAME}
              inputClassName={FIELD_INPUT_CLASS_NAME}
            />
            {activeSlot?.categoryId === "short-film" && (
              <Input
                isRequired
                type="url"
                label="Short Film Link"
                placeholder="https://example.com/your-short-film"
                value={shortFilmLink}
                onChange={setShortFilmLink}
                isInvalid={Boolean(
                  shortFilmLink && shortFilmLinkValidation && !shortFilmLinkValidation.valid,
                )}
                hint={shortFilmLinkValidation?.message || "Paste a public link to the short film."}
                className={`${FIELD_CLASS_NAME} [&_[slot=description]]:text-[var(--auth-muted)]`}
                wrapperClassName={FIELD_WRAPPER_CLASS_NAME}
                inputClassName={FIELD_INPUT_CLASS_NAME}
              />
            )}
          </div>

          {formError && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-[var(--auth-danger-border)] bg-[var(--auth-danger-background)] p-3 text-sm leading-6 text-[var(--auth-danger-text)]"
            >
              {formError}
            </p>
          )}

          <div className="mt-7 space-y-3">
            <Button
              type="submit"
              size="lg"
              color="primary"
              isLoading={isSaving}
              isDisabled={isSaving}
              showTextWhileLoading
              className={PRIMARY_BUTTON_CLASS_NAME}
            >
              {isSaving
                ? "Saving..."
                : existingContestant
                  ? "Update contestant"
                  : "Save contestant"}
            </Button>
          </div>
        </form>
      </PopUpModel>

      <KunchanadaDashboardNotifications />
    </div>
  );
}

export function ContestantRegistrationView({
  selectedCategory,
  onSelectCategory,
  currentCategory,
  remainingContestantsByCategory,
  registeredBySlot,
  databaseReady,
  registrationEnabled,
  registrationOpensAt,
  onOpenSlot,
}: {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  currentCategory: (typeof KUNCHANADA_CATEGORIES)[number];
  remainingContestantsByCategory: number[];
  registeredBySlot: Map<string, KunchanadaContestant>;
  databaseReady: boolean;
  registrationEnabled: boolean;
  registrationOpensAt: string | null;
  onOpenSlot: (
    categoryId: string,
    subcategoryId: string,
    slotNumber: KunchanadaContestantSlot,
  ) => void;
}) {
  if (!registrationEnabled) {
    return <RegistrationComingSoon opensAt={registrationOpensAt} />;
  }

  return (
    <section
      aria-labelledby="contestant-category-title"
      className="flex h-full min-h-0 w-full flex-col overflow-hidden"
    >
      <h2
        id="contestant-category-title"
        className="hidden shrink-0 font-[family-name:var(--font-display)] text-[32px] font-bold leading-tight tracking-[-0.035em] text-slate-950 dark:text-slate-100 md:block"
      >
        {currentCategory.label}
      </h2>

      <div className="shrink-0 xl:hidden">
        <div className="relative h-44 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 top-1/2 z-0 h-9 -translate-y-1/2"
          >
            <GlassSurface
              width="100%"
              height="100%"
              borderRadius={12}
              borderWidth={0.16}
              brightness={58}
              opacity={0.82}
              blur={8}
              displace={0.6}
              backgroundOpacity={0.12}
              saturation={1.45}
              distortionScale={-110}
              redOffset={0}
              greenOffset={8}
              blueOffset={16}
              mixBlendMode="screen"
              className="ring-1 ring-slate-200 dark:ring-slate-700 ring-inset"
            />
          </div>
          <OptionWheel
            items={categoryLabels}
            itemBadges={remainingContestantsByCategory}
            defaultSelected={Math.max(
              0,
              KUNCHANADA_CATEGORIES.findIndex((category) => category.id === selectedCategory),
            )}
            textColor="var(--dashboard-wheel-text)"
            activeColor="var(--dashboard-wheel-active)"
            side="left"
            fontSize={0.92}
            spacing={2.15}
            curve={0.8}
            tilt={8}
            blur={1}
            fade={0.3}
            minOpacity={0.08}
            smoothing={140}
            inset={25}
            soundUrl={wheelClick}
            soundVolume={0.5}
            loop={false}
            draggable
            onChange={(index) => {
              const category = KUNCHANADA_CATEGORIES[index];
              if (category) onSelectCategory(category.id);
            }}
            className="relative z-10"
          />
        </div>
      </div>

      <div
        key={currentCategory.id}
        data-lenis-prevent
        role="region"
        data-contestant-scroll
        aria-label={`${currentCategory.label} contestants`}
        tabIndex={0}
        className="mt-5 min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl pb-1 focus-visible:outline-2 focus-visible:outline-blue-500 md:mt-7"
      >
        {!databaseReady && (
          <div
            role="alert"
            className="mb-5 flex gap-3 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 p-4 text-sm text-rose-800 dark:text-rose-200"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Contestant data is temporarily unavailable. Registration controls are disabled until the
            database is ready.
          </div>
        )}

        <div className="grid gap-4 md:gap-5">
          {[...currentCategory.subcategories]
            .sort(
              (first, second) =>
                subcategoryDisplayRank(first.id) - subcategoryDisplayRank(second.id),
            )
            .map((subcategory) => {
              const slotNumbers = getKunchanadaContestantSlots(currentCategory.id);
              return (
                <section
                  key={subcategory.id}
                  aria-labelledby={`${currentCategory.id}-${subcategory.id}-title`}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3.5 shadow-sm sm:p-5"
                >
                  <h3 id={`${currentCategory.id}-${subcategory.id}-title`}>
                    <Badge
                      type="color"
                      size="sm"
                      color="gray"
                      className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 ring-slate-200 dark:ring-slate-700"
                    >
                      {subcategory.label}
                    </Badge>
                  </h3>
                  <div
                    className={`mt-3 grid gap-3 sm:mt-4 sm:gap-4 ${
                      slotNumbers.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                    }`}
                    aria-label={`${subcategory.label} contestant slots`}
                  >
                    {slotNumbers.map((slotNumber) => {
                      const contestant = registeredBySlot.get(
                        contestantSlotKey(currentCategory.id, subcategory.id, slotNumber),
                      );
                      return (
                        <button
                          key={slotNumber}
                          type="button"
                          aria-label={`${contestant ? "Edit" : "Add"} contestant ${slotNumber} for ${subcategory.label}`}
                          disabled={!databaseReady}
                          onClick={() => onOpenSlot(currentCategory.id, subcategory.id, slotNumber)}
                          className="group min-h-28 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 p-4 text-left shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-900 hover:shadow-[0_12px_30px_rgba(15,23,42,0.09)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-amber-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          <div className="flex h-full flex-col items-start">
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              Contestant {slotNumber}
                            </span>
                            {contestant ? (
                              <>
                                <Badge
                                  type="color"
                                  size="md"
                                  color="brand"
                                  className="mt-3 max-w-full whitespace-normal bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-emerald-200 dark:ring-emerald-800"
                                >
                                  {contestant.contestant_name}
                                </Badge>
                                {currentCategory.id === "short-film" &&
                                  contestant.short_film_link && (
                                    <span className="mt-2 line-clamp-1 max-w-full text-[10px] text-slate-500 dark:text-slate-400">
                                      {contestant.short_film_link}
                                    </span>
                                  )}
                                <span className="mt-auto flex items-center gap-2 pt-3 text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100">
                                  <Edit01 className="size-3" aria-hidden="true" />
                                  Edit contestant
                                </span>
                              </>
                            ) : (
                              <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                <Plus className="size-3" aria-hidden="true" />
                                Add contestant
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
        </div>
      </div>
    </section>
  );
}

interface SchoolProfileProps {
  schoolCode: string;
  schoolName: string;
  schoolAddress: string;
  registrationDate: string;
  coordinatorName: string;
  coordinatorEmail: string | null;
  coordinatorPhone: string;
  micName: string;
  micPhone: string;
  schoolLogoUrl: string | null;
  mediaUnitLogoUrl: string | null;
  registeredContestants: string;
}

export function SchoolProfile({
  schoolCode,
  schoolName,
  schoolAddress,
  registrationDate,
  coordinatorName,
  coordinatorEmail,
  coordinatorPhone,
  micName,
  micPhone,
  schoolLogoUrl,
  mediaUnitLogoUrl,
  registeredContestants,
}: SchoolProfileProps) {
  const [copied, setCopied] = useState(false);

  async function copySchoolCode() {
    try {
      await navigator.clipboard.writeText(schoolCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="w-full space-y-4 md:space-y-0 md:overflow-hidden md:rounded-2xl md:border md:border-slate-200 dark:md:border-slate-700 md:bg-white dark:md:bg-slate-900 md:shadow-sm">
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm md:rounded-none md:border-0 md:shadow-none">
        <div
          className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 dark:bg-slate-700 bg-cover bg-center md:aspect-auto md:h-[250px]"
          style={{
            backgroundImage: `linear-gradient(to top, var(--dashboard-banner-base) 0%, var(--dashboard-banner-mid) 32%, rgba(15,23,42,0.08) 100%), url(${PROFILE_BANNER_URL})`,
          }}
          role="img"
          aria-label="Kunchanada profile banner"
        />

        <div className="relative z-10 -mt-8 px-4 pb-5 md:-mt-10 md:px-7 md:pb-6">
          <div className="flex items-center gap-2.5">
            <ProfileIdentityLogo
              label="School logo"
              url={schoolLogoUrl}
              alt={`${schoolName} school logo`}
            />
            <ProfileIdentityLogo
              label="Media Unit logo"
              url={mediaUnitLogoUrl}
              alt={`${schoolName} Media Unit logo`}
            />
          </div>
          <h2 className="mt-3 text-xl font-bold leading-tight tracking-tight text-slate-950 dark:text-slate-100 md:text-2xl">
            {schoolName}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge type="color" color="gray" size="sm" className="gap-1.5 font-mono">
              {schoolCode}
              <button
                type="button"
                onClick={copySchoolCode}
                aria-label={copied ? "School code copied" : "Copy school code"}
                className="inline-flex text-slate-400 dark:text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
              >
                {copied ? (
                  <Check
                    className="size-3.5 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
              </button>
            </Badge>
            <a
              href="https://mcmediaunit.org/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#20ba5a]"
            >
              <MessageCircle className="size-3.5" aria-hidden="true" />
              Join the Group for Coordinators
            </a>
          </div>
          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3.5 py-2.5 text-xs font-medium leading-tight text-blue-800 dark:text-blue-200 md:hidden">
            <Info className="size-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            Please verify the information and request any corrections, if required.
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm md:rounded-none md:border-0 md:border-t md:p-7 md:shadow-none">
        <div className="hidden items-center gap-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3.5 py-2.5 text-xs font-medium leading-tight text-blue-800 dark:text-blue-200 md:flex">
          <Info className="size-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          Please verify the information and request any corrections, if required.
        </div>

        <dl className="grid gap-x-3 gap-y-3.5 text-xs sm:grid-cols-2 md:mt-5 md:grid-cols-6">
          <ReadOnlyProfileField
            label="Name of the School"
            value={schoolName}
            className="md:col-span-3"
          />
          <ReadOnlyProfileField
            label="Identification Code of the School"
            value={schoolCode}
            className="md:col-span-3"
            onCopy={copySchoolCode}
            copied={copied}
          />
          <ReadOnlyProfileField
            label="Address of the School"
            value={schoolAddress}
            className="sm:col-span-2 md:col-span-6"
          />
          <ReadOnlyProfileField
            label="Name of the Coordinator"
            value={coordinatorName}
            className="md:col-span-2"
          />
          <ReadOnlyProfileField
            label="E-Mail of the Coordinator"
            value={coordinatorEmail || "Not provided"}
            className="md:col-span-2"
          />
          <ReadOnlyProfileField
            label="Phone of the Coordinator"
            value={coordinatorPhone}
            className="md:col-span-2"
          />
          <ReadOnlyProfileField
            label="Name of the Master-in-Charge (MIC)"
            value={micName}
            className="md:col-span-3"
          />
          <ReadOnlyProfileField
            label="Phone of the Master-in-Charge (MIC)"
            value={micPhone}
            className="md:col-span-3"
          />
          <ReadOnlyProfileField
            label="Date of Registration"
            value={registrationDate}
            className="md:col-span-3"
          />
          <ReadOnlyProfileField
            label="Number of Registered Contestants"
            value={registeredContestants}
            className="md:col-span-3"
            strong
          />
        </dl>
      </div>
    </section>
  );
}

export function ReadOnlyProfileField({
  label,
  value,
  className = "",
  onCopy,
  copied = false,
  strong = false,
}: {
  label: string;
  value: string;
  className?: string;
  onCopy?: () => void;
  copied?: boolean;
  strong?: boolean;
}) {
  return (
    <div className={className}>
      <dt className="mb-1 text-[11px] font-semibold tracking-wide text-slate-600 dark:text-slate-300">
        {label}
      </dt>
      <dd
        className={`flex min-h-[38px] items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 shadow-sm ${strong ? "font-semibold text-slate-950 dark:text-slate-100" : "font-medium"}`}
      >
        <span className="min-w-0 break-words">{value}</span>
        {onCopy && (
          <button
            type="button"
            onClick={onCopy}
            aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
            className="ml-2 shrink-0 rounded p-1 text-slate-400 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {copied ? (
              <Check
                className="size-3.5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
          </button>
        )}
      </dd>
    </div>
  );
}

export function ProfileIdentityLogo({
  label,
  url,
  alt,
}: {
  label: string;
  url: string | null;
  alt: string;
}) {
  return (
    <div
      title={label}
      className="relative size-14 shrink-0 overflow-hidden rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 md:size-[68px]"
    >
      {url ? (
        <Image src={url} alt={alt} fill sizes="68px" className="object-contain p-1" />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center text-lg font-bold text-slate-400 dark:text-slate-400"
          aria-label={`${label} unavailable`}
        >
          {label === "School logo" ? "S" : "M"}
        </span>
      )}
    </div>
  );
}

export function RegistrationComingSoon({ opensAt }: { opensAt: string | null }) {
  return (
    <section className="mx-auto flex min-h-[520px] w-full flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center shadow-sm">
      {opensAt && (
        <div className="flex flex-col items-center gap-4 px-5 py-6 sm:px-8">
          <CountdownTimer
            targetDate={opensAt}
            tone="auth"
            expiredLabel="Please refresh the page."
          />
        </div>
      )}
      <Badge
        type="color"
        color="orange"
        size="md"
        className="rounded-full bg-[#fff7ed] px-3 py-1 text-[12px] font-semibold text-[#ea3900] ring-[#fed7aa] dark:bg-[#431407] dark:text-[#fdba74] dark:ring-[#9a3412]"
      >
        Coming Soon
      </Badge>
    </section>
  );
}
