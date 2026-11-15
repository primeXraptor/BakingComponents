"use client";
import { useDashboardRuntime } from "../../../../runtime/context";

import { useEffect, useState, type ReactNode } from "react";
import { Button, Collection, Tree, TreeItem, TreeItemContent } from "react-aria-components";
import { ChevronRight, LockKeyhole } from "lucide-react";
import { groupContestantsForTree } from "../../../lib/kunchanada-contestant-tree";
import type { KunchanadaContestant } from "../../../lib/kunchanada-contestants";

const rowClass =
  "flex min-h-[40px] items-center gap-[8px] rounded-lg py-[8px] pr-[12px] text-[14px] text-slate-700 outline-none hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-200 dark:hover:bg-slate-800";

function ExpandToggle({ label, expanded }: { label: string; expanded: boolean }) {
  return (
    <Button
      slot="chevron"
      aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
      className="flex size-[24px] shrink-0 items-center justify-center rounded text-slate-400 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <ChevronRight
        aria-hidden
        className={`size-[16px] transition-transform ${expanded ? "rotate-90" : ""}`}
      />
    </Button>
  );
}

export function LockedContestantsTree({
  contestants,
  databaseReady,
  renderAction,
  pollStatus = true,
}: {
  contestants: KunchanadaContestant[];
  databaseReady: boolean;
  renderAction?: (contestant: KunchanadaContestant) => ReactNode;
  pollStatus?: boolean;
}) {
  const [statuses, setStatuses] = useState<Record<string, string | null>>({});
  const {request: fetch} = useDashboardRuntime();
  useEffect(() => {
    if (!pollStatus) return;
    const controller = new AbortController();
    let fetching = false;
    async function refresh() {
      if (fetching || controller.signal.aborted) return;
      fetching = true;
      try {
        const response = await fetch("/api/kunchanada/submission-status", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const result = await response.json();
        if (!controller.signal.aborted && Array.isArray(result.contestants))
          setStatuses(
            Object.fromEntries(
              result.contestants.map((row: { id: string; work_submitted_at: string | null }) => [
                row.id,
                row.work_submitted_at,
              ]),
            ),
          );
      } catch {
        /* Preserve the last known status during an outage. */
      } finally {
        fetching = false;
      }
    }
    void refresh();
    const timer = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 30000);
    const focus = () => {
      void refresh();
    };
    window.addEventListener("focus", focus);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, [pollStatus, fetch]);
  const groups = groupContestantsForTree(
    contestants.map((row) => ({
      ...row,
      work_submitted_at: Object.prototype.hasOwnProperty.call(statuses, row.id) ? statuses[row.id] : row.work_submitted_at,
    })),
  );
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-[20px] dark:border-slate-700 dark:bg-slate-900">
      <h2 className="flex items-center gap-[8px] text-[18px] font-semibold text-slate-900 dark:text-slate-100">
        <LockKeyhole aria-hidden className="size-[18px] shrink-0" /> Registered contestants
      </h2>
      {!databaseReady ? (
        <p role="alert">Contestants could not be loaded. Please refresh to try again.</p>
      ) : (
        <Tree
          aria-label="Registered contestants by competition and category"
          selectionMode="none"
          items={groups}
          defaultExpandedKeys={groups.map((group) => `category:${group.id}`)}
          renderEmptyState={() => (
            <p className="py-[16px] text-[14px] text-slate-500 dark:text-slate-400">
              No contestants have been submitted.
            </p>
          )}
        >
          {(group) => (
            <TreeItem
              id={`category:${group.id}`}
              textValue={group.label}
              className={rowClass}
              style={({ level }) => ({ paddingLeft: (level - 1) * 24 })}
            >
              <TreeItemContent>
                {({ isExpanded }) => (
                  <>
                    <ExpandToggle label={group.label} expanded={isExpanded} />
                    <span>{group.label}</span>
                  </>
                )}
              </TreeItemContent>
              <Collection items={group.subcategories}>
                {(subcategory) => (
                  <TreeItem
                    id={`subcategory:${group.id}:${subcategory.id}`}
                    textValue={subcategory.label}
                    className={rowClass}
                    style={({ level }) => ({ paddingLeft: (level - 1) * 24 })}
                  >
                    <TreeItemContent>
                      {({ isExpanded }) => (
                        <>
                          <ExpandToggle label={subcategory.label} expanded={isExpanded} />
                          <span>{subcategory.label}</span>
                        </>
                      )}
                    </TreeItemContent>
                    <Collection items={subcategory.contestants}>
                      {(contestant) => (
                        <TreeItem
                          id={`contestant:${contestant.id}`}
                          textValue={contestant.contestant_name}
                          className={rowClass}
                          style={({ level }) => ({ paddingLeft: (level - 1) * 24 + 32 })}
                        >
                          <TreeItemContent>
                            <span className="min-w-0 break-words">
                              {contestant.contestant_name}
                              <span className="ml-[8px] text-[12px] text-slate-500 dark:text-slate-400">
                                Contestant {contestant.slot_number}
                              </span>
                              {renderAction ? (
                                renderAction(contestant)
                              ) : (
                                <span
                                  className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${contestant.work_submitted_at ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`}
                                >
                                  {contestant.work_submitted_at
                                    ? "Successful Submission"
                                    : "Pending Submission"}
                                </span>
                              )}
                            </span>
                          </TreeItemContent>
                        </TreeItem>
                      )}
                    </Collection>
                  </TreeItem>
                )}
              </Collection>
            </TreeItem>
          )}
        </Tree>
      )}
    </section>
  );
}
