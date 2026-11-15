"use client";
import { useDashboardRuntime } from "../../../../runtime/context";

import { useEffect, useRef, useState } from "react";
import { AtSign, Bell, Mail, BookOpen, UserRound, X } from "lucide-react";
import { SearchPopUpModel } from "../../ui/search-pop-up-model";
import {
  KUNCHANADA_CATEGORIES,
  findKunchanadaCategory,
  findKunchanadaSubcategory,
  type KunchanadaContestant,
} from "../../../lib/kunchanada-contestants";
import { matchingQuickResponses, type QuickResponseMention } from "../../../lib/kunchanada-dashboard";
import { MentionText } from "./KunchanadaQuickResponses";
import styles from "../../ui/search-pop-up-model.module.css";

interface SearchEntry {
  id: string;
  title: string;
  content: string;
  kind: "Alerts" | "Personal alerts" | "Messages";
}
interface SearchDialogProps {
  alerts: { id: string; title: string; content: string | null }[];
  personalAlerts: { id: string; message: string }[];
  onSelectSection: (section: "alerts" | "contact") => void;

  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contestants: KunchanadaContestant[];
  registrationEnabled: boolean;
  onSelectCategory: (categoryId: string) => void;
  onOpenContestant: (contestant: KunchanadaContestant) => void;
  onSelectMention: (mention: QuickResponseMention) => void;
}

export function KunchanadaSearchDialog({
  alerts,
  personalAlerts,
  onSelectSection,
  isOpen,
  onOpenChange,
  contestants,
  registrationEnabled,
  onSelectCategory,
  onOpenContestant,
  onSelectMention,
}: SearchDialogProps) {
  return (
    <SearchPopUpModel isOpen={isOpen} onOpenChange={onOpenChange} label="Search the dashboard">
      {(close) => (
        <SearchContent
          alerts={alerts}
          personalAlerts={personalAlerts}
          onSelectSection={onSelectSection}
          contestants={contestants}
          registrationEnabled={registrationEnabled}
          onClose={close}
          onSelectCategory={onSelectCategory}
          onOpenContestant={onOpenContestant}
          onSelectMention={onSelectMention}
        />
      )}
    </SearchPopUpModel>
  );
}

function SearchContent({
  alerts,
  personalAlerts,
  onSelectSection,
  contestants,
  registrationEnabled,
  onClose,
  onSelectCategory,
  onOpenContestant,
  onSelectMention,
}: Omit<SearchDialogProps, "isOpen" | "onOpenChange"> & { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const {request: fetch} = useDashboardRuntime();
  const [messages, setMessages] = useState<
    { id: string; message: string; adminReply: string | null }[]
  >([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/kunchanada/contact", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data.messages)) setMessages(data.messages);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [fetch]);
  const normalizedQuery = query.trim().toLowerCase();
  const mentionSearch = normalizedQuery.startsWith("@");
  const mentions = mentionSearch ? matchingQuickResponses(normalizedQuery) : [];
  const mentionListRef = useRef<HTMLUListElement>(null);
  const showCategorySkeletons = !registrationEnabled && !normalizedQuery;
  const categories =
    !registrationEnabled || mentionSearch
      ? []
      : KUNCHANADA_CATEGORIES.filter((category) =>
          category.label.toLowerCase().includes(normalizedQuery),
        );
  const matchingContestants = mentionSearch
    ? []
    : contestants.filter((contestant) => {
        const category = findKunchanadaCategory(contestant.category);
        const subcategory = findKunchanadaSubcategory(contestant.category, contestant.subcategory);
        return `${contestant.contestant_name} ${category?.label ?? ""} ${subcategory?.label ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery);
      });
  const entries: SearchEntry[] = [
    ...alerts.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content ?? "",
      kind: "Alerts" as const,
    })),
    ...personalAlerts.map((item) => ({
      id: item.id,
      title: item.message,
      content: item.message,
      kind: "Personal alerts" as const,
    })),
    ...messages.map((item) => ({
      id: item.id,
      title: item.message,
      content: [item.message, item.adminReply].filter(Boolean).join(" · "),
      kind: "Messages" as const,
    })),
  ];
  const matches = mentionSearch
    ? []
    : entries.filter((item) =>
        `${item.title} ${item.content}`.toLowerCase().includes(normalizedQuery),
      );
  const resultCount =
    categories.length + matchingContestants.length + mentions.length + matches.length;

  return (
    <>
      <div className={styles.header}>
        <input
          autoFocus
          type="search"
          aria-label="Search categories, contestants, or @tags"
          placeholder="Search…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={styles.input}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && mentions.length > 0) {
              event.preventDefault();
              mentionListRef.current?.querySelector("button")?.focus();
            }
          }}
        />
        <button type="button" aria-label="Close search" onClick={onClose} className={styles.close}>
          <X size={18} aria-hidden />
        </button>
      </div>
      <div
        className={styles.results}
        data-lenis-prevent
        role="region"
        aria-label="Search results"
        tabIndex={0}
      >
        <p className={styles.srOnly} role="status">
          {resultCount} {resultCount === 1 ? "result" : "results"}
        </p>
        {mentions.length > 0 && (
          <section aria-labelledby="search-tags-title" className={styles.group}>
            <h2 id="search-tags-title">Tags</h2>
            <ul
              ref={mentionListRef}
              onKeyDown={(event) => {
                if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                event.preventDefault();
                const buttons = Array.from(
                  mentionListRef.current?.querySelectorAll("button") ?? [],
                );
                const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
                buttons[
                  (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length
                ]?.focus();
              }}
            >
              {mentions.map((mention) => (
                <li key={mention}>
                  <button
                    type="button"
                    className={styles.result}
                    onClick={() => {
                      onSelectMention(mention);
                      onClose();
                    }}
                  >
                    <AtSign size={20} aria-hidden />
                    <span>
                      <MentionText text={mention} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {(categories.length > 0 || showCategorySkeletons) && (
          <section aria-labelledby="search-categories-title" className={styles.group}>
            <h2 id="search-categories-title">Categories</h2>
            <ul aria-busy={showCategorySkeletons}>
              {(showCategorySkeletons ? KUNCHANADA_CATEGORIES : categories).map((category) => (
                <li key={category.id}>
                  {!registrationEnabled ? (
                    <div
                      aria-hidden="true"
                      className={`${styles.result} motion-safe:animate-pulse`}
                    >
                      <span className="h-5 w-5 shrink-0 rounded bg-slate-200 dark:bg-slate-700" />
                      <span className="h-3 w-3/5 rounded bg-slate-200 dark:bg-slate-700" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles.result}
                      onClick={() => {
                        onSelectCategory(category.id);
                        onClose();
                      }}
                    >
                      <BookOpen size={20} aria-hidden />
                      <span>{category.label}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
        {matchingContestants.length > 0 && (
          <section aria-labelledby="search-contestants-title" className={styles.group}>
            <h2 id="search-contestants-title">Registered contestants</h2>
            <ul>
              {matchingContestants.map((contestant) => (
                <li key={contestant.id}>
                  <button
                    type="button"
                    className={styles.result}
                    onClick={() => {
                      onOpenContestant(contestant);
                      onClose();
                    }}
                  >
                    <UserRound size={20} aria-hidden />
                    <span>
                      {contestant.contestant_name}
                      <small>{findKunchanadaCategory(contestant.category)?.label} · {findKunchanadaSubcategory(contestant.category, contestant.subcategory)?.label} · Contestant {contestant.slot_number}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {(["Alerts", "Personal alerts", "Messages"] as const).map((kind) => {
          const items = matches.filter((item) => item.kind === kind);
          return (
            items.length > 0 && (
              <section key={kind} aria-label={kind} className={styles.group}>
                <h2>{kind}</h2>
                <ul>
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className={styles.result}
                        onClick={() => {
                          onSelectSection(kind === "Messages" ? "contact" : "alerts");
                          onClose();
                        }}
                      >
                        {kind === "Messages" ? (
                          <Mail size={20} aria-hidden />
                        ) : (
                          <Bell size={20} aria-hidden />
                        )}
                        <span>
                          {item.title}
                          <small>{item.content !== item.title ? item.content : kind}</small>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          );
        })}
        {resultCount === 0 && !showCategorySkeletons && (
          <p className={styles.empty}>
            {mentionSearch ? "No matching tags." : "No matching results."}
          </p>
        )}
      </div>
    </>
  );
}
