"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle, XClose } from "@untitledui/icons";
import { Toaster, toast } from "sonner";

const TOASTER_ID = "kunchanada-dashboard-toaster";
const MOBILE_QUERY = "(max-width: 767px)";

function subscribeToMobileQuery(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerMobileSnapshot() {
  return false;
}

function SuccessNotification({
  toastId,
  title,
  description,
}: {
  toastId: string | number;
  title: string;
  description?: string;
}) {
  return (
    <div className="kunchanada-home-notification" role="status">
      <div className="kunchanada-home-notification__icon">
        <CheckCircle aria-hidden="true" />
      </div>

      <div className="kunchanada-home-notification__content">
        <p className="kunchanada-home-notification__title">{title}</p>
        {description && <p className="kunchanada-home-notification__description">{description}</p>}
      </div>

      <button
        type="button"
        aria-label={`Dismiss ${title} notification`}
        className="kunchanada-home-notification__close"
        onClick={() => toast.dismiss(toastId)}
      >
        <XClose aria-hidden="true" />
      </button>
    </div>
  );
}

export function showKunchanadaSuccessNotification(title: string, description?: string) {
  toast.custom(
    (toastId) => <SuccessNotification toastId={toastId} title={title} description={description} />,
    {
      toasterId: TOASTER_ID,
      duration: 5000,
      unstyled: true,
    },
  );
}

export function KunchanadaDashboardNotifications() {
  const isMobile = useSyncExternalStore(
    subscribeToMobileQuery,
    getMobileSnapshot,
    getServerMobileSnapshot,
  );

  return (
    <Toaster
      id={TOASTER_ID}
      position={isMobile ? "top-center" : "bottom-right"}
      visibleToasts={2}
      gap={12}
      offset={{ top: 24, right: 24, bottom: 24, left: 24 }}
      mobileOffset={{ top: 24, right: 16, bottom: 16, left: 16 }}
      containerAriaLabel="Kunchanada dashboard notifications"
    />
  );
}
