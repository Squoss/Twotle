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

import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AntiFactory, Factory } from "@twotle/hexagon";
import Abode from "./components/Abode";
import { antiFactoryContext } from "./antiFactoryContext";
import App from "./App";
import Election from "./components/Election";
import { factoryContext } from "./factoryContext";
import { FetchRepository } from "./FetchRepository";
import I18nApp from "./I18nApp";
import Masthead from "./components/Masthead";
import NotFound from "./components/NotFound";
import Prices from "./components/Prices";
import PrivacyPolicy from "./components/PrivacyPolicy";
import ToDo from "./components/ToDo";

import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const repository = new FetchRepository();
const factory = new Factory(repository);
const antiFactory = new AntiFactory(repository);

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <factoryContext.Provider value={factory}>
        <antiFactoryContext.Provider value={antiFactory}>
          <I18nApp>
            <Routes>
              <Route path="/" element={<App />}>
                <Route index element={<Abode />} />
                <Route path="elections/:election/*" element={<Election />} />
                <Route path="legalese" element={<Navigate to="/legalese/im" />} />
                <Route path="legalese/im" element={<Masthead />} />
                <Route path="legalese/pp" element={<PrivacyPolicy />} />
                <Route path="legalese/tos" element={<ToDo />} />
                <Route path="prices" element={<Prices />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </I18nApp>
        </antiFactoryContext.Provider>
      </factoryContext.Provider>
    </BrowserRouter>
  </React.StrictMode>
);
