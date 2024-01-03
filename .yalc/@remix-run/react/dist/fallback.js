/**
 * @remix-run/react v2.4.0
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

var React = require('react');
var components = require('./components.js');

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

var React__namespace = /*#__PURE__*/_interopNamespace(React);

// If the user sets `clientLoader.hydrate=true` somewhere but does not
// provide a `HydrateFallback` at any level of the tree, then we need to at
// least include `<Scripts>` in the SSR so we can hydrate the app and call the
// `clientLoader` functions
function RemixRootDefaultHydrateFallback() {
  return /*#__PURE__*/React__namespace.createElement("html", {
    lang: "en"
  }, /*#__PURE__*/React__namespace.createElement("head", null, /*#__PURE__*/React__namespace.createElement("meta", {
    charSet: "utf-8"
  }), /*#__PURE__*/React__namespace.createElement("meta", {
    name: "viewport",
    content: "width=device-width,initial-scale=1,viewport-fit=cover"
  })), /*#__PURE__*/React__namespace.createElement("body", null, /*#__PURE__*/React__namespace.createElement(components.Scripts, null), /*#__PURE__*/React__namespace.createElement("script", {
    dangerouslySetInnerHTML: {
      __html: `
              console.log(
                "💿 Hey developer 👋. You can provide a way better UX than this " +
                "when your app is running \`clientLoader\` functions on hydration. " +
                "Check out https://remix.run/route/hydrate-fallback for more information."
              );
            `
    }
  }), " "));
}

exports.RemixRootDefaultHydrateFallback = RemixRootDefaultHydrateFallback;
