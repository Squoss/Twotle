# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. This file was created by Claude Code (/init) and amended with hints taken from [Claude Code: The Complete Guide](https://www.linkedin.com/posts/david-ramsey-9b8231108_claudecode-iwroteabook-humblebrag-activity-7368664132440485889-vDlm).

## Project Overview

Twotle is a web application inspired by doodle.com and meant as a teaching aid for a textbook. It consists of two subprojects, beapi (short for backend/API) implemented in Scala with Play and fegui (short for frontend/GUI) implemented in TypeScript with React.

## Tech Stack

- Backend: Play with Scala
- Frontend: React with TypeScript
- DBMS: MongoDB
- Auth: Capability URLs (https://www.w3.org/TR/capability-urls/)

## Work in Progress

- Retrofitting fegui as a React Router v8 framework-mode SPA with its hexagon as an npm workspace package (`fegui/hexagon`). As of 2026-09-17, Stage 1 (the hexagon package; dependency-cruiser waits for TypeScript 7.1) and Stage 2 (framework mode) are done; Stage 3 (idiomatic data APIs) is done as well: localizations and elections via `clientLoader`s, mutations via `clientAction`s and fetchers, and the composition root via `getContext`. See [PLAN.md](PLAN.md) for the staged plan, decisions, risks, and verification steps.

## Conventions

- Always run tests before committing

## Development Commands

### Backend (beapi/)
```bash
cd beapi
sbt                                                                         # Start sbt in interactive mode
run -Dconfig.file=conf/insecureLocalhost.conf                               # Start Play dev server on port 9000 with mock implementations of database, e-mail, and SMS
run -Dconfig.file=conf/insecureLocalhost.conf -Ddi.db=mongodb.MdbRepository # Start Play dev server on port 9000 with local MongoDB database (mongodb://localhost:27017/twotle) and mock implementations of e-mail and SMS
test                                                                        # Run tests (includes ArchUnit dependency rules)
 ```

### Frontend (fegui/)
```bash
cd fegui
npm start           # Start the React Router (Vite) dev server on port 5173 (proxies /iapi to localhost:9000)
npm run typecheck   # Generate route types (.react-router/) and type-check the app and the hexagon
npm run build       # Pre-render the SPA into build/client (Play serves its index.html and, under /fegui/, its assets)
```

### Development Workflow
Run both servers simultaneously:
1. Terminal 1: `cd beapi && sbt run`
2. Terminal 2: `cd fegui && npm start`

The dev server proxies `/iapi/*` requests to the Play backend.

## Architecture

### Backend

#### Hexagonal Architecture (Ports & Adapters Pattern)

The backend follows strict hexagonal architecture with dependency rules enforced by ArchUnit tests.

```
beapi/
├── app/
│   ├── api/                  # REST controllers (driving adapters)
│   ├── gui/                  # UI controllers (Twirl templates, React serving)
│   ├── mongodb/              # Database adapter (driven adapter)
│   ├── thirdparty_services/  # Email/SMS adapters (Mailjet, Threema)
│   ├── dev/                  # Mock implementations for development
│   ├── filters/              # HTTP filters
│   └── Module.scala          # Guice dependency injection
├── hexagon/                  # Domain core (independent subproject)
│   └── src/main/scala/domain/
│       ├── driving_ports/    # Input interfaces (Elections, Factory)
│       ├── driven_ports/     # Output interfaces
│       │   ├── persistence/  # Repository, Events
│       │   └── notifications/# Email, Sms
│       ├── entities/         # ElectionEntity
│       ├── driving_adapters/ # ElectionsService
│       └── value_objects/    # Id, AccessToken, EmailAddress, Vote, etc.
└── conf/
    ├── routes                # Play routing
    └── application.conf      # Config with DI bindings
```

#### Dependency Rules

The following rules are enforced by `sbt test`:
- API controllers only depend on driving ports and value objects
- Nothing outside the router depends on API controllers
- MongoDB adapter only depends on persistence interfaces
- Third-party services only depend on notification interfaces
- Dev implementations are isolated (only Module can reference them)
- Filters are self-contained

### Frontend

React SPA built with React Router v8 in framework mode (`ssr: false`, cf. `react-router.config.ts`). `app/routes.ts` maps URLs to route modules (cf. beapi's `conf/routes`), and `app/root.tsx` renders the HTML document. The build pre-renders `build/client/index.html`, which Play serves for all non-API paths after replacing its `REPLACE_LANG` and `REPLACE_CSRF_TOKEN` placeholders and adding the request's CSP nonce to its inline scripts (cf. `ReactController` and `script-src` in `application.conf`); the assets are served under `/fegui/`.

Internationalization/Localization is based on the backend (i.e., on Play's i18n/l10n support): the root route's `clientLoader` fetches the messages once, and components read them via `useLocalizations()` (cf. `app/localizations.ts`).

Organized along the lines of the Ports & Adapters pattern (Hexagonal architecture), mirroring the backend:

```
fegui/
├── app/
│   ├── root.tsx              # HTML document (Layout) and the localizations' clientLoader
│   ├── routes.ts             # Route config (cf. beapi's conf/routes)
│   ├── entry.client.tsx      # Browser entry and composition root (wires FetchRepository into Factory/AntiFactory for route modules via getContext, cf. context.ts); loads Bootstrap's JavaScript (route modules must not import it statically, as they're also evaluated in Node)
│   ├── App.tsx               # App shell (navbar, footer, cookie consent) around the routes' <Outlet />
│   ├── components/, props/   # React GUI (driving adapters); most components double as route modules
│   ├── routes/               # Thin route modules where routing needs glue (redirects, the election tabs and their clientAction)
│   ├── FetchRepository.ts    # REST adapter for the Repository port (driven adapter)
│   ├── fetchLookups.ts       # Localizations, time zones, validations (bypass the hexagon, like beapi's I18nController/ValidationsController)
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

Import the hexagon via `@twotle/hexagon` (the `hexagon/src/index.ts` barrel), never via relative paths. Nothing enforces the frontend dependency rules yet (dependency-cruiser waits for TypeScript 7.1); `npm run typecheck` only keeps DOM APIs out of the hexagon.

## API Routes

REST API at `/iapi/*`:
- `POST /iapi/elections` - Create election
- `GET /iapi/elections/:id` - Get election
- `PUT /iapi/elections/:id/text` - Update text
- `PUT /iapi/elections/:id/nominees` - Update nominees
- `POST /iapi/elections/:id/votes` - Cast vote
- `GET /iapi/l10nMessages` - Localization strings
- `GET /iapi/validations/*` - Validate email, phone, URL

## Environment Variables

Required for full functionality:
- `APPLICATION_SECRET` - Play framework secret
- `MONGODB_URI`, `MONGODB_DB` - Database connection
- `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `MAILJET_SENDER` - Email
- `MAILJET_SMS_TOKEN` - SMS via Mailjet
- `THREEMA_ID`, `THREEMA_SECRET` - SMS via Threema

## Key Files

- `beapi/conf/application.conf` - Main config, DI bindings, security settings
- `beapi/app/Module.scala` - Guice module loading implementations from config
- `beapi/test/DependencyRulesTestSuite.scala` - ArchUnit architecture tests
- `fegui/vite.config.ts` - Vite config (React Router plugin, /iapi proxy, /fegui/ base for builds)
- `fegui/react-router.config.ts` - React Router framework mode config (SPA)
- `fegui/app/routes.ts` - Frontend route config

## Testing

Backend tests validate architectural constraints. Run `sbt test` before committing changes that touch the backend structure.
