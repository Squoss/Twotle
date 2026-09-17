# fegui: frontend hexagon as a subproject + retrofit to React Router v8 framework mode

> **Status (2026-09-17):** Stage 1 committed (`31e3c18`), except dependency-cruiser, which waits for TypeScript 7.1. Stage 2 committed (`0906bf5`). Next step: Stage 3.

## Context

Paul asked two related questions about `fegui`:

1. Can the frontend hexagon be a real subproject, like `beapi/hexagon` is an sbt subproject (`beapi/build.sbt:14-19`)?
2. How much work would it be to move from the Create React App leftovers (Vite + `react-router-dom` v7 in library mode) to an elegant **React Router v8 framework-mode** project? v8.3.1 was current when planned (released June 2026); Stage 2 used 8.4.0. v8 removes `react-router-dom` and makes middleware the default.

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
   - **Why:** TS 7.0's npm package has no compiler JS API, which dependency-cruiser needs to parse TypeScript. Its `swc` fallback is deprecated and aborts on the first `.tsx` file containing JSX. `typescript@7.1` is expected to bring the API back (still only a `next` dev build as of 2026-09-15).
   - **Until then only the hexagon's tsconfig guards it.** A probe using `document` failed to compile, but `import React from "react"` compiled.
   - **When TS 7.1 lands**, add:
     - the `dependency-cruiser` dev dependency
     - `.dependency-cruiser.cjs`, with rules mirroring both `DependencyRulesTestSuite.scala` files. For example: the hexagon depends on nothing outside itself; only `FetchRepository`/`fetchLookups` use `fetchJson`; only `app/root.tsx` depends on `FetchRepository`.
     - an `npm run lint:arch` script and a matching step in `.github/workflows/test.yml`
5. **Updated build files:**
   - The `Dockerfile` react stage copies `hexagon/package.json` before `npm ci`, and `hexagon/src` + `hexagon/tsconfig.json` before the build.
   - The Sonar `sources` in `scan.yml` include `fegui/hexagon/src/`.

**Small behaviour changes:**
- Election errors other than 403/404/410 now show the reason name instead of the status code, e.g. `ProtectedAccess` instead of `409`, `Unexpected` instead of `500`.
- Reminders use the entity's `organizerToken` instead of the URL token. These are identical for organizers, and the Links tab is organizer-only.

**Follow-up (`6e3c6d8`):** all query strings in fegui are built with `URLSearchParams`, so a `+` no longer arrives at Play as a space.

**Verified:** `npm run typecheck`, `vite build`, the hexagon boundary probe, and a browser smoke test against the dev servers.

### Stage 2: React Router v8 framework mode, SPA (`ssr: false`), same behaviour (done 2026-09-15)

Built on React Router **8.4.0**.

1. **Dependencies:**
   - `react-router-dom` and `@vitejs/plugin-react` are gone. `react-router@^8.4.0` and `@react-router/dev@^8.4.0` are in; the latter brings `@react-router/node` and React Refresh.
   - `isbot@^5` is in as well. React Router's default server entry, which the build-time pre-render uses, needs it; `react-router typegen` added it on its own.
   - `package.json` has `"type": "module"`, and the unused CRA leftovers `eslintConfig` and `browserslist` are gone.
   - The lockfile changed only by the router swap, the dev tooling, and `isbot`.
2. **`vite.config.ts`:**
   - `plugins: [reactRouter()]`
   - `base: "/fegui/"` for `build` only; the dev server stays at `/`, and the router's `basename` stays `/`.
   - `assetsDir: "vrassets"` kept, `/iapi` proxy kept, `experimental.renderBuiltUrl` removed.
3. **New `react-router.config.ts`:** `{ ssr: false }`. The build writes `build/client/index.html` in SPA mode, with route discovery `initial`, so no `/__manifest` requests hit Play.
4. **Renamed `src/` → `app/`** with `git mv`.
5. **New `app/root.tsx`**, built from `index.html` and `index.tsx`:
   - `Layout` carries `<html lang="REPLACE_LANG" data-bs-theme id="rootElement">`, the csrf `<meta>`, the favicons and `<Meta/><Links/><Scripts/><ScrollRestoration/>`.
     - `suppressHydrationWarning` sits on `<html>` and the csrf `<meta>`, because Play rewrites those placeholders.
     - The Rybbit script is now `async` rather than `defer`, so that React 19 treats it as a resource instead of warning about a script tag.
   - The default export is the composition root: the two contexts and `I18nApp` around the existing `App.tsx` shell. **Deviation:** `App.tsx` stays a separate file instead of merging into `root.tsx`.
   - `HydrateFallback` is a spinner, pre-rendered into `index.html`; `ErrorBoundary` is a minimal alert.
   - Deleted: `index.html`, `src/index.tsx`, `src/react-app-env.d.ts`.
6. **New `app/entry.client.tsx`:** `hydrateRoot` + `<HydratedRouter/>`, plus `import "bootstrap"`.
   - **Why:** Bootstrap's JavaScript touches `document` as soon as it's loaded, and route modules are also evaluated in Node for the pre-render.
   - `App`, `Abode` and `ElectionSettings` therefore get `Modal` via `import("bootstrap")` in effects and handlers.
7. **New `app/routes.ts`**, config-based (cf. Play's `conf/routes`):
   - **Self-contained components are route modules directly:** `Abode`, `Election`, `Masthead`, `PrivacyPolicy`, `ToDo`, `Prices`, `NotFound` (the latter twice, once with the id `election-not-found`).
   - **Thin route modules in `app/routes/`** where routing needs glue:
     - `ElectionIndex` (the brand-new/tally redirect) and `Legalese` (the redirect to `/legalese/im`).
     - `ElectionTab`: one module reused by the five tab routes via the ids `election-texts` … `election-settings`, which it maps to `ACTIVE_TAB`.
   - `Election` renders `<Outlet context>` instead of nested `<Routes>`. Its type is `ElectionOutletContext = Omit<ElectionTabsProps, "activeTab">`.
8. **Imports:** `react-router-dom` → `react-router` everywhere.
9. **Scripts and TypeScript:**
   - `start: react-router dev`, `build: react-router typegen && tsc -b && react-router build`, `typecheck: react-router typegen && tsc -b`
   - `tsconfig.app.json` includes `app` + `.react-router/types/**/*`, with `rootDirs` and `types: ["vite/client"]`. v8 has no `@react-router/dev/types`. `root.tsx` uses the generated `./+types/root`.
   - `tsconfig.node.json` includes `react-router.config.ts`; `.gitignore` and `.dockerignore` ignore `.react-router`.
10. **Backend/deploy:**
    - The `Dockerfile` copies `app/` and `react-router.config.ts` (no `index.html`) and `build/client` into `public/build`.
    - The Sonar `sources` point at `fegui/app/`.
    - **CSP nonces (Paul's decision):**
      - **The problem:** Play's CSP (`script-src 'self' https://app.rybbit.io/`) blocked the four inline scripts in React Router's pre-rendered `index.html`: the router context, the module script importing the manifest and `entry.client`, and two stream scripts. So the Play-served app never started.
      - **Why only the production-like check caught it:** the dev server doesn't send Play's CSP.
      - **The fix:** `application.conf` adds `${play.filters.csp.nonce.pattern}` to `script-src` (Play 3.0.11 generates nonces by default), and `ReactController.guiRoute` adds the request's `CSPNonce` to every `<script` in `index.html`.
      - **Rejected alternatives:** script hashes change with every build; `'unsafe-inline'` weakens the CSP; moving the inline scripts into files at build time would depend on React Router's output format.

**Fixes found along the way:**
- **`I18nApp` crashed on every page:** it logs `JSON.stringify(props)`, and its `children` is now created inside `Root`'s render, which React 19's dev build makes circular. It now leaves `children` out.
- **Encoding slip-through:** `App.tsx`'s language links re-inserted decoded query values unencoded, which `6e3c6d8` had missed.
- **Duplicate csrf-token `<meta>` under Play:**
  - **The problem:** React 19 doesn't patch a `<meta>` whose `content` differs from the server HTML. It added a second one with the placeholder; the real one only happened to come first.
  - **The fix:** `Layout` now renders the values Play filled in, read from `document` in the browser and left as placeholders during the pre-render. `suppressHydrationWarning` is gone as well.

**Gotchas:**
- **Install order:** `npm install` with the new `package.json` and the old lock fails with ERESOLVE; `npm uninstall react-router-dom @vitejs/plugin-react` first, then install.
- **No concurrent dev server:** don't run a dev server while `react-router typegen`/`npm install` might install something; Windows file locks gutted `node_modules` once.
- **Docker pre-render (broke GHCR delivery and Clever Cloud deployment of `0906bf5`):**
  - **Cause:** `react-router build` pre-renders via a Vite preview server bound to `localhost`. In the `node:24` image that resolves to `::1`, but the pre-render requests `127.0.0.1`, so the build failed with `ECONNREFUSED`.
  - **Why CI missed it:** the Test workflow never runs `npm run build`.
  - **Fix:** `preview.host: '127.0.0.1'` in `vite.config.ts`.

**Verified:**
- **`npm run typecheck` and `npm run build`:**
  - `index.html` keeps both placeholders and the pre-rendered spinner.
  - All assets are under `/fegui/vrassets/`, with `basename` `/` and route discovery `initial`.
- **Dev server** (`react-router dev` + Play with mocks):
  - The browser smoke test passes 14 of 15; the one failure is a flaw in the test itself.
  - The encoding check passes 5 of 5.
  - The integration check passes 13 of 13: cookie modal and language dropdown, POST/PUT with the CSRF header, client-side navigation across all five tabs, a deep-link reload, the legalese redirect, and no hydration warnings. It passed 13 of 13 again after the csrf-token fix.
- **Play-served production build** (copied into `beapi/public/build` before starting Play, restored afterwards):
  - **CSP:** the CSP header's nonce matches the nonce on all five `<script>` tags, with no CSP violations.
  - **CSRF:** after hydration there is exactly one csrf-token `<meta>` and a real `lang`, and the real token is sent with POST.
  - **Integration check:** 13 of 13.
- **Backend:** `sbt test` passes (27 + 9 tests).
- **`npm run serve` (`vite preview`): removed.** It answered every path, assets under `/fegui/vrassets/` included, with `index.html`. Only Play splits assets (under `/fegui/`) from app routes, so a production-like check needs Play (see Verification 4).

**Docker build:** with the pre-render fix, `docker build .` succeeds locally (Docker Desktop), including the frontend pre-render and `sbt stage`. The container itself wasn't run.

**Pre-existing backend issue, fixed after Stage 2:**
- **The problem:** `ReactController` read `index.html` via `getResourceAsStream` without closing the stream. On Windows that kept `target/web/.../build/index.html` locked, so Play dev reloads failed with `AccessDeniedException` once `public/build` changed.
- **The fix:** it now reads the file with `Using.resource(Source.fromResource(…))`.
- **Verified on Windows:** after `ReactController` had read `index.html`, sbt-web replaced the file in `target/web` while Play kept running, without errors.

### Stage 3: Idiomatic data layer (the "elegant" part)

1. **Composition root (the `Module.scala` analogue):** `app/entry.client.tsx` (which already exists for Bootstrap) builds `FetchRepository`/`Factory`/`AntiFactory` once. It seeds them with `getContext()` → `RouterContextProvider` + `createContext<ElectionFactory>()` etc. This replaces `factoryContext.ts`, `antiFactoryContext.ts` and the providers in `root.tsx`.
2. **Localizations:** a root `clientLoader` fetches them via `fetchLookups.getLocalizations`. `useRouteLoaderData("root")` or a small `useL10n()` hook replaces `I18nApp.tsx` and `l10nContext`.
3. **Election loading:**
   - `components/Election.tsx` (or a new `routes/Election.tsx`) gets a `clientLoader` that calls `context.get(factory).recreateElection(...)` and throws `data(null, { status })` on `ElectionError`s.
   - A route `ErrorBoundary` renders Forbidden/Not Found/Gone.
   - Child tabs read the election via `useRouteLoaderData` instead of `useOutletContext`.
   - Entity mutations (`updateElectionText`, `castVote`, …) run as `clientAction`s or imperatively followed by `useRevalidator()`. This removes the `onElectionChanged` prop drilling and much of `props/*`.
4. **Other routes:** `Abode` creates the election via a `clientAction` + `redirect(...)`. `Legalese` → `redirect("/legalese/im")` in a `clientLoader`.

## Risks / things to check during implementation

- **Capability token lives in the URL fragment** (`#token`). A `clientLoader`'s `request.url` likely excludes the fragment. Read `window.location.hash` inside the loader instead, and check that hash-only navigations between organizer/voter links revalidate (add `shouldRevalidate` if not).
- **Route modules that are plain components** (e.g. `Abode`, `Election`) receive React Router's route props (`params`, `loaderData`, `matches`, …). Their `console.log(JSON.stringify(props))` now logs those; watch for circular values once loaders return entities.
- **Workspace hoisting:** until dependency-cruiser runs, nothing stops the hexagon from importing React.
- *Resolved in Stage 2:* the Node pre-render and Bootstrap (see `entry.client.tsx`), and `base: "/fegui/"` vs. `basename: "/"` (build-only `base`).

## Critical files

- **fegui:**
  - `package.json`, `vite.config.ts`, `react-router.config.ts`, `tsconfig*.json`
  - `app/root.tsx`, `app/routes.ts`, `app/entry.client.tsx`, `app/App.tsx`, `app/I18nApp.tsx`
  - `app/components/Election.tsx`, `app/components/ElectionTabs.tsx`, `app/components/Abode.tsx`, `app/routes/*`
  - `app/FetchRepository.ts`, `app/fetchLookups.ts`, `app/useInputValidation.tsx`
  - `hexagon/src/**`
- **New fegui files (Stage 3 and later):** `.dependency-cruiser.cjs` (once TS 7.1 is out)
- **Elsewhere:**
  - `Dockerfile`, `.github/workflows/test.yml`, `.github/workflows/scan.yml`
  - `beapi/app/controllers/gui/ReactController.scala` (CSP nonces; closes the `index.html` stream)
  - `CLAUDE.md`

## Verification (per stage)

1. **`cd fegui && npm ci && npm run typecheck`**, plus `npm run lint:arch` once dependency-cruiser is in.
   - As a negative test, temporarily add `import React from "react"` to a hexagon file and confirm dependency-cruiser fails.
2. **`npm run build`**, then check the build output:
   - `build/client/index.html` still contains `REPLACE_CSRF_TOKEN` and `REPLACE_LANG`.
   - Asset URLs start with `/fegui/`.
3. **Dev loop:**
   - `cd beapi && sbt "run -Dconfig.file=conf/insecureLocalhost.conf"` plus `cd fegui && npm start`. Don't install packages while the dev server runs.
   - Smoke test in the browser (headless Edge via Playwright, since the Chrome extension isn't installed):
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
4. **Production-like:** `docker build .` and run it, or locally copy `fegui/build/client` into `beapi/public/build` before starting Play, because `ReactController` keeps `index.html` in memory until Play reloads (restore the tracked placeholder `index.html` afterwards). Hit a deep link such as `/elections/<id>/tally#<token>` directly so the Play-served `index.html` and `/fegui/` assets are exercised with a real CSRF token (POST/PUT succeed).
5. **Backend:** `cd beapi && sbt test` (ArchUnit) if `ReactController` changed.
6. **Git:** stage after each stage and stop before committing, so Paul can review.
