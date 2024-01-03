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

// This file allows us to dynamically require the plugin so non-Vite consumers
// don't need to have Vite installed as a peer dependency. Only types should
// be imported at the top level.

const unstable_vitePlugin = (...args) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  let {
    remixVitePlugin
  } = require("./plugin");
  return remixVitePlugin(...args);
};

exports.unstable_vitePlugin = unstable_vitePlugin;
