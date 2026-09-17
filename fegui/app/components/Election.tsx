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

import React, { useCallback, useContext, useEffect, useState } from "react";
import { Outlet, useLocation, useParams, useSearchParams } from "react-router";
import { ElectionEntity, ElectionError, ElectionErrorReason } from "@twotle/hexagon";
import { getTimeZones } from "../fetchLookups";
import { factoryContext } from "../factoryContext";
import { ElectionOutletContext } from "../props/ElectionOutletContext";

function Election(props: {}) {
  console.log("Election props: " + JSON.stringify(props));

  const factory = useContext(factoryContext)!;
  const id = useParams().election;
  const location = useLocation();
  const token = location.hash;
  const [searchParams] = useSearchParams();
  const brandNew = searchParams.has("brandNew");
  const tz = searchParams.get("timeZone");

  const [election, setElection] = useState<ElectionEntity | undefined>(undefined);
  const [electionErrorReason, setElectionErrorReason] = useState<ElectionErrorReason | undefined>(undefined);
  const [timeZones, setTimeZones] = useState<Array<string>>([]);

  const getElection = useCallback(() => {
    if (token === "" || !id) {
      return;
    }

    factory
      .recreateElection(id, token.substring(1), tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone)
      .then((election) => {
        setElectionErrorReason(undefined);
        setElection(election);
      })
      .catch((error) => {
        if (error instanceof ElectionError) {
          setElectionErrorReason(error.reason);
        }
        console.error(`failed to get election: ${error}`);
      });
  }, [id, token, tz]);

  useEffect(() => {
    getElection();
  }, [getElection]);

  useEffect(() => {
    getTimeZones()
      .then((timeZones) => setTimeZones(timeZones))
      .catch((error) => console.error(`failed to get time zones: ${error}`));
  }, []);

  const sendLinksReminder = (emailAddress?: string, phoneNumber?: string) =>
    election
      ?.sendLinksReminder(emailAddress, phoneNumber)
      .catch((error) => console.error(`failed to post election reminders: ${error}`));

  const onElectionDeleted = () => {
    setElection(undefined);
    setElectionErrorReason(ElectionErrorReason.NOTFOUND);
  };

  if (token === "") {
    return <p>Dude, where's my token?!</p>;
  }

  if (election === undefined && electionErrorReason === undefined) {
    return (
      <output className="spinner-border">
        <span className="visually-hidden">Loading election …</span>
      </output>
    );
  } else if (electionErrorReason !== undefined) {
    switch (electionErrorReason) {
      case ElectionErrorReason.ACCESSDENIED:
        return <p>Forbidden</p>;
      case ElectionErrorReason.NOTFOUND:
        return <p>Not Found</p>;
      case ElectionErrorReason.PRIVATEACCESS:
        return <p>Gone</p>;
      default:
        return <p>{electionErrorReason}</p>;
    }
  } else if (election) {
    // the child routes (cf. routes.ts) render the tabs
    const context: ElectionOutletContext = {
      election,
      token: token.substring(1),
      onElectionChanged: setElection,
      sendLinksReminder,
      timeZones,
      onElectionDeleted,
      isOrganizer: token.substring(1) === election.organizerToken,
      isBrandNew: brandNew,
    };

    return (
      <React.Fragment>
        <title>{election.name}</title>
        <Outlet context={context} />
      </React.Fragment>
    );
  } else {
    return (
      <dl>
        <dt>assert false</dt>
        <dd>
          election is {election} and electionErrorReason is {electionErrorReason}
        </dd>
      </dl>
    );
  }
}

export default Election;
