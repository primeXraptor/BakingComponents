"use client";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useDashboardRuntime, type DashboardAdminAction } from "./context";
const NoticeContext = createContext<(text: string, error: boolean) => void>(
  () => {},
);
export function AdminActionFeedback({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(
    null,
  );
  return (
    <NoticeContext.Provider value={(text, error) => setNotice({ text, error })}>
      {notice && (
        <p
          role={notice.error ? "alert" : "status"}
          className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-4 text-sm"
        >
          {notice.text}
        </p>
      )}
      {children}
    </NoticeContext.Provider>
  );
}
export function useAdminActions() {
  const { actions, onRefresh } = useDashboardRuntime(),
    report = useContext(NoticeContext);
  return useMemo(() => {
    const action = (name: DashboardAdminAction) => async (data: FormData) => {
      try {
        if (!actions?.[name])
          throw new Error(`Connect the ${name} admin action to your backend.`);
        await actions[name]!(data);
        report("Changes saved.", false);
        onRefresh?.();
      } catch (e) {
        report(
          e instanceof Error ? e.message : "Unable to save changes.",
          true,
        );
      }
    };
    return {
      saveKunchanadaPortalSettings: action("saveSettings"),
      saveKunchanadaCalendarEvent: action("saveCalendarEvent"),
      deleteKunchanadaCalendarEvent: action("deleteCalendarEvent"),
      sendKunchanadaPersonalAlert: action("sendPersonalAlert"),
      updateContactSubmission: action("replyToMessage"),
    };
  }, [actions, onRefresh, report]);
}
