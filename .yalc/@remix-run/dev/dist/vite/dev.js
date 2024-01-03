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

var pc = require('picocolors');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var pc__default = /*#__PURE__*/_interopDefaultLegacy(pc);

async function dev(root, {
  clearScreen,
  config: configFile,
  cors,
  force,
  host,
  logLevel,
  mode,
  open,
  port,
  strictPort
}) {
  let vite = await import('vite');
  let server = await vite.createServer({
    root,
    mode,
    configFile,
    server: {
      open,
      cors,
      host,
      port,
      strictPort
    },
    optimizeDeps: {
      force
    },
    clearScreen,
    logLevel
  });
  if (!server.config.plugins.find(plugin => plugin.name === "remix")) {
    console.error(pc__default["default"].red("Remix Vite plugin not found in Vite config"));
    process.exit(1);
  }
  await server.listen();
  server.printUrls();
  server.bindCLIShortcuts({
    print: true
  });
}

exports.dev = dev;
