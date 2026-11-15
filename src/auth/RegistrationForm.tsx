"use client";
import { useRef, useState } from "react";
import type {
  LoginCredentials,
  RegistrationFormProps,
  SchoolRegistrationInput,
  SchoolRegistrationValues,
} from "./types";
import { emptyRegistration, validateSchoolRegistration } from "./validation";
import {
  AuthHeader,
  AuthErrorDialog,
  RegistrationField,
  RegistrationSuccess,
} from "./components";
import s from "./auth.module.css";
export function RegistrationForm({
  onRegister,
  onRegistered,
  onLogin,
  loginHref,
  header,
  title = "Register your school",
  status = "open",
  className,
}: RegistrationFormProps) {
  const [values, setValues] = useState(emptyRegistration),
    [errors, setErrors] = useState<
      Partial<Record<keyof SchoolRegistrationValues, string>>
    >({}),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false),
    [credentials, setCredentials] = useState<LoginCredentials | null>(null),
    [generation, setGeneration] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  function update<K extends keyof SchoolRegistrationValues>(
    key: K,
    value: SchoolRegistrationValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }
  if (status !== "open")
    return (
      <section className={`${s.shell} ${className ?? ""}`}>
        <h2>
          {status === "locked"
            ? "Registration is closed"
            : "Registration is temporarily unavailable"}
        </h2>
        <p role="status">
          {status === "locked"
            ? "School registration is not accepting submissions."
            : "Please try again later."}
        </p>
        {loginHref && <a href={loginHref}>Log in</a>}
      </section>
    );
  const textFields: {
    name: Exclude<keyof SchoolRegistrationValues, "scl_logo" | "mu_logo">;
    label: string;
    type?: "text" | "textarea" | "tel" | "email" | "password";
    autoComplete?: string;
  }[] = [
    {
      name: "school_name",
      label: "Name of the School",
      autoComplete: "organization",
    },
    {
      name: "school_address",
      label: "Address of the School",
      type: "textarea",
      autoComplete: "street-address",
    },
    {
      name: "coordinator_name",
      label: "Name of the School Coordinator",
      autoComplete: "name",
    },
    {
      name: "coordinator_phone",
      label: "Contact Number of the School Coordinator",
      type: "tel",
      autoComplete: "tel",
    },
    {
      name: "coordinator_email",
      label: "Email Address of the School Coordinator",
      type: "email",
      autoComplete: "email",
    },
    {
      name: "mic_name",
      label: "Name of the Master-In-Charge (MIC)",
      autoComplete: "name",
    },
    {
      name: "mic_phone",
      label: "Contact Number of the Master-In-Charge (MIC)",
      type: "tel",
      autoComplete: "tel",
    },
  ];
  return (
    <section
      aria-label="School registration"
      className={`${s.shell} ${className ?? ""}`}
    >
      {header ?? <AuthHeader title={title} />}
      <form
        ref={formRef}
        noValidate
        className={s.stack}
        onSubmit={async (e) => {
          e.preventDefault();
          if (pending) return;
          const invalid = validateSchoolRegistration(values);
          setErrors(invalid);
          if (Object.keys(invalid).length) {
            const first = Object.keys(invalid)[0];
            formRef.current
              ?.querySelector<HTMLElement>(`[name="${first}"]`)
              ?.focus();
            return;
          }
          setPending(true);
          setError("");
          try {
            const { confirm_password, ...input } = values;
            const result = await onRegister(input as SchoolRegistrationInput);
            if (!result.schoolCode?.trim())
              throw new Error("Registration did not return a school code.");
            setCredentials({
              schoolCode: result.schoolCode,
              password: values.password,
            });
            setValues(emptyRegistration());
            setGeneration((v) => v + 1);
            onRegistered?.(result);
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message
                : "Unable to register. Please try again.",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        <fieldset disabled={pending} className={s.stack}>
          <legend>School registration details</legend>
          {textFields.map((field) => (
            <RegistrationField
              key={field.name}
              {...field}
              required
              value={values[field.name]}
              error={errors[field.name]}
              onValueChange={(value) => update(field.name, value)}
            />
          ))}
          {(["scl_logo", "mu_logo"] as const).map((name) => (
            <RegistrationField
              key={`${name}:${generation}`}
              name={name}
              label={name === "scl_logo" ? "School Logo" : "Media Unit Logo"}
              type="file"
              accept="image/*"
              required
              hint="Image file, maximum 2 MB."
              error={errors[name]}
              onFileChange={(file) => update(name, file)}
            />
          ))}
          <RegistrationField
            label="Password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            hint="Use at least 6 characters."
            value={values.password}
            error={errors.password}
            onValueChange={(value) => update("password", value)}
          />
          <RegistrationField
            label="Confirm password"
            name="confirm_password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={values.confirm_password}
            error={errors.confirm_password}
            onValueChange={(value) => update("confirm_password", value)}
          />
          <button type="submit" className={s.submit} aria-busy={pending}>
            {pending ? "Registering school…" : "Register school"}
          </button>
        </fieldset>
        {Object.keys(errors).some(
          (key) => errors[key as keyof SchoolRegistrationValues],
        ) && (
          <p role="alert">Please complete the indicated fields correctly.</p>
        )}
      </form>
      <AuthErrorDialog
        title="Registration failed"
        message={error}
        onClose={() => setError("")}
      />
      <RegistrationSuccess
        credentials={credentials}
        onClose={() => setCredentials(null)}
        onLogin={onLogin}
        loginHref={loginHref}
      />
    </section>
  );
}
