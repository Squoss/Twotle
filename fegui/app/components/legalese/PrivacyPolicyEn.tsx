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

// cf. PrivacyPolicyDe.tsx, which has to say the same
function PrivacyPolicyEn() {
  return (
    <React.Fragment>
      <h1>Privacy Policy</h1>
      <p>As of October 19, 2026</p>
      <p>
        This policy covers the web app Twotle at twotle.com. It says what personal data Squeng AG processes, why, and
        for how long. It follows the Swiss Federal Act on Data Protection (FADP) and, insofar as it applies, the General
        Data Protection Regulation (GDPR).
      </p>

      <h2>In short</h2>
      <ul>
        <li>There is no account: no sign-up and no password. An election's links are its keys.</li>
        <li>Anyone who has an election's link can read the election, including the names of those who voted.</li>
        <li>
          No analytics, no advertising and no cookie banner: the site sets only cookies it needs, and the browser
          contacts no other party.
        </li>
      </ul>

      <h2>Controller</h2>
      <p>
        Squeng AG, at the address given in the <Link to="/legalese/im">imprint</Link>.
        <br />
        E-mail: <a href="mailto:twotle@squeng.com">twotle@squeng.com</a>
      </p>

      <h2>The website</h2>
      <h3>Visiting the site</h3>
      <p>
        When a page is opened, the browser sends its IP address and the usual request headers, such as the browser
        type and the preferred language, to the server. They are needed to deliver the page and are used for nothing
        else. Twotle itself does not write them down: it keeps no access log. If a request fails with a server error,
        the error log records the request's method and its address on the site, but not who sent it. Such an address
        can contain an election's ID and, when a vote is revoked, the voter's name.
      </p>
      <p>
        The servers are operated by Clever Cloud SAS, Nantes, France, in its Paris region. Clever Cloud keeps an access
        log of its own, which records each request with its IP address and its address on the site. It keeps both this
        log and the error log for seven days. While an e-mail address or phone number is being checked, the recorded
        addresses include that address or number.
      </p>
      <p>Legal basis under the GDPR: Art. 6(1)(f), the legitimate interest in delivering the site and keeping it secure.</p>

      <h3>Cookies and browser storage</h3>
      <p>The site sets no tracking cookies. It sets two cookies of its own, both deleted when the browser is closed:</p>
      <ul>
        <li>
          <strong>
            <code>PLAY_SESSION</code>
          </strong>{" "}
          holds a random token that protects Twotle's requests against cross-site request forgery. It is set when the
          first page loads, because the site cannot work securely without it.
        </li>
        <li>
          <strong>
            <code>PLAY_LANG</code>
          </strong>{" "}
          holds the language picked from the language menu (<code>en</code> or <code>de</code>). It is set only when a
          language is picked.
        </li>
      </ul>
      <p>
        Nothing else is stored in the browser, not even dark mode, which is reset whenever the page is reloaded.
        Cookies that a site needs, or that store a choice the visitor made, require no consent, so there is no cookie
        banner. Both cookies can be deleted at any time in the browser's settings.
      </p>

      <h3>Other websites</h3>
      <p>
        Fonts, icons, styles and scripts all come from twotle.com itself, so the browser contacts no other party. Links
        to other websites, such as GitHub or Leanpub, lead to sites whose own privacy policies apply.
      </p>

      <h2>Elections</h2>
      <h3>What is stored</h3>
      <p>Twotle stores what organizers and voters enter:</p>
      <ul>
        <li>for an election: its name and description, the proposed dates and times, and their time zone</li>
        <li>
          for a vote: the name the voter gave, their answer for each date and time, their time zone, and when they
          voted
        </li>
        <li>
          for notifications: the e-mail address and the phone number that an organizer saved in the election's
          settings, and the organizer's language
        </li>
      </ul>
      <p>
        Twotle records every change as an event. Earlier names, descriptions and dates, as well as revoked votes,
        therefore remain in an election's history until the election is deleted.
      </p>

      <h3>Who can see it</h3>
      <p>
        There are no accounts. Instead, every election has two links, each holding a random key. Anyone with the
        voter link can see the election and all of its votes, including the voters' names. Anyone with the organizer
        link can also see the election's settings, but only they see the e-mail address and phone number saved there.
        Squeng AG does not know who is behind an election. A voter's name need not be their full name, and nothing
        sensitive belongs in an election.
      </p>

      <h3>How long</h3>
      <p>
        An election is kept until it is deleted with its organizer link. Deleting it removes the election together
        with its whole history at once. Squeng AG may also delete elections at any time, in particular ones that are no
        longer in use.
      </p>
      <p>
        The database is MongoDB Atlas, operated by MongoDB Limited, Ireland, with the data stored at Microsoft Azure in
        the Netherlands. It keeps no backups, so a deleted election is gone for good.
      </p>
      <p>
        Legal basis under the GDPR: Art. 6(1)(b), because the processing is necessary to provide the service that
        organizers and voters use.
      </p>

      <h3>Notifications and reminders</h3>
      <p>
        When an e-mail address or phone number is entered, the server checks whether it is valid. It is stored only
        once Save is clicked.
      </p>
      <p>
        If an e-mail address or phone number is saved in an election's settings, Twotle notifies that address or number
        whenever a vote is cast or revoked. Such a notification contains the election's name, the voter's name and the
        voter link. On request, Twotle also sends the organizer link to an e-mail address or phone number entered for
        that purpose, which is not stored.
      </p>
      <p>
        E-mails are sent through Mailjet SAS, France. Messages to phone numbers are sent through the Threema Gateway of
        Threema GmbH, Switzerland: Threema looks up which Threema user the phone number belongs to and delivers the
        message in the Threema app. On behalf of Squeng AG, both providers process the recipient and the content of
        the message, including the link it contains.
      </p>

      <h2>Disclosure and transfers abroad</h2>
      <p>
        Personal data is neither sold nor shared for advertising. Only the providers named above process it on behalf
        of Squeng AG: Clever Cloud (France), MongoDB (Ireland, with the data in the Netherlands), Mailjet (France) and
        Threema (Switzerland). According to the Swiss Federal Council, these EU countries provide adequate data
        protection. For support, MongoDB may give affiliates outside Europe access, such as MongoDB, Inc. in the USA.
        MongoDB, Inc. is certified under the Swiss-U.S. Data Privacy Framework, which the Federal Council recognises as
        adequate.
      </p>
      <p>Nobody is profiled, and no decision is made automatically about anybody.</p>

      <h2>Rights</h2>
      <p>
        The FADP and the GDPR grant a right of access to one's personal data, and the right to have it corrected or
        deleted. The GDPR adds the rights to restrict processing, to object to it and to data portability. Requests go
        to <a href="mailto:twotle@squeng.com">twotle@squeng.com</a>.
      </p>
      <p>
        Because Twotle has no accounts, Squeng AG cannot tell on its own which elections concern somebody, so a request
        about an election has to include one of its links. Anyone with an election's voter link can also revoke a vote
        directly, and anyone with its organizer link can delete the election.
      </p>
      <p>
        Complaints can be lodged with the Swiss Federal Data Protection and Information Commissioner (FDPIC,{" "}
        <a href="https://www.edoeb.admin.ch" target="FDPIC" rel="noreferrer noopener">
          edoeb.admin.ch
        </a>
        ) or, in the EU and the EEA, with the supervisory authority of one's country.
      </p>

      <h2>Changes</h2>
      <p>
        This policy changes when what is processed changes, and the current version is always the one here. Every
        change can be traced in the public{" "}
        <a href="https://github.com/Squoss/Twotle" target="GitHub" rel="noreferrer noopener">
          repository on GitHub
        </a>
        .
      </p>
    </React.Fragment>
  );
}

export default PrivacyPolicyEn;
