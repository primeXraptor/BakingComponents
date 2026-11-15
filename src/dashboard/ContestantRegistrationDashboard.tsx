"use client";
import { useState } from "react";
import type {
  StructuralContestantDashboardProps,
  ContestantSlot,
  DashboardView,
} from "./types";
import { KUNCHANADA_CATEGORIES } from "./contestants";
import {
  DashboardDialog,
  DashboardShell,
  DashboardNavigation,
  DashboardTabs,
  DashboardMobileHeader,
  DashboardMobileBottomNavigation,
} from "./primitives";
import {
  ContestantEditor,
  ContestantRegistrationView,
  DashboardCategoryList,
  DashboardRegistrationStatus,
  LockedContestantsTree,
  contestantSlotKey,
} from "./registration";
import {
  SchoolProfile,
  DashboardAlerts,
  PersonalAlertsList,
  RegistrationCountdowns,
  DashboardMessages,
  DashboardRules,
} from "./views";
import { DashboardCalendar } from "./DashboardCalendar";
import s from "./dashboard.module.css";
import { DashboardAccountMenu, DashboardSearch } from "./navigation";
/** Presentation layer only: callers own authentication, fetching and persistence. */
export function StructuralContestantDashboard({
  profile,
  contestants,
  onSaveContestant,
  onContestantsChange,
  registrationEnabled = true,
  submissionsLocked = false,
  databaseReady = true,
  registrationOpensAt,
  alerts = [],
  personalAlerts = [],
  alertsAvailable = true,
  messages = [],
  messagesAvailable = true,
  onSendMessage,
  calendarEvents = [],
  calendarAvailable = true,
  today,
  deadlines = {},
  rulesPdfUrl,
  renderRules,
  homeLinks = [],
  onLogout,
  initialView = "contestant-registration",
  view: controlledView,
  onViewChange,
  className,
  title = "Dashboard",
}: StructuralContestantDashboardProps) {
  const [saving, setSaving] = useState(false);
  const [localView, setLocalView] = useState<DashboardView>(initialView),
    [tabs, setTabs] = useState<DashboardView[]>([
      controlledView ?? initialView,
    ]);
  const view = controlledView ?? localView;
  const visibleTabs = tabs.includes(view) ? tabs : [...tabs, view];
  const [category, setCategory] = useState<string>(KUNCHANADA_CATEGORIES[0].id),
    [slot, setSlot] = useState<ContestantSlot | null>(null);
  const [sheet, setSheet] = useState<
      "search" | "notifications" | "more" | null
    >(null),
    [draft, setDraft] = useState(""),
    [notice, setNotice] = useState("");
  function select(next: DashboardView) {
    setTabs((current) =>
      current.includes(next) ? current : [...current, next],
    );
    setLocalView(next);
    onViewChange?.(next);
    setSheet(null);
  }
  function close(tab: DashboardView) {
    if (visibleTabs.length === 1) return;
    const next = visibleTabs.filter((item) => item !== tab);
    setTabs(next);
    if (view === tab) select(next[Math.max(0, visibleTabs.indexOf(tab) - 1)]);
  }
  const categories = (
    <DashboardCategoryList
      selectedCategory={category}
      contestants={contestants}
      onSelect={(id) => {
        setCategory(id);
        select("contestant-registration");
      }}
    />
  );
  const context =
    view === "contestant-registration" ? (
      <DashboardRegistrationStatus
        coordinatorName={profile.coordinatorName}
        registrationEnabled={registrationEnabled}
        submissionsLocked={submissionsLocked}
      >
        {categories}
      </DashboardRegistrationStatus>
    ) : view === "alerts" ? (
      <PersonalAlertsList alerts={personalAlerts} available={alertsAvailable} />
    ) : view === "calendar" ? (
      <RegistrationCountdowns deadlines={deadlines} />
    ) : null;
  return (
    <>
      <DashboardShell
        className={className}
        sidebar={
          <>
            <strong>{title}</strong>
            <DashboardAccountMenu
              profile={profile}
              onProfile={() => select("school-profile")}
              onLogout={onLogout}
            />
            <button type="button" onClick={() => setSheet("search")}>
              Search dashboard
            </button>
            <DashboardNavigation view={view} onSelect={select} />
            {homeLinks.length > 0 && (
              <nav aria-label="Home links" className={s.nav}>
                {homeLinks.map((link) => (
                  <a key={link.href} href={link.href}>
                    {link.icon}
                    {link.label}
                  </a>
                ))}
              </nav>
            )}
          </>
        }
        context={context}
        header={
          <DashboardMobileHeader
            view={view}
            onSelect={select}
            onSearch={() => setSheet("search")}
            onNotifications={() => setSheet("notifications")}
          />
        }
        tabs={
          <DashboardTabs
            tabs={visibleTabs}
            view={view}
            onSelect={select}
            onClose={close}
          />
        }
        bottomNavigation={
          <DashboardMobileBottomNavigation
            onSelect={select}
            onMore={() => setSheet("more")}
          />
        }
      >
        {notice && <p role="status">{notice}</p>}
        {view === "school-profile" && (
          <SchoolProfile
            profile={profile}
            registeredContestants={contestants.length}
          />
        )}
        {view === "contestant-registration" && (
          <div className={s.stack}>
            <details>
              <summary>Categories and registration status</summary>
              <DashboardRegistrationStatus
                coordinatorName={profile.coordinatorName}
                registrationEnabled={registrationEnabled}
                submissionsLocked={submissionsLocked}
              >
                {categories}
              </DashboardRegistrationStatus>
            </details>
            {!onSaveContestant && !submissionsLocked && (
              <p>Contestant editing is not configured.</p>
            )}
            {submissionsLocked ? (
              <LockedContestantsTree
                contestants={contestants}
                databaseReady={databaseReady}
              />
            ) : (
              <ContestantRegistrationView
                categoryId={category}
                contestants={contestants}
                registrationEnabled={registrationEnabled}
                databaseReady={databaseReady}
                opensAt={registrationOpensAt}
                onOpenSlot={(next) => {
                  if (onSaveContestant) setSlot(next);
                }}
              />
            )}
          </div>
        )}
        {view === "rules-and-regulations" && (
          <DashboardRules url={rulesPdfUrl} renderRules={renderRules} />
        )}
        {view === "contact" && (
          <DashboardMessages
            messages={messages}
            draft={draft}
            onDraftChange={setDraft}
            onSend={onSendMessage}
            available={messagesAvailable}
          />
        )}
        {view === "alerts" && (
          <>
            <DashboardAlerts
              alerts={alerts}
              available={alertsAvailable}
              onMention={(text) => {
                setDraft(text);
                select("contact");
              }}
            />
            <PersonalAlertsList
              alerts={personalAlerts}
              available={alertsAvailable}
            />
          </>
        )}
        {view === "calendar" && (
          <>
            <DashboardCalendar
              events={calendarEvents}
              available={calendarAvailable}
              today={today}
            />
            <RegistrationCountdowns deadlines={deadlines} />
          </>
        )}
      </DashboardShell>
      <DashboardDialog
        title={
          sheet === "search"
            ? "Search dashboard"
            : sheet === "notifications"
              ? "Notifications"
              : "More dashboard options"
        }
        isOpen={Boolean(sheet)}
        onClose={() => setSheet(null)}
      >
        {sheet === "search" ? (
          <DashboardSearch
            contestants={contestants}
            alerts={alerts}
            onSelect={select}
            onCategorySelect={(id) => {
              setCategory(id);
              select("contestant-registration");
            }}
          />
        ) : sheet === "notifications" ? (
          <PersonalAlertsList
            alerts={personalAlerts}
            available={alertsAvailable}
          />
        ) : (
          <div className={s.stack}>
            <DashboardAccountMenu
              profile={profile}
              onProfile={() => select("school-profile")}
              onLogout={onLogout}
            />
            <DashboardNavigation view={view} onSelect={select} />
            {homeLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.icon}
                {link.label}
              </a>
            ))}
          </div>
        )}
      </DashboardDialog>
      <DashboardDialog
        title={
          slot
            ? `Contestant: ${slot.category} / ${slot.subcategory} / ${slot.slot_number}`
            : "Contestant"
        }
        isOpen={Boolean(slot)}
        dismissable={!saving}
        onClose={() => {
          if (!saving) setSlot(null);
        }}
      >
        {slot && onSaveContestant && (
          <ContestantEditor
            key={contestantSlotKey(slot)}
            slot={slot}
            onPendingChange={setSaving}
            contestant={contestants.find(
              (c) => contestantSlotKey(c) === contestantSlotKey(slot),
            )}
            disabled={
              !registrationEnabled || submissionsLocked || !databaseReady
            }
            onSave={onSaveContestant}
            onSaved={(saved) => {
              onContestantsChange?.([
                ...contestants.filter(
                  (c) => contestantSlotKey(c) !== contestantSlotKey(saved),
                ),
                saved,
              ]);
              setSlot(null);
              setNotice("Contestant saved.");
            }}
          />
        )}
      </DashboardDialog>
    </>
  );
}
