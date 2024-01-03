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

var _rollupPluginBabelHelpers = require('./_virtual/_rollupPluginBabelHelpers.js');
var React = require('react');
var reactRouterDom = require('react-router-dom');

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

let STORAGE_KEY = "positions";

/**
 * This component will emulate the browser's scroll restoration on location
 * changes.
 *
 * @see https://remix.run/components/scroll-restoration
 */
function ScrollRestoration({
  getKey,
  ...props
}) {
  let location = reactRouterDom.useLocation();
  let matches = reactRouterDom.useMatches();
  reactRouterDom.UNSAFE_useScrollRestoration({
    getKey,
    storageKey: STORAGE_KEY
  });

  // In order to support `getKey`, we need to compute a "key" here so we can
  // hydrate that up so that SSR scroll restoration isn't waiting on React to
  // hydrate. *However*, our key on the server is not the same as our key on
  // the client!  So if the user's getKey implementation returns the SSR
  // location key, then let's ignore it and let our inline <script> below pick
  // up the client side history state key
  let key = React__namespace.useMemo(() => {
    if (!getKey) return null;
    let userKey = getKey(location, matches);
    return userKey !== location.key ? userKey : null;
  },
  // Nah, we only need this the first time for the SSR render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);
  let restoreScroll = ((STORAGE_KEY, restoreKey) => {
    if (!window.history.state || !window.history.state.key) {
      let key = Math.random().toString(32).slice(2);
      window.history.replaceState({
        key
      }, "");
    }
    try {
      let positions = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
      let storedY = positions[restoreKey || window.history.state.key];
      if (typeof storedY === "number") {
        window.scrollTo(0, storedY);
      }
    } catch (error) {
      console.error(error);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }).toString();
  return /*#__PURE__*/React__namespace.createElement("script", _rollupPluginBabelHelpers["extends"]({}, props, {
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: {
      __html: `(${restoreScroll})(${JSON.stringify(STORAGE_KEY)}, ${JSON.stringify(key)})`
    }
  }));
}

exports.ScrollRestoration = ScrollRestoration;
