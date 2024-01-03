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
import * as React from 'react';
import { Scripts } from './components.js';

// If the user sets `clientLoader.hydrate=true` somewhere but does not
// provide a `HydrateFallback` at any level of the tree, then we need to at
// least include `<Scripts>` in the SSR so we can hydrate the app and call the
// `clientLoader` functions
function RemixRootDefaultHydrateFallback() {
  return /*#__PURE__*/React.createElement("html", {
    lang: "en"
  }, /*#__PURE__*/React.createElement("head", null, /*#__PURE__*/React.createElement("meta", {
    charSet: "utf-8"
  }), /*#__PURE__*/React.createElement("meta", {
    name: "viewport",
    content: "width=device-width,initial-scale=1,viewport-fit=cover"
  })), /*#__PURE__*/React.createElement("body", null, /*#__PURE__*/React.createElement(Scripts, null), /*#__PURE__*/React.createElement("script", {
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

export { RemixRootDefaultHydrateFallback };
