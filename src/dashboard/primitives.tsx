"use client";
import type { ReactNode } from "react";
import { Dialog, Modal, ModalOverlay, Heading } from "react-aria-components";
import type { DashboardView } from "./types";
import { dashboardLabels } from "./types";
import s from "./dashboard.module.css";
export { s as dashboardStyles };
export function DashboardDialog({
  title,
  isOpen,
  onClose,
  children,
  dismissable = true,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  dismissable?: boolean;
}) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      isDismissable={dismissable}
      isKeyboardDismissDisabled={!dismissable}
      className={s.overlay}
    >
      <Modal>
        <Dialog className={s.dialog}>
          <div className={s.between}>
            <Heading slot="title">{title}</Heading>
            <button type="button" disabled={!dismissable} onClick={onClose}>
              Close
            </button>
          </div>
          {children}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
export function DashboardNavigation({
  view,
  onSelect,
}: {
  view: DashboardView;
  onSelect: (view: DashboardView) => void;
}) {
  return (
    <nav aria-label="Dashboard navigation" className={s.nav}>
      {(Object.keys(dashboardLabels) as DashboardView[]).map((id) => (
        <button
          type="button"
          key={id}
          aria-current={view === id ? "page" : undefined}
          onClick={() => onSelect(id)}
        >
          {dashboardLabels[id]}
        </button>
      ))}
    </nav>
  );
}
export function DashboardShell({
  sidebar,
  context,
  header,
  tabs,
  children,
  bottomNavigation,
  className,
}: {
  sidebar: ReactNode;
  context?: ReactNode;
  header?: ReactNode;
  tabs?: ReactNode;
  children: ReactNode;
  bottomNavigation?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${s.root} ${className ?? ""}`}>
      <aside className={s.sidebar}>{sidebar}</aside>
      <div>
        <div className={s.mobileHeader}>{header}</div>
        <main className={s.main}>
          {tabs}
          {children}
        </main>
        <div className={s.mobileBottom}>{bottomNavigation}</div>
      </div>
      <aside className={s.context}>{context}</aside>
    </div>
  );
}
export function DashboardTabs({
  tabs,
  view,
  onSelect,
  onClose,
}: {
  tabs: DashboardView[];
  view: DashboardView;
  onSelect: (view: DashboardView) => void;
  onClose: (view: DashboardView) => void;
}) {
  return (
    <nav aria-label="Open dashboard pages" className={s.tabs}>
      {tabs.map((tab) => (
        <span key={tab} className={s.tab}>
          <button
            type="button"
            aria-current={view === tab ? "page" : undefined}
            onClick={() => onSelect(tab)}
          >
            {dashboardLabels[tab]}
          </button>
          <button
            type="button"
            aria-label={`Close ${dashboardLabels[tab]}`}
            disabled={tabs.length === 1}
            onClick={() => onClose(tab)}
          >
            ×
          </button>
        </span>
      ))}
    </nav>
  );
}
export function DashboardMobileHeader({
  view,
  onSelect,
  onSearch,
  onNotifications,
}: {
  view: DashboardView;
  onSelect: (view: DashboardView) => void;
  onSearch: () => void;
  onNotifications: () => void;
}) {
  return (
    <>
      <label>
        Page{" "}
        <select
          aria-label="Dashboard page"
          value={view}
          onChange={(e) => onSelect(e.target.value as DashboardView)}
        >
          {(Object.keys(dashboardLabels) as DashboardView[]).map((id) => (
            <option key={id} value={id}>
              {dashboardLabels[id]}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={onSearch}>
        Search
      </button>
      <button type="button" onClick={onNotifications}>
        Notifications
      </button>
    </>
  );
}
export function DashboardMobileBottomNavigation({
  onSelect,
  onMore,
}: {
  onSelect: (view: DashboardView) => void;
  onMore: () => void;
}) {
  return (
    <nav aria-label="Mobile dashboard navigation" className={s.row}>
      <button type="button" onClick={() => onSelect("contestant-registration")}>
        Contestants
      </button>
      <button type="button" onClick={() => onSelect("rules-and-regulations")}>
        Rules
      </button>
      <button type="button" onClick={onMore}>
        More
      </button>
    </nav>
  );
}
