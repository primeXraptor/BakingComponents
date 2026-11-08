import type { ComponentProps } from "react";
import { cn } from "../lib/utils";
import styles from "./action-btn.module.css";

export type ActionBtnProps =
  | (ComponentProps<"a"> & { href: string })
  | (ComponentProps<"button"> & { href?: never });

/** Solid blue in light mode; solid gold in dark mode. */
export function HardBtn(props: ActionBtnProps) {
  const className = cn(styles.button, styles.hard, props.className);
  if (props.href !== undefined) return <a {...props} className={className} />;
  return <button type="button" {...props} className={className} />;
}
