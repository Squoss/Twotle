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

// cf. TermsOfServiceEn.tsx, which has to say the same
function TermsOfServiceDe() {
  return (
    <React.Fragment>
      <h1>Nutzungs&shy;bedingungen</h1>
      <p>Stand: 19. Oktober 2026</p>
      <p>
        Diese Bedingungen regeln die Nutzung von Twotle unter twotle.com. Anbieterin ist die Squeng AG, Adresse siehe{" "}
        <Link to="/legalese/im">Impressum</Link>. Der Umgang mit Personendaten ist in der{" "}
        <Link to="/legalese/pp">Datenschutzerklärung</Link> dargelegt.
      </p>

      <h2>Was Twotle ist</h2>
      <p>
        Twotle hilft einer Gruppe, ein Datum und eine Zeit festzulegen. Organisatorinnen und Organisatoren führen eine
        Wahl durch, indem sie Daten und Zeiten vorschlagen, und Wählerinnen und Wähler beantworten jeden Vorschlag mit
        Ja, Nein oder Wenns sein muss.
      </p>
      <p>
        Twotle ist das Lehrobjekt eines{" "}
        <a href="https://leanpub.com/DevWebApps" target="Leanpub" rel="noreferrer noopener">
          Lehrbuchs
        </a>{" "}
        und kostenlos. Es ist zum Lernen und Ausprobieren gedacht, nicht für etwas, das davon abhängt.
      </p>

      <h2>Die Links sind die Schlüssel</h2>
      <p>Twotle kennt weder Konten noch Passwörter. Stattdessen hat jede Wahl zwei Links:</p>
      <ul>
        <li>
          Wer den <strong>Wähler-Link</strong> hat, sieht die Wahl und alle ihre Stimmen, samt den Namen der
          Wählerinnen und Wähler, und kann Stimmen abgeben und annullieren.
        </li>
        <li>
          Wer den <strong>Organisator-Link</strong> hat, kann die Wahl zudem ändern, verstecken und löschen.
        </li>
      </ul>
      <p>
        Ein Link verdient dieselbe Sorgfalt wie ein Passwort. Die Squeng AG weiss nicht, wer eine Wahl erstellt hat. Sie
        kann weder einen verlorenen Organisator-Link wiederherstellen noch einen weitergegebenen Link zurückholen. Eine
        Wahl, deren Link zu weit gestreut wurde, lässt sich mit ihrem Organisator-Link verstecken oder löschen.
      </p>

      <h2>Was Nutzende eingeben</h2>
      <p>
        Für das, was sie eingeben, sind Organisatorinnen und Organisatoren sowie Wählerinnen und Wähler selbst
        verantwortlich. Nicht erlaubt sind rechtswidrige Inhalte, heikle Daten, etwa über die Gesundheit, und
        Personendaten anderer ohne das Recht, sie weiterzugeben. Erinnerungen und Mitteilungen dürfen nur an die eigene
        E-Mail-Adresse oder Telefonnummer gehen.
      </p>

      <h2>Faire Nutzung</h2>
      <p>
        Nicht erlaubt ist, Wahlen oder Stimmen automatisiert oder massenhaft zu erstellen, die Links anderer zu erraten
        zu versuchen, Twotle zu überlasten oder anzugreifen, darüber unerwünschte Nachrichten zu versenden oder es für
        rechtswidrige Zwecke zu nutzen. Die Squeng AG kann Anfragen zurückweisen, die dies tun, und die betroffenen
        Wahlen löschen.
      </p>

      <h2>Verfügbarkeit und Änderungen</h2>
      <p>
        Die Squeng AG betreibt Twotle sorgfältig, aber ohne zugesicherte Verfügbarkeit. Wartungen und Ausfälle kommen
        vor, und Wahlen können verloren gehen. Die Squeng AG kann Twotle jederzeit ändern, unterbrechen oder einstellen
        und Wahlen löschen, insbesondere solche, die gegen diese Bedingungen verstossen.
      </p>

      <h2>Quellcode</h2>
      <p>
        Der Quellcode von Twotle ist auf{" "}
        <a href="https://github.com/Squoss/Twotle" target="GitHub" rel="noreferrer noopener">
          GitHub
        </a>{" "}
        unter der MIT-Lizenz veröffentlicht. Diese Bedingungen schränken keines der Rechte aus dieser Lizenz ein. Sie
        regeln den Dienst, den die Squeng AG unter twotle.com betreibt.
      </p>

      <h2>Haftung</h2>
      <p>
        Die Squeng AG haftet für Schäden, die sie vorsätzlich oder grobfahrlässig verursacht. Soweit gesetzlich
        zulässig, ist jede weitere Haftung ausgeschlossen, insbesondere für den Verlust von Wahlen oder Stimmen, für
        Mitteilungen, die verspätet oder gar nicht ankommen, sowie für indirekte Schäden und Folgeschäden. Zwingende
        gesetzliche Haftung bleibt unberührt.
      </p>

      <h2>Änderungen dieser Bedingungen</h2>
      <p>
        Die Squeng AG kann diese Bedingungen mit Wirkung für die Zukunft ändern. Gültig ist stets die Fassung an dieser
        Stelle, und jede Änderung lässt sich im öffentlichen Repository auf GitHub nachvollziehen.
      </p>

      <h2>Anwendbares Recht und Gerichtsstand</h2>
      <p>
        Diese Bedingungen unterstehen schweizerischem Recht unter Ausschluss des Kollisionsrechts. Gerichtsstand ist der
        Sitz der Squeng AG. Konsumentinnen und Konsumenten behalten den Schutz des zwingenden Rechts ihres
        Wohnsitzstaates und können auch dort klagen.
      </p>
    </React.Fragment>
  );
}

export default TermsOfServiceDe;
