# fegui: frontend hexagon as a subproject + retrofit to React Router v8 framework mode

> **Status (2026-09-15):** Stage 1 done and staged (not yet committed), except dependency-cruiser, which waits for TypeScript 7.1 (see Stage 1). Next step: Stage 2.

## Context

Paul asked two related questions about `fegui`:

1. Can the frontend hexagon be a real subproject, like `beapi/hexagon` is an sbt subproject (`beapi/build.sbt:14-19`)?
2. How much work would it be to move from the Create React App leftovers (Vite + `react-router-dom` v7 in library mode) to an elegant **React Router v8 framework-mode** project? v8.3.1 is current (released June 2026). v8 removes `react-router-dom` and makes middleware the default.

The two are related. Framework mode's `app/` directory next to a `hexagon/` workspace package would match `beapi/app` + `beapi/hexagon` one to one. That is a nice parallel for the textbook.

### Current state (from exploration, before Stage 1)

- **The hexagon exists only as folders.** Nothing enforces the boundary: `src/entities`, `src/value_objects`, `src/driving_ports`, `src/driven_ports`, and the services `src/Factory.ts` and `src/AntiFactory.ts`.
- **Some code bypasses the ports:**
  - `components/Election.tsx` calls `fetchResource` directly for `/iapi/timeZones` and `/iapi/elections/:id/reminders`, and imports the adapter's `HttpError`.
  - `I18nApp.tsx` (`/iapi/l10nMessages`) and `useInputValidation.tsx` (`/iapi/validations/*`) also call `fetchResource` directly.
- **Routing is library mode:**
  - `src/index.tsx` uses `<BrowserRouter><Routes>`.
  - The dependency container is made of React contexts (`factoryContext.ts`, `antiFactoryContext.ts`).
  - `Election.tsx` fetches in `useEffect` and hand-rolls 403/404/410 handling.
  - `Election.tsx` renders `<ElectionTabs>` 5 times with identical props.
- **The Play integration depends on:**
  - `ReactController.scala` reads `public/build/index.html` and replaces the `REPLACE_CSRF_TOKEN` / `REPLACE_LANG` placeholders.
  - Assets are served at `/fegui/*` (`conf/routes:30`) through Vite's `experimental.renderBuiltUrl`.
  - `Dockerfile:36` copies `/squeng/twotle/build` into `public/build`.
- **Tooling baseline already meets v8's requirements:** Vite 8, TS 7, React 19.3, Node 24. `@react-router/dev@8.3.1` peer deps allow `vite ^7||^8` and `typescript ^5.1||^6||^7`.

## Answers in short

**Q1: Yes.**
- **Setup:** use npm workspaces. `fegui/hexagon` becomes its own package (`@twotle/hexagon`) with its own `package.json` and its own `tsconfig.json`, referenced from `fegui/tsconfig.json`.
  - It has no `react`, `react-router`, or `bootstrap` dependencies.
  - Its `lib` has no `DOM` and its `types` are empty, so `document` and `fetch` do not type-check inside it.
  - `fegui` uses it via `"@twotle/hexagon": "*"`.
  - Vite consumes the TypeScript source directly (`exports` → `src/index.ts`), so there is no separate build step.
- **Caveat, npm hoisting:** unlike sbt, hoisting means `import React from "react"` inside the hexagon still *resolves* (confirmed in Stage 1). Enforcement therefore needs a rule checker. **dependency-cruiser** is the closest thing to ArchUnit, but it can't parse TypeScript 7.0 yet (see Stage 1).

**Q2: Moderate. Roughly 4–5 focused days**, done in three stages that can each be merged separately:

| Stage | Effort |
|---|---|
| 1. Hexagon workspace | ~½–1 day |
| 2. Framework mode, same behaviour | ~1 day |
| 3. Idiomatic data APIs | ~2–3 days |

Stage 2 alone already removes the patchwork. Stage 3 is what makes it "elegant".

## Recommended approach

### Stage 1: Hexagon as a workspace package (done 2026-09-15, except enforcement)

**Paul scaffolded:**
- `fegui/hexagon/package.json` (`@twotle/hexagon`, `exports` → `./src/index.ts`)
- `fegui/hexagon/tsconfig.json` (`lib: ["ESNext"]`, `types: []`, `noEmit`)
- `"workspaces": ["hexagon"]` and `"@twotle/hexagon": "*"` in `fegui/package.json`, plus a reference in `fegui/tsconfig.json`

**Claude then:**
1. **Moved the domain code** into `hexagon/src/…` with `git mv`:
   - `entities/ElectionEntity.ts`
   - `value_objects/*`
   - `driving_ports/*`
   - `driven_ports/Repository.ts`
   - `driving_adapters/` ← `Factory.ts`, `AntiFactory.ts`. This mirrors `beapi/hexagon/.../domain/driving_adapters/ElectionsService.scala`; the earlier `services/` name came from an outdated CLAUDE.md tree.
   - Barrel file `hexagon/src/index.ts`.
2. **Closed the port leaks the way `beapi` does it** (Paul's decision):
   - **Reminders go through the hexagon:** `Repository.postReminder` plus `ElectionEntity.sendLinksReminder`, named after `beapi`'s `Elections.sendLinksReminder`.
   - **Localizations, time zones and validations stay outside the hexagon**, like `beapi`'s `I18nController`/`ValidationsController`. The new adapter `src/fetchLookups.ts` serves them, and `I18nApp`, `Election` and `useInputValidation` use it instead of `fetchResource`.
   - **`HttpError` is gone.** `hexagon/src/value_objects/ElectionError.ts` has an `ElectionErrorReason` that mirrors `beapi`'s `Error` enum, plus `UNEXPECTED`. `FetchRepository.toElectionError` is the inverse of `ElectionsController.toErrorResponse`.
3. **Rewrote imports** in `src/components/*`, `src/props/*`, the contexts and `src/index.tsx` to `@twotle/hexagon`.
4. **Enforcement: deferred until TypeScript 7.1** (Paul's decision).
   - **Why:** TS 7.0's npm package has no compiler JS API, which dependency-cruiser needs to parse TypeScript. Its `swc` fallback is deprecated and aborts on the first `.tsx` file containing JSX. `typescript@7.1` is expected to bring the API back.
   - **Until then only the hexagon's tsconfig guards it.** A probe using `document` failed to compile, but `import React from "react"` compiled.
   - **When TS 7.1 lands**, add:
     - the `dependency-cruiser` dev dependency
     - `.dependency-cruiser.cjs`, with rules mirroring both `DependencyRulesTestSuite.scala` files. For example: the hexagon depends on nothing outside itself; only `FetchRepository`/`fetchLookups` use `fetchJson`; only `src/index.tsx` depends on `FetchRepository`.
     - an `npm run lint:arch` script and a matching step in `.github/workflows/test.yml`
5. **Updated build files:**
   - The `Dockerfile` react stage copies `hexagon/package.json` before `npm ci`, and `hexagon/src` + `hexagon/tsconfig.json` before the build.
   - The Sonar `sources` in `scan.yml` include `fegui/hexagon/src/`.

**Small behaviour changes:**
- Election errors other than 403/404/410 now show the reason name instead of the status code, e.g. `ProtectedAccess` instead of `409`, `Unexpected` instead of `500`.
- Reminders use the entity's `organizerToken` instead of the URL token. These are identical for organizers, and the Links tab is organizer-only.

**Verified:**
- `npm run typecheck`
- `vite build`
- the hexagon boundary probe
- no leftover imports of the old paths, and `fetchJson` used only by the two fetch adapters

**Not verified yet:**
- the Docker build (no Docker daemon was running)
- the browser smoke test (see Verification)

### Stage 2: React Router v8 framework mode, SPA (`ssr: false`), same behaviour

1. **Dependencies:**
   - Remove `react-router-dom` and `@vitejs/plugin-react`.
   - Add `react-router@^8`, plus `@react-router/dev@^8` as a dev dependency.
2. **`vite.config.ts`:**
   - `plugins: [reactRouter()]`
   - Keep the `/iapi` proxy.
   - Replace `experimental.renderBuiltUrl` with `base: "/fegui/"`.
   - Keep `assetsDir: "vrassets"` if still wanted.
3. **New `react-router.config.ts`:** `{ ssr: false }` (builds to `build/client/index.html`).
4. **Rename `src/` → `app/`** (framework convention, and matches `beapi/app`).
5. **New `app/root.tsx`**, built from `index.html` + `index.tsx` + `App.tsx`:
   - `Layout` carries the `<html lang="REPLACE_LANG" data-bs-theme>`, the csrf `<meta>`, the rybbit script and the favicons, with `<Meta/><Links/><Scripts/><ScrollRestoration/>`.
   - Put `suppressHydrationWarning` on `<html>` and the csrf `<meta>`, because Play rewrites those placeholders after the build-time prerender.
   - Global CSS imports.
   - The default export is the current `App` shell (navbar/footer/cookie modal + `<Outlet/>`).
   - `HydrateFallback` shows a spinner.
   - `ErrorBoundary` replaces the ad-hoc not-found handling.
   - Delete `index.html`, `index.tsx`, `App.tsx`, and `react-app-env.d.ts` (replaced by the `+types` typegen).
6. **New `app/routes.ts`**, config-based rather than file-based. It deliberately reads like Play's `conf/routes`:
   - `layout("root")`
   - `index("routes/abode.tsx")`
   - `route("elections/:election", "routes/election.tsx", [index(...), route("texts", ...), route("dats", ...), route("links", ...), route("tally", ...), route("settings", ...)])`
   - `legalese/*`, `prices`, `*`
   - This collapses the 5 duplicated `<Route>`s in `Election.tsx` into one layout route whose children render `ElectionTabs` with the active tab derived from the route.
7. **Imports:** `react-router-dom` → `react-router` everywhere (`App`, `Abode`, `Election`, `ElectionTabs`, `ElectionLinks`, `NotFound`).
8. **Scripts:**
   - `start: react-router dev`
   - `build: react-router build`
   - `typecheck: react-router typegen && tsc -b`
   - Add `.react-router/` to `tsconfig.app.json` `include`/`rootDirs` and to `.gitignore`.
9. **Backend/deploy:**
   - `ReactController.scala:47` → `public/build/client/index.html`, or keep `public/build` and change `Dockerfile:36` to `COPY --from=react /squeng/twotle/build/client ./public/build` (preferred: no Scala change).
   - `robots.txt`/`browserconfig.xml` routes stay valid.
   - Update the `CLAUDE.md` dev commands.

### Stage 3: Idiomatic data layer (the "elegant" part)

1. **Composition root (the `Module.scala` analogue):** a new `app/entry.client.tsx` builds `FetchRepository`/`Factory`/`AntiFactory` once. It seeds them with `getContext()` → `RouterContextProvider` + `createContext<ElectionFactory>()` etc. This replaces `factoryContext.ts` and `antiFactoryContext.ts`.
2. **Localizations:** a root `clientLoader` fetches them via `fetchLookups.getLocalizations`. `useRouteLoaderData("root")` or a small `useL10n()` hook replaces `I18nApp.tsx` and `l10nContext`.
3. **Election loading:**
   - `routes/election.tsx` gets a `clientLoader` that calls `context.get(factory).recreateElection(...)` and throws `data(null, { status })` on `ElectionError`s.
   - A route `ErrorBoundary` renders Forbidden/Not Found/Gone.
   - Child tabs read the election via `useRouteLoaderData`.
   - Entity mutations (`updateElectionText`, `castVote`, …) run as `clientAction`s or imperatively followed by `useRevalidator()`. This removes the `onElectionChanged` prop drilling and much of `props/*`.
4. **Other routes:** `Abode` creates the election via a `clientAction` + `redirect(...)`. `legalese` → `redirect("/legalese/im")` in a `clientLoader`.

## Risks / things to check during implementation

- **Capability token lives in the URL fragment** (`#token`). A `clientLoader`'s `request.url` likely excludes the fragment. Read `window.location.hash` inside the loader instead, and check that hash-only navigations between organizer/voter links revalidate (add `shouldRevalidate` if not).
- **Build-time prerender imports route modules in Node.** `import { Modal } from "bootstrap"` in `root`/`Abode` may touch `window`/`document`. If so, switch to a dynamic `import("bootstrap")` inside effects/handlers.
- **`base: "/fegui/"` vs. router `basename: "/"`:** confirm that asset URLs in the prerendered `index.html` resolve under `/fegui/` and that the Play `/*reactRoute` fallback still wins for app URLs.
- **Workspace hoisting:** until dependency-cruiser runs, nothing stops the hexagon from importing React.
- **Pre-existing, unchanged in Stage 1:** `fetchLookups` doesn't URL-encode the values it validates, so a `+` in a phone number or e-mail address arrives at Play as a space.

## Critical files

- **fegui:**
  - `package.json`, `vite.config.ts`, `tsconfig*.json`
  - `index.html`, `src/index.tsx`, `src/App.tsx`, `src/I18nApp.tsx`
  - `src/components/Election.tsx`, `src/components/ElectionTabs.tsx`, `src/components/Abode.tsx`
  - `src/FetchRepository.ts`, `src/fetchLookups.ts`, `src/useInputValidation.tsx`
  - `hexagon/src/**`
- **New fegui files:** `app/root.tsx`, `app/routes.ts`, `app/entry.client.tsx`, `react-router.config.ts`, `.dependency-cruiser.cjs` (once TS 7.1 is out)
- **Elsewhere:**
  - `Dockerfile`, `.github/workflows/test.yml`, `.github/workflows/scan.yml`
  - `beapi/app/controllers/gui/ReactController.scala` (only if the build path isn't remapped in the Dockerfile)
  - `CLAUDE.md`

## Verification (per stage)

1. **`cd fegui && npm ci && npm run typecheck`**, plus `npm run lint:arch` once dependency-cruiser is in.
   - As a negative test, temporarily add `import React from "react"` to a hexagon file and confirm dependency-cruiser fails.
2. **`npm run build`**, then check the build output:
   - `build/client/index.html` still contains `REPLACE_CSRF_TOKEN` and `REPLACE_LANG`.
   - Asset URLs start with `/fegui/`.
3. **Dev loop:**
   - `cd beapi && sbt "run -Dconfig.file=conf/insecureLocalhost.conf"` plus `cd fegui && npm start`.
   - Smoke test in the browser (via the `run` skill / Chrome):
     - create an election
     - land on `texts?brandNew=true#token`
     - switch all 5 tabs
     - edit texts/dates
     - cast and revoke a vote
     - open the voter link (tabs hidden)
     - use a bad token → Forbidden; deleted election → Not Found/Gone
     - switch the locale de/en and toggle dark mode
     - reload deep links
     - check `/legalese` redirect, `/prices`, and an unknown path
4. **Production-like:** `docker build .` and run it. Hit a deep link such as `/elections/<id>/tally#<token>` directly so the Play-served `index.html` and `/fegui/` assets are exercised with a real CSRF token (POST/PUT succeed).
5. **Backend:** `cd beapi && sbt test` (ArchUnit) if `ReactController` changed.
6. **Git:** stage after each stage and stop before committing, so Paul can review.
