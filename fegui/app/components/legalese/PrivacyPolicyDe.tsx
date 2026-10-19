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

// cf. PrivacyPolicyEn.tsx, which has to say the same
function PrivacyPolicyDe() {
  return (
    <React.Fragment>
      <h1>Datenschutz&shy;erklärung</h1>
      <p>Stand: 19. Oktober 2026</p>
      <p>
        Diese Erklärung gilt für die Web-App Twotle unter twotle.com. Sie legt dar, welche Personendaten die Squeng AG
        bearbeitet, wozu und wie lange. Sie richtet sich nach dem Bundesgesetz über den Datenschutz (DSG) und, soweit
        diese anwendbar ist, nach der Datenschutz-Grundverordnung (DSGVO).
      </p>

      <h2>Kurz gesagt</h2>
      <ul>
        <li>Es gibt kein Konto: keine Registrierung und kein Passwort. Die Links einer Wahl sind ihre Schlüssel.</li>
        <li>Wer einen Link einer Wahl hat, kann die Wahl lesen, samt den Namen derer, die abgestimmt haben.</li>
        <li>
          Keine Analyse, keine Werbung und kein Cookie-Banner: Die Website setzt nur Cookies, die sie braucht, und der
          Browser tritt mit keiner anderen Stelle in Kontakt.
        </li>
      </ul>

      <h2>Verantwortliche</h2>
      <p>
        Squeng AG, Adresse siehe <Link to="/legalese/im">Impressum</Link>.
        <br />
        E-Mail: <a href="mailto:twotle@squeng.com">twotle@squeng.com</a>
      </p>

      <h2>Die Website</h2>
      <h3>Besuch der Website</h3>
      <p>
        Beim Aufruf einer Seite sendet der Browser seine IP-Adresse und die üblichen Angaben einer Anfrage, etwa den
        Browsertyp und die bevorzugte Sprache, an den Server. Sie werden gebraucht, um die Seite auszuliefern, und für
        nichts anderes verwendet. Twotle selbst zeichnet sie nicht auf: Es gibt kein Zugriffsprotokoll. Scheitert eine
        Anfrage an einem Serverfehler, hält das Fehlerprotokoll die Methode der Anfrage und die angefragte Adresse der
        Website fest, aber nicht, von wem sie stammt. Eine solche Adresse kann die Kennung einer Wahl enthalten und,
        wenn eine Stimme annulliert wird, den Namen der Wählerin oder des Wählers.
      </p>
      <p>
        Die Server betreibt die Clever Cloud SAS, Nantes, Frankreich, in ihrer Region Paris. Clever Cloud führt ein
        eigenes Zugriffsprotokoll, das jede Anfrage mit ihrer IP-Adresse und der angefragten Adresse der Website
        festhält. Dieses wie auch das Fehlerprotokoll bewahrt sie sieben Tage lang auf. Während eine E-Mail-Adresse oder
        Telefonnummer geprüft wird, gehört zu den festgehaltenen Adressen auch diese Adresse oder Nummer.
      </p>
      <p>
        Rechtsgrundlage nach DSGVO: Art. 6 Abs. 1 lit. f, das berechtigte Interesse, die Website auszuliefern und
        sicher zu betreiben.
      </p>

      <h3>Cookies und Speicher im Browser</h3>
      <p>
        Die Website setzt keine Tracking-Cookies. Sie setzt zwei eigene Cookies, die beide beim Schliessen des Browsers
        gelöscht werden:
      </p>
      <ul>
        <li>
          <strong>
            <code>PLAY_SESSION</code>
          </strong>{" "}
          enthält ein zufälliges Token, das die Anfragen von Twotle vor Cross-Site Request Forgery schützt. Es wird
          beim Laden der ersten Seite gesetzt, weil die Website ohne es nicht sicher funktionieren kann.
        </li>
        <li>
          <strong>
            <code>PLAY_LANG</code>
          </strong>{" "}
          enthält die im Sprachmenü gewählte Sprache (<code>en</code> oder <code>de</code>). Es wird erst gesetzt, wenn
          eine Sprache gewählt wird.
        </li>
      </ul>
      <p>
        Sonst wird nichts im Browser gespeichert, auch nicht der dunkle Modus, der bei jedem Neuladen der Seite
        zurückgesetzt wird. Cookies, die eine Website braucht oder die eine Wahl der Besucherin oder des Besuchers
        speichern, bedürfen keiner Einwilligung, darum gibt es auch kein Cookie-Banner. Beide Cookies lassen sich
        jederzeit in den Einstellungen des Browsers löschen.
      </p>

      <h3>Andere Websites</h3>
      <p>
        Schriften, Symbole, Stile und Skripte stammen alle von twotle.com selbst, sodass der Browser mit keiner anderen
        Stelle in Kontakt tritt. Links auf andere Websites, etwa GitHub oder Leanpub, führen auf Websites, für die deren
        eigene Datenschutzerklärungen gelten.
      </p>

      <h2>Wahlen</h2>
      <h3>Was gespeichert wird</h3>
      <p>Twotle speichert, was Organisatorinnen und Organisatoren sowie Wählerinnen und Wähler eingeben:</p>
      <ul>
        <li>zu einer Wahl: ihren Namen und ihre Beschreibung, die vorgeschlagenen Daten und Zeiten und deren Zeitzone</li>
        <li>
          zu einer Stimme: den angegebenen Namen, die Antwort zu jedem Datum und jeder Zeit, die Zeitzone und den
          Zeitpunkt der Stimmabgabe
        </li>
        <li>
          für Mitteilungen: die E-Mail-Adresse und die Telefonnummer, die in den Einstellungen der Wahl gespeichert
          wurden, und die Sprache der Organisatorin oder des Organisators
        </li>
      </ul>
      <p>
        Twotle hält jede Änderung als Ereignis fest. Frühere Namen, Beschreibungen und Daten sowie annullierte Stimmen
        bleiben darum im Verlauf einer Wahl, bis die Wahl gelöscht wird.
      </p>

      <h3>Wer es sehen kann</h3>
      <p>
        Es gibt keine Konten. Stattdessen hat jede Wahl zwei Links, die je einen zufälligen Schlüssel enthalten. Wer
        den Wähler-Link hat, sieht die Wahl und alle ihre Stimmen, samt den Namen der Wählerinnen und Wähler. Wer den
        Organisator-Link hat, sieht zudem die Einstellungen der Wahl, und nur wer ihn hat, sieht die dort gespeicherte
        E-Mail-Adresse und Telefonnummer. Die Squeng AG weiss nicht, wer hinter einer Wahl steht. Der Name zu einer
        Stimme muss nicht der volle Name sein, und Heikles gehört nicht in eine Wahl.
      </p>

      <h3>Wie lange</h3>
      <p>
        Eine Wahl bleibt bestehen, bis sie mit ihrem Organisator-Link gelöscht wird. Das Löschen entfernt die Wahl samt
        ihrem ganzen Verlauf auf einmal. Die Squeng AG kann Wahlen zudem jederzeit löschen, insbesondere solche, die
        nicht mehr genutzt werden.
      </p>
      <p>
        Die Datenbank ist MongoDB Atlas der MongoDB Limited, Irland; die Daten liegen bei Microsoft Azure in den
        Niederlanden. Sie führt keine Sicherungskopien, sodass eine gelöschte Wahl endgültig weg ist.
      </p>
      <p>
        Rechtsgrundlage nach DSGVO: Art. 6 Abs. 1 lit. b, weil die Bearbeitung für die Erbringung des Dienstes nötig
        ist, den Organisatorinnen und Organisatoren sowie Wählerinnen und Wähler nutzen.
      </p>

      <h3>Mitteilungen und Erinnerungen</h3>
      <p>
        Wird eine E-Mail-Adresse oder Telefonnummer eingegeben, prüft der Server, ob sie gültig ist. Gespeichert wird
        sie erst mit einem Klick auf «Speichern».
      </p>
      <p>
        Ist in den Einstellungen einer Wahl eine E-Mail-Adresse oder Telefonnummer gespeichert, benachrichtigt Twotle
        diese Adresse oder Nummer, sobald eine Stimme abgegeben oder annulliert wird. Eine solche Mitteilung enthält den
        Namen der Wahl, den Namen der Wählerin oder des Wählers und den Wähler-Link. Auf Wunsch schickt Twotle zudem den
        Organisator-Link an eine dafür eingegebene E-Mail-Adresse oder Telefonnummer, die nicht gespeichert wird.
      </p>
      <p>
        E-Mails werden über die Mailjet SAS, Frankreich, versandt. Nachrichten an Telefonnummern werden über das Threema
        Gateway der Threema GmbH, Schweiz, versandt: Threema ermittelt, welchem Threema-Nutzer die Telefonnummer gehört,
        und stellt die Nachricht in der Threema-App zu. Beide Anbieter bearbeiten im Auftrag der Squeng AG die
        Empfängerin oder den Empfänger und den Inhalt der Nachricht, samt dem darin enthaltenen Link.
      </p>

      <h2>Bekanntgabe und Übermittlung ins Ausland</h2>
      <p>
        Personendaten werden weder verkauft noch für Werbung weitergegeben. Einzig die oben genannten Anbieter
        bearbeiten sie im Auftrag der Squeng AG: Clever Cloud (Frankreich), MongoDB (Irland, mit den Daten in den
        Niederlanden), Mailjet (Frankreich) und Threema (Schweiz). Diese EU-Staaten gewährleisten gemäss dem Bundesrat
        einen angemessenen Datenschutz. Für den Support kann MongoDB verbundenen Unternehmen ausserhalb Europas Zugriff
        gewähren, etwa der MongoDB, Inc. in den USA. Diese ist unter dem Swiss-U.S. Data Privacy Framework zertifiziert,
        das der Bundesrat als angemessen anerkennt.
      </p>
      <p>Niemand wird profiliert, und über niemanden wird automatisiert entschieden.</p>

      <h2>Rechte</h2>
      <p>
        DSG und DSGVO gewähren ein Recht auf Auskunft über die eigenen Personendaten sowie auf deren Berichtigung oder
        Löschung. Die DSGVO ergänzt die Rechte auf Einschränkung der Bearbeitung, auf Widerspruch und auf
        Datenübertragbarkeit. Anfragen gehen an <a href="mailto:twotle@squeng.com">twotle@squeng.com</a>.
      </p>
      <p>
        Weil Twotle keine Konten kennt, kann die Squeng AG nicht von sich aus erkennen, welche Wahlen jemanden
        betreffen. Eine Anfrage zu einer Wahl muss darum einen ihrer Links nennen. Wer den Wähler-Link einer Wahl hat,
        kann eine Stimme auch direkt annullieren, und wer ihren Organisator-Link hat, kann die Wahl löschen.
      </p>
      <p>
        Beschwerden sind beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB,{" "}
        <a href="https://www.edoeb.admin.ch" target="FDPIC" rel="noreferrer noopener">
          edoeb.admin.ch
        </a>
        ) möglich oder, in der EU und im EWR, bei der Aufsichtsbehörde des eigenen Landes.
      </p>

      <h2>Änderungen</h2>
      <p>
        Diese Erklärung ändert sich, wenn sich ändert, was bearbeitet wird, und gültig ist stets die Fassung an dieser
        Stelle. Jede Änderung lässt sich im öffentlichen{" "}
        <a href="https://github.com/Squoss/Twotle" target="GitHub" rel="noreferrer noopener">
          Repository auf GitHub
        </a>{" "}
        nachvollziehen.
      </p>
    </React.Fragment>
  );
}

export default PrivacyPolicyDe;
