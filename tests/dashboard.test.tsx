import React, { useState } from "react";
import { afterEach, expect, test, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ContestantRegistrationDashboard,
  ContestantEditor,
  DashboardCalendar,
  PersonalAlertsList,
  calendarEventLastDay,
  eventsOnCalendarDay,
  type KunchanadaContestant,
  type DashboardProfile,
} from "../src/dashboard";
afterEach(cleanup);
const profile: DashboardProfile = {
  schoolCode: "ABC",
  schoolName: "Test School",
  schoolAddress: "Colombo",
  registrationDate: "15 November 2026",
  coordinatorName: "Coordinator",
  coordinatorPhone: "0712345678",
  micName: "Teacher",
  micPhone: "0712345678",
};
const slot = {
  category: "tamil-announcing",
  subcategory: "open",
  slot_number: 1 as const,
};
const row: KunchanadaContestant = {
  ...slot,
  id: "one",
  contestant_name: "Test Student",
  date_of_birth: "2010-01-01",
  contact_number: "0712345678",
  short_film_link: null,
  created_at: "2026-11-15T00:00:00Z",
  updated_at: "2026-11-15T00:00:00Z",
};
test("whole dashboard navigates all views, sends a message, and closes tabs", async () => {
  const user = userEvent.setup(),
    send = vi.fn().mockResolvedValue(undefined);
  render(
    <ContestantRegistrationDashboard
      profile={profile}
      contestants={[]}
      onSendMessage={send}
    />,
  );
  const nav = within(
    screen.getByRole("navigation", { name: "Dashboard navigation" }),
  );
  await user.click(nav.getByRole("button", { name: "School Profile" }));
  expect(screen.getByRole("heading", { name: "Test School" })).toBeTruthy();
  await user.click(nav.getByRole("button", { name: "Messages" }));
  await user.type(
    screen.getByRole("textbox", { name: "Message" }),
    "Hello organizer",
  );
  await user.click(screen.getByRole("button", { name: "Send message" }));
  expect(send).toHaveBeenCalledWith("Hello organizer");
  await user.click(nav.getByRole("button", { name: "Rules and Regulations" }));
  expect(
    screen.getByText("Rules and regulations have not been uploaded yet."),
  ).toBeTruthy();
  await user.click(nav.getByRole("button", { name: "Alerts" }));
  expect(screen.getByText("No alerts.")).toBeTruthy();
  await user.click(nav.getByRole("button", { name: "Calendar" }));
  expect(screen.getByRole("table")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Close Calendar" }));
  expect(screen.queryByRole("table")).toBeNull();
});
test("editor persists through host callback and renders controlled saved data", async () => {
  const user = userEvent.setup(),
    save = vi.fn().mockResolvedValue(row);
  function Example() {
    const [rows, setRows] = useState<KunchanadaContestant[]>([]);
    return (
      <ContestantRegistrationDashboard
        profile={profile}
        contestants={rows}
        onSaveContestant={save}
        onContestantsChange={setRows}
      />
    );
  }
  render(<Example />);
  // Both desktop context and narrow-screen category lists exist in DOM.
  await user.click(
    screen.getAllByRole("button", { name: /Tamil Announcing/ })[0],
  );
  await user.click(
    screen.getByRole("button", { name: "Add Tamil Announcing Open slot 1" }),
  );
  const dialog = within(screen.getByRole("dialog"));
  await user.type(dialog.getByLabelText("Full name"), "Test Student");
  await user.type(dialog.getByLabelText("Date of birth"), "2010-01-01");
  await user.type(dialog.getByLabelText("Contact number"), "0712345678");
  await user.click(dialog.getByRole("button", { name: "Save contestant" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(save).toHaveBeenCalledWith(
    expect.objectContaining({
      contestant_name: "Test Student",
      category: "tamil-announcing",
    }),
  );
  expect(
    screen.getByRole("button", { name: "Edit Tamil Announcing Open slot 1" }),
  ).toBeTruthy();
});
test("locked registration is read only and missing data does not hide errors", () => {
  render(
    <ContestantRegistrationDashboard
      profile={profile}
      contestants={[row]}
      submissionsLocked
    />,
  );
  expect(screen.getByText("Test Student")).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Edit Tamil/ })).toBeNull();
  cleanup();
  render(<PersonalAlertsList alerts={[]} available={false} />);
  expect(screen.getByRole("alert").textContent).toContain("unavailable");
});
test("save rejection retains editor and shows error; invalid age never reaches callback", async () => {
  const user = userEvent.setup(),
    save = vi.fn().mockRejectedValue(new Error("Network unavailable"));
  render(
    <ContestantEditor
      slot={{ ...slot, subcategory: "junior" }}
      onSave={save}
      onSaved={vi.fn()}
    />,
  );
  await user.type(screen.getByLabelText("Full name"), "Test Student");
  await user.type(screen.getByLabelText("Date of birth"), "1990-01-01");
  await user.type(screen.getByLabelText("Contact number"), "0712345678");
  await user.click(screen.getByRole("button", { name: "Save contestant" }));
  expect(save).not.toHaveBeenCalled();
  expect(screen.getByRole("alert").textContent).toContain("aged 11–13");
  cleanup();
  render(
    <ContestantEditor
      slot={slot}
      contestant={row}
      onSave={save}
      onSaved={vi.fn()}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Save contestant" }));
  expect(await screen.findByText("Network unavailable")).toBeTruthy();
  expect(screen.getByLabelText("Full name")).toHaveProperty(
    "value",
    "Test Student",
  );
});
test("calendar retains exclusive midnight ends and opens event details", async () => {
  const event = {
    id: "event",
    title: "Workshop",
    starts_at: "2026-11-15T10:00:00+05:30",
    ends_at: "2026-11-16T00:00:00+05:30",
    location: "Hall",
    description: "Bring notes",
    color: "blue" as const,
  };
  expect(calendarEventLastDay(event)).toBe("2026-11-15");
  expect(eventsOnCalendarDay([event], "2026-11-16")).toHaveLength(0);
  render(<DashboardCalendar events={[event]} today="2026-11-15" />);
  await userEvent.click(screen.getByRole("button", { name: "Workshop" }));
  expect(
    within(screen.getByRole("dialog")).getByText("Bring notes"),
  ).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "Close" }));
  await userEvent.click(screen.getByRole("button", { name: "Next month" }));
  expect(screen.getByRole("heading", { name: "December 2026" })).toBeTruthy();
});

test('search finds contestants and restores focus when dismissed', async () => {
 const user = userEvent.setup();
 render(<ContestantRegistrationDashboard profile={profile} contestants={[row]} />);
 const trigger = screen.getByRole('button',{name:'Search dashboard'});
 await user.click(trigger);
 const dialog = within(screen.getByRole('dialog'));
 await user.type(dialog.getByRole('textbox',{name:'Search'}),'Test Student');
 await user.click(dialog.getByRole('button',{name:'Test Student'}));
 await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
 expect(screen.getByRole('heading',{name:'Tamil Announcing'})).toBeTruthy();
 await user.click(trigger);
 await user.keyboard('{Escape}');
 await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
 await waitFor(() => expect(document.activeElement).toBe(trigger));
});
