import React from "react";
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
  LoginForm,
  RegistrationForm,
  validateSchoolRegistration,
  emptyRegistration,
  MAX_LOGO_FILE_SIZE,
} from "../src/auth";
afterEach(cleanup);
test("login rejects missing values, retains failed input, then succeeds through callback", async () => {
  const user = userEvent.setup(),
    login = vi
      .fn()
      .mockRejectedValueOnce(new Error("Incorrect credentials"))
      .mockResolvedValue(undefined),
    success = vi.fn();
  render(<LoginForm onLogin={login} onSuccess={success} />);
  await user.click(screen.getByRole("button", { name: "Log in" }));
  expect(login).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Close" }));
  await user.type(screen.getByLabelText("School code"), " SCHOOL-1 ");
  await user.type(screen.getByLabelText("Password"), "secret123");
  await user.click(screen.getByRole("button", { name: "Log in" }));
  expect(await screen.findByText("Incorrect credentials")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.getByLabelText("Password")).toHaveProperty(
    "value",
    "secret123",
  );
  await user.click(screen.getByRole("button", { name: "Log in" }));
  expect(login).toHaveBeenLastCalledWith({
    schoolCode: "SCHOOL-1",
    password: "secret123",
  });
  expect(success).toHaveBeenCalledOnce();
  expect(screen.getByLabelText("Password")).toHaveProperty("value", "");
});
test("registration validates logos, email, password length and confirmation", () => {
  const values = {
    ...emptyRegistration(),
    coordinator_email: "bad-email",
    password: "short",
    confirm_password: "different",
    scl_logo: new File(["x"], "bad.txt", { type: "text/plain" }),
    mu_logo: new File([new Uint8Array(MAX_LOGO_FILE_SIZE + 1)], "big.png", {
      type: "image/png",
    }),
  };
  const errors = validateSchoolRegistration(values);
  expect(errors.coordinator_email).toContain("valid email");
  expect(errors.password).toContain("6 characters");
  expect(errors.confirm_password).toContain("do not match");
  expect(errors.scl_logo).toContain("image");
  expect(errors.mu_logo).toContain("2 MB");
});
async function fillRegistration(user: ReturnType<typeof userEvent.setup>) {
  for (const [label, value] of [
    ["Name of the School", "Example School"],
    ["Address of the School", "Colombo"],
    ["Name of the School Coordinator", "Coordinator"],
    ["Contact Number of the School Coordinator", "0712345678"],
    ["Email Address of the School Coordinator", "coordinator@example.com"],
    ["Name of the Master-In-Charge (MIC)", "Teacher"],
    ["Contact Number of the Master-In-Charge (MIC)", "0712345678"],
    ["Password", "secret123"],
    ["Confirm password", "secret123"],
  ])
    await user.type(screen.getByLabelText(label, { exact: true }), value);
  await user.upload(
    screen.getByLabelText("School Logo"),
    new File(["logo"], "school.png", { type: "image/png" }),
  );
  await user.upload(
    screen.getByLabelText("Media Unit Logo"),
    new File(["logo"], "media.png", { type: "image/png" }),
  );
}
test("registration passes File objects to host, shows credentials and clears form", async () => {
  const user = userEvent.setup(),
    register = vi.fn().mockResolvedValue({ schoolCode: "SCHOOL-42" });
  render(<RegistrationForm onRegister={register} />);
  await fillRegistration(user);
  await user.click(screen.getByRole("button", { name: "Register school" }));
  const dialog = within(await screen.findByRole("dialog"));
  expect(dialog.getByText("SCHOOL-42")).toBeTruthy();
  expect(dialog.getByText("secret123")).toBeTruthy();
  const input = register.mock.calls[0][0];
  expect(input.scl_logo).toBeInstanceOf(File);
  expect(input).not.toHaveProperty("confirm_password");
  await user.click(dialog.getByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByLabelText("Name of the School")).toHaveProperty(
    "value",
    "",
  );
  expect(
    (screen.getByLabelText("School Logo") as HTMLInputElement).files,
  ).toHaveLength(0);
});
test("registration failure keeps values; closed state never exposes submission", async () => {
  const user = userEvent.setup(),
    register = vi.fn().mockRejectedValue(new Error("Service unavailable"));
  render(<RegistrationForm onRegister={register} />);
  await fillRegistration(user);
  await user.click(screen.getByRole("button", { name: "Register school" }));
  expect(await screen.findByText("Service unavailable")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Close" }));
  expect(screen.getByLabelText("Name of the School")).toHaveProperty(
    "value",
    "Example School",
  );
  cleanup();
  render(<RegistrationForm status="locked" onRegister={register} />);
  expect(screen.queryByRole("button", { name: "Register school" })).toBeNull();
  expect(
    screen.getByRole("heading", { name: "Registration is closed" }),
  ).toBeTruthy();
});
