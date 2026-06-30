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

import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import Clipboard from "./Clipboard";
import { l10nContext } from "../l10nContext";
import { ElectionLinksProps } from "../props/ElectionLinksProps";
import useInputValidation, { InputType } from "../useInputValidation";

function ElectionLinks(props: Readonly<ElectionLinksProps>) {
  console.log("ElectionLinks props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const { id, nrOfCandidates, voterToken, organizerToken } = props;

  const guestLink = `${globalThis.origin}/elections/${id}#${voterToken}`;
  const hostLink = `${globalThis.origin}/elections/${id}#${organizerToken}`;

  const [emailAddressValid, emailAddress, setEmailAddress] = useInputValidation(
    InputType.EMAILADDRESS,
    ""
  );
  const [cellPhoneNumberValid, cellPhoneNumber, setCellPhoneNumber] =
    useInputValidation(InputType.CELLPHONENUMBER, "");

  const sendLinksReminderEmail = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    props.sendLinksReminder(emailAddress, undefined);
  };

  const sendLinksReminderSms = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    props.sendLinksReminder(undefined, cellPhoneNumber);
  };

  return (
    <React.Fragment>
      <div className="card text-dark bg-warning mb-3">
        <div className="card-header">{localizations["links.voters"]}</div>
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto text-truncate">
              <mark>{guestLink}</mark>
            </div>
            <div className="col-auto">
              <Clipboard text={guestLink} />
            </div>
          </div>
          {nrOfCandidates < 1 ? (
            <p className="card-text">
              <NavLink
                className="link-dark"
                to={`/elections/${id}/dats#${organizerToken}`}
              >
                {localizations["firstThingsFirst"]}
              </NavLink>
            </p>
          ) : (
            null
          )}
        </div>
      </div>
      <div className="card text-white bg-danger mb-3">
        <div className="card-header">
          <i className="bi bi-shield-fill-exclamation"></i>{" "}
          {localizations["links.organizers"]}
        </div>
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-auto text-truncate">
              <mark>{hostLink}</mark>
            </div>
            <div className="col-auto">
              <Clipboard text={hostLink} />
            </div>
          </div>
          <div className="row">
            <p className="card-text col">
              <i className="bi bi-life-preserver"></i>{" "}
              {localizations["links.reminderTo"]}
            </p>
            <form className="col">
              <div className="row">
                <div className="col-auto">
                  <input
                    type="email"
                    placeholder="yours.truly@twotle.com"
                    id="emailAddress"
                    className={
                      "form-control" +
                      (emailAddressValid ? " is-valid" : " is-invalid")
                    }
                    value={emailAddress}
                    onChange={(event) => setEmailAddress(event.target.value)}
                    readOnly={false}
                  />
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-light"
                    onClick={sendLinksReminderEmail}
                    disabled={emailAddress === "" || !emailAddressValid}
                  >
                    {localizations["links.byEmail"]}
                  </button>
                </div>
              </div>
            </form>
            <form className="col">
              <div className="row">
                <div className="col-auto">
                  <input
                    type="tel"
                    placeholder="078 965 43 21"
                    id="cellPhoneNumber"
                    className={
                      "form-control" +
                      (cellPhoneNumberValid ? " is-valid" : " is-invalid")
                    }
                    value={cellPhoneNumber}
                    onChange={(event) => setCellPhoneNumber(event.target.value)}
                    readOnly={false}
                  />
                </div>
                <div className="col-auto">
                  <button
                    className="btn btn-light"
                    onClick={sendLinksReminderSms}
                    disabled={cellPhoneNumber === "" || !cellPhoneNumberValid}
                  >
                    {localizations["links.bySms"]}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default ElectionLinks;
