import { ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";
import styles from "./rightArrowBtnBlrbg.module.css";

/** Decorative arrow for a parent card link; avoids nesting interactive elements. */
export function RightArrowBtnBlrbg({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  return (
    <span aria-hidden="true" className={cn(styles.arrow, inverse && styles.inverse, className)}>
      <ArrowRight />
    </span>
  );
}
