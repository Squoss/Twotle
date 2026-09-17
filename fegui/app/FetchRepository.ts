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

import {
  ElectionData,
  ElectionEntity,
  ElectionError,
  ElectionErrorReason,
  PostElectionResponse,
  Repository,
  Visibility,
} from "@twotle/hexagon";
import { fetchResource, Method } from "./fetchJson";

// the inverse of beapi's ElectionsController.toErrorResponse
function toElectionError(status: number): ElectionError {
  switch (status) {
    case 400:
      return new ElectionError(ElectionErrorReason.COMMANDINCOMPLETE);
    case 403:
      return new ElectionError(ElectionErrorReason.ACCESSDENIED);
    case 404:
      return new ElectionError(ElectionErrorReason.NOTFOUND);
    case 409:
      return new ElectionError(ElectionErrorReason.PROTECTEDACCESS);
    case 410:
      return new ElectionError(ElectionErrorReason.PRIVATEACCESS);
    default:
      return new ElectionError(ElectionErrorReason.UNEXPECTED);
  }
}

export class FetchRepository implements Repository {
  postElection = (): Promise<PostElectionResponse> =>
    fetchResource<PostElectionResponse>(Method.Post, "/iapi/elections").then(
      (response) => {
        if (response.status !== 201) {
          throw new Error(`HTTP status ${response.status} instead of 201`);
        }
        return response.parsedBody!;
      }
    );

  getElection = (id: string, token: string, timeZone: string): Promise<ElectionEntity> =>
    fetchResource<ElectionData>(
      Method.Get,
      `/iapi/elections/${id}?${new URLSearchParams({ timeZone })}`,
      token
    ).then((response) => {
      if (!response.ok) {
        throw toElectionError(response.status);
      }
      return new ElectionEntity(this, response.parsedBody!);
    });

  putElectionText = (id: string, token: string, name: string, description?: string): Promise<void> =>
    fetchResource(Method.Put, `/iapi/elections/${id}/text`, token, {
      name,
      description,
    }).then((response) => {
      if (response.status !== 204) {
        throw toElectionError(response.status);
      }
    });

  putElectionSchedule = (id: string, token: string, candidates: Array<string>, timeZone?: string): Promise<void> =>
    fetchResource(Method.Put, `/iapi/elections/${id}/nominees`, token, {
      candidates,
      timeZone,
    }).then((response) => {
      if (response.status !== 204) {
        throw toElectionError(response.status);
      }
    });

  patchElectionSubscriptions = (id: string, token: string, emailAddress?: string, phoneNumber?: string): Promise<void> =>
    fetchResource(Method.Patch, `/iapi/elections/${id}/subscriptions`, token, {
      emailAddress,
      phoneNumber,
    }).then((response) => {
      if (response.status !== 204) {
        throw toElectionError(response.status);
      }
    });

  putElectionVisibility = (id: string, token: string, visibility: Visibility): Promise<void> =>
    fetchResource(Method.Put, `/iapi/elections/${id}/visibility`, token, {
      visibility,
    }).then((response) => {
      if (response.status !== 204) {
        throw toElectionError(response.status);
      }
    });

  postReminder = (id: string, token: string, emailAddress?: string, phoneNumber?: string): Promise<void> =>
    fetchResource(Method.Post, `/iapi/elections/${id}/reminders`, token, {
      emailAddress,
      phoneNumber,
    }).then((response) => {
      if (response.status !== 204) {
        throw toElectionError(response.status);
      }
    });

  postVote = (id: string, token: string, name: string, availability: Map<string, string>, timeZone?: string): Promise<void> =>
    fetchResource(Method.Post, `/iapi/elections/${id}/votes`, token, {
      name,
      timeZone,
      availability: Object.fromEntries(availability),
    }).then((response) => {
      if (response.status !== 204) {
        throw toElectionError(response.status);
      }
    });

  deleteVote = (id: string, token: string, name: string, voted: Date): Promise<void> =>
    fetchResource<void>(Method.Delete, `/iapi/elections/${id}/votes?${new URLSearchParams({ name, voted: String(voted) })}`, token)
      .then((response) => {
        if (response.status !== 204) {
          throw toElectionError(response.status);
        }
      });

  deleteElection = (id: string, token: string): Promise<void> =>
    fetchResource<void>(Method.Delete, `/iapi/elections/${id}`, token)
      .then((response) => {
        if (response.status !== 204) {
          throw toElectionError(response.status);
        }
      });
}
