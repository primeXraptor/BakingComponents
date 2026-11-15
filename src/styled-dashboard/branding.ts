import schoolLight from "./assets/logos/school-logo-original.svg?url";
import schoolDark from "./assets/logos/school-logo-white.svg?url";
import clubLight from "./assets/logos/logo-original.svg?url";
import clubDark from "./assets/logos/logo-white.svg?url";
import eventLight from "./assets/logos/dark-kunchanada.svg?url";
import eventDark from "./assets/logos/kunchanada.svg?url";
import type { DashboardBranding } from "./runtime/context";
/** Original artwork is supplied for a faithful source preview; override all four values for another event. */
export const sourceDashboardBranding: DashboardBranding = {
  event_name: "Kunchanada",
  school_logo: { light: schoolLight, dark: schoolDark },
  club_logo: { light: clubLight, dark: clubDark },
  event_logo: { light: eventLight, dark: eventDark },
};
