export const CALENDAR_TIME_ZONE = "Asia/Colombo";
export const CALENDAR_COLORS = [
  "gray",
  "brand",
  "green",
  "blue",
  "indigo",
  "purple",
  "pink",
  "orange",
  "yellow",
] as const;
export type CalendarColor = (typeof CALENDAR_COLORS)[number];

export interface KunchanadaCalendarEvent {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  description: string | null;
  location: string | null;
  color: CalendarColor;
}

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: CALENDAR_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function calendarDateKey(value: Date | string): string {
  const parts = dateFormatter.formatToParts(new Date(value));
  const part = (name: string) =>
    parts.find((item) => item.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function calendarLocalDateTime(value: string): string {
  const date = new Date(value);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: CALENDAR_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return `${calendarDateKey(date)}T${time}`;
}

export function parseCalendarDateTime(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
    throw new Error("Enter a valid date and time.");
  const date = new Date(`${value}:00+05:30`);
  if (
    !Number.isFinite(date.getTime()) ||
    calendarLocalDateTime(date.toISOString()) !== value
  ) {
    throw new Error("Enter a valid date and time.");
  }
  return date.toISOString();
}

export function validateCalendarEvent(formData: FormData) {
  const text = (name: string, max: number) => {
    const value = String(formData.get(name) ?? "").trim();
    if (value.length > max) throw new Error(`${name} is too long.`);
    return value;
  };
  const title = text("title", 240);
  if (!title) throw new Error("Event title is required.");
  const starts_at = parseCalendarDateTime(text("starts_at", 50));
  const end = text("ends_at", 50);
  const ends_at = end ? parseCalendarDateTime(end) : null;
  if (ends_at && ends_at <= starts_at)
    throw new Error("End time must be after the start time.");
  const color = text("color", 20);
  if (!CALENDAR_COLORS.includes(color as CalendarColor))
    throw new Error("Select a valid event color.");
  return {
    title,
    starts_at,
    ends_at,
    color: color as CalendarColor,
    description: text("description", 5000) || null,
    location: text("location", 240) || null,
  };
}

export function shiftCalendarMonth(month: string, offset: number): string {
  const date = new Date(`${month}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 10);
}

/** Full Monday–Sunday weeks, including adjacent-month days. */
export function calendarMonthDays(month: string): string[] {
  const first = new Date(`${month}T00:00:00Z`);
  const next = new Date(first);
  next.setUTCMonth(next.getUTCMonth() + 1);
  const weekdayOffset = (first.getUTCDay() + 6) % 7;
  const length =
    Math.ceil(
      (weekdayOffset + (next.getTime() - first.getTime()) / 86400000) / 7,
    ) * 7;
  const start = first.getTime() - weekdayOffset * 86400000;
  return Array.from({ length }, (_, index) =>
    new Date(start + index * 86400000).toISOString().slice(0, 10),
  );
}

/** End timestamps are exclusive, so midnight ends on the preceding calendar day. */
export function calendarEventLastDay(event: KunchanadaCalendarEvent): string {
  return calendarDateKey(
    event.ends_at
      ? new Date(new Date(event.ends_at).getTime() - 1)
      : event.starts_at,
  );
}

export function eventsOnCalendarDay(
  events: KunchanadaCalendarEvent[],
  day: string,
): KunchanadaCalendarEvent[] {
  return events
    .filter((event) => {
      const start = calendarDateKey(event.starts_at);
      const last = calendarEventLastDay(event);
      return start <= day && last >= day;
    })
    .sort(
      (a, b) =>
        a.starts_at.localeCompare(b.starts_at) ||
        a.title.localeCompare(b.title) ||
        a.id.localeCompare(b.id),
    );
}
