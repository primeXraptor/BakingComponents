"use client";
import { useState } from "react";
import {
  calendarDateKey,
  calendarMonthDays,
  eventsOnCalendarDay,
  shiftCalendarMonth,
  type KunchanadaCalendarEvent,
} from "./calendar";
import { DashboardDialog } from "./primitives";
import s from "./dashboard.module.css";
export function DashboardCalendar({
  events,
  today = calendarDateKey(new Date()),
  available = true,
}: {
  events: KunchanadaCalendarEvent[];
  today?: string;
  available?: boolean;
}) {
  const [month, setMonth] = useState(`${today.slice(0, 7)}-01`),
    [agenda, setAgenda] = useState(false),
    [selected, setSelected] = useState<KunchanadaCalendarEvent | null>(null);
  const days = calendarMonthDays(month);
  const eventButton = (event: KunchanadaCalendarEvent) => (
    <button
      type="button"
      key={event.id}
      className={s.event}
      onClick={() => setSelected(event)}
    >
      {event.title}
    </button>
  );
  return (
    <section className={s.stack}>
      <h2>Calendar</h2>
      {!available ? (
        <p role="alert">Calendar is temporarily unavailable.</p>
      ) : (
        <>
          <div className={s.row}>
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setMonth(shiftCalendarMonth(month, -1))}
            >
              Previous
            </button>
            <h3 aria-live="polite">
              {new Intl.DateTimeFormat("en-GB", {
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }).format(new Date(`${month}T00:00:00Z`))}
            </h3>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setMonth(shiftCalendarMonth(month, 1))}
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => setMonth(`${today.slice(0, 7)}-01`)}
            >
              Today
            </button>
            <button
              type="button"
              aria-pressed={agenda}
              onClick={() => setAgenda(!agenda)}
            >
              {agenda ? "Month view" : "Agenda view"}
            </button>
          </div>
          {agenda ? (
            <ul className={s.list}>
              {days
                .filter((day) => day.slice(0, 7) === month.slice(0, 7))
                .map((day) => {
                  const items = eventsOnCalendarDay(events, day);
                  return items.length ? (
                    <li key={day}>
                      <time dateTime={day}>{day}</time>
                      {items.map(eventButton)}
                    </li>
                  ) : null;
                })}
            </ul>
          ) : (
            <table className={s.calendar}>
              <caption>Event dates (Asia/Colombo)</caption>
              <thead>
                <tr>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <th key={day} scope="col">
                        {day}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: days.length / 7 }, (_, week) => (
                  <tr key={week}>
                    {days.slice(week * 7, week * 7 + 7).map((day) => (
                      <td
                        key={day}
                        data-outside={day.slice(0, 7) !== month.slice(0, 7)}
                      >
                        <time
                          dateTime={day}
                          aria-current={day === today ? "date" : undefined}
                        >
                          {Number(day.slice(-2))}
                        </time>
                        {eventsOnCalendarDay(events, day).map(eventButton)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      <DashboardDialog
        title={selected?.title ?? "Event"}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className={s.stack}>
            <time dateTime={selected.starts_at}>
              {new Intl.DateTimeFormat("en-GB", {
                timeZone: "Asia/Colombo",
                dateStyle: "full",
                timeStyle: "short",
              }).format(new Date(selected.starts_at))}{" "}
              (Asia/Colombo)
            </time>
            {selected.ends_at && (
              <p>
                Ends:{" "}
                <time dateTime={selected.ends_at}>
                  {new Intl.DateTimeFormat("en-GB", {
                    timeZone: "Asia/Colombo",
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(selected.ends_at))}
                </time>
              </p>
            )}
            <p>{selected.location}</p>
            <p className={s.status}>{selected.description}</p>
          </div>
        )}
      </DashboardDialog>
    </section>
  );
}
