"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type PointerEvent } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import styles from "./pop-up-model.module.css";

export interface PopUpModelProps {
  isOpen: boolean;
  children: ReactNode;
  labelledBy?: string;
  label?: string;
  role?: "dialog" | "alertdialog";
  isDismissable?: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

/** Supply content only: this component owns padding, the drag handle and Close footer. */
export function PopUpModel({
  isOpen,
  children,
  labelledBy,
  label,
  role = "dialog",
  isDismissable = true,
  onOpenChange,
}: PopUpModelProps) {
  const [closing, setClosing] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    setClosing(false);
  }
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const close = useCallback(() => {
    if (!isDismissable || closeTimer.current) return;
    setClosing(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Let the 300ms exit finish before a conditional parent unmounts us.
    closeTimer.current = setTimeout(
      () => {
        closeTimer.current = null;
        onOpenChange(false);
      },
      reduced ? 0 : 320,
    );
  }, [isDismissable, onOpenChange]);

  const modalRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointerId: number;
    startY: number;
    startedAt: number;
    offset: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      drag.current = null;
      modalRef.current?.style.removeProperty("--popup-drag-offset");
      modalRef.current?.removeAttribute("data-dragging");
    }
  }, [isOpen]);

  useEffect(() => {
    const modal = modalRef.current;
    if (!isOpen || !modal || !isDismissable) return;
    let gesture: {
      x: number;
      y: number;
      time: number;
      offset: number;
      dragging: boolean;
      blocked: boolean;
    } | null = null;
    function start(event: TouchEvent) {
      if (event.touches.length !== 1 || !window.matchMedia("(max-width: 767px)").matches) {
        gesture = null;
        return;
      }
      const touch = event.touches[0];
      let node = event.target instanceof Element ? event.target : null;
      let blocked = false;
      // Nested lists and textareas must reach their top before dismissing.
      while (node && node !== modal) {
        if (node.scrollTop > 0) blocked = true;
        node = node.parentElement;
      }
      gesture = {
        x: touch.clientX,
        y: touch.clientY,
        time: event.timeStamp,
        offset: 0,
        dragging: false,
        blocked,
      };
    }
    function move(event: TouchEvent) {
      if (!gesture) return;
      if (event.touches.length !== 1) {
        gesture = null;
        modal!.removeAttribute("data-dragging");
        modal!.style.removeProperty("--popup-drag-offset");
        return;
      }
      const touch = event.touches[0];
      const delta = touch.clientY - gesture.y;
      if (!gesture.dragging) {
        if (
          gesture.blocked ||
          delta < -8 ||
          Math.abs(touch.clientX - gesture.x) > Math.max(8, delta)
        ) {
          gesture = null;
          return;
        }
        if (delta < 8) return;
        if (!event.cancelable) {
          gesture = null;
          return;
        }
        gesture.dragging = true;
        modal!.setAttribute("data-dragging", "");
      }
      event.preventDefault();
      gesture.offset = Math.max(0, delta);
      modal!.style.setProperty("--popup-drag-offset", `${gesture.offset}px`);
    }
    function finish(event: TouchEvent) {
      if (!gesture) return;
      const current = gesture;
      gesture = null;
      modal!.removeAttribute("data-dragging");
      if (!current.dragging) return;
      if (event.cancelable) event.preventDefault();
      const velocity = current.offset / Math.max(1, event.timeStamp - current.time);
      if (
        event.type !== "touchcancel" &&
        (current.offset >= 80 || (current.offset >= 24 && velocity > 0.5))
      )
        close();
      else modal!.style.removeProperty("--popup-drag-offset");
    }
    modal.addEventListener("touchstart", start, { passive: true });
    modal.addEventListener("touchmove", move, { passive: false });
    modal.addEventListener("touchend", finish, { passive: false });
    modal.addEventListener("touchcancel", finish, { passive: false });
    return () => {
      modal.removeEventListener("touchstart", start);
      modal.removeEventListener("touchmove", move);
      modal.removeEventListener("touchend", finish);
      modal.removeEventListener("touchcancel", finish);
    };
  }, [isOpen, isDismissable, close]);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (
      event.pointerType === "touch" ||
      !isDismissable ||
      !window.matchMedia("(max-width: 767px)").matches ||
      event.button !== 0
    )
      return;
    if (!(event.target instanceof Element) || !event.target.closest("[data-popup-drag-handle]"))
      return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startedAt: event.timeStamp,
      offset: 0,
    };
    modalRef.current?.setAttribute("data-dragging", "");
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    drag.current.offset = Math.max(0, event.clientY - drag.current.startY);
    modalRef.current?.style.setProperty("--popup-drag-offset", `${drag.current.offset}px`);
  }

  function endDrag(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    modalRef.current?.removeAttribute("data-dragging");
    const velocity = current.offset / Math.max(1, event.timeStamp - current.startedAt);
    if (!cancelled && (current.offset >= 80 || (current.offset >= 24 && velocity > 0.5))) {
      close();
    } else {
      modalRef.current?.style.removeProperty("--popup-drag-offset");
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <ModalOverlay
      data-kunchanada-auth=""
      data-lenis-prevent=""
      isOpen={isOpen && !closing}
      isDismissable={isDismissable}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      className={styles.overlay}
    >
      <Modal
        ref={modalRef}
        className={styles.modal}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={(event) => endDrag(event)}
        onPointerCancel={(event) => endDrag(event, true)}
        onLostPointerCapture={(event) => endDrag(event, true)}
      >
        <Dialog
          role={role}
          aria-labelledby={labelledBy}
          aria-label={label}
          className={styles.dialog}
        >
          <div data-popup-drag-handle className={styles.handle} aria-hidden="true">
            <span />
          </div>
          <div className={styles.body} data-lenis-prevent>
            {children}
          </div>
          <div className={styles.footer}>
            <button
              type="button"
              onClick={close}
              disabled={!isDismissable}
              className={styles.close}
            >
              Close
            </button>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
