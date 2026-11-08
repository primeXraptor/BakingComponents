"use client";

import type { ReactNode } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import styles from "./search-pop-up-model.module.css";

export interface SearchPopUpModelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  children: ReactNode | ((close: () => void) => ReactNode);
}

/** Centered ChatGPT-style search popup, separate from the standard bottom-sheet model. */
export function SearchPopUpModel({ isOpen, onOpenChange, label, children }: SearchPopUpModelProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className={styles.overlay}
    >
      <Modal className={styles.modal}>
        <Dialog aria-label={label} className={styles.dialog}>
          {({ close }) => (typeof children === "function" ? children(close) : children)}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
