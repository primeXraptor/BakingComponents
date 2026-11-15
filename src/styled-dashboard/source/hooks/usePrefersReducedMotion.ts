"use client";

import { useSyncExternalStore } from "react";
import { subscribeToMediaQuery } from "../lib/mediaQuery";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  return subscribeToMediaQuery(window.matchMedia(REDUCED_MOTION_QUERY), onChange);
}

function getSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerSnapshot() {
  // Keep the initial browser tree identical to SSR; update after hydration.
  return false;
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
