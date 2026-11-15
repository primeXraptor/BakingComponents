"use client";
import {useAdminActions} from "../../../runtime/admin";
import {
  AdminDetails,
  AdminField,
  AdminPanel,
  AdminSaveButton,
  AdminSelect,
  AdminTextarea,
} from "./AdminFormUI";
import {
  CALENDAR_COLORS,
  calendarLocalDateTime,
  type KunchanadaCalendarEvent,
} from "../../lib/kunchanada-calendar";

function EventFields({ event }: { event?: KunchanadaCalendarEvent }) {
  return (
    <>
      {event && <input type="hidden" name="id" value={event.id} />}
      <AdminField
        label="Event title"
        name="title"
        required
        maxLength={240}
        defaultValue={event?.title ?? ""}
      />
      <div className="grid gap-[14px] sm:grid-cols-2">
        <AdminField
          label="Start date and time"
          name="starts_at"
          type="datetime-local"
          required
          defaultValue={event ? calendarLocalDateTime(event.starts_at) : ""}
          hint="Sri Lanka time (UTC+05:30)"
        />
        <AdminField
          label="End date and time (optional)"
          name="ends_at"
          type="datetime-local"
          defaultValue={event?.ends_at ? calendarLocalDateTime(event.ends_at) : ""}
          hint="Sri Lanka time (UTC+05:30)"
        />
      </div>
      <AdminField
        label="Location (optional)"
        name="location"
        maxLength={240}
        defaultValue={event?.location ?? ""}
      />
      <AdminTextarea
        label="Description (optional)"
        name="description"
        maxLength={5000}
        defaultValue={event?.description ?? ""}
      />
      <AdminSelect label="Event color" name="color" defaultValue={event?.color ?? "brand"}>
        {CALENDAR_COLORS.map((color) => (
          <option value={color} key={color}>
            {color[0].toUpperCase() + color.slice(1)}
          </option>
        ))}
      </AdminSelect>
    </>
  );
}

export function KunchanadaCalendarManager({
  events,
  ready,
}: {
  events: KunchanadaCalendarEvent[];
  ready: boolean;
}) {
  const {deleteKunchanadaCalendarEvent,saveKunchanadaCalendarEvent} = useAdminActions();
  return (
    <AdminPanel
      title="Calendar events"
      description="Schedule events for the Calendar tab in school dashboards. All dates and times use Sri Lanka time."
    >
      {!ready ? (
        <p role="status" className="text-sm text-[var(--admin-muted)]">
          Calendar management is unavailable. Apply the Kunchanada calendar migration, then reload
          this page.
        </p>
      ) : (
        <div className="space-y-[18px]">
          <AdminDetails title="Add event">
            <form action={saveKunchanadaCalendarEvent} className="space-y-[14px]">
              <EventFields />
              <AdminSaveButton>Add event</AdminSaveButton>
            </form>
          </AdminDetails>
          {events.length === 0 && (
            <p className="text-sm text-[var(--admin-muted)]">No calendar events yet.</p>
          )}
          {events.map((event) => (
            <AdminDetails
              key={`${event.id}-${event.title}-${event.starts_at}-${event.ends_at}-${event.color}-${event.description}-${event.location}`}
              title={event.title}
            >
              <form action={saveKunchanadaCalendarEvent} className="space-y-[14px]">
                <EventFields event={event} />
                <AdminSaveButton>Save event</AdminSaveButton>
              </form>
              <form action={deleteKunchanadaCalendarEvent} className="mt-[16px]">
                <input type="hidden" name="id" value={event.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-[var(--admin-danger-border)] px-[12px] py-[8px] text-sm font-semibold text-[var(--admin-danger-text)]"
                >
                  Delete event
                </button>
              </form>
            </AdminDetails>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
