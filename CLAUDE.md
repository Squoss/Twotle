# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository. This file was created by Claude Code (/init) and amended with hints taken from [Claude Code: The Complete Guide](https://www.linkedin.com/posts/david-ramsey-9b8231108_claudecode-iwroteabook-humblebrag-activity-7368664132440485889-vDlm).

## Project Overview

Twotle is a web application inspired by doodle.com and meant as a teaching aid for a textbook. It consists of two subprojects, beapi (short for backend/API) implemented in Scala with Play and fegui (short for frontend/GUI) implemented in TypeScript with React.

## Tech Stack

- Backend: Play with Scala
- Frontend: React with TypeScript
- DBMS: MongoDB
- Auth: Capability URLs (https://www.w3.org/TR/capability-urls/)

## Weird Stuff You Should Know

- For teaching purposes, the backend (which used to feature an API only) is going to feature GUI parts implemented in Play's Twirl both with and without htmx.

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
npm run start    # Start Vite dev server on port 5173 (proxies /iapi to localhost:9000)
```

### Development Workflow
Run both servers simultaneously:
1. Terminal 1: `cd beapi && sbt run`
2. Terminal 2: `cd fegui && npm start`

The Vite dev server proxies `/iapi/*` requests to the Play backend.

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
│       ├── services/         # ElectionsService
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

React SPA with React Router.

Internationalization/Localization (cf. `l10nContext.tsx`) is based on the backend (i.e., on Play's i18n/l10n support).

Organized along the lines of the Ports & Adapters pattern (Hexagonal architecture).

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
- `fegui/vite.config.ts` - Vite config with proxy setup

## Testing

Backend tests validate architectural constraints. Run `sbt test` before committing changes that touch the backend structure.
