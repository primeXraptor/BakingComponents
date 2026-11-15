"use client";
import { useState } from "react";
import type { LoginFormProps } from "./types";
import { AuthHeader, AuthErrorDialog, RegistrationField } from "./components";
import s from "./auth.module.css";
export function LoginForm({
  onLogin,
  onSuccess,
  header,
  title = "Access your dashboard",
  className,
}: LoginFormProps) {
  const [schoolCode, setSchoolCode] = useState(""),
    [password, setPassword] = useState(""),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(false);
  const [invalid, setInvalid] = useState({
    schoolCode: false,
    password: false,
  });
  return (
    <section
      aria-label="School login"
      className={`${s.shell} ${s.login} ${className ?? ""}`}
    >
      {header ?? <AuthHeader title={title} />}
      <form
        noValidate
        className={s.stack}
        onSubmit={async (e) => {
          e.preventDefault();
          if (pending) return;
          setSuccess(false);
          if (!schoolCode.trim() || !password) {
            setInvalid({ schoolCode: !schoolCode.trim(), password: !password });
            setError("Enter your school code and password.");
            return;
          }
          setInvalid({ schoolCode: false, password: false });
          setPending(true);
          setError("");
          try {
            await onLogin({ schoolCode: schoolCode.trim(), password });
            setPassword("");
            setSuccess(true);
            onSuccess?.();
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : "Unable to log in. Please try again.",
            );
            setInvalid({ schoolCode: true, password: true });
          } finally {
            setPending(false);
          }
        }}
      >
        <fieldset disabled={pending} className={s.stack}>
          <legend>Login details</legend>
          <RegistrationField
            label="School code"
            name="schoolCode"
            required
            autoComplete="username"
            value={schoolCode}
            error={invalid.schoolCode ? "Check your school code." : undefined}
            onValueChange={(value) => {
              setSchoolCode(value);
              setInvalid((v) => ({ ...v, schoolCode: false }));
            }}
          />
          <RegistrationField
            label="Password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            error={invalid.password ? "Check your password." : undefined}
            onValueChange={(value) => {
              setPassword(value);
              setInvalid((v) => ({ ...v, password: false }));
            }}
          />
          <button type="submit" className={s.submit} aria-busy={pending}>
            {pending ? "Logging in…" : "Log in"}
          </button>
        </fieldset>
      </form>
      {success && <p role="status">Logged in successfully.</p>}
      <AuthErrorDialog
        title="Login failed"
        message={error}
        onClose={() => setError("")}
      />
    </section>
  );
}
