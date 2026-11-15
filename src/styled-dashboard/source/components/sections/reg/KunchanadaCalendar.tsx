"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { Heading } from "react-aria-components";
import { FilterDropdown } from "../../ui/filter-dropdown";
import { PopUpModel } from "../../ui/pop-up-model";
import {
  calendarDateKey,
  calendarEventLastDay,
  calendarMonthDays,
  eventsOnCalendarDay,
  shiftCalendarMonth,
  CALENDAR_TIME_ZONE,
  type KunchanadaCalendarEvent,
} from "../../../lib/kunchanada-calendar";
import styles from "./KunchanadaCalendar.module.css";

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: CALENDAR_TIME_ZONE,
});
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: CALENDAR_TIME_ZONE,
});
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayDate = (day: string) => new Date(`${day}T12:00:00Z`);

function eventTime(event: KunchanadaCalendarEvent, day?: string) {
  return day && calendarDateKey(event.starts_at) < day
    ? "Continues"
    : timeFormatter.format(new Date(event.starts_at));
}

function EventButton({
  event,
  day,
  onSelect,
  agenda = false,
}: {
  event: KunchanadaCalendarEvent;
  day: string;
  onSelect: (event: KunchanadaCalendarEvent) => void;
  agenda?: boolean;
}) {
  const startsToday = calendarDateKey(event.starts_at) === day;
  const endsToday = Boolean(event.ends_at) && calendarEventLastDay(event) === day;
  return (
    <button
      type="button"
      className={styles.event}
      data-color={event.color}
      title={`${event.title} · ${eventTime(event, day)} (Sri Lanka time)`}
      onClick={() => onSelect(event)}
    >
      <span>{event.title}</span>
      {agenda ? (
        <div className={styles.eventTimes}>
          {startsToday && <time dateTime={event.starts_at}>Starts {timeFormatter.format(new Date(event.starts_at))}</time>}
          {endsToday && event.ends_at && <time dateTime={event.ends_at}>Ends {timeFormatter.format(new Date(event.ends_at))}</time>}
          {!startsToday && !endsToday && <span>Continues</span>}
        </div>
      ) : (
        <time dateTime={event.starts_at}>{eventTime(event, day)}</time>
      )}
    </button>
  );
}

export function KunchanadaCalendar({
  events,
  today,
  available = true,
}: {
  events: KunchanadaCalendarEvent[];
  today: string;
  available?: boolean;
}) {
  const calendarScroll = useRef<HTMLDivElement>(null);
  const currentDay = useRef<HTMLTableCellElement>(null);
  const firstDay = useRef<HTMLTableCellElement>(null);
  const focusStart = useRef(false);
  const [month, setMonth] = useState(`${today.slice(0, 7)}-01`);
  const [view, setView] = useState("month");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<KunchanadaCalendarEvent | null>(null);
  const days = calendarMonthDays(month);
  const lastDay = new Date(`${shiftCalendarMonth(month, 1)}T00:00:00Z`);
  lastDay.setUTCDate(0);
  const monthEnd = lastDay.toISOString().slice(0, 10);
  const monthDays = days.filter((day) => day.slice(0, 7) === month.slice(0, 7));
  const agenda = monthDays
    .map((day) => ({ day, events: eventsOnCalendarDay(events, day) }))
    .filter((item) => item.events.length);
  const details = selectedEvent
    ? [selectedEvent]
    : selectedDay
      ? eventsOnCalendarDay(events, selectedDay)
      : [];
  const monthTitle = monthFormatter.format(dayDate(month));

  function scrollToToday() {
    const container = calendarScroll.current;
    const cell = currentDay.current;
    if (!container || !cell) return;
    const bounds = container.getBoundingClientRect();
    const dayBounds = cell.getBoundingClientRect();
    container.scrollTo({
      top:
        container.scrollTop +
        dayBounds.top -
        bounds.top -
        (container.clientHeight - dayBounds.height) / 2,
      left:
        container.scrollLeft +
        dayBounds.left -
        bounds.left -
        (container.clientWidth - dayBounds.width) / 2,
      behavior: "instant",
    });
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (focusStart.current && window.matchMedia("(max-width: 767px)").matches) {
        const container = calendarScroll.current;
        const cell = firstDay.current;
        if (!container || !cell) return;
        const bounds = container.getBoundingClientRect();
        const dayBounds = cell.getBoundingClientRect();
        container.scrollTo({
          top: 0,
          left:
            container.scrollLeft +
            dayBounds.left -
            bounds.left -
            (container.clientWidth - dayBounds.width) / 2,
          behavior: "instant",
        });
      } else scrollToToday();
    });
    return () => cancelAnimationFrame(frame);
  }, [month, view, today, available]);

  function changeMonth(direction: number) {
    focusStart.current = true;
    setMonth((current) => shiftCalendarMonth(current, direction));
  }

  function goToToday() {
    focusStart.current = false;
    setMonth(`${today.slice(0, 7)}-01`);
    setView("month");
    scrollToToday();
  }

  function closeDetails() {
    setSelectedDay(null);
    setSelectedEvent(null);
  }

  return (
    <section className={styles.calendar} aria-label="Kunchanada event calendar">
      <header className={styles.header}>
        <div className={styles.heading}>
          <button
            type="button"
            className={styles.dateBadge}
            onClick={goToToday}
            aria-label={`Go to today: ${dayFormatter.format(dayDate(today))}`}
          >
            <span>
              {new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(
                dayDate(today),
              )}
            </span>
            <strong>{Number(today.slice(-2))}</strong>
          </button>
          <div>
            <div className={styles.monthTitle}>
              <h2 aria-live="polite" aria-atomic="true">
                {monthTitle}
              </h2>
              <div className={styles.navigation}>
                <button type="button" aria-label="Previous month" onClick={() => changeMonth(-1)}>
                  <ArrowLeft size={16} aria-hidden />
                </button>
                <button type="button" aria-label="Next month" onClick={() => changeMonth(1)}>
                  <ArrowRight size={16} aria-hidden />
                </button>
              </div>
            </div>
            <p>{dayFormatter.format(dayDate(month))} – {dayFormatter.format(dayDate(monthEnd))}</p>
          </div>
        </div>
        <div className={styles.controls}>
          <FilterDropdown
            value={view}
            onChange={setView}
            label="Calendar view"
            showFilterIcon={false}
            options={[
              { value: "month", label: "Month view" },
              { value: "agenda", label: "Agenda view" },
            ]}
          />
        </div>
      </header>
      {!available ? (
        <p className={styles.empty} role="status">
          The event calendar is temporarily unavailable. Please try again later.
        </p>
      ) : (
        <>
          {view === "month" ? (
            <div
              ref={calendarScroll}
              className={styles.scroll}
              data-lenis-prevent
              tabIndex={0}
              role="region"
              aria-label={`${monthTitle} month calendar`}
            >
              <table className={styles.grid}>
                <caption className="sr-only">{monthTitle}. Event times are in Sri Lanka time.</caption>
                <thead>
                  <tr>
                    {weekdays.map((day) => (
                      <th scope="col" key={day}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: days.length / 7 }, (_, week) => (
                    <tr key={week}>
                      {days.slice(week * 7, week * 7 + 7).map((day) => {
                        const dayEvents = eventsOnCalendarDay(events, day);
                        return (
                          <td
                            key={day}
                            ref={(cell) => {
                              if (day === today) currentDay.current = cell;
                              if (day === month) firstDay.current = cell;
                            }}
                            className={
                              day.slice(0, 7) !== month.slice(0, 7) ? styles.outside : undefined
                            }
                          >
                            <time
                              dateTime={day}
                              aria-label={dayFormatter.format(dayDate(day))}
                              aria-current={day === today ? "date" : undefined}
                              className={styles.dayNumber}
                            >
                              {Number(day.slice(-2))}
                            </time>
                            <div className={styles.dayEvents}>
                              {dayEvents.slice(0, 3).map((event) => (
                                <EventButton
                                  key={event.id}
                                  event={event}
                                  day={day}
                                  onSelect={setSelectedEvent}
                                />
                              ))}
                              {dayEvents.length > 3 && <button type="button" className={styles.more} aria-label={`Show all ${dayEvents.length} events on ${dayFormatter.format(dayDate(day))}`} onClick={() => setSelectedDay(day)}>{dayEvents.length - 3} more…</button>}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.agenda} data-lenis-prevent>
              {agenda.map(({ day, events: dayEvents }) => (
                <section key={day}>
                  <h3>{dayFormatter.format(dayDate(day))}</h3>
                  {dayEvents.map((event) => (
                    <EventButton
                      key={event.id}
                      event={event}
                      day={day}
                      onSelect={setSelectedEvent}
                      agenda
                    />
                  ))}
                </section>
              ))}
            </div>
          )}
        </>
      )}
      <PopUpModel
        isOpen={Boolean(selectedEvent || selectedDay)}
        isDismissable
        onOpenChange={(open) => {
          if (!open) closeDetails();
        }}
      >
        <div className={styles.details}>
          <div className={styles.detailsHeader}>
            <Heading slot="title">
              {selectedEvent?.title ??
                (selectedDay ? dayFormatter.format(dayDate(selectedDay)) : "Events")}
            </Heading>
          </div>
          {details.map((event) => (
            <article key={event.id}>
              {!selectedEvent && <h3>{event.title}</h3>}
              <p><CalendarDays size={16} aria-hidden /> {dayFormatter.format(new Date(event.starts_at))} · {timeFormatter.format(new Date(event.starts_at))}</p>
              {event.ends_at && <p>Until {dayFormatter.format(new Date(event.ends_at))} · {timeFormatter.format(new Date(event.ends_at))}</p>}
              <p>Sri Lanka time (UTC+05:30)</p>
              {event.location && (
                <p>
                  <strong>Location:</strong> {event.location}
                </p>
              )}
              {event.description && <p className={styles.description}>{event.description}</p>}
            </article>
          ))}
        </div>
      </PopUpModel>
    </section>
  );
}
