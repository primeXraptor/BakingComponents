"use client";

import { useLayoutEffect } from "react";

import { THEME_STORAGE_KEY } from "../../hooks/useTheme";

/**
 * Restores the saved theme without rendering a script element into the React
 * tree. This is important when a server action revalidates the root layout:
 * React can safely render this client boundary again without encountering an
 * executable <script> tag.
 */
export function ThemeInitializer() {
  useLayoutEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } catch {
      // Keep the default light theme when storage is unavailable.
    }
  }, []);

  return null;
}
