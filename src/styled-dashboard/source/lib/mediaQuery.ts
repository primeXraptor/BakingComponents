type MediaQueryChangeListener = (event: MediaQueryListEvent) => void;

export function subscribeToMediaQuery(
  mediaQuery: MediaQueryList,
  listener: MediaQueryChangeListener,
) {
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", listener);

    return () => mediaQuery.removeEventListener("change", listener);
  }

  // Safari and embedded WebKit browsers before MediaQueryList EventTarget
  // support expose only the deprecated listener methods.
  mediaQuery.addListener(listener);

  return () => mediaQuery.removeListener(listener);
}
