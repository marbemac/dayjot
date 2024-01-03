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

async function extractRemixPluginConfig({
  configFile,
  mode,
  root
}) {
  let vite = await import('vite');

  // Leverage the Vite config as a way to configure the entire multi-step build
  // process so we don't need to have a separate Remix config
  let viteConfig = await vite.resolveConfig({
    mode,
    configFile,
    root
  }, "build");
  let pluginConfig = viteConfig["__remixPluginResolvedConfig"];
  if (!pluginConfig) {
    console.error(pc__default["default"].red("Remix Vite plugin not found in Vite config"));
    process.exit(1);
  }
  return pluginConfig;
}
async function build(root, {
  assetsInlineLimit,
  clearScreen,
  config: configFile,
  emptyOutDir,
  force,
  logLevel,
  minify,
  mode
}) {
  // For now we just use this function to validate that the Vite config is
  // targeting Remix, but in the future the return value can be used to
  // configure the entire multi-step build process.
  await extractRemixPluginConfig({
    configFile,
    mode,
    root
  });
  let vite = await import('vite');
  async function viteBuild({
    ssr
  }) {
    await vite.build({
      root,
      mode,
      configFile,
      build: {
        assetsInlineLimit,
        emptyOutDir,
        minify,
        ssr
      },
      optimizeDeps: {
        force
      },
      clearScreen,
      logLevel
    });
  }
  await viteBuild({
    ssr: false
  });
  await viteBuild({
    ssr: true
  });
}

exports.build = build;
