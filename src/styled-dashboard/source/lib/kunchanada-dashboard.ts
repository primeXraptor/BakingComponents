import { parseCalendarDateTime } from "./kunchanada-calendar";

export const QUICK_RESPONSE_MENTIONS = [
  "@President",
  "@Secretary",
  "@Organizer",
  "@Developer",
] as const;
export type QuickResponseMention = (typeof QUICK_RESPONSE_MENTIONS)[number];

export interface KunchanadaPersonalAlert {
  id: string;
  message: string;
  created_at: string;
}

export interface KunchanadaDeadlines {
  schoolRegistrationOpensAt?: string | null;
  contestantRegistrationOpensAt?: string | null;
  schoolRegistrationClosesAt: string | null;
  contestantRegistrationClosesAt: string | null;
  eventStartsAt: string | null;
}

export function composeKunchanadaMessage(message: string) {
  const text = message.trim();
  if (!text) throw new Error("Enter a message.");
  if (text.length > 5000)
    throw new Error("Messages must be 5,000 characters or fewer, including mentions.");
  return text;
}

export function insertKunchanadaMention(
  message: string,
  mention: QuickResponseMention,
  selectionStart = message.length,
  selectionEnd = selectionStart,
) {
  const start = Math.max(0, Math.min(message.length, selectionStart));
  const end = Math.max(start, Math.min(message.length, selectionEnd));
  const before = message.slice(0, start);
  const insertion = `${before && !/\s$/.test(before) ? " " : ""}${mention} `;
  const next = before + insertion + message.slice(end);
  if (next.length > 5000)
    throw new Error("Messages must be 5,000 characters or fewer, including mentions.");
  return { message: next, caret: start + insertion.length };
}

export function matchingQuickResponses(query: string) {
  return QUICK_RESPONSE_MENTIONS.filter((mention) =>
    mention.toLowerCase().startsWith(query.toLowerCase()),
  );
}

export function mentionQueryAtCaret(message: string, caret: number) {
  if (/[A-Za-z]/.test(message[caret] ?? "")) return null;
  const match = /(?:^|\s)(@[A-Za-z]*)$/.exec(message.slice(0, caret));
  if (!match) return null;
  return { query: match[1], start: caret - match[1].length };
}

export function validatePersonalAlert(formData: FormData) {
  const message = String(formData.get("message") ?? "").trim();
  if (!message || message.length > 5000)
    throw new Error("Enter an alert between 1 and 5,000 characters.");
  const recipient = String(formData.get("school_auth_user_id") ?? "");
  if (
    recipient !== "all" &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recipient)
  ) {
    throw new Error("Choose a registered school or all registered schools.");
  }
  return { p_school_auth_user_id: recipient === "all" ? null : recipient, p_message: message };
}

export function portalClosingDates(formData: FormData) {
  const value = (name: string) => {
    const raw = String(formData.get(name) ?? "").trim();
    return raw ? parseCalendarDateTime(raw) : null;
  };
  return {
    school_registration_closes_at: value("school_registration_closes_at"),
    contestant_registration_closes_at: value("contestant_registration_closes_at"),
  };
}
