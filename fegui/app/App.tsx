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

import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useLocalizations } from "./localizations";

type ColorMode = "light" | "dark" | "auto";

const COLOR_MODE_ICONS: Record<ColorMode, string> = {
  light: "bi-sun-fill",
  dark: "bi-moon-stars-fill",
  auto: "bi-circle-half",
};

function App(props: {}) {
  console.log("App props: " + JSON.stringify(props));

  const localizations = useLocalizations();

  const location = useLocation();
  let locationString = location.pathname;
  locationString += "?";
  new URLSearchParams(location.search).forEach((v, k) => (locationString += k === "locale" ? "" : `${new URLSearchParams({ [k]: v })}&`));
  locationString += "locale=NEWLOCALE";
  locationString += location.hash;

  // "auto" follows the operating system. Until the JavaScript runs, so does Bootstrap's :root (color-scheme: light dark),
  // but a few rules (e.g., select's caret) need data-bs-theme="dark"; hence "auto" is resolved like in Bootstrap's color mode toggler.
  // The choice isn't stored (the privacy policy says that the site stores nothing else in the browser), so a reload resets it.
  const [mode, setMode] = useState<ColorMode>("auto");
  useEffect(() => {
    const root = document.getElementById("rootElement")!;
    if (mode !== "auto") {
      root.setAttribute("data-bs-theme", mode);
      return;
    }
    const darkQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");
    const resolve = () => root.setAttribute("data-bs-theme", darkQuery.matches ? "dark" : "light");
    resolve();
    darkQuery.addEventListener("change", resolve);
    return () => darkQuery.removeEventListener("change", resolve);
  }, [mode]);

  return (
    <React.Fragment>
      <a className="visually-hidden-focusable" href="#content">{localizations["skipToMainContent"]}</a>{/* https://getbootstrap.com/docs/6.0/getting-started/accessibility/#visually-hidden-content */}
      {/* the dark color mode lightens the navbar's text and theme-inverse (e.g., the buttons) on bg-primary */}
      <header className="navbar md:navbar-expand fixed-top bg-primary" data-bs-theme="dark">
        <nav className="container-fluid" aria-label="Main navigation">
          <Link className="navbar-brand" to="/">
            Twotle
          </Link>{" "}
          <a className="navbar-brand" href="https://www.squeng.com/" target="Squeng" rel="noreferrer noopener">
            <small>
              Squeng<sup>&reg;</sup>&nbsp;made
            </small>
          </a>
          <button
            className="btn-icon navbar-toggler"
            type="button"
            data-bs-toggle="drawer"
            data-bs-target="#navbarDrawer"
            aria-controls="navbarDrawer"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          {/* below md, a drawer; from md up, md:navbar-expand shows its body inline */}
          <dialog className="drawer drawer-end" tabIndex={-1} id="navbarDrawer" aria-labelledby="navbarDrawerLabel">
            <div className="drawer-header">
              <h5 className="drawer-title" id="navbarDrawerLabel">
                Twotle
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="drawer" aria-label="Close"></button>
            </div>
            <div className="drawer-body">
              <ul className="nav navbar-nav me-auto mb-3 md:mb-0">
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                    aria-current="page"
                    to="/"
                  >
                    <i className="bi bi-house"></i>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => (isActive ? "disabled nav-link active" : "disabled nav-link")}
                    tabIndex={-1}
                    aria-disabled="true"
                    to="/acknowledgements"
                  >
                    {localizations["acknowledgements"]}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button className="nav-link" type="button" id="legalese" data-bs-toggle="menu" aria-expanded="false">
                    {localizations["legalese"]}
                  </button>
                  <div className="menu" aria-labelledby="legalese">
                    <NavLink
                      className={({ isActive }) => (isActive ? "menu-item disabled" : "menu-item")}
                      to="/legalese/im"
                    >
                      {localizations["legalese.imprint"]}
                    </NavLink>
                    <NavLink
                      className={({ isActive }) => (isActive ? "menu-item disabled" : "menu-item")}
                      to="/legalese/pp"
                    >
                      {localizations["legalese.pp"]}
                    </NavLink>
                    <NavLink
                      className={({ isActive }) => (isActive ? "menu-item disabled" : "menu-item")}
                      to="/legalese/tos"
                    >
                      {localizations["legalese.tos"]}
                    </NavLink>
                  </div>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} to="/prices">
                    {localizations["prices"]}
                  </NavLink>
                </li>
              </ul>
              {/* one row, also in the drawer, whose body stacks (and stretches) its children */}
              <div className="d-flex align-items-center gap-5">
                <div>
                  <button
                    className="btn-solid theme-inverse"
                    type="button"
                    id="language"
                    data-bs-toggle="menu"
                    aria-expanded="false"
                  >
                    <i className="bi bi-globe"></i>
                  </button>
                  <div className="menu" aria-labelledby="language">
                    <a
                      className={localizations["locale"] === "de" ? "menu-item disabled" : "menu-item"}
                      href={locationString.replace("NEWLOCALE", "de")}
                    >
                      Deutsch
                    </a>
                    <a
                      className={localizations["locale"] === "en" ? "menu-item disabled" : "menu-item"}
                      href={locationString.replace("NEWLOCALE", "en")}
                    >
                      English
                    </a>
                  </div>
                </div>
                <div>
                  <button
                    className="btn-solid theme-inverse"
                    type="button"
                    id="colorMode"
                    data-bs-toggle="menu"
                    aria-expanded="false"
                    aria-label={localizations["colorMode"]}
                  >
                    <i className={`bi ${COLOR_MODE_ICONS[mode]}`}></i>
                  </button>
                  <div className="menu" aria-labelledby="colorMode">
                    {(Object.keys(COLOR_MODE_ICONS) as ColorMode[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={m === mode ? "menu-item selected" : "menu-item"}
                        aria-current={m === mode ? "true" : undefined}
                        onClick={() => setMode(m)}
                      >
                        <i className={`bi ${COLOR_MODE_ICONS[m]} menu-item-icon`}></i>
                        {localizations[`colorMode.${m}`]}
                        <i className="bi bi-check2 menu-item-check"></i>
                      </button>
                    ))}
                  </div>
                </div>
                <a
                  className="btn-outline theme-inverse"
                  href="https://github.com/Squoss/Twotle"
                  target="GitHub"
                  rel="noreferrer noopener"
                >
                  <i className="bi bi-github"></i>
                </a>
              </div>
            </div>
          </dialog>
        </nav>
      </header>

      <main className="container" id="content">
        <Outlet />
      </main>

      <footer className="d-none sm:d-block fixed-bottom">
        <nav className="card text-center" aria-label="Legal links">
          <div className="card-body">
            <div className="row">
              <div className="col">
                <Link className="link text-decoration-none" to="/legalese/im">
                  {localizations["legalese.imprint"]}
                </Link>
              </div>
              <div className="col">
                <Link className="link text-decoration-none" to="/legalese/pp">
                  {localizations["legalese.pp"]}
                </Link>
              </div>
              <div className="col">
                <Link className="link text-decoration-none" to="/legalese/tos">
                  {localizations["legalese.tos"]}
                </Link>
              </div>
              <div className="col">
                Copyright &copy; <time dateTime="2021">2021</time>-<time dateTime="2026">2026</time> Squeng AG
              </div>
            </div>
          </div>
        </nav>
      </footer>
    </React.Fragment>
  );
}

export default App;
