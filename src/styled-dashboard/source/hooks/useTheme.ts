"use client";

import { useSyncExternalStore } from "react";

export const THEME_STORAGE_KEY = "mmu-theme";

export function isDarkTheme() {
  return document.documentElement.classList.contains("dark");
}

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  const syncStoredTheme = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      document.documentElement.classList.toggle("dark", event.newValue === "dark");
    }
  };
  window.addEventListener("storage", syncStoredTheme);

  return () => {
    observer.disconnect();
    window.removeEventListener("storage", syncStoredTheme);
  };
}

function getServerSnapshot() {
  return false;
}

function toggleTheme() {
  const nextIsDark = !isDarkTheme();
  document.documentElement.classList.toggle("dark", nextIsDark);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? "dark" : "light");
  } catch {
    // Theme switching still works when private browsing blocks persistence.
  }
}

export function useTheme() {
  const isDark = useSyncExternalStore(subscribeToTheme, isDarkTheme, getServerSnapshot);
  return { isDark, toggleTheme };
}
