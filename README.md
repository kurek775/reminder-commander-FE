# Reminder Commander — Frontend

Angular 21 frontend for the Reminder Commander application. Connects to the FastAPI backend and displays real-time reminders.

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

# Open in browser
# http://localhost:4200
```

> The app expects the backend to be running at `http://localhost:8000`. See [Backend Connection](#backend-connection) below.

---

## Running Tests

```bash
# Run unit tests (headless, single run)
ng test --watch=false --browsers=ChromeHeadless

# Run with coverage
ng test --watch=false --browsers=ChromeHeadless --code-coverage
```

---

## Backend Connection

The API base URL is configured via environment files:

| File                          | `apiUrl`                  | When used                   |
|-------------------------------|---------------------------|-----------------------------|
| `src/environments/environment.ts`      | `http://localhost:8000`   | `ng serve` (development)    |
| `src/environments/environment.prod.ts` | `''` (same-origin)        | `ng build` (production)     |

In development, start the backend with:

```bash
cd ../reminder-commander-BE
cp .env.example .env
docker compose up --build
```

Then run `ng serve` — the health check page at `http://localhost:4200` will display the backend status.

---

## Project Structure

```
src/
  app/
    app.config.ts          # provideRouter + provideHttpClient
    app.routes.ts          # Route definitions
    app.ts                 # Root component (router-outlet)
    features/
      health/
        health.service.ts       # HTTP call to GET /api/v1/health
        health.component.ts     # Displays health data / error
        health.component.html
        health.component.scss
        health.component.spec.ts
  environments/
    environment.ts          # Dev API URL
    environment.prod.ts     # Prod API URL (same-origin)
```
