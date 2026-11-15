"use client";
import { Badge } from "../base/badges/badges";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const ADMIN_INPUT_CLASS =
  "mt-[7px] min-h-[44px] w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-field)] px-[13px] py-[10px] text-sm text-[var(--admin-text)] outline-none transition placeholder:text-[var(--admin-muted)] focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[var(--admin-accent)]/20 disabled:cursor-not-allowed disabled:opacity-60";

export function AdminField({
  label,
  hint,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className={`block text-sm font-semibold text-[var(--admin-text)] ${className}`}>
      {label}
      {props.required && <span aria-hidden="true"> *</span>}
      <input {...props} className={ADMIN_INPUT_CLASS} />
      {hint && (
        <span className="mt-[6px] block text-xs font-normal leading-[18px] text-[var(--admin-muted)]">
          {hint}
        </span>
      )}
    </label>
  );
}

export function AdminTextarea({
  label,
  hint,
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  return (
    <label className={`block text-sm font-semibold text-[var(--admin-text)] ${className}`}>
      {label}
      {props.required && <span aria-hidden="true"> *</span>}
      <textarea {...props} className={`${ADMIN_INPUT_CLASS} min-h-[112px] resize-y`} />
      {hint && (
        <span className="mt-[6px] block text-xs font-normal leading-[18px] text-[var(--admin-muted)]">
          {hint}
        </span>
      )}
    </label>
  );
}

export function AdminSelect({
  label,
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <label className={`block text-sm font-semibold text-[var(--admin-text)] ${className}`}>
      {label}
      <select {...props} className={`${ADMIN_INPUT_CLASS} cursor-pointer`}>
        {children}
      </select>
    </label>
  );
}

export function AdminCheckbox({
  label,
  description,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-[10px] rounded-xl border border-[var(--admin-border)] bg-[var(--admin-soft)] px-[13px] py-[11px]">
      <input
        {...props}
        type="checkbox"
        className="mt-[2px] h-[16px] w-[16px] accent-[var(--admin-action)]"
      />
      <span>
        <span className="block text-sm font-semibold text-[var(--admin-text)]">{label}</span>
        {description && (
          <span className="mt-[2px] block text-xs leading-[18px] text-[var(--admin-muted)]">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

export function AdminImageFields({
  currentUrl,
  urlName,
  fileName,
  label = "Image",
  urlType = "url",
}: {
  currentUrl?: string | null;
  urlName: string;
  fileName: string;
  label?: string;
  urlType?: "url" | "text";
}) {
  return (
    <div className="grid gap-[14px] rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-soft)] p-[14px] sm:grid-cols-2">
      <AdminField
        label={`${label}`}
        name={urlName}
        type={urlType}
        defaultValue={currentUrl ?? ""}
        placeholder="http"
        hint="link ekak danna"
      />
      <AdminField
        label={`${label.toLowerCase()}`}
        name={fileName}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        hint="JPG, PNG, WebP, AVIF or GIF · max 4 MB · uploads to Cloudinary"
      />
    </div>
  );
}

export function AdminPdfFields({
  currentUrl,
  urlName = "rules_pdf_url",
  fileName = "rules_pdf_file",
}: {
  currentUrl?: string | null;
  urlName?: string;
  fileName?: string;
}) {
  return (
    <div className="grid gap-[14px] rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-soft)] p-[14px] sm:grid-cols-2">
      <AdminField
        label="link"
        name={urlName}
        type="url"
        defaultValue={currentUrl ?? ""}
        placeholder=""
        hint=""
      />
      <AdminField
        label="upload"
        name={fileName}
        type="file"
        accept="application/pdf,.pdf"
        hint="max 4MB"
      />
    </div>
  );
}

export function AdminSaveButton({ children = "Save changes" }: { children?: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-full bg-[var(--admin-action)] px-[20px] text-sm font-bold text-[var(--admin-action-text)] transition-colors hover:bg-[var(--admin-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)]"
    >
      {children}
    </button>
  );
}

export function AdminPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-[var(--admin-border)] bg-[var(--admin-panel)] p-[20px] sm:p-[26px]">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--admin-heading)] sm:text-2xl">
        {title}
      </h2>
      {description && (
        <p className="mt-[7px] max-w-3xl text-sm leading-[22px] text-[var(--admin-muted)]">
          {description}
        </p>
      )}
      <div className="mt-[22px]">{children}</div>
    </section>
  );
}

export function AdminDetails({
  title,
  meta,
  badge,
  children,
}: {
  title: string;
  meta?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg)] open:bg-[var(--admin-soft)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-[14px] px-[16px] py-[14px] marker:content-none">
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-[var(--admin-text)]">{title}</span>
          {meta && <span className="mt-[3px] block text-xs text-[var(--admin-muted)]">{meta}</span>}
        </span>
        {badge && (
          <Badge type="color" color="brand" size="sm" className="shrink-0">
            {badge}
          </Badge>
        )}
      </summary>
      <div className="border-t border-[var(--admin-border)] p-[16px] sm:p-[20px]">{children}</div>
    </details>
  );
}

export function AdminEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-[var(--admin-border)] p-[24px] text-center text-sm text-[var(--admin-muted)]">
      {children}
    </p>
  );
}
