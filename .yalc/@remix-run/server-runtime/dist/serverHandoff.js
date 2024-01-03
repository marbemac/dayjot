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

var markup = require('./markup.js');

// TODO: Remove Promises from serialization
function createServerHandoffString(serverHandoff) {
  // Uses faster alternative of jsesc to escape data returned from the loaders.
  // This string is inserted directly into the HTML in the `<Scripts>` element.
  return markup.escapeHtml(JSON.stringify(serverHandoff));
}

exports.createServerHandoffString = createServerHandoffString;
