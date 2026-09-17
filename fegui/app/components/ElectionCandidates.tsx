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
import { DayPicker } from "@daypicker/react";
import { de, enUS } from "@daypicker/react/locale";
import "@daypicker/react/style.css";
import { l10nContext } from "../l10nContext";
import { ElectionCandidatesProps } from "../props/ElectionCandidatesProps";

// Use local date parts to avoid UTC/local timezone offset issues
function localDateStr(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// Parse "YYYY-MM-DDTHH:mm:ss" candidates into { "YYYY-MM-DD": ["HH:mm", ...] }
function parseCandidates(candidates: string[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const c of candidates) {
    const date = c.substring(0, 10);
    const time = c.substring(11, 16);
    if (!map[date]) map[date] = [];
    map[date].push(time);
  }
  // Invariant: each date always ends with an empty slot as an "add" affordance
  for (const date of Object.keys(map)) {
    map[date].push("");
  }
  return map;
}

// Flatten back into sorted "YYYY-MM-DDTHH:mm:00" array
function flattenCandidates(schedule: Record<string, string[]>): string[] {
  return Object.keys(schedule)
    .sort((a, b) => a.localeCompare(b))
    .flatMap((date) => schedule[date].filter((time) => time !== "").map((time) => `${date}T${time}:00`));
}

function sameElements(arr1: string[], arr2: string[]): boolean {
  const set = new Set([...arr1, ...arr2]);
  return set.size === new Set(arr1).size && set.size === new Set(arr2).size;
}

function tte(s?: string) {
  return s?.trim() ?? "";
}

function ttu(s?: string) {
  return s === undefined || s.trim() === "" ? undefined : s.trim();
}

function ElectionCandidates(props: Readonly<ElectionCandidatesProps>) {
  const localizations = useContext(l10nContext);
  const locale = localizations["locale"] === "de" ? de : enUS;

  const [schedule, setSchedule] = useState<Record<string, string[]>>(parseCandidates(props.election.candidates));
  const [timeZone, setTimeZone] = useState(props.election.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Noon local time avoids any UTC rollover when DayPicker compares dates
  const selectedDays = Object.keys(schedule).map((ds) => new Date(ds + "T12:00:00"));

  const handleSelect = (days: Date[] | undefined) => {
    const newSchedule: Record<string, string[]> = {};
    for (const day of days ?? []) {
      const ds = localDateStr(day);
      newSchedule[ds] = schedule[ds] ?? [""]; // preserve existing times
    }
    setSchedule(newSchedule);
  };

  const updateTime = (date: string, index: number, time: string) => {
    const times = [...schedule[date]];
    times[index] = time;
    // When the last slot is filled, append a new empty slot
    if (index === times.length - 1 && time !== "") {
      times.push("");
    }
    setSchedule({ ...schedule, [date]: times });
  };

  const removeTime = (date: string, index: number) => {
    const times = schedule[date].filter((_, i) => i !== index);
    if (times.length === 0) {
      // Removing the last time deselects the date entirely
      const { [date]: _removed, ...rest } = schedule;
      setSchedule(rest);
    } else {
      // Re-enforce the invariant: trailing empty slot
      if (times[times.length - 1] !== "") times.push("");
      setSchedule({ ...schedule, [date]: times });
    }
  };

  const candidates = flattenCandidates(schedule);
  const hasEmptyTimes = Object.values(schedule).some((times) => times.every((t) => t === ""));

  const changesSaved = () =>
    sameElements(props.election.candidates, candidates) && tte(props.election.timeZone) === timeZone;

  const cancelSchedule = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSchedule(parseCandidates(props.election.candidates));
    setTimeZone(props.election.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
  };

  const saveSchedule = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    props.election
      .updateElectionSchedule(candidates, ttu(timeZone))
      .then((updated) => props.onElectionChanged(updated))
      .catch((error) => console.error(`failed to put election schedule: ${error}`));
  };

  const timeZoneOptions = props.timeZones.map((tz) => (
    <option key={tz} value={tz}>
      {tz}
    </option>
  ));

  return (
    <form className="d-grid gap-4">
      <div className={changesSaved() ? "card" : "card border-warning"}>
        <div className="card-body">
          <h5 className="card-title">{localizations["datesAndTimes.instruction"]}</h5>

          {/* Timezone */}
          <div className="mb-3">
            <label htmlFor="timeZoneSelect" className="form-label">
              {localizations["datesAndTimes.timeZone"]}
            </label>
            <select
              className="form-select"
              id="timeZoneSelect"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
            >
              {timeZoneOptions}
            </select>
            <div className="form-text">
              <i className="bi bi-info-circle-fill" /> {localizations["datesAndTimes.timeZoneMotivation"]}
            </div>
          </div>

          {/* Calendar + per-date times */}
          <div className="row align-items-start">
            <div className="col-auto">
              <div className="border rounded p-1">
                <DayPicker
                  mode="multiple"
                  selected={selectedDays}
                  onSelect={handleSelect}
                  disabled={{ before: today }}
                  locale={locale}
                />
              </div>
            </div>
            <div className="col">
              {Object.keys(schedule).length === 0 ? (
                <p className="text-muted fst-italic">{localizations["datesAndTimes"]}</p>
              ) : (
                Object.keys(schedule)
                  .sort((a, b) => a.localeCompare(b))
                  .map((date) => (
                    <div key={date} className="mb-3">
                      <div className="fw-semibold mb-1">
                        {new Date(date + "T12:00:00").toLocaleDateString(localizations["locale"], {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      {schedule[date].map((time, i) => (
                        <div key={`${date}T${time}`} className="input-group mb-1">
                          <input
                            type="time"
                            className="form-control"
                            value={time}
                            onChange={(e) => updateTime(date, i, e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => removeTime(date, i)}
                            title="Remove this time"
                          >
                            <i className="bi bi-dash-lg" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
        <div className={changesSaved() ? "card-footer" : "card-footer bg-warning"}>
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button className="btn btn-secondary" onClick={cancelSchedule}>
              {localizations["revert"]}
            </button>
            <button
              className="btn btn-primary"
              onClick={saveSchedule}
              disabled={candidates.length === 0 || hasEmptyTimes || changesSaved()}
            >
              {localizations["save"]}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default ElectionCandidates;
