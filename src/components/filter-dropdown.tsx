"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ListFilter } from "lucide-react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import styles from "./filter-dropdown.module.css";

export function FilterDropdown<T extends string>({
  value,
  options,
  label,
  onChange,
  showFilterIcon = true,
}: {
  value: T;
  options: readonly { value: T; label: string }[];
  label: string;
  showFilterIcon?: boolean;
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div
      ref={root}
      className={styles.root}
      data-open={open}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
      >
        {showFilterIcon && <ListFilter size={16} aria-hidden="true" />}
        <span>{options.find((option) => option.value === value)?.label || "All"}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="filter-list"
            id={id}
            className={styles.dropdown}
            role="group"
            aria-label={`${label} options`}
            initial={{
              opacity: 0,
              y: reduced ? 0 : -12,
              clipPath: reduced ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
            }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{
              opacity: 0,
              y: reduced ? 0 : -12,
              clipPath: reduced ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
            }}
            transition={{ duration: reduced ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={styles.option}
                aria-pressed={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  button.current?.focus();
                }}
              >
                {option.label}
                {value === option.value && <Check size={16} aria-hidden="true" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
