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

import React, { useState } from "react";
import { Availability, Visibility } from "@twotle/hexagon";
import { useLocalizations } from "../localizations";
import { useElectionSubmit } from "../useElectionSubmit";
import { ElectionVoteProps } from "../props/ElectionVoteProps";

function ElectionVote(props: ElectionVoteProps) {
  console.log("ElectionVote props: " + JSON.stringify(props));

  const localizations = useLocalizations();
  const submit = useElectionSubmit();

  const { candidates } = props.election;
  candidates.sort((a, b) => Date.parse(a) - Date.parse(b));

  const defaultAvailabiity = new Map<string, Availability>();
  candidates.forEach((candidate) =>
    defaultAvailabiity.set(candidate, Availability.NO)
  );
  const [name, setName] = useState("");
  const [availability, setAvailability] =
    useState<Map<string, Availability>>(defaultAvailabiity);

  const updateAvailability = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAvailability = new Map<string, Availability>(availability);
    Object.entries(Availability).forEach((a) => {
      if (a[1] === event.target.value) {
        newAvailability.set(event.target.name, a[1]);
      }
    });
    setAvailability(newAvailability);
  };

  const saveVote = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    submit({ intent: "castVote", name, availability: Object.fromEntries(availability), timeZone: props.election.timeZone });
    setName("");
    setAvailability(defaultAvailabiity);
  };

  return props.election.visibility === Visibility.PUBLIC ? (
    <tr>
      <td>
        <input
          type="text"
          className="form-control"
          id="name"
          placeholder={localizations["votes.yourName"]}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </td>
      {candidates.map((candidate) => (
        <td key={Date.parse(candidate)}>
          <div className="row row-cols-1">
            <div className="col">
              <label
                title={localizations["no"]}
                className="btn-check btn-outline theme-danger"
              >
                <input
                  type="radio"
                  name={candidate}
                  value={Availability.NO}
                  checked={availability.get(candidate) === Availability.NO}
                  onChange={updateAvailability}
                />
                <span title={localizations["no"]}>🙁</span>
              </label>
            </div>
            <div className="col">
              <label
                title={localizations["ifNeedBe"]}
                className="btn-check btn-outline theme-warning"
              >
                <input
                  type="radio"
                  name={candidate}
                  value={Availability.IFNEEDBE}
                  checked={availability.get(candidate) === Availability.IFNEEDBE}
                  onChange={updateAvailability}
                />
                <span title={localizations["ifNeedBe"]}>😐</span>
              </label>
            </div>
            <div className="col">
              <label
                title={localizations["yes"]}
                className="btn-check btn-outline theme-success"
              >
                <input
                  type="radio"
                  name={candidate}
                  value={Availability.YES}
                  checked={availability.get(candidate) === Availability.YES}
                  onChange={updateAvailability}
                />
                <span title={localizations["yes"]}>🙂</span>
              </label>
            </div>
          </div>
        </td>
      ))}
      <td>
        <button
          className="btn-solid theme-primary"
          onClick={saveVote}
          disabled={name === ""}
        >
          {localizations["votes.castVote"]} 🗳️
        </button>
      </td>
    </tr>
  ) : (
    <tr>
      <td colSpan={3}>{localizations["votes.gameOver"]}</td>
    </tr>
  );
}

export default ElectionVote;
