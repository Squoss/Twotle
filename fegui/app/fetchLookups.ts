/*
 * The MIT License
 *
 * Copyright (c) 2026 Squeng AG
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

import { fetchResource, Method } from "./fetchJson";

// like beapi's I18nController and ValidationsController, these lookups bypass the hexagon

interface Validity {
  value: string;
  valid: boolean;
}

const get = <T>(path: string): Promise<T> =>
  fetchResource<T>(Method.Get, path).then((response) => {
    if (response.status !== 200) {
      throw new Error(`HTTP status ${response.status} instead of 200`);
    }
    return response.parsedBody!;
  });

export const getLocalizations = (): Promise<Record<string, string>> =>
  get<Record<string, string>>("/iapi/l10nMessages");

// the time zones don't change while the app runs, so every revalidation of an election reuses the first request (unless that failed)
let timeZones: Promise<Array<string>> | undefined;

export const getTimeZones = (): Promise<Array<string>> => {
  timeZones ??= get<Array<string>>("/iapi/timeZones").catch((error) => {
    timeZones = undefined;
    throw error;
  });
  return timeZones;
};

// URLSearchParams encodes e.g. "+", which would otherwise arrive as a space
export const isValidCellPhoneNumber = (cellPhoneNumber: string): Promise<boolean> =>
  get<Validity>(`/iapi/validations/cellPhoneNumbers?${new URLSearchParams({ cellPhoneNumber })}`).then((validity) => validity.valid);

export const isValidEmailAddress = (emailAddress: string): Promise<boolean> =>
  get<Validity>(`/iapi/validations/emailAddresses?${new URLSearchParams({ emailAddress })}`).then((validity) => validity.valid);
