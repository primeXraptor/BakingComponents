import React from "react";
import { afterEach, beforeAll, expect, test, vi } from "vitest";
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
  DashboardAdminPanel,
  type StyledDashboardProps,
} from "../src/styled-dashboard";
afterEach(cleanup);
beforeAll(() => {
  window.scrollTo = vi.fn();
  Element.prototype.scrollTo = vi.fn();
});
const props: StyledDashboardProps = {
  event_name: "Test Festival",
  school_logo: "/school.svg",
  club_logo: "/club.svg",
  event_logo: { light: "/event.svg", dark: "/event-dark.svg" },
  events: [],
  schoolCode: "SCHOOL-1",
  schoolName: "Example School",
  schoolAddress: "Colombo",
  registrationDate: "15 November 2026",
  coordinatorName: "Coordinator",
  coordinatorEmail: "coordinator@example.com",
  coordinatorPhone: "0712345678",
  micName: "Teacher",
  micPhone: "0712345678",
  schoolLogoUrl: null,
  mediaUnitLogoUrl: null,
  contestantRegistrationEnabled: true,
  contestantSubmissionsLocked: false,
  contestantRegistrationOpensAt: null,
  rulesPdfUrl: null,
  initialContestants: [],
  databaseReady: true,
  alerts: [],
  calendarEvents: [],
  calendarAvailable: true,
  calendarToday: "2026-11-15",
  request: async () => Response.json({ messages: [], contestants: [] }),
};
test("source welcome preserves all three logo positions and configurable event tab", () => {
  const { container } = render(<ContestantRegistrationDashboard {...props} />);
  expect(
    screen
      .getAllByRole("tab")
      .some((tab) => tab.textContent === "Test Festival"),
  ).toBe(true);
  const welcome = container.querySelector(
    '[aria-label="School, club and Test Festival"]',
  )!;
  expect(
    within(welcome as HTMLElement)
      .getAllByAltText("School logo")[0]
      .getAttribute("src"),
  ).toBe("/school.svg");
  expect(
    within(welcome as HTMLElement)
      .getAllByAltText("Club logo")[0]
      .getAttribute("src"),
  ).toBe("/club.svg");
  expect(
    within(welcome as HTMLElement)
      .getAllByAltText("Test Festival")[0]
      .getAttribute("src"),
  ).toBe("/event.svg");
  expect(container.querySelector("[data-kunchanada-dashboard]")).toBeTruthy();
  expect(container.querySelector('[data-dashboard-empty="true"]')).toBeTruthy();
});
test("source page tabs and registration editor save using host transport", async () => {
  const user = userEvent.setup(),
    request = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).endsWith("/contestants"))
        return Response.json({
          contestant: {
            ...JSON.parse(String(init?.body)),
            id: "saved",
            created_at: "2026-11-15T00:00:00Z",
            updated_at: "2026-11-15T00:00:00Z",
          },
        });
      return Response.json({ messages: [], contestants: [] });
    });
  const { container } = render(
    <ContestantRegistrationDashboard {...props} request={request} />,
  );
  const sidebar = within(container.querySelector("aside")!);
  await user.click(
    sidebar.getByRole("button", { name: /Contestant Registration/ }),
  );
  await user.click(
    screen.getByRole("button", { name: "Add contestant 1 for Junior" }),
  );
  const dialog = within(screen.getByRole("dialog"));
  await user.type(
    dialog.getByLabelText(/Name of the Contestant/),
    "Test Student",
  );
  await user.type(dialog.getByLabelText(/Date of Birth/), "2014-01-01");
  await user.type(dialog.getByLabelText(/Contact Number/), "0712345678");
  await user.click(dialog.getByRole("button", { name: "Save contestant" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(
    request.mock.calls.some(
      ([input, init]) =>
        String(input).endsWith("/contestants") && init?.method === "POST",
    ),
  ).toBe(true);
  expect(screen.getByText("Test Student")).toBeTruthy();
});
test("separate admin preserves registration dependencies and sends settings to callback", async () => {
  const user = userEvent.setup(),
    save = vi.fn().mockResolvedValue(undefined);
  render(
    <DashboardAdminPanel
      settings={{
        school_registration_locked: false,
        contestant_registration_enabled: true,
        contestant_submissions_locked: false,
        contestant_submissions_enabled: false,
      }}
      schools={[]}
      contestants={[]}
      newsTags={[]}
      calendarEvents={[]}
      calendarReady
      personalAlerts={[]}
      personalAlertsReady
      actions={{ saveSettings: save }}
    />,
  );
  const locked = screen.getByRole("checkbox", {
    name: /^Lock contestant submissions/,
  });
  await user.click(locked);
  expect(
    screen.getByRole("checkbox", { name: /^Enable Contestant Submissions/ }),
  ).toHaveProperty("disabled", false);
  await user.click(screen.getByLabelText("Enable contestant registration"));
  expect(locked).toHaveProperty("checked", false);
  expect(
    screen.getByRole("checkbox", { name: /^Enable Contestant Submissions/ }),
  ).toHaveProperty("disabled", true);
  await user.click(screen.getByRole("button", { name: "save karapiya" }));
  await waitFor(() => expect(save).toHaveBeenCalledOnce());
  expect(save.mock.calls[0][0]).toBeInstanceOf(FormData);
  expect(screen.getByRole("status").textContent).toContain("Changes saved");
});
