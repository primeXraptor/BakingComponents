import type { SchoolRegistrationValues } from "./types";
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_LOGO_FILE_SIZE = 2 * 1024 * 1024;
export const emptyRegistration = (): SchoolRegistrationValues => ({
  school_name: "",
  school_address: "",
  coordinator_name: "",
  coordinator_email: "",
  coordinator_phone: "",
  mic_name: "",
  mic_phone: "",
  scl_logo: null,
  mu_logo: null,
  password: "",
  confirm_password: "",
});
export function validateLogoFile(
  file: File,
  label: string,
): string | undefined {
  if (!file.type.startsWith("image/")) return `${label} must be an image file.`;
  if (file.size > MAX_LOGO_FILE_SIZE)
    return `${label} must be 2 MB or smaller.`;
}
export function validateSchoolRegistration(values: SchoolRegistrationValues) {
  const errors: Partial<Record<keyof SchoolRegistrationValues, string>> = {};
  for (const [key, value] of Object.entries(values))
    if (typeof value === "string" ? !value.trim() : !value)
      errors[key as keyof SchoolRegistrationValues] = "This field is required.";
  if (
    values.coordinator_email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.coordinator_email.trim())
  )
    errors.coordinator_email = "Enter a valid email address.";
  if (values.password && values.password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (values.password !== values.confirm_password)
    errors.confirm_password = "Passwords do not match.";
  for (const [key, label] of [
    ["scl_logo", "School logo"],
    ["mu_logo", "Media Unit logo"],
  ] as const) {
    const file = values[key];
    if (file) {
      const error = validateLogoFile(file, label);
      if (error) errors[key] = error;
    }
  }
  return errors;
}
