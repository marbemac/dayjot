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

var invariant = require('../invariant.js');

// This file is used to avoid CJS deprecation warnings in Vite 5 since

// eslint-disable-next-line @typescript-eslint/consistent-type-imports

let vite;
async function preloadViteEsm() {
  vite = await import('vite');
}
function importViteEsmSync() {
  invariant["default"](vite, "importViteEsmSync() called before preloadViteEsm()");
  return vite;
}

exports.importViteEsmSync = importViteEsmSync;
exports.preloadViteEsm = preloadViteEsm;
