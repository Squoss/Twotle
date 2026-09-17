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

import { useMatches, useRouteLoaderData, useSearchParams } from "react-router";
import type { Route } from "./+types/ElectionTab";
import type { clientLoader } from "../components/Election";
import ElectionTabs from "../components/ElectionTabs";
import { antiFactoryContext, factoryContext } from "../context";
import { ElectionIntent } from "../props/ElectionIntent";
import { ACTIVE_TAB } from "../props/ElectionTabsProps";

// keyed by the route ids in routes.ts, which reuse this module for all five tabs
const ACTIVE_TABS: Record<string, ACTIVE_TAB> = {
  "election-texts": ACTIVE_TAB.TEXTS,
  "election-dats": ACTIVE_TAB.CANDIDATES,
  "election-links": ACTIVE_TAB.LINKS,
  "election-tally": ACTIVE_TAB.VOTES,
  "election-settings": ACTIVE_TAB.SETTINGS,
};

// the tabs' mutations (cf. useElectionSubmit); afterwards, React Router revalidates the election's loader
export async function clientAction({ params, request, context }: Route.ClientActionArgs) {
  const intent: ElectionIntent = await request.json();
  const token = window.location.hash.substring(1); // the capability token (cf. components/Election.tsx)

  try {
    if (intent.intent === "destroyElection") {
      await context.get(antiFactoryContext).destroyElection(params.election, token);
      return null;
    }

    const election = await context
      .get(factoryContext)
      .recreateElection(params.election, token, Intl.DateTimeFormat().resolvedOptions().timeZone);
    switch (intent.intent) {
      case "updateElectionText":
        await election.updateElectionText(intent.name, intent.description);
        break;
      case "updateElectionSchedule":
        await election.updateElectionSchedule(intent.candidates, intent.timeZone);
        break;
      case "updateElectionSubscriptions":
        await election.updateElectionSubscriptions(intent.emailAddress, intent.phoneNumber);
        break;
      case "updateElectionVisibility":
        await election.updateElectionVisibility(intent.visibility);
        break;
      case "castVote":
        await election.castVote(token, intent.name, new Map(Object.entries(intent.availability)), intent.timeZone);
        break;
      case "revokeVote":
        // passes on the timestamp as received from Play (the Vote value object's Date type notwithstanding)
        await election.revokeVote(token, intent.name, intent.voted as unknown as Date);
        break;
      case "sendLinksReminder":
        await election.sendLinksReminder(intent.emailAddress, intent.phoneNumber);
        break;
      default: {
        // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
        const _exhaustiveCheck: never = intent;
        return _exhaustiveCheck;
      }
    }
  } catch (error) {
    console.error(`failed to ${intent.intent}: ${error}`);
  }
  return null;
}

function ElectionTab() {
  const { election, timeZones, token } = useRouteLoaderData<typeof clientLoader>("election")!;
  const routeId = useMatches().at(-1)!.id;
  const [searchParams] = useSearchParams();

  return (
    <ElectionTabs
      activeTab={ACTIVE_TABS[routeId]}
      election={election}
      token={token}
      timeZones={timeZones}
      isOrganizer={token === election.organizerToken}
      isBrandNew={searchParams.has("brandNew")}
    />
  );
}

export default ElectionTab;
