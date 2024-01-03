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

var router$1 = require('@remix-run/router');
var React = require('react');
var reactRouter = require('react-router');
var reactRouterDom = require('react-router-dom');
var components = require('./components.js');
var errorBoundaries = require('./errorBoundaries.js');
var errors = require('./errors.js');
var routes = require('./routes.js');

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

/* eslint-disable prefer-let/prefer-let */

/* eslint-enable prefer-let/prefer-let */

let router;
let routerInitialized = false;
let hmrRouterReadyResolve;
// There's a race condition with HMR where the remix:manifest is signaled before
// the router is assigned in the RemixBrowser component. This promise gates the
// HMR handler until the router is ready
new Promise(resolve => {
  // body of a promise is executed immediately, so this can be resolved outside
  // of the promise body
  hmrRouterReadyResolve = resolve;
}).catch(() => {
  // This is a noop catch handler to avoid unhandled promise rejection warnings
  // in the console. The promise is never rejected.
  return undefined;
});
// The critical CSS can only be cleared, so the reducer always returns undefined
let criticalCssReducer = () => undefined;

/**
 * The entry point for a Remix app when it is rendered in the browser (in
 * `app/entry.client.js`). This component is used by React to hydrate the HTML
 * that was received from the server.
 */
function RemixBrowser(_props) {
  if (!router) {
    // Hard reload if the path we tried to load is not the current path.
    // This is usually the result of 2 rapid back/forward clicks from an
    // external site into a Remix app, where we initially start the load for
    // one URL and while the JS chunks are loading a second forward click moves
    // us to a new URL.  Avoid comparing search params because of CDNs which
    // can be configured to ignore certain params and only pathname is relevant
    // towards determining the route matches.
    let initialPathname = window.__remixContext.url;
    let hydratedPathname = window.location.pathname;
    if (initialPathname !== hydratedPathname && !window.__remixContext.isSpaMode) {
      let errorMsg = `Initial URL (${initialPathname}) does not match URL at time of hydration ` + `(${hydratedPathname}), reloading page...`;
      console.error(errorMsg);
      window.location.reload();
      // Get out of here so the reload can happen - don't create the router
      // since it'll then kick off unnecessary route.lazy() loads
      return /*#__PURE__*/React__namespace.createElement(React__namespace.Fragment, null);
    }
    let routes$1 = routes.createClientRoutes(window.__remixManifest.routes, window.__remixRouteModules, window.__remixContext.state, window.__remixContext.future, window.__remixContext.isSpaMode);
    let hydrationData = undefined;
    if (!window.__remixContext.isSpaMode) {
      // Create a shallow clone of `loaderData` we can mutate for partial hydration.
      // When a route exports a `clientLoader` and a `HydrateFallback`, the SSR will
      // render the fallback so we need the client to do the same for hydration.
      // The server loader data has already been exposed to these route `clientLoader`'s
      // in `createClientRoutes` above, so we need to clear out the version we pass to
      // `createBrowserRouter` so it initializes and runs the client loaders.
      hydrationData = {
        ...window.__remixContext.state,
        loaderData: {
          ...window.__remixContext.state.loaderData
        }
      };
      let initialMatches = reactRouterDom.matchRoutes(routes$1, window.location);
      if (initialMatches) {
        for (let match of initialMatches) {
          let routeId = match.route.id;
          let route = window.__remixRouteModules[routeId];
          let manifestRoute = window.__remixManifest.routes[routeId];
          // Clear out the loaderData to avoid rendering the route component when the
          // route opted into clientLoader hydration and either:
          // * gave us a HydrateFallback
          // * or doesn't have a server loader and we have no data to render
          if (route && routes.shouldHydrateRouteLoader(manifestRoute, route, window.__remixContext.isSpaMode) && (route.HydrateFallback || !manifestRoute.hasLoader)) {
            hydrationData.loaderData[routeId] = undefined;
          } else if (manifestRoute && !manifestRoute.hasLoader) {
            // Since every Remix route gets a `loader` on the client side to load
            // the route JS module, we need to add a `null` value to `loaderData`
            // for any routes that don't have server loaders so our partial
            // hydration logic doesn't kick off the route module loaders during
            // hydration
            hydrationData.loaderData[routeId] = null;
          }
        }
      }
      if (hydrationData && hydrationData.errors) {
        hydrationData.errors = errors.deserializeErrors(hydrationData.errors);
      }
    }

    // We don't use createBrowserRouter here because we need fine-grained control
    // over initialization to support synchronous `clientLoader` flows.
    router = router$1.createRouter({
      routes: routes$1,
      history: router$1.createBrowserHistory(),
      future: {
        v7_normalizeFormMethod: true,
        v7_fetcherPersist: window.__remixContext.future.v3_fetcherPersist,
        v7_partialHydration: true,
        v7_prependBasename: true,
        v7_relativeSplatPath: window.__remixContext.future.v3_relativeSplatPath
      },
      hydrationData,
      mapRouteProperties: reactRouter.UNSAFE_mapRouteProperties
    });

    // We can call initialize() immediately if the router doesn't have any
    // loaders to run on hydration
    if (router.state.initialized) {
      routerInitialized = true;
      router.initialize();
    }

    // @ts-ignore
    router.createRoutesForHMR = routes.createClientRoutesWithHMRRevalidationOptOut;
    window.__remixRouter = router;

    // Notify that the router is ready for HMR
    if (hmrRouterReadyResolve) {
      hmrRouterReadyResolve(router);
    }
  }

  // Critical CSS can become stale after code changes, e.g. styles might be
  // removed from a component, but the styles will still be present in the
  // server HTML. This allows our HMR logic to clear the critical CSS state.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  let [criticalCss, clearCriticalCss] = React__namespace.useReducer(criticalCssReducer, window.__remixContext.criticalCss);
  window.__remixClearCriticalCss = clearCriticalCss;

  // This is due to the short circuit return above when the pathname doesn't
  // match and we force a hard reload.  This is an exceptional scenario in which
  // we can't hydrate anyway.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  let [location, setLocation] = React__namespace.useState(router.state.location);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  React__namespace.useLayoutEffect(() => {
    // If we had to run clientLoaders on hydration, we delay initialization until
    // after we've hydrated to avoid hydration issues from synchronous client loaders
    if (!routerInitialized) {
      routerInitialized = true;
      router.initialize();
    }
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  React__namespace.useLayoutEffect(() => {
    return router.subscribe(newState => {
      if (newState.location !== location) {
        setLocation(newState.location);
      }
    });
  }, [location]);

  // We need to include a wrapper RemixErrorBoundary here in case the root error
  // boundary also throws and we need to bubble up outside of the router entirely.
  // Then we need a stateful location here so the user can back-button navigate
  // out of there
  return /*#__PURE__*/React__namespace.createElement(components.RemixContext.Provider, {
    value: {
      manifest: window.__remixManifest,
      routeModules: window.__remixRouteModules,
      future: window.__remixContext.future,
      criticalCss,
      isSpaMode: window.__remixContext.isSpaMode
    }
  }, /*#__PURE__*/React__namespace.createElement(errorBoundaries.RemixErrorBoundary, {
    location: location
  }, /*#__PURE__*/React__namespace.createElement(reactRouterDom.RouterProvider, {
    router: router,
    fallbackElement: null,
    future: {
      v7_startTransition: true
    }
  })));
}

exports.RemixBrowser = RemixBrowser;
