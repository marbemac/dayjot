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
/**
 * A function that handles data mutations for a route on the client
 */

/**
 * Arguments passed to a route `clientAction` function
 */

/**
 * A function that loads data for a route on the client
 */

/**
 * Arguments passed to a route `clientLoader` function
 */

/**
 * ErrorBoundary to display for this route
 */

/**
 * `<Route HydrateFallback>` component to render on initial loads
 * when client loaders are present
 */

/**
 * A function that defines `<link>` tags to be inserted into the `<head>` of
 * the document on route transitions.
 *
 * @see https://remix.run/route/meta
 */

/**
 * A React component that is rendered for a route.
 */

/**
 * An arbitrary object that is associated with a route.
 *
 * @see https://remix.run/route/handle
 */

async function loadRouteModule(route, routeModulesCache) {
  if (route.id in routeModulesCache) {
    return routeModulesCache[route.id];
  }
  try {
    let routeModule = await import( /* webpackIgnore: true */route.module);
    routeModulesCache[route.id] = routeModule;
    return routeModule;
  } catch (error) {
    // User got caught in the middle of a deploy and the CDN no longer has the
    // asset we're trying to import! Reload from the server and the user
    // (should) get the new manifest--unless the developer purged the static
    // assets, the manifest path, but not the documents 😬
    window.location.reload();
    return new Promise(() => {
      // check out of this hook cause the DJs never gonna re[s]olve this
    });
  }
}

export { loadRouteModule };
