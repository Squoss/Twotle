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

import { useMatches, useRevalidator, useRouteLoaderData, useSearchParams } from "react-router";
import type { clientLoader } from "../components/Election";
import ElectionTabs from "../components/ElectionTabs";
import { ACTIVE_TAB } from "../props/ElectionTabsProps";

// keyed by the route ids in routes.ts, which reuse this module for all five tabs
const ACTIVE_TABS: Record<string, ACTIVE_TAB> = {
  "election-texts": ACTIVE_TAB.TEXTS,
  "election-dats": ACTIVE_TAB.CANDIDATES,
  "election-links": ACTIVE_TAB.LINKS,
  "election-tally": ACTIVE_TAB.VOTES,
  "election-settings": ACTIVE_TAB.SETTINGS,
};

function ElectionTab() {
  const { election, timeZones, token } = useRouteLoaderData<typeof clientLoader>("election")!;
  const routeId = useMatches().at(-1)!.id;
  const [searchParams] = useSearchParams();
  const revalidator = useRevalidator();

  // until PLAN.md Stage 3c, the components mutate the election themselves and then have the election's loader revalidated
  const reloadElection = () => revalidator.revalidate();
  const sendLinksReminder = (emailAddress?: string, phoneNumber?: string) =>
    election
      .sendLinksReminder(emailAddress, phoneNumber)
      .catch((error) => console.error(`failed to post election reminders: ${error}`));

  return (
    <ElectionTabs
      activeTab={ACTIVE_TABS[routeId]}
      election={election}
      token={token}
      onElectionChanged={reloadElection}
      sendLinksReminder={sendLinksReminder}
      timeZones={timeZones}
      onElectionDeleted={reloadElection}
      isOrganizer={token === election.organizerToken}
      isBrandNew={searchParams.has("brandNew")}
    />
  );
}

export default ElectionTab;
