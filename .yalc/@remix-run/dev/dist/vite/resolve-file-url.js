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

var path = require('node:path');
var importViteEsmSync = require('./import-vite-esm-sync.js');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespace(path);

const resolveFileUrl = ({
  rootDirectory
}, filePath) => {
  let vite = importViteEsmSync.importViteEsmSync();
  let relativePath = path__namespace.relative(rootDirectory, filePath);
  let isWithinRoot = !relativePath.startsWith("..") && !path__namespace.isAbsolute(relativePath);
  if (!isWithinRoot) {
    // Vite will prevent serving files outside of the workspace
    // unless user explictly opts in with `server.fs.allow`
    // https://vitejs.dev/config/server-options.html#server-fs-allow
    return path__namespace.posix.join("/@fs", vite.normalizePath(filePath));
  }
  return "/" + vite.normalizePath(relativePath);
};

exports.resolveFileUrl = resolveFileUrl;
