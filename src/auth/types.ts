import type { ReactNode } from "react";
export interface LoginCredentials {
  schoolCode: string;
  password: string;
}
export interface SchoolRegistrationValues {
  school_name: string;
  school_address: string;
  coordinator_name: string;
  coordinator_email: string;
  coordinator_phone: string;
  mic_name: string;
  mic_phone: string;
  scl_logo: File | null;
  mu_logo: File | null;
  password: string;
  confirm_password: string;
}
export type SchoolRegistrationInput = Omit<
  SchoolRegistrationValues,
  "confirm_password" | "scl_logo" | "mu_logo"
> & { scl_logo: File; mu_logo: File };
export interface RegistrationResult {
  schoolCode: string;
}
export interface AuthLink {
  id: string;
  label: string;
  href: string;
}
export interface AuthHeaderProps {
  title: string;
  description?: ReactNode;
  activePage?: string;
  links?: AuthLink[];
  children?: ReactNode;
}
export interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  onSuccess?: () => void;
  title?: string;
  header?: ReactNode;
  className?: string;
}
export interface RegistrationFormProps {
  onRegister: (input: SchoolRegistrationInput) => Promise<RegistrationResult>;
  onRegistered?: (result: RegistrationResult) => void;
  onLogin?: () => void;
  loginHref?: string;
  header?: ReactNode;
  title?: string;
  status?: "open" | "locked" | "unavailable";
  className?: string;
}
