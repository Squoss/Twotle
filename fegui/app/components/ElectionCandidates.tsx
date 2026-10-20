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

import React, { useEffect, useRef, useState } from "react";
import type { Datepicker } from "bootstrap";
import { useLocalizations } from "../localizations";
import { useElectionSubmit } from "../useElectionSubmit";
import { ElectionCandidatesProps } from "../props/ElectionCandidatesProps";

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
  const localizations = useLocalizations();
  const submit = useElectionSubmit();
  const locale = localizations["locale"];

  const [schedule, setSchedule] = useState<Record<string, string[]>>(parseCandidates(props.election.candidates));
  const [timeZone, setTimeZone] = useState(props.election.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Bootstrap's Datepicker renders the calendar into this element; its selected dates ("YYYY-MM-DD") are the schedule's keys
  const calendarRef = useRef<HTMLDivElement>(null);
  const datepickerRef = useRef<Datepicker | null>(null);

  useEffect(() => {
    const element = calendarRef.current!;
    let disposed = false;
    const handleSelect = (event: Event) => {
      const { dates } = event as Event & { dates: string[] };
      setSchedule((schedule) => Object.fromEntries(dates.map((date) => [date, schedule[date] ?? [""]]))); // preserve existing times
    };
    element.addEventListener("change.bs.datepicker", handleSelect);
    // imported dynamically because route modules are also pre-rendered in Node (cf. entry.client.tsx)
    import("bootstrap").then(({ Datepicker }) => {
      if (!disposed) {
        datepickerRef.current = new Datepicker(element, {
          inline: true,
          selectionMode: "multiple",
          dateMin: "today",
          locale,
          selectedDates: Object.keys(schedule),
        });
      }
    });
    return () => {
      disposed = true;
      element.removeEventListener("change.bs.datepicker", handleSelect);
      datepickerRef.current?.dispose();
      datepickerRef.current = null;
    };
  }, [locale]);

  // the calendar follows changes it didn't make (e.g., reverting, or removing a date's last time)
  useEffect(() => {
    const dates = Object.keys(schedule).sort((a, b) => a.localeCompare(b));
    const datepicker = datepickerRef.current;
    if (datepicker && datepicker.getSelectedDates().sort((a, b) => a.localeCompare(b)).join() !== dates.join()) {
      datepicker.setSelectedDates(dates);
    }
  }, [schedule]);

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
    submit({ intent: "updateElectionSchedule", candidates, timeZone: ttu(timeZone) });
  };

  const timeZoneOptions = props.timeZones.map((tz) => (
    <option key={tz} value={tz}>
      {tz}
    </option>
  ));

  return (
    <form className="d-grid gap-7">
      <div className={changesSaved() ? "card" : "card border-warning"}>
        <div className="card-body">
          <h5 className="card-title">{localizations["datesAndTimes.instruction"]}</h5>

          {/* Timezone */}
          <div className="mb-5">
            <label htmlFor="timeZoneSelect" className="form-label">
              {localizations["datesAndTimes.timeZone"]}
            </label>
            <select
              className="form-control"
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
              <div ref={calendarRef}></div>
            </div>
            <div className="col">
              {Object.keys(schedule).length === 0 ? (
                <p className="fg-secondary fst-italic">{localizations["datesAndTimes"]}</p>
              ) : (
                Object.keys(schedule)
                  .sort((a, b) => a.localeCompare(b))
                  .map((date) => (
                    <div key={date} className="mb-5">
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
                            className="btn-solid theme-danger"
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
          <div className="d-grid gap-3 md:d-flex md:justify-content-end">
            <button className="btn-solid theme-secondary" onClick={cancelSchedule}>
              {localizations["revert"]}
            </button>
            <button
              className="btn-solid theme-primary"
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
