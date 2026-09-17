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

import { type RouteConfig, index, route } from "@react-router/dev/routes";

// https://reactrouter.com/api/framework-conventions/routes.ts (cf. beapi's conf/routes); root.tsx wraps all of them
export default [
  index("components/Abode.tsx"),
  route("elections/:election", "components/Election.tsx", [
    index("routes/ElectionIndex.tsx"),
    route("texts", "routes/ElectionTab.tsx", { id: "election-texts" }),
    route("dats", "routes/ElectionTab.tsx", { id: "election-dats" }),
    route("links", "routes/ElectionTab.tsx", { id: "election-links" }),
    route("tally", "routes/ElectionTab.tsx", { id: "election-tally" }),
    route("settings", "routes/ElectionTab.tsx", { id: "election-settings" }),
    route("*", "components/NotFound.tsx", { id: "election-not-found" }),
  ]),
  route("legalese", "routes/Legalese.tsx"),
  route("legalese/im", "components/Masthead.tsx"),
  route("legalese/pp", "components/PrivacyPolicy.tsx"),
  route("legalese/tos", "components/ToDo.tsx"),
  route("prices", "components/Prices.tsx"),
  route("*", "components/NotFound.tsx"),
] satisfies RouteConfig;
