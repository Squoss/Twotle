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

// cf. ImprintEn.tsx, which has to say the same
function ImprintDe() {
  return (
    <React.Fragment>
      <h1>Impressum</h1>
      <p>Twotle ist ein Produkt der</p>
      <address>
        <strong>Squeng AG</strong>
        <br />
        Switzerland Innovation Park Ost
        <br />
        Lerchenfeldstrasse 3
        <br />
        9014 St.Gallen
        <br />
        Schweiz
      </address>
      <p>
        E-Mail: <a href="mailto:twotle@squeng.com">twotle@squeng.com</a>
      </p>
      <p>Handelsregister: St.Gallen, UID CHE-383.211.903</p>
      <p>Mehrwertsteuernummer: CHE-383.211.903 MWST</p>
      <p>
        Squeng<sup>&reg;</sup> ist eine eingetragene Marke der Squeng AG.
      </p>
    </React.Fragment>
  );
}

export default ImprintDe;
