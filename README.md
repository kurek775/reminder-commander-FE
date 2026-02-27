# Reminder Commander — Frontend

Angular 21 frontend for the Reminder Commander application. Connects to the FastAPI backend for Google OAuth login, sheet management, WhatsApp/voice reminder rules, and the Warlord voice-call dashboard.

---

## Current Status

All 7 phases complete. **150 tests pass (25 spec files).**

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Angular 21 + Vitest infrastructure, health page | ✅ |
| 2 | Google SSO login, JWT tokens, auth guard/interceptor | ✅ |
| 3 | Tailwind v4 dark mode, EN/CS i18n (Transloco) | ✅ |
| 4 | Google Sheets connect flow | ✅ |
| 5 | Tracker rules (health_tracker / WhatsApp reminders) | ✅ |
| 6 | Warlord UI (voice call dashboard, inline edit, debug) | ✅ |
| 7 | Dashboard, 404 page, sheet management enhancements | ✅ |

---

## Prerequisites

- [Node.js 22 LTS](https://nodejs.org/) (or higher even-numbered LTS)
- [Angular CLI](https://angular.dev/tools/cli) v21+

```bash
npm install -g @angular/cli
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server (hot-reload)
ng serve

# Open in browser: http://localhost:4200
```

> The app expects the backend at `http://localhost:8000`. Start it with `docker compose up --build` in `reminder-commander-BE/`.

---

## Running Tests

```bash
# Run unit tests (Vitest, single run)
ng test --watch=false

# Watch mode
ng test
```

> No `--browsers` flag needed — Vitest runs headless by default in this project.

---

## Backend Connection

The API base URL is configured via environment files:

| File | `apiUrl` | When used |
|------|----------|-----------|
| `src/environments/environment.ts` | `http://localhost:8000` | `ng serve` (development) |
| `src/environments/environment.prod.ts` | `''` (same-origin) | `ng build` (production) |

---

## Features

### Auth (Google SSO)
- `GET /api/v1/auth/google` — redirects to Google
- Callback at `/auth/callback` stores JWT + refresh tokens via `TokenService` (localStorage)
- `AuthService` exposes signals: `currentUser()`, `isLoggedIn()`
- `authGuard` protects `/profile`, `/sheets`, `/rules`, `/warlord`
- `authInterceptor` attaches `Authorization: Bearer <token>` to every request

### Dashboard
- `/` — dashboard showing connected sheets, active rules, recent activity, and setup checklist
- Metric cards: sheets connected, health rules active, warlord rules active
- Setup checklist: Google login, WhatsApp linked, sheets connected, rules created

### Sheets
- `/sheets` — lists connected Google Sheets with tabbed "Connect Existing" / "Create New" UI
- Sheet preview — expandable data table showing headers and rows
- Inline rename — custom display name per sheet
- Disconnect with confirmation modal and rule-count warning
- OAuth redirect handled transparently by the backend; on return, sheet appears in the list

### Rules (Health Tracker)
- `/rules` — create/delete tracker rules (WhatsApp reminders via cron)
- `rule_type: health_tracker` — checks a sheet column for today's entry; sends WhatsApp if missing
- Form: rule name, sheet dropdown, cron schedule, target column, prompt text

### Warlord (Voice Calls)
- `/warlord` — dashboard for overdue task enforcement via voice calls
- **Trigger Now** — fires a forced warlord scan immediately (bypasses cron schedule)
- **Add Rule** — creates a `warlord` rule tied to a connected sheet
- **Inline prompt editor** — pencil button per rule; saves `prompt_text` via `PATCH /api/v1/rules/{id}`
  - Supports `{task_name}` and `{deadline}` placeholders
- **Debug / Check Sheet** — clipboard button per rule; calls `GET /api/v1/warlord/debug/{id}` and shows raw sheet rows + missed tasks inline
- **Voice Call Log** — shows last 50 voice interaction logs (direction, status, content)

### Dark Mode & i18n
- `ThemeService` — toggles `dark` class on `<html>`; persisted to localStorage
- `LanguageService` — switches between English and Czech via Transloco
- Toggle buttons in navbar (top-right)

---

## Project Structure

```
src/
  app/
    app.ts                        # Root component — navbar, router-outlet
    app.config.ts                 # provideRouter, provideHttpClient, Transloco
    app.routes.ts                 # Route definitions (lazy-loaded features)
    transloco-loader.ts           # HTTP loader for i18n JSON files
    core/
      auth/
        auth.service.ts           # currentUser signal, login/logout, token refresh
        auth.guard.ts             # Redirects to /login if not authenticated
        auth.interceptor.ts       # Attaches JWT Bearer token to requests
        token.service.ts          # localStorage read/write for JWT tokens
      theme/
        theme.service.ts          # Dark/light mode toggle (signal-based)
      i18n/
        language.service.ts       # EN/CS language switching (Transloco)
    features/
      dashboard/
        dashboard.component.*     # Metric cards, setup checklist, recent activity
        dashboard.service.ts      # GET /api/v1/dashboard/summary
      health/
        health.service.ts         # GET /api/v1/health
        health.component.*        # Displays backend health status
      auth/
        login/
          login.component.*       # "Sign in with Google" button
        callback/
          callback.component.*    # Handles OAuth redirect, stores tokens
        profile/
          profile.component.*     # Shows current user info, WhatsApp link form
      sheets/
        sheets.service.ts         # connect, create, preview, rename, disconnect
        sheets-list/
          sheets-list.component.* # Lists sheets, tabbed connect/create, preview, rename, disconnect
        connect-sheet/
          connect-sheet.component.* # URL input → OAuth connect flow
      rules/
        rules.service.ts          # CRUD for TrackerRule via API
        rules-list.component.*    # Create/delete health_tracker rules
      warlord/
        warlord.service.ts        # trigger, createRule, deleteRule, updatePrompt, debugRule, getVoiceLogs
        warlord.component.*       # Full warlord dashboard (signals + computed)
      not-found/
        not-found.component.ts    # 404 page with link back to home
    shared/
      models.ts                   # Shared interfaces (SheetIntegration, SheetPreview, etc.)
      cron-utils.ts               # Cron expression utilities
      cron-to-human.pipe.ts       # Pipe: cron expression → human-readable string
      confirm-modal/              # Reusable confirmation dialog (component + service)
      toast/                      # Toast notification (component + service)
      skeleton/                   # Loading skeleton component
      schedule-picker/            # Cron schedule picker with model() two-way binding
  environments/
    environment.ts                # Dev: apiUrl = http://localhost:8000
    environment.prod.ts           # Prod: apiUrl = '' (same-origin)
  assets/
    i18n/
      en.json                     # English translations
      cs.json                     # Czech translations
```

---

## Key Architecture Notes

- **Angular 21 is zoneless** — all mutable state uses `signal()`. Plain property assignments in async callbacks won't trigger change detection.
- **Transloco** for i18n — `TranslocoModule` imported in every standalone component; `TranslocoTestingModule.forRoot(...)` in every spec.
- **Vitest** as test runner — `vi.fn()` for mocks, access signals via `component.signal()` not `component.signal`.
- **Tailwind v4** — uses `postcss.config.json` (not `.mjs`) and `@import "tailwindcss"` in `styles.scss` (not `@use`).
- **Dark mode** — enabled via `@variant dark (&:where(.dark, .dark *))` in `styles.scss`; toggled by `ThemeService`.

---

## Routes

| Path | Component | Guard |
|------|-----------|-------|
| `/` | `DashboardComponent` | `authGuard` |
| `/health` | `HealthComponent` | `authGuard` |
| `/login` | `LoginComponent` | — |
| `/auth/callback` | `CallbackComponent` | — |
| `/profile` | `ProfileComponent` | `authGuard` |
| `/sheets` | `SheetsListComponent` | `authGuard` |
| `/rules` | `RulesListComponent` | `authGuard` |
| `/warlord` | `WarlordComponent` | `authGuard` |
| `**` | `NotFoundComponent` | — |

---

## Warlord Sheet Convention

The Warlord feature expects a fixed Google Sheet layout:

| Col A | Col B | Col C |
|-------|-------|-------|
| Task name | Deadline (`YYYY-MM-DD`) | Done (`TRUE`/`FALSE`) |

Row 1 = headers (skipped). The backend looks for rows where `deadline < today` AND `done ≠ TRUE`.

Voice message template (`prompt_text` on the rule):
- `{task_name}` — replaced with column A value
- `{deadline}` — replaced with column B value
- Default: `"{task_name} was due on {deadline}. Complete it now."`

---

## Known Issues / Gotchas

- **Warlord component spec** path for Transloco assets: `../../assets/i18n/` (2 levels from `features/warlord/`)
- **Rules-list spec** path: `../../../assets/i18n/` (3 levels), vs sheets-list at `../../../../` (4 levels — one dir deeper)
- **Signal access in specs**: always call `component.mySignal()` (with parentheses), not `component.mySignal`
- **Auth interceptor**: if the token is expired and refresh fails, the user is redirected to `/login` automatically
