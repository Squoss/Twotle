# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. This file was created by Claude Code (/init) and amended with hints taken from [Claude Code: The Complete Guide](https://www.linkedin.com/posts/david-ramsey-9b8231108_claudecode-iwroteabook-humblebrag-activity-7368664132440485889-vDlm).

## Project Overview

Twotle is a web application inspired by doodle.com and meant as a teaching aid for a textbook. It consists of two subprojects, beapi (short for backend/API) implemented in Scala with Play and fegui (short for frontend/GUI) implemented in TypeScript with React.

## Tech Stack

- Backend: Play with Scala
- Frontend: React with TypeScript (React Router v8 in framework mode)
- DBMS: MongoDB
- Auth: Capability URLs (https://www.w3.org/TR/capability-urls/)

## Open Items

- **Enforce the frontend dependency rules once TypeScript 7.1 is out.**
  - **Why wait:** TypeScript 7.0's npm package has no compiler JS API, so dependency-cruiser can't parse TypeScript, and its swc fallback aborts on JSX. Paul decided to wait rather than downgrade TypeScript or hand-roll a checker.
  - **Then add:**
    - the `dependency-cruiser` dev dependency
    - a `.dependency-cruiser.cjs` mirroring both `DependencyRulesTestSuite.scala` files (e.g., the hexagon depends on nothing outside itself; only `FetchRepository.ts` and `fetchLookups.ts` use `fetchJson.ts`; only `entry.client.tsx` depends on `FetchRepository.ts`)
    - an `npm run lint:arch` script and a matching step in `.github/workflows/test.yml`
  - **Until then:** nothing stops the hexagon from importing, e.g., React (npm hoists it); its tsconfig (no DOM lib, no types) only keeps browser APIs out.

## Conventions

- Always run tests before committing

## Development Commands

### Backend (beapi/)
```bash
cd beapi
sbt                                                                                             # Start sbt in interactive mode
run -Dconfig.file=conf/insecureLocalhost.conf                                                   # Start Play dev server on port 9000 with mock implementations of database, e-mail, and SMS
run -Dconfig.file=conf/insecureLocalhost.conf -Ddi.db=driven_adapters.persistence.MdbRepository # Start Play dev server on port 9000 with local MongoDB database (mongodb://localhost:27017/twotle) and mock implementations of e-mail and SMS
test                                                                                            # Run tests (includes ArchUnit dependency rules)
```

### Frontend (fegui/)
```bash
cd fegui
npm start           # Start the React Router (Vite) dev server on port 5173 (proxies /iapi to localhost:9000)
npm run typecheck   # Generate route types (.react-router/) and type-check the app and the hexagon
npm run build       # Pre-render the SPA into build/client (Play serves its index.html and, under /fegui/, its assets)
```

From the repository root, `docker build --target react .` builds the frontend the way CI's delivery (GHCR) and deployment (Clever Cloud) do: on Linux, in `node:24`.

### Development Workflow
Run both servers simultaneously:
1. Terminal 1: `cd beapi && sbt run`
2. Terminal 2: `cd fegui && npm start`

The dev server proxies `/iapi/*` requests to the Play backend.

### Production-like Local Check

The dev server doesn't send Play's security headers (e.g., the CSP), so only a Play-served build exercises the CSP nonces, the CSRF token, and the `/fegui/` assets:

1. Copy `fegui/build/client/.` into `beapi/public/build/` *before* starting Play. `ReactController` keeps `index.html` in memory until Play reloads.
2. Afterwards, restore the tracked placeholder: delete the copied files and run `git checkout -- beapi/public/build/index.html`.

`vite preview` is no substitute: only Play splits the `/fegui/` assets from the app's routes.

## Architecture

### Backend

#### Hexagonal Architecture (Ports & Adapters Pattern)

The backend follows strict hexagonal architecture with dependency rules enforced by ArchUnit tests.

```
beapi/
├── app/
│   ├── controllers/
│   │   ├── api/                       # REST controllers (driving adapters); I18nController and ValidationsController bypass the hexagon
│   │   └── gui/                       # ReactController (serves fegui's build)
│   ├── driven_adapters/
│   │   ├── persistence/               # MongoDB adapter (Mdb, MdbRepository)
│   │   └── notifications/             # Email/SMS adapters (Mailjet, Threema)
│   ├── filters/                       # HTTP filters
│   └── Module.scala                   # Guice dependency injection
├── hexagon/                           # Domain core (independent subproject)
│   └── src/
│       ├── main/scala/
│       │   ├── domain/
│       │   │   ├── driving_ports/     # Input interfaces (Elections, Factory)
│       │   │   ├── driven_ports/      # Output interfaces
│       │   │   │   ├── persistence/   # Repository, Events
│       │   │   │   └── notifications/ # Email, Sms
│       │   │   ├── entities/          # ElectionEntity
│       │   │   ├── driving_adapters/  # ElectionsService
│       │   │   └── value_objects/     # Id, AccessToken, EmailAddress, Vote, etc.
│       │   └── dev/                   # Mock driven adapters (for insecureLocalhost.conf and ElectionsServiceTest)
│       └── test/scala/                # ArchUnit rules (hexagon), ElectionsServiceTest
├── conf/
│   ├── routes                         # Play routing
│   ├── application.conf               # Config with DI bindings
│   └── insecureLocalhost.conf         # Local development config (mock database, e-mail, and SMS)
├── public/build/                      # fegui's build (only a placeholder index.html is tracked)
└── test/                              # ArchUnit rules (app)
```

#### Dependency Rules

The `hexagon` subproject lets the compiler enforce two things only: the hexagon can't see `app/`, and it can't see libraries missing from `hexagon/build.sbt` (e.g., Play, the MongoDB driver). So declare a library there only if the domain uses it. The rules *within* each project need ArchUnit; e.g., `app/` sees the whole hexagon, including `ElectionsService` and the `dev` mocks.

`sbt test` runs both ArchUnit suites (the root project aggregates `hexagon`).

`hexagon/src/test/scala/DependencyRulesTestSuite.scala` (checks the `domain` packages only):
- The domain depends on nothing outside itself except the JDK, Scala, jakarta.inject, and libphonenumber
- Value objects only depend on themselves
- Only the services (driving adapters) and entities depend on the persistence port
- Only the services depend on the driving ports and the notification port
- Nothing depends on the services

`test/DependencyRulesTestSuite.scala`:
- API controllers only depend on driving ports and value objects
- Nothing outside the router depends on API controllers
- MongoDB adapter only depends on persistence interfaces
- Third-party services only depend on notification interfaces
- Dev implementations are isolated (only Module can reference them)
- Filters are self-contained

### Frontend

React SPA built with React Router v8 in framework mode (`ssr: false`, cf. `react-router.config.ts`). `app/routes.ts` maps URLs to route modules (cf. beapi's `conf/routes`), and `app/root.tsx` renders the HTML document.

The build pre-renders `build/client/index.html`. Play serves it for all non-API paths, after replacing its `REPLACE_LANG` and `REPLACE_CSRF_TOKEN` placeholders and adding the request's CSP nonce to its inline scripts (cf. `ReactController` and `script-src` in `application.conf`). The assets are served under `/fegui/`.

Internationalization/Localization is based on the backend (i.e., on Play's i18n/l10n support): the root route's `clientLoader` fetches the messages once, and components read them via `useLocalizations()` (cf. `app/localizations.ts`).

Organized along the lines of the Ports & Adapters pattern (Hexagonal architecture), mirroring the backend:

```
fegui/
├── app/
│   ├── root.tsx              # HTML document (Layout) and the localizations' clientLoader
│   ├── routes.ts             # Route config (cf. beapi's conf/routes)
│   ├── entry.client.tsx      # Browser entry and composition root (wires FetchRepository into Factory/AntiFactory for route modules via getContext, cf. context.ts); loads Bootstrap's JavaScript
│   ├── App.tsx               # App shell (navbar, footer, cookie consent) around the routes' <Outlet />
│   ├── components/, props/   # React GUI (driving adapters); most components double as route modules
│   ├── routes/               # Thin route modules where routing needs glue (redirects, the election tabs and their clientAction)
│   ├── FetchRepository.ts    # REST adapter for the Repository port (driven adapter)
│   ├── fetchLookups.ts       # Localizations, time zones (cached), validations (bypass the hexagon, like beapi's I18nController/ValidationsController)
│   └── fetchJson.ts          # Used by the two fetch adapters only
├── hexagon/                  # Domain core (npm workspace package @twotle/hexagon, no DOM lib)
│   └── src/
│       ├── driving_ports/    # ElectionFactory, ElectionAntiFactory
│       ├── driven_ports/     # Repository
│       ├── entities/         # ElectionEntity
│       ├── driving_adapters/ # Factory, AntiFactory
│       └── value_objects/    # Availability, ElectionError, Visibility, Vote, etc.
└── react-router.config.ts    # Framework mode config (SPA)
```

Import the hexagon via `@twotle/hexagon` (the `hexagon/src/index.ts` barrel), never via relative paths.

#### Data Flow

- **Composition root:** `entry.client.tsx` (cf. beapi's `Module.scala`) creates `FetchRepository`, `Factory`, and `AntiFactory` once. It hands them to route modules via `<HydratedRouter getContext>` and the router contexts in `context.ts`, which `clientLoader`s and `clientAction`s read with `context.get(factoryContext)`.
- **Localizations:** `root.tsx`'s `clientLoader` loads them; its `shouldRevalidate` skips them after actions.
- **Elections:** `components/Election.tsx` (route id `election`) loads the election and the time zones in its `clientLoader`. The tabs read both via `useRouteLoaderData("election")`, and its `ErrorBoundary` renders `ElectionError`s (Forbidden/Not Found/Gone).
- **Mutations:** the tab components submit typed intents (`props/ElectionIntent.ts`, named after the entity or anti-factory methods) via `useElectionSubmit()` (`useFetcher`). `routes/ElectionTab.tsx`'s `clientAction` recreates the election, calls the method, and lets React Router revalidate the election. `Abode`'s `clientAction` creates an election and redirects to it.

#### Design Decisions

- **Lookups bypass the hexagon:** localizations, time zones, and validations go through `fetchLookups.ts`, just as beapi's `I18nController`/`ValidationsController` bypass its hexagon. Reminders do go through it (`ElectionEntity.sendLinksReminder`, cf. beapi's `Elections.sendLinksReminder`).
- **Domain errors, not HTTP errors:** `ElectionErrorReason` mirrors beapi's `Error` enum (plus `UNEXPECTED`), and `FetchRepository.toElectionError` is the inverse of `ElectionsController.toErrorResponse`. So nothing HTTP-specific reaches the GUI.
- **Mutations as `clientAction`s** rather than entity calls in components: components are views, and route modules are the driving adapters. A save costs a GET (recreating the entity), the mutation, and a GET (revalidation); the time zones are cached.
- **CSP nonces:** Play's CSP allows React Router's inline scripts via per-request nonces. The alternatives were rejected: hashes change with every build, `'unsafe-inline'` weakens the CSP, and moving the scripts into files at build time would depend on React Router's output format.
- **Query strings are built with `URLSearchParams`:** a raw `+` would arrive at Play as a space.

#### Gotchas

- **The capability token is the URL's fragment:**
  - React Router strips the fragment from loader and action requests.
  - During client-side navigations, `window.location` is still the previous URL.
  - So `Election.tsx`'s loader reads `window.location.hash` and returns the token it used, and `useTokenRevalidation` revalidates whenever the location's token differs. This covers stale navigations as well as fragment-only changes, which React Router ignores.
- **Build-time pre-rendering in Node:** route modules are also evaluated in Node. So they must not import Bootstrap's JavaScript statically, as it touches `document`: `entry.client.tsx` loads it, and components use `import("bootstrap")` in effects and handlers.
- **Values that Play injects into `index.html`** (`lang`, CSRF token) must be rendered from `document` in the browser (`replacedByPlay` in `root.tsx`). Otherwise React 19 adds a second `<meta>` while hydrating.
- **Pre-rendering in Docker:** `react-router build` pre-renders via a Vite preview server. In `node:24` containers, `localhost` resolves to `::1`, whereas the pre-render requests `127.0.0.1`; hence `preview.host: '127.0.0.1'` in `vite.config.ts`. CI's Test workflow doesn't run `npm run build`, so verify build-related changes with `docker build --target react .`.
- **npm:** `react-router typegen` installs `isbot` on its own if it's missing. Don't run the dev server while packages might get installed; on Windows, file locks once gutted `node_modules`.
- **Props logging:** route components that log `JSON.stringify(props)` receive React Router's route props (`loaderData`, `matches`, …). Watch out for circular values (e.g., React elements created during render).
- **Vite's first load:** a freshly started dev server may answer the first page load with "504 Outdated Optimize Dep" while Vite re-bundles dependencies; reload.

## API Routes

REST API at `/iapi/*`:
- `POST /iapi/elections` - Create election
- `GET /iapi/elections/:id` - Get election
- `PUT /iapi/elections/:id/text` - Update text
- `PUT /iapi/elections/:id/nominees` - Update nominees
- `PUT /iapi/elections/:id/visibility` - Update visibility
- `PATCH /iapi/elections/:id/subscriptions` - Update subscriptions
- `POST /iapi/elections/:id/reminders` - Send links reminder
- `DELETE /iapi/elections/:id` - Delete election
- `POST /iapi/elections/:id/votes` - Cast vote
- `DELETE /iapi/elections/:id/votes` - Revoke vote
- `GET /iapi/l10nMessages` - Localization strings
- `GET /iapi/timeZones` - Time zones
- `GET /iapi/validations/*` - Validate email, phone, URL

## Environment Variables

Required for full functionality:
- `APPLICATION_SECRET` - Play framework secret
- `MONGODB_URI`, `MONGODB_DB` - Database connection
- `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `MAILJET_SENDER` - Email
- `MAILJET_SMS_TOKEN` - SMS via Mailjet
- `THREEMA_ID`, `THREEMA_SECRET` - SMS via Threema

## Key Files

- `beapi/conf/application.conf` - Main config, DI bindings, security settings (incl. the CSP)
- `beapi/app/Module.scala` - Guice module loading implementations from config
- `beapi/app/controllers/gui/ReactController.scala` - Serves fegui's pre-rendered index.html (placeholders, CSP nonces) and assets
- `beapi/test/DependencyRulesTestSuite.scala` - ArchUnit architecture tests (app)
- `beapi/hexagon/src/test/scala/DependencyRulesTestSuite.scala` - ArchUnit architecture tests (hexagon)
- `fegui/vite.config.ts` - Vite config (React Router plugin, /iapi proxy, /fegui/ base for builds, preview host for pre-rendering)
- `fegui/react-router.config.ts` - React Router framework mode config (SPA)
- `fegui/app/routes.ts` - Frontend route config
- `fegui/app/entry.client.tsx` - Frontend composition root

## Testing

Backend tests validate architectural constraints. Run `sbt test` before committing changes that touch the backend structure.

fegui has no test suite yet:
- **Every change:** run `npm run typecheck` and `npm run build`.
- **Build-related changes:** also run `docker build --target react .`.
- **Browser checks** against the dev server, and for CSP- or CSRF-related changes against a Play-served build (see Production-like Local Check):
  - create an election and switch all five tabs
  - save texts, dates, subscriptions, and visibility
  - cast and revoke a vote, and send a reminder
  - open the voters' link, and switch tokens via the URL's fragment
  - a bad token shows Forbidden, and a deleted election shows Not Found
  - the `/legalese` redirect, the locale switch, dark mode, and deep-link reloads
