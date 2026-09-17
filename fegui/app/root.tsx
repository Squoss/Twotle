/*
 * The MIT License
 *
 * Copyright (c) 2026 Squeng AG
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import React from "react";
import { isRouteErrorResponse, Links, Meta, Scripts, ScrollRestoration, type ShouldRevalidateFunctionArgs } from "react-router";
import type { Route } from "./+types/root";
import App from "./App";
import { getLocalizations } from "./fetchLookups";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Play replaces REPLACE_LANG and REPLACE_CSRF_TOKEN in the pre-rendered index.html per request (cf. beapi's ReactController).
// The browser must render the replaced values; otherwise, React adds a second csrf-token <meta> (with the placeholder) while hydrating.
function replacedByPlay(placeholder: string, read: (doc: Document) => string | null | undefined) {
  return typeof document === "undefined" ? placeholder : (read(document) ?? placeholder);
}

// https://reactrouter.com/api/framework-conventions/root.tsx
export function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const lang = replacedByPlay("REPLACE_LANG", (doc) => doc.documentElement.getAttribute("lang"));
  const csrfToken = replacedByPlay("REPLACE_CSRF_TOKEN", (doc) => doc.querySelector('meta[name="csrf-token"]')?.getAttribute("content"));

  return (
    <html lang={lang} data-bs-theme="light" id="rootElement">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Fix a date & time (with a tip of the hat to classic Doodle)" />
        {/* async (rather than defer) so that React 19 treats it as a resource instead of warning about a script tag */}
        <script src="https://app.rybbit.io/api/script.js" data-site-id="64b4c9e59152" async></script>
        {/* generated with https://realfavicongenerator.net/ */}
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <title>Twotle</title>
        <meta name="csrf-token" content={csrfToken} />
        <Meta />
        <Links />
      </head>
      <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Play's localizations for all routes (cf. localizations.ts); HydrateFallback shows until they're loaded
export async function clientLoader() {
  return { localizations: await getLocalizations() };
}

// the localizations don't change when an action (e.g., saving an election) completes
export function shouldRevalidate({ formMethod, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return formMethod === undefined && defaultShouldRevalidate;
}

// the composition root is entry.client.tsx
export default function Root() {
  return <App />;
}

// pre-rendered into index.html, shown until the JavaScript has loaded
export function HydrateFallback() {
  return (
    <output className="spinner-border">
      <span className="visually-hidden">Loading …</span>
    </output>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <main className="container" id="content">
      <div className="alert alert-danger" role="alert">
        {isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : String(error)}
      </div>
    </main>
  );
}
