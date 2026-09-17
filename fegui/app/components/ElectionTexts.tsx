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

import React, { useContext, useState } from "react";
import { l10nContext } from "../l10nContext";
import { ElectionTextsProps } from "../props/ElectionTextsProps";

function tte(s?: string) {
  // trim to empty
  return s?.trim() ?? "";
}

function ttu(s?: string) {
  // trim to undefined
  return s === undefined || s.trim() === "" ? undefined : s.trim();
}

function ElectionTexts(props: Readonly<ElectionTextsProps>) {
  console.log("ElectionTexts props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const [name, setName] = useState(props.election.name);
  const [description, setDescription] = useState(
    tte(props.election.description)
  );

  const cancelText = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setName(props.election.name);
    setDescription(tte(props.election.description));
  };

  const saveText = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    props.election.updateElectionText(name.trim(), ttu(description))
      .then((updated) => props.onElectionChanged(updated))
      .catch((error) => console.error(`failed to put election text: ${error}`));
  };

  const changesSaved = () =>
    props.election.name === name &&
    tte(props.election.description) === description;

  return (
    <form className="d-grid gap-4">
      <div className={changesSaved() ? "card" : "card border-warning"}>
        <div className="card-body">
          <h5 className="card-title">{localizations["texts.instruction"]}</h5>
          <div>
            <label htmlFor="nameText" className="form-label">
              {localizations["texts.name"]}
            </label>
            <input
              type="text"
              className="form-control"
              id="nameText"
              placeholder="Election Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="descriptionText" className="form-label">
              {localizations["texts.description"]}
            </label>
            <textarea
              className="form-control"
              id="descriptionText"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>
        <div
          className={changesSaved() ? "card-footer" : "card-footer bg-warning"}
        >
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button className="btn btn-secondary" onClick={cancelText}>
              {localizations["revert"]}
            </button>
            <button
              className="btn btn-primary"
              onClick={saveText}
              disabled={name === "" || changesSaved()}
            >
              {localizations["save"]}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default ElectionTexts;
