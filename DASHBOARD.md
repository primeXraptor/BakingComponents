# Original styled contestant dashboard

The default `ContestantRegistrationDashboard` is now a direct source extraction
from `primeXraptor/mmu-main` at `123804276c7ccc47a8afe1e94448a33dce0d3523`.
It replaces the earlier simplified dashboard and targets React 19, matching the source application. The original desktop and mobile JSX,
CSS modules, Tailwind classes/theme tokens, fonts, animations, category wheel,
glass surface, search, notifications, account menu/theme switch, profile, registration
editor, locked contestant tree, calendar, messages and PDF viewer are retained.

The requested branding changes are:

- The Home / Kunchanada sidebar tab uses `event_name` instead of Kunchanada.
- The welcome screen's three logo positions use `school_logo`, `club_logo`, and
  `event_logo`. Each accepts a URL string or `{ light: string, dark?: string }`.
- The event icon and registration-status heading follow the configured event name.

Framework integrations use ordinary React image/link elements and explicit runtime
adapters instead of requiring a Next.js application. The runtime provider adds no
rendered wrapper elements. Source component markup/classes are preserved. No files
in mmu-main are changed.

## Import and render

```tsx
import {
  ContestantRegistrationDashboard,
  type StyledDashboardProps,
} from 'baking-components/dashboard';
import 'baking-components/dashboard.css';

function Dashboard() {
  return (
    <ContestantRegistrationDashboard
      event_name="Your event"
      school_logo={{ light: '/school.svg', dark: '/school-white.svg' }}
      club_logo={{ light: '/club.svg', dark: '/club-white.svg' }}
      event_logo={{ light: '/event.svg', dark: '/event-white.svg' }}
      events={[]}
      schoolCode="SCHOOL-001"
      schoolName="Example School"
      schoolAddress="Colombo"
      registrationDate="15 November 2026"
      coordinatorName="Coordinator"
      coordinatorEmail="coordinator@example.com"
      coordinatorPhone="0712345678"
      micName="Teacher"
      micPhone="0712345678"
      schoolLogoUrl="/school.svg"
      mediaUnitLogoUrl="/club.svg"
      contestantRegistrationEnabled
      contestantSubmissionsLocked={false}
      contestantRegistrationOpensAt={null}
      rulesPdfUrl={null}
      initialContestants={[]}
      databaseReady
      alerts={[]}
      personalAlerts={[]}
      calendarEvents={[]}
      calendarAvailable
      calendarToday="2026-11-15"
      request={(input, init) => fetch(input, init)}
      onRefresh={() => { /* reload current settings/data in the host */ }}
      onNavigate={href => { window.location.assign(href); }}
      onLogout={async () => { /* host sign-out and navigation */ }}
    />
  );
}
```

The props match the original source page. `schoolLogoUrl` / `mediaUnitLogoUrl` are
school-account profile images, independent of the three welcome-screen logos.
Optional `deadlines`, `personalAlertsAvailable`, `pdfAssetsUrl`, `pdfWorkerUrl`, and
`smoothScrollRef` support the corresponding original features. `events` supplies
the Home tab's event links. The original website links, profile banner and copyright
notice are retained. The source artwork is available as `sourceDashboardBranding`
for an exact source preview; override it for other events.

### Backend adapter

`request(input, init)` has the same interface as fetch and returns a Response. No
request reaches a backend unless you supply this adapter. You can pass fetch to use
the original routes or map them to your own services. Their response contracts are:

| Route used by the copied UI | Response |
| --- | --- |
| `POST /api/kunchanada/contestants` | `{ contestant: KunchanadaContestant }`; errors use `{ error }`, with the source's lock-status handling retained |
| `GET /api/kunchanada/contact` | `{ messages: [{ id, message, status, createdAt, adminReply, repliedAt }] }` |
| `POST /api/kunchanada/contact` | `{ success: true, message: ChatMessage }` |
| `GET /api/kunchanada/submission-status` | `{ contestants: [{ id, work_submitted_at }] }` |
| `GET /api/kunchanada/registration-dates` | Original registration date fields |
| `POST /api/kunchanada/logout` | `{ success: true }`; bypassed when `onLogout` is supplied |

Keep authentication, authorization, persistence and server validation in the host.
The original polling and visibility/focus refresh interactions are retained. The
source theme initializer restores the saved light/dark preference on mount. The wrapper remounts the source component when registration enabled/locked flags
change, matching the key used by the original server route; other host data can be
refreshed through `onRefresh`. Initial contestant records seed source-local editor state.

The `onNavigate` adapter handles programmatic router navigation. Ordinary source
links are native anchors with their original hrefs; your host can handle those
routes or intercept navigation at its application boundary. When implementing
`onLogout`, perform both sign-out and any desired redirect in that callback.

### PDF assets

The original BreadCrumbPDF viewer is included. `npm run build` packages the matching
PDF.js worker, CMaps, standard fonts and WASM under `dist/pdf-assets/`. Serve that
directory from your host's public assets and set `pdfAssetsUrl`, for example
`pdfAssetsUrl="/pdf-assets/"`. An optional `pdfWorkerUrl` overrides the worker URL.
The package exposes `baking-components/pdf-assets/*` for host build integrations.
The default module-relative asset URL is suitable only when the host serves the
bundle and its adjacent assets without relocating them. Copy assets explicitly
when a bundler prebundles or relocates dependencies.

## Separate dashboard admin panel

```tsx
import { DashboardAdminPanel } from 'baking-components/dashboard-admin';
import 'baking-components/dashboard-admin.css';

<DashboardAdminPanel
  settings={portalSettings}
  schools={schools}
  contestants={contestants}
  newsTags={newsTags}
  calendarEvents={calendarEvents}
  calendarReady
  personalAlerts={personalAlerts}
  personalAlertsReady
  messages={schoolMessages}
  actions={{
    saveSettings: async formData => { /* persist portal settings / uploaded PDF */ },
    saveCalendarEvent: async formData => { /* create or update event */ },
    deleteCalendarEvent: async formData => { /* delete event by id */ },
    sendPersonalAlert: async formData => { /* send to selected school or all */ },
    replyToMessage: async formData => { /* update school chat reply/status */ },
  }}
  request={(input, init) => fetch(input, init)}
  onRefresh={() => { /* reload admin data after successful writes */ }}
/>
```

This copies only the source school's dashboard manager and its dependencies:
registration/lock/work-submission controls, opening/closing dates, alerts news tag,
rules PDF upload/link, personal alerts, calendar CRUD, school and contestant tables,
and CSV export. Optional `messages` adds the copied school-message reply manager;
non-school rows are excluded from that view. Unrelated CMS/news/gallery/our-work and
judge managers, admin login, the site's admin shell, and server-side database code
are not included.

Action callbacks receive the original FormData, including uploaded File objects.
Settings use the original database field names. Missing supported fields in
`settings` show the source's disabled/migration states. Actions reject with an Error
to display an error notice; successful actions display a save notice and invoke
`onRefresh`. React 19 is required for these function-valued form actions, matching
the source application. The host must enforce admin authorization and reject invalid
operations on the server.

The export button uses `GET /api/admin/kunchanada/export` and optional `?school=...`
through `request`. Return a CSV Response with `Content-Type: text/csv` and an optional
`Content-Disposition` filename. The host controls data access and CSV generation.

Individual source components are also exported, including `KunchanadaCalendar`,
`KunchanadaContactForm`, `KunchanadaSearchDialog`, `KunchanadaAccountMenu`,
`KunchanadaMainCategories`, `KunchanadaContextSidebar`, registration controls and the
admin calendar/alerts/export components. Wrap standalone source components in
`DashboardRuntimeProvider`. The earlier simplified composition remains available
as `StructuralContestantDashboard`; its API is intentionally separate from the
source dashboard and it is no longer the default.

## Demo and fidelity checks

Run `npm run dev`. The gallery links to `?dashboard` for the styled contestant
experience and `?dashboard-admin` for its separate admin panel. Both demos use local
callbacks, with no production writes. `?dashboard&event=Your%20Event` demonstrates
the event-name replacement. Demo `rules=/path/to/document.pdf` enables the PDF pane.

Run `npm run typecheck`, `npm test`, `npm run check:source`, and `npm run build`.
The source check compares original CSS bytes and JSX class/style fingerprints
against `source-provenance.json`. It detects visual-source drift while allowing the
listed branding/runtime changes. It is source-parity evidence, not a claim of
pixel-perfect screenshots across different browsers or host stylesheets.

`styles/globals.css` retains the original site's CSS/theme definitions; Tailwind
and styling dependencies match the source lockfile. `styles/shadcn.css` is the
unmodified stylesheet from shadcn 4.19.0, with its MIT notice preserved alongside
it. Original proprietary component/assets/font attribution remains in NOTICE.md.
Import the dashboard styles once and load your host's deliberate overrides after
them. Unlike the previous structural-only entry, this entry includes the original
global resets, light/dark colors, hover states and font definitions.
