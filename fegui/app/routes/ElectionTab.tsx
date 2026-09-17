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

import { useMatches, useOutletContext } from "react-router";
import ElectionTabs from "../components/ElectionTabs";
import { ElectionOutletContext } from "../props/ElectionOutletContext";
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
  const context = useOutletContext<ElectionOutletContext>();
  const routeId = useMatches().at(-1)!.id;

  return <ElectionTabs activeTab={ACTIVE_TABS[routeId]} {...context} />;
}

export default ElectionTab;
