import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";
import styles from "./cardLinkBtn.module.css";

export type CardLinkBtnProps = Omit<ComponentProps<"a">, "children"> & {
  children: ReactNode;
  /** Decorative logo or icon; the visible label supplies the accessible name. */
  logo?: ReactNode;
  isDisabled?: boolean;
};

/** Outlined card link with a leading logo, bold label and trailing arrow. */
export function CardLinkBtn({
  children,
  logo,
  className,
  isDisabled = false,
  ...props
}: CardLinkBtnProps) {
  const content = (
    <>
      {logo && (
        <span className={styles.logo} aria-hidden="true">
          {logo}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      <ArrowRight className={styles.arrow} aria-hidden="true" />
    </>
  );
  if (isDisabled)
    return (
      <span
        role="link"
        aria-disabled="true"
        className={cn(styles.card, className)}
        style={{ cursor: "not-allowed", opacity: 0.6 }}
      >
        {content}
      </span>
    );
  return (
    <a {...props} className={cn(styles.card, className)}>
      {content}
    </a>
  );
}
