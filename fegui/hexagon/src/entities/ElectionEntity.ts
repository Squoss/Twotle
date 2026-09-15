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

import { Repository } from "../driven_ports/Repository";
import { Availability } from "../value_objects/Availability";
import { SubscriptionChannels } from "../value_objects/SubscriptionChannels";
import { Visibility } from "../value_objects/Visibility";
import { Vote } from "../value_objects/Vote";

export type ElectionData = {
  id: number;
  organizerToken: string;
  voterToken: string;
  name: string;
  description?: string;
  timeZone?: string;
  candidates: Array<string>;
  visibility: Visibility;
  created: Date;
  updated: Date;
  votes: Array<Vote>;
  subscriptions: SubscriptionChannels;
};

export class ElectionEntity {
  private readonly repository: Repository;

  id: number;
  organizerToken: string;
  voterToken: string;
  name: string;
  description?: string;
  timeZone?: string;
  candidates: Array<string>;
  visibility: Visibility;
  created: Date;
  updated: Date;
  votes: Array<Vote>;
  subscriptions: SubscriptionChannels;

  constructor(repository: Repository, data: ElectionData) {
    this.repository = repository;
    this.id = data.id;
    this.organizerToken = data.organizerToken;
    this.voterToken = data.voterToken;
    this.name = data.name;
    this.description = data.description;
    this.timeZone = data.timeZone;
    this.candidates = data.candidates;
    this.visibility = data.visibility;
    this.created = data.created;
    this.updated = data.updated;
    this.votes = data.votes;
    this.subscriptions = data.subscriptions;
  }

  updateElectionText(name: string, description?: string): Promise<ElectionEntity> {
    this.name = name;
    this.description = description;
    return this.repository.putElectionText(String(this.id), this.organizerToken, name, description)
      .then(() => this.with({}));
  }

  updateElectionSchedule(candidates: Array<string>, timeZone?: string): Promise<ElectionEntity> {
    this.candidates = candidates;
    this.timeZone = timeZone;
    return this.repository.putElectionSchedule(String(this.id), this.organizerToken, candidates, timeZone)
      .then(() => this.with({}));
  }

  updateElectionSubscriptions(emailAddress?: string, phoneNumber?: string): Promise<ElectionEntity> {
    this.subscriptions = { emailAddress, phoneNumber };
    return this.repository.patchElectionSubscriptions(String(this.id), this.organizerToken, emailAddress, phoneNumber)
      .then(() => this.with({}));
  }

  updateElectionVisibility(visibility: Visibility): Promise<ElectionEntity> {
    this.visibility = visibility;
    return this.repository.putElectionVisibility(String(this.id), this.organizerToken, visibility)
      .then(() => this.with({}));
  }

  sendLinksReminder(emailAddress?: string, phoneNumber?: string): Promise<void> {
    return this.repository.postReminder(String(this.id), this.organizerToken, emailAddress, phoneNumber);
  }

  castVote(token: string, name: string, availability: Map<string, Availability>, timeZone?: string): Promise<ElectionEntity> {
    return this.repository.postVote(String(this.id), token, name, availability, timeZone)
      .then(() => this.repository.getElection(String(this.id), token, this.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone));
  }

  revokeVote(token: string, name: string, voted: Date): Promise<ElectionEntity> {
    return this.repository.deleteVote(String(this.id), token, name, voted)
      .then(() => this.repository.getElection(String(this.id), token, this.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone));
  }

  with(overrides: Partial<ElectionData>): ElectionEntity {
    return new ElectionEntity(this.repository, {
      id: this.id,
      organizerToken: this.organizerToken,
      voterToken: this.voterToken,
      name: this.name,
      description: this.description,
      timeZone: this.timeZone,
      candidates: this.candidates,
      visibility: this.visibility,
      created: this.created,
      updated: this.updated,
      votes: this.votes,
      subscriptions: this.subscriptions,
      ...overrides,
    });
  }
}
