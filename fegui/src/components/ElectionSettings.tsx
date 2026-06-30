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

import { Modal } from "bootstrap";
import React, { useContext, useState } from "react";
import { antiFactoryContext } from "../antiFactoryContext";
import { Visibility } from "../value_objects/Visibility";
import { l10nContext } from "../l10nContext";
import { ElectionSettingsProps } from "../props/ElectionSettingsProps";
import useInputValidation, { InputType } from "../useInputValidation";

function ElectionSettings(props: Readonly<ElectionSettingsProps>) {
  console.log("ElectionSettings props: " + JSON.stringify(props));

  const antiFactory = useContext(antiFactoryContext)!;
  const localizations = useContext(l10nContext);

  const [emailAddressValid, emailAddress, setEmailAddress] = useInputValidation(
    InputType.EMAILADDRESS,
    props.election.subscriptions.emailAddress ?? ""
  );
  const [phoneNumberValid, phoneNumber, setPhoneNumber] = useInputValidation(
    InputType.CELLPHONENUMBER,
    props.election.subscriptions.phoneNumber ?? ""
  );

  const [visibility, setVisibility] = useState<Visibility>(
    props.election.visibility
  );

  const cancelSubscriptions = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setEmailAddress(props.election.subscriptions.emailAddress ?? "");
    setPhoneNumber(props.election.subscriptions.phoneNumber ?? "");
  };

  const saveSubscriptions = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    props.election.updateElectionSubscriptions(
      emailAddress && emailAddress !== "" ? emailAddress : undefined,
      phoneNumber && phoneNumber !== "" ? phoneNumber : undefined
    )
      .then((updated) => props.onElectionChanged(updated))
      .catch((error) => console.error(`failed to put election subscriptions: ${error}`));
  };

  const cancelVisibility = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    setVisibility(props.election.visibility);
  };

  const saveVisibility = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    props.election.updateElectionVisibility(visibility)
      .then((updated) => props.onElectionChanged(updated))
      .catch((error) => console.error(`failed to put election visibility: ${error}`));
  };

  const handleDeleteElection = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    Modal.getInstance(document.getElementById("deleteElectionModal")!)!.hide();
    antiFactory.destroyElection(String(props.election.id), props.election.organizerToken)
      .then(() => props.onElectionDeleted())
      .catch((error) => console.error(`failed to delete election: ${error}`));
  };

  const subscriptionChangesSaved = () =>
    ((!props.election.subscriptions.emailAddress && emailAddress === "") ||
      props.election.subscriptions.emailAddress === emailAddress) &&
    ((!props.election.subscriptions.phoneNumber && phoneNumber === "") ||
      props.election.subscriptions.phoneNumber === phoneNumber);

  const visibilityChangesSaved = () => props.election.visibility === visibility;

  return (
    <React.Fragment>
      <form className="d-grid gap-4">
        <div
          className={
            subscriptionChangesSaved() ? "card" : "card border-warning"
          }
        >
          <div className="card-body">
            <h5 className="card-title">
              {localizations["settings.subscriptions"]}
            </h5>
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
            <input
              type="tel"
              placeholder="078 965 43 21"
              id="cellPhoneNumber"
              className={
                "form-control" +
                (phoneNumberValid ? " is-valid" : " is-invalid")
              }
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              readOnly={false}
            />
          </div>
          <div
            className={
              subscriptionChangesSaved()
                ? "card-footer"
                : "card-footer bg-warning"
            }
          >
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button
                className="btn btn-secondary"
                onClick={cancelSubscriptions}
              >
                {localizations["revert"]}
              </button>
              <button
                className="btn btn-primary"
                onClick={saveSubscriptions}
                disabled={
                  subscriptionChangesSaved() ||
                  !emailAddressValid ||
                  !phoneNumberValid
                }
              >
                {localizations["save"]}
              </button>
            </div>
          </div>
        </div>
      </form>
      <form className="d-grid gap-4">
        <div
          className={visibilityChangesSaved() ? "card" : "card border-warning"}
        >
          <div className="card-body">
            <h5 className="card-title">
              {localizations["settings.visibility"]}
            </h5>
            <select
              className="form-select"
              id="visibilitySelect"
              value={visibility}
              onChange={(event) =>
                Object.entries(Visibility).forEach((v) => {
                  if (v[1] === event.target.value) {
                    setVisibility(v[1]);
                  }
                })
              }
            >
              <option value={Visibility.PUBLIC}>
                {localizations["settings.visibilityPublic"]}
              </option>
              <option value={Visibility.PROTECTED}>
                {localizations["settings.visibilityProtected"]}
              </option>
              <option value={Visibility.PRIVATE}>
                {localizations["settings.visibilityPrivate"]}
              </option>
            </select>
          </div>
          <div
            className={
              visibilityChangesSaved()
                ? "card-footer"
                : "card-footer bg-warning"
            }
          >
            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <button className="btn btn-secondary" onClick={cancelVisibility}>
                {localizations["revert"]}
              </button>
              <button
                className="btn btn-primary"
                onClick={saveVisibility}
                disabled={visibilityChangesSaved()}
              >
                {localizations["save"]}
              </button>
            </div>
          </div>
        </div>
      </form>
      <div className="card border-danger">
        <div className="card-body">
          <h5 className="card-title">
            <i className="bi bi-trash"></i>
          </h5>
          {localizations["settings.trash.finality"]}
        </div>
        <div className="card-footer">
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button
              className="btn btn-danger"
              data-bs-toggle="modal"
              data-bs-target="#deleteElectionModal"
            >
              {localizations["settings.trash"]}
            </button>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="deleteElectionModal"
        tabIndex={-1}
        aria-labelledby="deleteElectionModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="deleteElectionModalLabel">
                <i className="bi bi-shield-exclamation"></i>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {
                localizations["settings.trash.pointOfNoReturn"].replace(
                  "{0}",
                  props.election.name
                )
              }
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                {localizations["no"]}
              </button>
              <form onSubmit={handleDeleteElection}>
                <button type="submit" className="btn btn-danger">
                  {localizations["yes"]}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default ElectionSettings;
