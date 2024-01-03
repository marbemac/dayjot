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
import { createStaticRouter, StaticRouterProvider } from 'react-router-dom/server';
import { RemixContext } from './components.js';
import { RemixErrorBoundary } from './errorBoundaries.js';
import { createServerRoutes, shouldHydrateRouteLoader } from './routes.js';

/**
 * The entry point for a Remix app when it is rendered on the server (in
 * `app/entry.server.js`). This component is used to generate the HTML in the
 * response from the server.
 */
function RemixServer({
  context,
  url,
  abortDelay
}) {
  if (typeof url === "string") {
    url = new URL(url);
  }
  let {
    manifest,
    routeModules,
    criticalCss,
    serverHandoffString
  } = context;
  let routes = createServerRoutes(manifest.routes, routeModules, context.future, context.isSpaMode);

  // Create a shallow clone of `loaderData` we can mutate for partial hydration.
  // When a route exports a `clientLoader` and a `HydrateFallback`, we want to
  // render the fallback on the server so we clear our the `loaderData` during SSR.
  // Is it important not to change the `context` reference here since we use it
  // for context._deepestRenderedBoundaryId tracking
  context.staticHandlerContext.loaderData = {
    ...context.staticHandlerContext.loaderData
  };
  for (let match of context.staticHandlerContext.matches) {
    let routeId = match.route.id;
    let route = routeModules[routeId];
    let manifestRoute = context.manifest.routes[routeId];
    // Clear out the loaderData to avoid rendering the route component when the
    // route opted into clientLoader hydration and either:
    // * gave us a HydrateFallback
    // * or doesn't have a server loader and we have no data to render
    if (route && shouldHydrateRouteLoader(manifestRoute, route, context.isSpaMode) && (route.HydrateFallback || !manifestRoute.hasLoader)) {
      context.staticHandlerContext.loaderData[routeId] = undefined;
    }
  }
  let router = createStaticRouter(routes, context.staticHandlerContext, {
    future: {
      v7_partialHydration: true,
      v7_relativeSplatPath: context.future.v3_relativeSplatPath
    }
  });
  return /*#__PURE__*/React.createElement(RemixContext.Provider, {
    value: {
      manifest,
      routeModules,
      criticalCss,
      serverHandoffString,
      future: context.future,
      isSpaMode: context.isSpaMode,
      serializeError: context.serializeError,
      abortDelay
    }
  }, /*#__PURE__*/React.createElement(RemixErrorBoundary, {
    location: router.state.location
  }, /*#__PURE__*/React.createElement(StaticRouterProvider, {
    router: router,
    context: context.staticHandlerContext,
    hydrate: false
  })));
}

export { RemixServer };
