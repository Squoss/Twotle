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

function App(props: {}) {
  console.log("App props: " + JSON.stringify(props));

  const localizations = useLocalizations();

  const location = useLocation();
  let locationString = location.pathname;
  locationString += "?";
  new URLSearchParams(location.search).forEach((v, k) => (locationString += k === "locale" ? "" : `${new URLSearchParams({ [k]: v })}&`));
  locationString += "locale=NEWLOCALE";
  locationString += location.hash;

  const [mode, setMode] = useState<"light" | "dark">("light");
  useEffect(() => {
    document.getElementById("rootElement")?.setAttribute("data-bs-theme", mode);
  }, [mode]);

  return (
    <React.Fragment>
      <a className="visually-hidden-focusable" href="#content">{localizations["skipToMainContent"]}</a>{/* https://getbootstrap.com/docs/5.3/getting-started/accessibility/#visually-hidden-content */}
      <header className="navbar navbar-expand-md navbar-dark fixed-top bg-primary">
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
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
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
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle"
                  type="button"
                  id="legalese"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {localizations["legalese"]}
                </button>
                <ul className="dropdown-menu" aria-labelledby="legalese">
                  <li>
                    <NavLink
                      className={({ isActive }) => (isActive ? "dropdown-item disabled" : "dropdown-item")}
                      to="/legalese/im"
                    >
                      {localizations["legalese.imprint"]}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className={({ isActive }) => (isActive ? "dropdown-item disabled" : "dropdown-item")}
                      to="/legalese/pp"
                    >
                      {localizations["legalese.pp"]}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      className={({ isActive }) => (isActive ? "dropdown-item disabled" : "dropdown-item")}
                      to="/legalese/tos"
                    >
                      {localizations["legalese.tos"]}
                    </NavLink>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <NavLink className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")} to="/prices">
                  {localizations["prices"]}
                </NavLink>
              </li>
            </ul>
            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle"
                type="button"
                id="language"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-globe"></i>
              </button>
              <ul className="dropdown-menu" aria-labelledby="language">
                <li>
                  <a
                    className={localizations["locale"] === "de" ? "dropdown-item disabled" : "dropdown-item"}
                    href={locationString.replace("NEWLOCALE", "de")}
                  >
                    Deutsch
                  </a>
                </li>
                <li>
                  <a
                    className={localizations["locale"] === "en" ? "dropdown-item disabled" : "dropdown-item"}
                    href={locationString.replace("NEWLOCALE", "en")}
                  >
                    English
                  </a>
                </li>
              </ul>
            </div>
            &nbsp; &nbsp;
            <div className="form-check form-switch text-bg-primary">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="modeLightDark"
                checked={mode === "dark"}
                aria-checked={mode === "dark"}
                onChange={() => (mode === "light" ? setMode("dark") : setMode("light"))}
              />
              <label className="form-check-label" htmlFor="modeLightDark">
                <i className="bi bi-emoji-sunglasses-fill"></i> / <i className="bi bi-emoji-sunglasses"></i>
              </label>
            </div>
            &nbsp; &nbsp;
            <a
              className="btn btn-outline-light"
              href="https://github.com/Squoss/Twotle"
              target="GitHub"
              rel="noreferrer noopener"
            >
              <i className="bi bi-github"></i>
            </a>
          </div>
        </nav>
      </header>

      <main className="container" id="content">
        <Outlet />
      </main>

      <footer className="d-none d-sm-block fixed-bottom">
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
