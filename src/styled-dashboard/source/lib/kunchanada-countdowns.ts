export interface RegistrationDates {
  schoolRegistrationLocked?: boolean;
  schoolRegistrationOpensAt: string | null;
  schoolRegistrationClosesAt: string | null;
  contestantRegistrationOpensAt: string | null;
  contestantRegistrationClosesAt: string | null;
}

export function registrationCountdown(
  opensAt: string | null,
  closesAt: string | null,
  now: number,
) {
  const opens = opensAt ? Date.parse(opensAt) : NaN;
  const closes = closesAt ? Date.parse(closesAt) : NaN;
  if (Number.isFinite(opens) && now < opens)
    return { phase: "opens" as const, target: opensAt!, remaining: opens - now };
  if (Number.isFinite(closes) && now < closes)
    return { phase: "closes" as const, target: closesAt!, remaining: closes - now };
  return {
    phase: Number.isFinite(closes) ? ("closed" as const) : ("unannounced" as const),
    target: null,
    remaining: 0,
  };
}

export function countdownText(remaining: number) {
  const seconds = Math.max(0, Math.ceil(remaining / 1000));
  return `${Math.floor(seconds / 86400)}d ${String(Math.floor(seconds / 3600) % 24).padStart(2, "0")}h ${String(Math.floor(seconds / 60) % 60).padStart(2, "0")}m ${String(seconds % 60).padStart(2, "0")}s`;
}
