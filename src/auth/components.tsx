"use client";
import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { DashboardDialog } from "../dashboard/primitives";
import type { AuthHeaderProps, LoginCredentials } from "./types";
import s from "./auth.module.css";
export { s as authStyles };
export function AuthHeader({
  title,
  description,
  activePage,
  links = [],
  children,
}: AuthHeaderProps) {
  return (
    <header className={s.header}>
      {children}
      <h2>{title}</h2>
      {description && <div>{description}</div>}
      {links.length > 0 && (
        <nav aria-label="Account pages" className={s.links}>
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              aria-current={activePage === link.id ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
export interface RegistrationFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "type" | "children"
> {
  label: string;
  type?: "text" | "email" | "tel" | "password" | "file" | "textarea";
  value?: string;
  hint?: ReactNode;
  error?: string;
  onValueChange?: (value: string) => void;
  onFileChange?: (file: File | null) => void;
}
export function RegistrationField({
  label,
  type = "text",
  value,
  hint,
  error,
  onValueChange,
  onFileChange,
  id: suppliedId,
  ...props
}: RegistrationFieldProps) {
  const generatedId = useId(),
    id = suppliedId ?? generatedId;
  const described =
    [hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div
      className={s.field}
      data-registration-field={props.name}
      data-invalid={Boolean(error) || undefined}
    >
      <label htmlFor={id}>{label}</label>
      {type === "textarea" ? (
        <textarea
          id={id}
          name={props.name}
          required={props.required}
          disabled={props.disabled}
          autoComplete={props.autoComplete}
          placeholder={props.placeholder}
          value={value ?? ""}
          onChange={(e) => onValueChange?.(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={described}
        />
      ) : (
        <input
          {...props}
          id={id}
          type={type}
          value={type === "file" ? undefined : (value ?? "")}
          onChange={(e) => {
            if (type === "file") onFileChange?.(e.target.files?.[0] ?? null);
            else onValueChange?.(e.target.value);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={described}
        />
      )}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
      {error && (
        <p id={`${id}-error`} className={s.error}>
          {error}
        </p>
      )}
    </div>
  );
}
export function AuthErrorDialog({
  title = "Something went wrong",
  message,
  onClose,
}: {
  title?: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <DashboardDialog title={title} isOpen={Boolean(message)} onClose={onClose}>
      <p role="alert">{message}</p>
    </DashboardDialog>
  );
}
export function CopyCredentialsLoginButton({
  credentials,
  onLogin,
  loginHref,
}: {
  credentials: LoginCredentials;
  onLogin?: () => void;
  loginHref?: string;
}) {
  const [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [copied, setCopied] = useState(false);
  return (
    <div className={s.stack}>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError("");
          try {
            await navigator.clipboard.writeText(
              `School code: ${credentials.schoolCode}\nPassword: ${credentials.password}`,
            );
            setCopied(true);
            onLogin?.();
          } catch {
            setError(
              "Could not copy your credentials. Save them manually or allow clipboard access and try again.",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        {pending
          ? "Copying…"
          : onLogin
            ? "Copy and log in"
            : "Copy credentials"}
      </button>
      {copied && <p role="status">Credentials copied.</p>}
      {loginHref && <a href={loginHref}>Log in</a>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
export function RegistrationSuccess({
  credentials,
  onClose,
  onLogin,
  loginHref,
}: {
  credentials: LoginCredentials | null;
  onClose: () => void;
  onLogin?: () => void;
  loginHref?: string;
}) {
  return (
    <DashboardDialog
      title="Registration successful"
      isOpen={Boolean(credentials)}
      onClose={onClose}
    >
      {credentials && (
        <>
          <p>
            Save these credentials. You will need them to access your dashboard.
          </p>
          <dl className={s.credentials}>
            <div>
              <dt>School code</dt>
              <dd>{credentials.schoolCode}</dd>
            </div>
            <div>
              <dt>Password</dt>
              <dd>{credentials.password}</dd>
            </div>
          </dl>
          <CopyCredentialsLoginButton
            credentials={credentials}
            onLogin={onLogin}
            loginHref={loginHref}
          />
        </>
      )}
    </DashboardDialog>
  );
}
