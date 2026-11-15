"use client";
import { useDashboardRuntime } from "../../../../runtime/context";

import { useEffect, useState } from "react";
import { CountdownTimer } from "../../ui/CountdownTimer";
import {
  countdownText,
  registrationCountdown,
  type RegistrationDates,
} from "../../../lib/kunchanada-countdowns";
import styles from "./RegistrationCountdowns.module.css";

const formatter = new Intl.DateTimeFormat("en-LK", {
  timeZone: "Asia/Colombo",
  dateStyle: "medium",
  timeStyle: "short",
});

export function RegistrationCountdowns({
  dates,
  hideClosed = false,
}: {
  dates: RegistrationDates;
  hideClosed?: boolean;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className={styles.countdowns} aria-label="Registration countdowns">
      {(
        [
          [
            "School registration",
            dates.schoolRegistrationOpensAt,
            dates.schoolRegistrationClosesAt,
          ],
          [
            "Contestant registration",
            dates.contestantRegistrationOpensAt,
            dates.contestantRegistrationClosesAt,
          ],
        ] as const
      ).map(([label, opens, closes]) => {
        const countdown = now === null ? null : registrationCountdown(opens, closes, now);
        if (
          hideClosed &&
          (!countdown ||
            countdown.phase === "closed" ||
            countdown.phase === "unannounced" ||
            (label === "School registration" && dates.schoolRegistrationLocked))
        )
          return null;
        return (
          <section key={label} className={styles.countdown}>
            <h3>
              {label}
              {countdown?.target ? ` ${countdown.phase}` : ""}
            </h3>
            {countdown?.target ? (
              <>
                <div
                  className={styles.timer}
                  role="timer"
                  aria-label={`${label} ${countdown.phase} in ${countdownText(countdown.remaining)}`}
                >
                  <CountdownTimer
                    key={countdown.target}
                    targetDate={countdown.target}
                    tone="auth"
                    expiredLabel=""
                  />
                </div>
                <time dateTime={countdown.target}>
                  {formatter.format(new Date(countdown.target))}
                </time>
              </>
            ) : (
              <p>
                {countdown
                  ? countdown.phase === "closed"
                    ? "Registration closed"
                    : "Date not announced"
                  : "Loading dates…"}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

export function PublicRegistrationCountdowns() {
  const {request: fetch} = useDashboardRuntime();
  const [dates, setDates] = useState<RegistrationDates | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/kunchanada/registration-dates", { signal: controller.signal })
      .then(async (response) => {
        if (response.ok) setDates(await response.json());
      })
      .catch(() => {});
    return () => controller.abort();
  }, [fetch]);
  return dates ? (
    <div className={styles.auth}>
      <RegistrationCountdowns dates={dates} hideClosed />
    </div>
  ) : null;
}
