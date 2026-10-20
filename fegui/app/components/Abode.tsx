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
import { Form, redirect } from "react-router";
import type { Route } from "./+types/Abode";
import { factoryContext } from "../context";
import { useLocalizations } from "../localizations";

// creates an election and redirects to its organizer's page, whose capability token is the URL's fragment (cf. Election.tsx)
export async function clientAction({ context }: Route.ClientActionArgs) {
  try {
    const response = await context.get(factoryContext).createElection();
    return redirect(`/elections/${response.id}?brandNew=true#${response.organizerToken}`);
  } catch (error) {
    console.error(`failed to post election: ${error}`);
    return null;
  }
}

function Abode(props: {}) {
  console.log("Abode props: " + JSON.stringify(props));

  const localizations = useLocalizations();

  const hidePostElectionDialog = () => {
    import("bootstrap").then(({ Dialog }) => Dialog.getInstance(document.getElementById("postElectionDialog")!)!.hide());
  };

  return (
    <React.Fragment>
      <div className="border-primary p-12 border rounded">
        <h1 title="Fix a date & time">Twotle</h1>
        <p className="fs-lg fw-light">{localizations["executiveSummary"]}</p>
        <button
          type="button"
          className="btn-solid btn-lg theme-primary"
          data-bs-toggle="dialog"
          data-bs-target="#postElectionDialog"
        >
          {localizations["createRepliesPage"]} &raquo;
        </button>
        <p
          dangerouslySetInnerHTML={{
            __html: localizations["HTML.backToTheRoodle"],
          }}
        ></p>
      </div>

      <dialog
        className="dialog"
        id="postElectionDialog"
        aria-labelledby="postElectionDialogLabel"
      >
        <div className="dialog-header">
          <h5 className="dialog-title" id="postElectionDialogLabel">
            <i className="bi bi-shield-exclamation"></i>
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="dialog"
            aria-label="Close"
          ></button>
        </div>
        <div
          className="dialog-body"
          dangerouslySetInnerHTML={{
            __html: localizations["HTML.legalese.cya"],
          }}
        ></div>
        <div className="dialog-footer">
          <button
            type="button"
            className="btn-solid theme-secondary"
            data-bs-dismiss="dialog"
          >
            {localizations["no"]}
          </button>
          <Form method="post" onSubmit={hidePostElectionDialog}>
            <button type="submit" className="btn-solid theme-primary">
              {localizations["yes"]}
            </button>
          </Form>
        </div>
      </dialog>
    </React.Fragment>
  );
}

export default Abode;
