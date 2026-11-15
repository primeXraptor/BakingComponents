# Reusable contestant dashboard

Adapted from `primeXraptor/mmu-main` at commit `123804276c7ccc47a8afe1e94448a33dce0d3523`:
`ContestantRegistrationDashboard`, `DashboardMobileNavigation`, the context sidebar,
calendar, profile, alerts, registration and message views. The category definitions,
slot restrictions, age/link validation, and Sri Lanka calendar helpers are copied
from the source. Existing proprietary attribution in NOTICE.md applies.

This is a framework-independent presentation extraction. It retains the responsive
three-column shell, mobile navigation, open-page tabs, category groups, contestant
slots, editor, profile fields, rules area, message timeline/composer, alerts,
calendar/month/agenda/details, search and registration status/deadlines. Components
are exported individually and composed by `ContestantRegistrationDashboard`.

Colors, hover colors, shadows, glass surfaces, gradients, brand images, decorative
animations and dark-mode logic are omitted. The CSS provides layout, sizing,
spacing, typography hierarchy and responsive behavior. Native browser form styles
and focus indicators remain. `aria-current`, `aria-pressed`, `data-outside` and
exported `dashboardStyles` allow your application to add its own theme. Dialogs
use React Aria for focus management, keyboard dismissal and accessible titles;
provide your own dialog/overlay surfaces when theming.

## Import without the original library theme

```tsx
import {
  ContestantRegistrationDashboard,
  type KunchanadaContestant,
  type DashboardMessage,
} from 'baking-components/dashboard';
import 'baking-components/dashboard.css';
```

Use the dedicated subpath above to avoid importing the old library's theme CSS.
The root entry also exports the components for existing consumers.

```tsx
import { useState } from 'react';

function SchoolDashboard() {
  const [contestants, setContestants] = useState<KunchanadaContestant[]>([]);
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  return (
    <ContestantRegistrationDashboard
      profile={{
        schoolCode: 'SCHOOL-001', schoolName: 'Example School',
        schoolAddress: 'Colombo', registrationDate: '15 November 2026',
        coordinatorName: 'Coordinator', coordinatorPhone: '0712345678',
        micName: 'Teacher', micPhone: '0712345678',
      }}
      contestants={contestants}
      onContestantsChange={setContestants}
      onSaveContestant={async input => {
        const response = await fetch('/your-api/contestants', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (!response.ok) throw new Error('Unable to save contestant.');
        return response.json(); // Must return a KunchanadaContestant record.
      }}
      messages={messages}
      onSendMessage={async message => {
        const response = await fetch('/your-api/messages', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });
        if (!response.ok) throw new Error('Unable to send message.');
        const saved: DashboardMessage = await response.json();
        setMessages(current => [...current, saved]);
      }}
    />
  );
}
```

The host owns authentication, loading, persistence and authorization. There are no
hardcoded API endpoints, Supabase clients, Next.js imports, providers, remote brand
assets or required environment variables. Callback rejections appear inline and
retain entered values. Without a save/send callback the corresponding operation
is unavailable. Update the controlled `contestants` and `messages` props after
successful writes; callback completion alone does not persist local data.
The server must enforce authorization and registration rules independently.

## Data and composition

| Export / prop | Purpose |
| --- | --- |
| `DashboardShell`, `DashboardNavigation`, `DashboardTabs` | Responsive shell, navigation and closeable page tabs |
| `DashboardAccountMenu`, `DashboardSearch` | Reusable account controls and search across pages, categories, contestants and alerts |
| `DashboardMobileHeader`, `DashboardMobileBottomNavigation`, `DashboardDialog` | Mobile navigation and accessible dialogs |
| `SchoolProfile`, `profile` | School/coordinator/MIC information, optional logos, banner, group link, copy code |
| `DashboardCategoryList`, `ContestantRegistrationView`, `ContestantEditor` | Categories, remaining counts, slots and validated editing |
| `LockedContestantsTree`, `DashboardRegistrationStatus` | Read-only registrations and status sidebar |
| `DashboardRules`, `rulesPdfUrl`, `renderRules` | Native PDF iframe/open link, or a host-supplied document viewer |
| `DashboardMessages`, `messages`, `onSendMessage` | Message history, replies, quick mentions and sending |
| `DashboardAlerts`, `PersonalAlertsList` | General alerts and timestamped personal notifications |
| `DashboardCalendar`, `calendarEvents`, `today` | Month/agenda navigation and event details |
| `RegistrationCountdowns`, `deadlines` | Registration/event dates and live countdowns |
| `homeLinks`, `onLogout` | Host links and sign-out behavior |
| `view`, `onViewChange`, `initialView` | Controlled navigation or internal page state |

`registrationEnabled`, `submissionsLocked`, `databaseReady`, `alertsAvailable`,
`messagesAvailable`, `calendarAvailable` express host state. Locked contestants
remain visible but cannot be edited. Category/slot configuration follows Kunchanada,
including one short-film slot and age checks for junior/intermediate/senior groups.
Alert `content` accepts React nodes; plain HTML strings render as text. Sanitize
rich content in the host before converting it to React nodes. Pass trusted URLs
for PDF documents, logos and links.

Calendar timestamps are interpreted in `Asia/Colombo`; midnight end times are
exclusive, preserving multi-day event semantics. Optional event color metadata
is retained in types but does not select visual colors.

The original Next.js login/session routing, event-site navigation, network polling,
Supabase persistence, PDF editor, animated glass/category wheel, emoji and attachment
services are host integrations rather than bundled application dependencies. The
rules viewer can be replaced with `renderRules`; header/site links and logos are
supplied as data. Registration, navigation, messaging and calendar work independently
of those services.

## Demo and checks

Run `npm run dev`, then open the gallery's **Open the structure-only contestant
dashboard demo** link (`?dashboard`). Its saves and messages use in-memory callbacks.
There are no server writes and reload resets the demo. `demo/dashboard.tsx` is a
complete working composition example.

Run `npm run typecheck`, `npm test` and `npm run build`. The build emits a separate
`dist/dashboard.js`, `dist/dashboard.css`, and dashboard type declarations alongside
the existing library. Existing Vite `use client` warnings are nonfatal; both bundles
retain the directive through their output banners.
