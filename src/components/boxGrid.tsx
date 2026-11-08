import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../lib/utils";
import styles from "./boxGrid.module.css";

export const boxGridStyles: Record<string, string> = styles;

export function BoxGrid({
  columns = 4,
  className,
  ...props
}: ComponentPropsWithoutRef<"div"> & { columns?: 1 | 2 | 3 | 4 | 5 | 6 }) {
  return (
    <div
      {...props}
      className={cn(styles.grid, columns === 1 && styles.singleColumn, columns === 2 && styles.twoColumns, columns === 3 && styles.threeColumns, columns === 5 && styles.fiveColumns, columns === 6 && styles.sixColumns, className)}
    />
  );
}
