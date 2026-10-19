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

import React from "react";
import { Link } from "react-router";

// cf. TermsOfServiceDe.tsx, which has to say the same
function TermsOfServiceEn() {
  return (
    <React.Fragment>
      <h1>Terms of Service</h1>
      <p>As of October 19, 2026</p>
      <p>
        These terms govern the use of Twotle at twotle.com. The provider is Squeng AG, at the address given in the{" "}
        <Link to="/legalese/im">imprint</Link>. How personal data is handled is set out in the{" "}
        <Link to="/legalese/pp">privacy policy</Link>.
      </p>

      <h2>What Twotle is</h2>
      <p>
        Twotle helps a group fix a date and time. Organizers hold an election by proposing dates and times, and voters
        answer each of them with yes, no or if need be.
      </p>
      <p>
        Twotle is the teaching aid of a{" "}
        <a href="https://leanpub.com/DevWebApps" target="Leanpub" rel="noreferrer noopener">
          textbook
        </a>{" "}
        and is free of charge. It is meant for learning and trying things out, not for anything that depends on it.
      </p>

      <h2>The links are the keys</h2>
      <p>Twotle has no accounts and no passwords. Instead, every election has two links:</p>
      <ul>
        <li>
          Anyone with the <strong>voter link</strong> can see the election and all of its votes, including the voters'
          names, and can cast and revoke votes.
        </li>
        <li>
          Anyone with the <strong>organizer link</strong> can also change, hide and delete the election.
        </li>
      </ul>
      <p>
        A link should be treated like a password. Squeng AG does not know who created an election. It cannot restore a
        lost organizer link, nor take back a link that has been passed on. An election whose link has spread too far
        can be hidden or deleted with its organizer link.
      </p>

      <h2>What users enter</h2>
      <p>
        Organizers and voters are responsible for what they enter. Unlawful content is not allowed, and neither is
        sensitive data, such as on health, or other people's personal data without the right to share it. Reminders
        and notifications may be sent only to one's own e-mail address or phone number.
      </p>

      <h2>Fair use</h2>
      <p>
        Creating elections or votes automatically or in bulk, trying to guess other people's links, overloading or
        attacking Twotle, sending unsolicited messages through it, or using it for unlawful purposes is not allowed.
        Squeng AG may refuse requests that do any of these, and delete the elections involved.
      </p>

      <h2>Availability and changes</h2>
      <p>
        Squeng AG operates Twotle with care, but without any guaranteed availability. Maintenance and outages happen,
        and elections may be lost. Squeng AG may change, suspend or discontinue Twotle at any time, and may delete
        elections, in particular ones that break these terms.
      </p>

      <h2>Source code</h2>
      <p>
        Twotle's source code is published on{" "}
        <a href="https://github.com/Squoss/Twotle" target="GitHub" rel="noreferrer noopener">
          GitHub
        </a>{" "}
        under the MIT license. These terms do not restrict any right under that license. They govern the service that
        Squeng AG operates at twotle.com.
      </p>

      <h2>Liability</h2>
      <p>
        Squeng AG is liable for damage it causes intentionally or through gross negligence. To the extent the law
        permits, any further liability is excluded, in particular for the loss of elections or votes, for notifications
        that arrive late or not at all, and for indirect or consequential damage. Mandatory statutory liability remains
        unaffected.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        Squeng AG may change these terms with effect for the future. The version in force is always the one here, and
        every change can be traced in the public repository on GitHub.
      </p>

      <h2>Law and jurisdiction</h2>
      <p>
        These terms are governed by Swiss law, excluding its conflict-of-law rules. The place of jurisdiction is the
        seat of Squeng AG. Consumers keep the protection of the mandatory law of the country where they live, and may
        also sue there.
      </p>
    </React.Fragment>
  );
}

export default TermsOfServiceEn;
