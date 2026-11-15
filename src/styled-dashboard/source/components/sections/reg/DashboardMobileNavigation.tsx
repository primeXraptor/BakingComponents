"use client";
import type { ComponentType, CSSProperties } from "react";
import {
  Button as AriaButton,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import {
  Bell,
  Sun,
  Moon,
  Search,
  UserPlus,
  BookOpen,
  Ellipsis,
} from "lucide-react";
import { useTheme } from "../../../hooks/useTheme";
import mobileTabStyles from "./KunchanadaMobileTabs.module.css";
export function DashboardMobileHeader<T extends string>({
  selectedView,
  labels,
  Icon,
  primaryView,
  onSelect,
  onOpenNotifications,
  searchView,
}: {
  selectedView: T;
  labels: Record<T, string>;
  Icon: ComponentType<{ view: T; className?: string }>;
  primaryView: T;
  searchView: T;

  onSelect: (view: T) => void;
  onOpenNotifications: () => void;
}) {
  const { isDark, toggleTheme } = useTheme();
  const tabs = (Object.keys(labels) as T[]).filter(
    (view) => view !== selectedView && view !== "search" && view !== "alerts",
  );
  const cardClassName =
    "flex h-10 items-center rounded-full border border-white/80 bg-white/85 shadow-[0_2px_12px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-800/85 dark:shadow-[0_2px_12px_rgba(0,0,0,0.18)]";

  return (
    <header className="sticky top-0 z-[200] flex h-[57px] items-center justify-between gap-2 px-4 md:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <MenuTrigger>
          <AriaButton
            aria-label={`${labels[selectedView]}: switch tab`}
            className={`${cardClassName} min-w-0 gap-2 px-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-focus)]`}
          >
            <Icon
              view={selectedView}
              className="size-4 shrink-0 text-slate-700 dark:text-[var(--heading)]"
            />
            <span
              role="heading"
              aria-level={1}
              className="truncate text-[14px] font-semibold tracking-tight text-slate-800 dark:text-slate-200"
            >
              {labels[selectedView]}
            </span>
          </AriaButton>
          <Popover
            placement="bottom start"
            offset={10}
            className={mobileTabStyles.popover}
            data-lenis-prevent
          >
            <Menu
              aria-label="Switch dashboard tab"
              className={mobileTabStyles.menu}
              onAction={(key) => onSelect(key as T)}
            >
              {tabs.map((view, index) => (
                <MenuItem
                  key={view}
                  id={view}
                  textValue={labels[view]}
                  aria-haspopup={view === "search" ? "dialog" : undefined}
                  style={{ "--tab-delay": `${index * 35}ms` } as CSSProperties}
                  className={mobileTabStyles.card}
                >
                  <Icon view={view} className={mobileTabStyles.icon} />
                  <span>{labels[view]}</span>
                </MenuItem>
              ))}
            </Menu>
          </Popover>
        </MenuTrigger>
        {selectedView === primaryView && (
          <button
            type="button"
            aria-label="Search dashboard"
            aria-haspopup="dialog"
            onClick={() => onSelect(searchView)}
            className={`${cardClassName} w-10 shrink-0 justify-center text-slate-700 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[var(--auth-focus)] dark:text-slate-200 dark:hover:bg-slate-700`}
          >
            <Search className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <div className={`${cardClassName} shrink-0 gap-1 p-1`}>
        <button
          type="button"
          onClick={onOpenNotifications}
          aria-label="Open notifications"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-amber-300"
        >
          <Bell className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-pressed={isDark}
          aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
          title={`Switch to ${isDark ? "light" : "dark"} theme`}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-amber-300"
        >
          {isDark ? (
            <Sun className="size-4" aria-hidden="true" />
          ) : (
            <Moon className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
}

export function DashboardMobileBottomNavigation<T extends string>({
  selectedView,
  primaryView,
  rulesView,
  primaryLabel,
  onSelect,
  onOpenMore,
}: {
  selectedView: T;
  primaryView: T;
  rulesView: T;
  primaryLabel: string;
  onSelect: (view: T) => void;
  onOpenMore: () => void;
}) {
  const registrationSelected = selectedView === primaryView;
  const rulesSelected = selectedView === rulesView;

  return (
    <nav
      aria-label="Mobile dashboard navigation"
      className="fixed inset-x-0 bottom-4 z-[300] mx-auto w-max max-w-[calc(100%-16px)] md:hidden"
    >
      <div className="flex items-center gap-1 rounded-full border border-slate-200/90 dark:border-slate-700/90 bg-white/95 dark:bg-slate-900/95 p-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.14)] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => onSelect(primaryView)}
          aria-current={registrationSelected ? "page" : undefined}
          style={{ fontSize: 11 }}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-medium transition-all active:scale-95 ${
            registrationSelected
              ? "bg-slate-950 dark:bg-slate-700 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-slate-100"
          }`}
        >
          <UserPlus
            className={`size-4 shrink-0 ${registrationSelected ? "text-white" : "text-slate-500 dark:text-slate-400"}`}
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">{primaryLabel}</span>
        </button>
        <button
          type="button"
          onClick={() => onSelect(rulesView)}
          aria-current={rulesSelected ? "page" : undefined}
          style={{ fontSize: 11 }}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-medium transition-all active:scale-95 ${
            rulesSelected
              ? "bg-slate-950 dark:bg-slate-700 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-slate-100"
          }`}
        >
          <BookOpen className="size-4 shrink-0" aria-hidden="true" />
          <span>Rules</span>
        </button>
        <button
          type="button"
          onClick={onOpenMore}
          aria-label="More dashboard options"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-slate-100 active:scale-90"
        >
          <Ellipsis className="size-5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
