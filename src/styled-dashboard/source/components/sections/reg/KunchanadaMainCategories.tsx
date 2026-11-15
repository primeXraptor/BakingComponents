"use client";

import { KUNCHANADA_CATEGORIES } from "../../../lib/kunchanada-contestants";

export function KunchanadaMainCategories({
  loading = false,
  disabled = false,
  selectedCategory,
  onSelectCategory,
  counts,
  countLabel = "Remaining contestant places",
  showCounts = true,
}: {
  loading?: boolean;
  disabled?: boolean;
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
  counts?: number[];
  countLabel?: string;
  showCounts?: boolean;
}) {
  return (
    <ul className="mt-3 space-y-2.5" aria-label="Main Categories" aria-busy={loading}>
      {KUNCHANADA_CATEGORIES.map((category, index) => (
        <li key={category.id}>
          {loading ? (
            <div
              aria-hidden="true"
              className="flex min-h-9 items-center gap-2 rounded-lg px-2 py-1.5 motion-safe:animate-pulse"
            >
              <span className="h-3 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
              {showCounts && <span className="h-5 w-6 rounded bg-slate-200 dark:bg-slate-700" />}
            </div>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelectCategory(category.id)}
              aria-current={selectedCategory === category.id ? "page" : undefined}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                selectedCategory === category.id
                  ? "bg-slate-100 dark:bg-slate-800 font-semibold text-slate-950 dark:text-slate-100"
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-slate-100"
              }`}
            >
              <span className="min-w-0 flex-1 truncate">{category.label}</span>
              {showCounts && (
                <span
                  title={countLabel}
                  className="min-w-6 rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400"
                >
                  {counts?.[index]}
                </span>
              )}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
