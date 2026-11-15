import { useMemo } from "react";
import { useDashboardRuntime } from "./context";
export function useRouter() {
  const { onRefresh, onNavigate } = useDashboardRuntime();
  return useMemo(
    () => ({
      refresh: () => onRefresh?.(),
      push: (href: string) =>
        onNavigate ? onNavigate(href) : window.location.assign(href),
      replace: (href: string) =>
        onNavigate ? onNavigate(href) : window.location.replace(href),
    }),
    [onRefresh, onNavigate],
  );
}
