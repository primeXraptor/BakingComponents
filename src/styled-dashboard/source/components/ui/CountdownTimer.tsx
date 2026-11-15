"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {} from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: string): TimeLeft | null {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function subscribeToHydration() {
  return () => {};
}

interface CountdownTimerProps {
  targetDate: string | null;
  light?: boolean;
  tone?: "default" | "auth";
  expiredLabel?: string;
}

export function CountdownTimer({
  targetDate,
  light,
  tone = "default",
  expiredLabel = "Event concluded",
}: CountdownTimerProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!targetDate) return;

    const tick = () => setTimeLeft(getTimeLeft(targetDate));
    const frame = window.requestAnimationFrame(tick);

    if (reducedMotion) {
      return () => window.cancelAnimationFrame(frame);
    }
    const id = setInterval(tick, 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      clearInterval(id);
    };
  }, [targetDate, reducedMotion]);

  const textColor =
    tone === "auth" ? "text-[var(--auth-muted)]" : light ? "text-white/70" : "text-text-secondary";
  const valueColor =
    tone === "auth"
      ? "text-[var(--auth-heading)] font-[family-name:var(--font-display)]"
      : light
        ? "text-white font-[family-name:var(--font-display)]"
        : "text-navy font-[family-name:var(--font-display)]";

  if (!mounted || !targetDate) {
    return (
      <span
        className={
          tone === "auth"
            ? "inline-flex items-center rounded-full bg-[#fff7ed] px-3 py-1 text-[12px] font-semibold text-[#ea3900] ring-1 ring-inset ring-[#fed7aa] dark:bg-[#431407] dark:text-[#fdba74] dark:ring-[#9a3412]"
            : `text-[13px] font-medium tracking-widest ${textColor}`
        }
      >
        Coming soon
      </span>
    );
  }

  if (!timeLeft) {
    return (
      <span className={`text-[13px] font-medium tracking-widest ${textColor}`}>
        {expiredLabel}
      </span>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hrs", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-end gap-3">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-end gap-1">
          <div className="flex flex-col items-center">
            <span
              className={`${valueColor} tabular-nums`}
              style={{ fontSize: "28px", lineHeight: 1 }}
            >
              {pad(value)}
            </span>
            <span
              className={`text-[10px] font-semibold tracking-widest mt-1 ${textColor}`}
            >
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className={`${valueColor} mb-4 text-[20px] leading-none`}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}
