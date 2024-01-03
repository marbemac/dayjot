/**
 * @remix-run/server-runtime v2.4.0
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

async function broadcastDevReady(build, origin) {
  origin ??= process.env.REMIX_DEV_ORIGIN;
  if (!origin) throw Error("Dev server origin not set");
  let url = new URL(origin);
  url.pathname = "ping";
  let response = await fetch(url.href, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      buildHash: build.assets.version
    })
  }).catch(error => {
    console.error(`Could not reach Remix dev server at ${url}`);
    throw error;
  });
  if (!response.ok) {
    console.error(`Could not reach Remix dev server at ${url} (${response.status})`);
    throw Error(await response.text());
  }
}
function logDevReady(build) {
  console.log(`[REMIX DEV] ${build.assets.version} ready`);
}
const globalDevServerHooksKey = "__remix_devServerHooks";
function setDevServerHooks(devServerHooks) {
  // @ts-expect-error
  globalThis[globalDevServerHooksKey] = devServerHooks;
}
function getDevServerHooks() {
  // @ts-expect-error
  return globalThis[globalDevServerHooksKey];
}

exports.broadcastDevReady = broadcastDevReady;
exports.getDevServerHooks = getDevServerHooks;
exports.logDevReady = logDevReady;
exports.setDevServerHooks = setDevServerHooks;
