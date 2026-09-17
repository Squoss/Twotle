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
import { NavLink } from "react-router";
import ElectionCandidates from "./ElectionCandidates";
import ElectionLinks from "./ElectionLinks";
import ElectionSettings from "./ElectionSettings";
import ElectionTally from "./ElectionTally";
import ElectionTexts from "./ElectionTexts";
import { useLocalizations } from "../localizations";
import { ACTIVE_TAB, ElectionTabsProps } from "../props/ElectionTabsProps";

function ElectionTabs(props: Readonly<ElectionTabsProps>) {
  console.log("ElectionTabs props: " + JSON.stringify(props));

  const localizations = useLocalizations();

  const { id, voterToken, organizerToken, name } = props.election;

  let content;
  switch (props.activeTab) {
    case ACTIVE_TAB.TEXTS:
      content = (
        <ElectionTexts
          election={props.election}
          onElectionChanged={props.onElectionChanged}
        />
      );
      break;
    case ACTIVE_TAB.CANDIDATES:
      content = (
        <ElectionCandidates
          election={props.election}
          timeZones={props.timeZones}
          onElectionChanged={props.onElectionChanged}
        />
      );
      break;
    case ACTIVE_TAB.LINKS:
      content = (
        <ElectionLinks
          id={id}
          nrOfCandidates={props.election.candidates.length}
          organizerToken={organizerToken}
          voterToken={voterToken}
          sendLinksReminder={props.sendLinksReminder}
        />
      );
      break;
    case ACTIVE_TAB.VOTES:
      content = (
        <ElectionTally
          election={props.election}
          token={props.token}
          timeZones={props.timeZones}
          onElectionChanged={props.onElectionChanged}
        />
      );
      break;
    case ACTIVE_TAB.SETTINGS:
      content = (
        <ElectionSettings
          election={props.election}
          onElectionChanged={props.onElectionChanged}
          onElectionDeleted={props.onElectionDeleted}
        />
      );
      break;
    default: {
      // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
      const _exhaustiveCheck: never = props.activeTab;
      return _exhaustiveCheck;
    }
  }

  const brandNewAlert = (
    <div className="alert alert-success" role="alert">
      <h4 className="alert-heading">{localizations["electionPageCreated"]}</h4>
      <p>{localizations["firstThingsFirst"]}</p>
      <hr />
      <p className="mb-0">{localizations["rememberTheMilk"]}</p>
    </div>
  );

  if (props.isOrganizer) {
    return (
      <React.Fragment>
        <h1>{name}</h1>
        {props.isBrandNew ? brandNewAlert : <span></span>}
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              to={`/elections/${id}/texts#${organizerToken}`}
            >
              <i className="bi bi-body-text"></i> {localizations["texts"]}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              to={`/elections/${id}/dats#${organizerToken}`}
            >
              <i className="bi bi-calendar2-range"></i>{" "}
              {localizations["datesAndTimes"]}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              to={`/elections/${id}/links#${organizerToken}`}
            >
              <i className="bi bi-share"></i> {localizations["links"]}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              to={`/elections/${id}/tally#${organizerToken}`}
            >
              <i className="bi bi-person-lines-fill"></i>{" "}
              {localizations["votes"]}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              to={`/elections/${id}/settings#${organizerToken}`}
            >
              <i className="bi bi-sliders"></i> {localizations["settings"]}
            </NavLink>
          </li>
        </ul>
        {content}
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment>
        <h1>{name}</h1>
        {content}
      </React.Fragment>
    );
  }
}

export default ElectionTabs;
