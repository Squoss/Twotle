/*
 * The MIT License
 *
 * Copyright (c) 2021-2022 Squeng AG
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

export enum Method {
  Delete = "DELETE",
  Get = "GET",
  Head = "HEAD",
  Options = "OPTIONS",
  Patch = "PATCH",
  Post = "POST",
  Put = "PUT",
}

// https://www.carlrippon.com/fetch-with-async-await-and-typescript/

interface HttpResponse<T> extends Response {
  parsedBody?: T;
}
async function fetchJson<T>(request: Request): Promise<HttpResponse<T>> {
  // https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#xmlhttprequest-native-javascript
  if (!/^(GET|HEAD|OPTIONS)$/i.test(request.method)) {
    const csrf_token = document
      .querySelector("meta[name='csrf-token']")!
      .getAttribute("content");
    request.headers.append("Csrf-Token", csrf_token!);
  }

  const response: HttpResponse<T> = await fetch(request);
  try {
    response.parsedBody = await response.json();
  } catch (e) {
    console.error(`response to JSON to type conversions failed: ${e}`);
  }

  return response;
}

function buildRequestInit(
  method: Method,
  accessToken?: string,
  body?: Object
): RequestInit {
  return {
    method: method,
    body: body ? JSON.stringify(body) : null,
    mode: "same-origin",
    credentials: "same-origin",
    cache: "no-store",
    redirect: "error",
    headers: {
      "Content-Type": "application/json",
      "X-Access-Token": accessToken ?? "",
    },
  };
}

export async function fetchResource<T>(
  method: Method,
  path: string,
  accessToken?: string,
  body?: Object
): Promise<HttpResponse<T>> {
  return fetchJson<T>(
    new Request(path, buildRequestInit(method, accessToken, body))
  );
}
