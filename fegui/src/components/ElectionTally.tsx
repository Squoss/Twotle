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
import { Vote } from "@twotle/hexagon";
import ElectionVote from "./ElectionVote";
import { l10nContext } from "../l10nContext";
import { ElectionTallyProps } from "../props/ElectionTallyProps";

function prettyLocalDateTimeString(locale: string, dateTime: string) {
  if (dateTime) {
    return new Date(dateTime).toLocaleString(locale, {
      dateStyle: "full",
      timeStyle: "short",
    });
  }
}

function columnsAll(candidates: Array<string>, votes: Array<Vote>) {
  const columnCounts = new Array<[number, number, number]>(0);
  candidates.forEach(() => {
    columnCounts.push([0, 0, 0]);
  });
  votes.forEach((vote) => {
    candidates.forEach((candidate, ccIndex) => {
      const [y, inb, n] = columnCounts[ccIndex];
      const bla = new Map(Object.entries(vote.availability)).get(
        candidate.substring(0, candidate.indexOf("T") + 6)
      );
      if (bla === undefined) {
        // yep, nothing!
      } else if (bla === "No") {
        columnCounts[ccIndex] = [y, inb, n + 1];
      } else if (bla === "IfNeedBe") {
        columnCounts[ccIndex] = [y, inb + 1, n];
      } else if (bla === "Yes") {
        columnCounts[ccIndex] = [y + 1, inb, n];
      } else {
        throw new Error("unmapped enum value");
      }
    });
  });
  return columnCounts;
}

function columnBest(columnCounts: Array<[number, number, number]>) {
  let best = [0, 0, 0];
  columnCounts.forEach((columnCount) => {
    const [y, inb] = columnCount;
    if (
      y + inb > best[0] + best[1] ||
      (y + inb === best[0] + best[1] && y > best[0])
    ) {
      best = columnCount;
    }
  });
  return best;
}

function ElectionTally(props: Readonly<ElectionTallyProps>) {
  console.log("ElectionTally props: " + JSON.stringify(props));

  const localizations = useContext(l10nContext);

  const { id, description, timeZone, candidates, votes } = props.election;
  candidates.sort((a,b)=>Date.parse(a)-Date.parse(b));

  const timeZones = props.timeZones.map((tz) => (
    <li key={tz}>
      <a
        className="dropdonw-item"
        href={`/elections/${id}/tally?timeZone=${tz}#${props.token}`}
      >
        {tz}
      </a>
    </li>
  ));

  const cN = (bla?: string) => {
    if (bla === undefined) {
      return "table-light";
    }

    if (bla === "No") {
      return "table-danger";
    } else if (bla === "IfNeedBe") {
      return "table-warning";
    } else if (bla === "Yes") {
      return "table-success";
    } else {
      throw new Error("unmapped enum value");
    }
  };

  const columnCounts = columnsAll(candidates, votes);
  const best = columnBest(columnCounts);

  const deleteVote = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    name: string,
    voted: Date
  ) => {
    e.preventDefault();
    if (
      globalThis.confirm(
        localizations["votes.revocationConfirmation"]
          .replace("{0}", name)
          .replace(
            "{1}",
            new Date(voted).toLocaleDateString(localizations["locale"], {
              dateStyle: "full",
            })
          )
      )
    ) {
      props.election.revokeVote(props.token, name, voted)
        .then((updated) => props.onElectionChanged(updated))
        .catch((error) => console.error(`failed to revoke vote: ${error}`));
    }
  };

  return (
    <React.Fragment>
      <blockquote className="blockquote">
        {description
          ?.split("\n")
          .map((line, i) => <p key={`${i}:${line}`}>{line}</p>) ?? ""}
      </blockquote>
      <form>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr className="table-info">
                <th>
                  {timeZone ? (
                    <React.Fragment>
                      {localizations["datesAndTimes.timeZone"]}: {timeZone}
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-link dropdown-toggle"
                          type="button"
                          id="dropdownMenuLink"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          {localizations["votes.convertToDifferentTimeZone"]}
                        </button>
                        <ul
                          className="dropdown-menu"
                          aria-labelledby="dropdownMenuLink"
                        >
                          {timeZones}
                        </ul>
                      </div>
                    </React.Fragment>
                  ) : (
                    ""
                  )}
                </th>
                {candidates.map((candidate) => (
                  <th key={Date.parse(candidate)}>
                    {prettyLocalDateTimeString(
                      localizations["locale"],
                      candidate
                    )}
                  </th>
                ))}
                <th></th>
              </tr>
              <tr>
                <th></th>
                {columnCounts.map((yinbn, i) => (
                  <th
                    key={candidates[i]}
                    className={
                      best[0] === yinbn[0] &&
                      best[1] === yinbn[1] &&
                      best[2] === yinbn[2]
                        ? "table-primary"
                        : "table-secondary"
                    }
                  >
                    {yinbn[0] + yinbn[1]} ({yinbn[0]}:{yinbn[1]})
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {votes.map((vote) => (
                <tr key={String(vote.voted)}>
                  <td>{vote.name}</td>
                  {candidates.map((c) => (
                    <td
                      key={c}
                      className={cN(
                        new Map(Object.entries(vote.availability)).get(
                          c.substring(0, c.indexOf("T") + 6)
                        )
                      )}
                    >
                      &nbsp;
                    </td>
                  ))}
                  <td>
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={(e) => deleteVote(e, vote.name, vote.voted)}
                    >
                      {localizations["votes.revoke"]}{" "}
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <ElectionVote
                election={props.election}
                token={props.token}
                onElectionChanged={props.onElectionChanged}
              />
            </tfoot>
          </table>
        </div>
      </form>
    </React.Fragment>
  );
}

export default ElectionTally;
