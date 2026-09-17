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

// Bootstrap's JavaScript (the data API for dropdowns, collapses, and modals) needs the DOM,
// so it's loaded here, in the browser, rather than in route modules, which are also pre-rendered at build time
import "bootstrap";
import { AntiFactory, Factory } from "@twotle/hexagon";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { RouterContextProvider } from "react-router";
import { HydratedRouter } from "react-router/dom";
import { antiFactoryContext as antiFactoryReactContext } from "./antiFactoryContext";
import { antiFactoryContext, factoryContext } from "./context";
import { factoryContext as factoryReactContext } from "./factoryContext";
import { FetchRepository } from "./FetchRepository";

// the composition root (cf. beapi's Module.scala): the driven adapter is wired into the driving adapters once
const repository = new FetchRepository();
const factory = new Factory(repository);
const antiFactory = new AntiFactory(repository);

// React Router calls this for each navigation and fetcher submission; route modules' clientLoaders and clientActions get the ports from it
function getContext() {
  const context = new RouterContextProvider();
  context.set(factoryContext, factory);
  context.set(antiFactoryContext, antiFactory);
  return context;
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      {/* components that still mutate elections themselves get the ports via React context (until PLAN.md Stage 3c) */}
      <factoryReactContext.Provider value={factory}>
        <antiFactoryReactContext.Provider value={antiFactory}>
          <HydratedRouter getContext={getContext} />
        </antiFactoryReactContext.Provider>
      </factoryReactContext.Provider>
    </StrictMode>
  );
});
