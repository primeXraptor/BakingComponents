import { cn } from "../lib/utils";
import type { ActionBtnProps } from "./hardBtn";
import styles from "./action-btn.module.css";

/** Soft blue in light mode; soft gold in dark mode. */
export function LightBtn(props: ActionBtnProps) {
  const className = cn(styles.button, styles.light, props.className);
  if (props.href !== undefined) return <a {...props} className={className} />;
  return <button type="button" {...props} className={className} />;
}
