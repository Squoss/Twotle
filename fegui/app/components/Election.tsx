/*
 * The MIT License
 *
 * Copyright (c) 2021-2026 Squeng AG
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

import React, { useEffect } from "react";
import { Outlet, useLocation, useRevalidator } from "react-router";
import { ElectionError, ElectionErrorReason } from "@twotle/hexagon";
import type { Route } from "./+types/Election";
import { factoryContext } from "../context";
import { getTimeZones } from "../fetchLookups";

// an ElectionError that remembers the capability token it occurred with (cf. useTokenRevalidation)
class ElectionLoaderError extends ElectionError {
  constructor(reason: ElectionErrorReason, public readonly token: string) {
    super(reason);
  }
}

// The capability token is the URL's fragment, which React Router strips from the request's URL.
// So the loader reads it from window.location, which during client-side navigations may still be the previous URL (cf. useTokenRevalidation).
export async function clientLoader({ params, request, context }: Route.ClientLoaderArgs) {
  const token = window.location.hash.substring(1);
  if (token === "") {
    return null;
  }

  const timeZone = new URL(request.url).searchParams.get("timeZone") ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    const [election, timeZones] = await Promise.all([
      context.get(factoryContext).recreateElection(params.election, token, timeZone),
      getTimeZones().catch((error) => {
        console.error(`failed to get time zones: ${error}`);
        return new Array<string>();
      }),
    ]);
    return { election, timeZones, token };
  } catch (error) {
    throw error instanceof ElectionError ? new ElectionLoaderError(error.reason, token) : error;
  }
}

// Revalidates when the location's capability token differs from the one the loader used: the loader may have seen the previous URL,
// and React Router doesn't revalidate when only the URL's fragment changes (e.g., from the organizer's to the voters' link).
function useTokenRevalidation(loadedToken: string | undefined) {
  const token = useLocation().hash.substring(1);
  const revalidator = useRevalidator();

  useEffect(() => {
    if (loadedToken !== undefined && token !== loadedToken) {
      revalidator.revalidate();
    }
  }, [token, loadedToken]);

  return token;
}

function Election(props: Route.ComponentProps) {
  console.log("Election props: " + JSON.stringify(props));

  const token = useTokenRevalidation(props.loaderData?.token ?? "");

  if (token === "") {
    return <p>Dude, where's my token?!</p>;
  } else if (props.loaderData === null || props.loaderData.token !== token) {
    return (
      <output className="spinner-border">
        <span className="visually-hidden">Loading election …</span>
      </output>
    );
  }

  // the child routes (cf. routes.ts) read the election via useRouteLoaderData("election")
  return (
    <React.Fragment>
      <title>{props.loaderData.election.name}</title>
      <Outlet />
    </React.Fragment>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  useTokenRevalidation(error instanceof ElectionLoaderError ? error.token : undefined);

  if (!(error instanceof ElectionLoaderError)) {
    throw error; // to root.tsx's ErrorBoundary
  }
  switch (error.reason) {
    case ElectionErrorReason.ACCESSDENIED:
      return <p>Forbidden</p>;
    case ElectionErrorReason.NOTFOUND:
      return <p>Not Found</p>;
    case ElectionErrorReason.PRIVATEACCESS:
      return <p>Gone</p>;
    default:
      return <p>{error.reason}</p>;
  }
}

export default Election;
