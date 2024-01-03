/**
 * @remix-run/dev v2.4.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var node_events = require('node:events');
var stream = require('node:stream');
var setCookieParser = require('set-cookie-parser');
var node = require('@remix-run/node');
var serverRuntime = require('@remix-run/server-runtime');
var invariant = require('../../invariant.js');

function createHeaders(requestHeaders) {
  let headers = new Headers();
  for (let [key, values] of Object.entries(requestHeaders)) {
    if (values) {
      if (Array.isArray(values)) {
        for (let value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }
  return headers;
}

// Based on `createRemixRequest` in packages/remix-express/server.ts
function createRequest(req, res) {
  let origin = req.headers.origin && "null" !== req.headers.origin ? req.headers.origin : `http://${req.headers.host}`;
  invariant["default"](req.url, 'Expected "req.url" to be defined');
  let url = new URL(req.url, origin);
  let init = {
    method: req.method,
    headers: createHeaders(req.headers)
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = node.createReadableStreamFromReadable(req);
    init.duplex = "half";
  }
  return new Request(url.href, init);
}

// Adapted from solid-start's `handleNodeResponse`:
// https://github.com/solidjs/solid-start/blob/7398163869b489cce503c167e284891cf51a6613/packages/start/node/fetch.js#L162-L185
async function handleNodeResponse(webRes, res) {
  res.statusCode = webRes.status;
  res.statusMessage = webRes.statusText;
  let cookiesStrings = [];
  for (let [name, value] of webRes.headers) {
    if (name === "set-cookie") {
      cookiesStrings.push(...setCookieParser.splitCookiesString(value));
    } else res.setHeader(name, value);
  }
  if (cookiesStrings.length) {
    res.setHeader("set-cookie", cookiesStrings);
  }
  if (webRes.body) {
    // https://github.com/microsoft/TypeScript/issues/29867
    let responseBody = webRes.body;
    let readable = stream.Readable.from(responseBody);
    readable.pipe(res);
    await node_events.once(readable, "end");
  } else {
    res.end();
  }
}
let createRequestHandler = (build, {
  mode = "production"
}) => {
  let handler = serverRuntime.createRequestHandler(build, mode);
  return async (req, res) => {
    let request = createRequest(req);
    let response = await handler(request, {});
    handleNodeResponse(response, res);
  };
};

exports.createRequestHandler = createRequestHandler;
