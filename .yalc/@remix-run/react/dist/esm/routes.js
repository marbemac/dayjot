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
import { UNSAFE_ErrorResponseImpl } from '@remix-run/router';
import { useRouteError, redirect } from 'react-router-dom';
import { loadRouteModule } from './routeModules.js';
import { fetchData, isRedirectResponse, isCatchResponse, isDeferredResponse, parseDeferredReadableStream, isDeferredData, isResponse } from './data.js';
import { prefetchStyleLinks } from './links.js';
import { RemixRootDefaultErrorBoundary } from './errorBoundaries.js';
import { RemixRootDefaultHydrateFallback } from './fallback.js';
import invariant from './invariant.js';

// NOTE: make sure to change the Route in server-runtime if you change this

// NOTE: make sure to change the EntryRoute in server-runtime if you change this

// Create a map of routes by parentId to use recursively instead of
// repeatedly filtering the manifest.
function groupRoutesByParentId(manifest) {
  let routes = {};
  Object.values(manifest).forEach(route => {
    let parentId = route.parentId || "";
    if (!routes[parentId]) {
      routes[parentId] = [];
    }
    routes[parentId].push(route);
  });
  return routes;
}
function createServerRoutes(manifest, routeModules, future, isSpaMode, parentId = "", routesByParentId = groupRoutesByParentId(manifest)) {
  return (routesByParentId[parentId] || []).map(route => {
    let routeModule = routeModules[route.id];
    invariant(routeModule, "No `routeModule` available to create server routes");
    let dataRoute = {
      caseSensitive: route.caseSensitive,
      Component: getRouteModuleComponent(routeModule),
      HydrateFallback: routeModule.HydrateFallback ? routeModule.HydrateFallback : route.id === "root" ? RemixRootDefaultHydrateFallback : undefined,
      ErrorBoundary: routeModule.ErrorBoundary ? routeModule.ErrorBoundary : route.id === "root" ? () => /*#__PURE__*/React.createElement(RemixRootDefaultErrorBoundary, {
        error: useRouteError()
      }) : undefined,
      id: route.id,
      index: route.index,
      path: route.path,
      handle: routeModule.handle,
      // For SPA mode, all routes are lazy except root
      lazy: isSpaMode && route.id !== "root" ? () => Promise.resolve({
        Component: () => null
      }) : undefined,
      // For partial hydration rendering, we need to indicate when the route
      // has a loader/clientLoader, but it won't ever be called during the static
      // render, so just give it a no-op function so we can render down to the
      // proper fallback
      loader: route.hasLoader || route.hasClientLoader ? () => null : undefined
      // We don't need action/shouldRevalidate on these routes since they're
      // for a static render
    };

    let children = createServerRoutes(manifest, routeModules, future, isSpaMode, route.id, routesByParentId);
    if (children.length > 0) dataRoute.children = children;
    return dataRoute;
  });
}
function createClientRoutesWithHMRRevalidationOptOut(needsRevalidation, manifest, routeModulesCache, initialState, future, isSpaMode) {
  return createClientRoutes(manifest, routeModulesCache, initialState, future, isSpaMode, "", groupRoutesByParentId(manifest), needsRevalidation);
}
function preventInvalidServerHandlerCall(type, route, isSpaMode) {
  if (isSpaMode) {
    let fn = type === "action" ? "serverAction()" : "serverLoader()";
    let msg = `You cannot call ${fn} in SPA Mode (routeId: "${route.id}")`;
    console.error(msg);
    throw new UNSAFE_ErrorResponseImpl(400, "Bad Request", new Error(msg), true);
  }
  let fn = type === "action" ? "serverAction()" : "serverLoader()";
  let msg = `You are trying to call ${fn} on a route that does not have a server ` + `${type} (routeId: "${route.id}")`;
  if (type === "loader" && !route.hasLoader || type === "action" && !route.hasAction) {
    console.error(msg);
    throw new UNSAFE_ErrorResponseImpl(400, "Bad Request", new Error(msg), true);
  }
}
function noActionDefinedError(type, routeId) {
  let article = type === "clientAction" ? "a" : "an";
  let msg = `Route "${routeId}" does not have ${article} ${type}, but you are trying to ` + `submit to it. To fix this, please add ${article} \`${type}\` function to the route`;
  console.error(msg);
  throw new UNSAFE_ErrorResponseImpl(405, "Method Not Allowed", new Error(msg), true);
}
function createClientRoutes(manifest, routeModulesCache, initialState, future, isSpaMode, parentId = "", routesByParentId = groupRoutesByParentId(manifest), needsRevalidation) {
  return (routesByParentId[parentId] || []).map(route => {
    let routeModule = routeModulesCache[route.id];
    async function fetchServerLoader(request) {
      if (!route.hasLoader) return null;
      return fetchServerHandler(request, route);
    }
    async function fetchServerAction(request) {
      if (!route.hasAction) {
        throw noActionDefinedError("action", route.id);
      }
      return fetchServerHandler(request, route);
    }
    async function prefetchStylesAndCallHandler(handler) {
      // Only prefetch links if we exist in the routeModulesCache (critical modules
      // and navigating back to pages previously loaded via route.lazy).  Initial
      // execution of route.lazy (when the module is not in the cache) will handle
      // prefetching style links via loadRouteModuleWithBlockingLinks.
      let cachedModule = routeModulesCache[route.id];
      let linkPrefetchPromise = cachedModule ? prefetchStyleLinks(route, cachedModule) : Promise.resolve();
      try {
        return handler();
      } finally {
        await linkPrefetchPromise;
      }
    }
    let dataRoute = {
      id: route.id,
      index: route.index,
      path: route.path
    };
    if (routeModule) {
      var _initialState$loaderD, _initialState$errors, _routeModule$clientLo;
      // Use critical path modules directly
      Object.assign(dataRoute, {
        ...dataRoute,
        Component: getRouteModuleComponent(routeModule),
        HydrateFallback: routeModule.HydrateFallback ? routeModule.HydrateFallback : route.id === "root" ? RemixRootDefaultHydrateFallback : undefined,
        ErrorBoundary: routeModule.ErrorBoundary ? routeModule.ErrorBoundary : route.id === "root" ? () => /*#__PURE__*/React.createElement(RemixRootDefaultErrorBoundary, {
          error: useRouteError()
        }) : undefined,
        handle: routeModule.handle,
        shouldRevalidate: needsRevalidation ? wrapShouldRevalidateForHdr(route.id, routeModule.shouldRevalidate, needsRevalidation) : routeModule.shouldRevalidate
      });
      let initialData = initialState === null || initialState === void 0 ? void 0 : (_initialState$loaderD = initialState.loaderData) === null || _initialState$loaderD === void 0 ? void 0 : _initialState$loaderD[route.id];
      let initialError = initialState === null || initialState === void 0 ? void 0 : (_initialState$errors = initialState.errors) === null || _initialState$errors === void 0 ? void 0 : _initialState$errors[route.id];
      let isHydrationRequest = needsRevalidation == null && (((_routeModule$clientLo = routeModule.clientLoader) === null || _routeModule$clientLo === void 0 ? void 0 : _routeModule$clientLo.hydrate) === true || !route.hasLoader);
      dataRoute.loader = async ({
        request,
        params
      }) => {
        try {
          let result = await prefetchStylesAndCallHandler(async () => {
            invariant(routeModule, "No `routeModule` available for critical-route loader");
            if (!routeModule.clientLoader) {
              if (isSpaMode) return null;
              // Call the server when no client loader exists
              return fetchServerLoader(request);
            }
            return routeModule.clientLoader({
              request,
              params,
              async serverLoader() {
                preventInvalidServerHandlerCall("loader", route, isSpaMode);

                // On the first call, resolve with the server result
                if (isHydrationRequest) {
                  if (initialError !== undefined) {
                    throw initialError;
                  }
                  return initialData;
                }

                // Call the server loader for client-side navigations
                let result = await fetchServerLoader(request);
                let unwrapped = await unwrapServerResponse(result);
                return unwrapped;
              }
            });
          });
          return result;
        } finally {
          // Whether or not the user calls `serverLoader`, we only let this
          // stick around as true for one loader call
          isHydrationRequest = false;
        }
      };

      // Let React Router know whether to run this on hydration
      dataRoute.loader.hydrate = shouldHydrateRouteLoader(route, routeModule, isSpaMode);
      dataRoute.action = ({
        request,
        params
      }) => {
        return prefetchStylesAndCallHandler(async () => {
          invariant(routeModule, "No `routeModule` available for critical-route action");
          if (!routeModule.clientAction) {
            if (isSpaMode) {
              throw noActionDefinedError("clientAction", route.id);
            }
            return fetchServerAction(request);
          }
          return routeModule.clientAction({
            request,
            params,
            async serverAction() {
              preventInvalidServerHandlerCall("action", route, isSpaMode);
              let result = await fetchServerAction(request);
              let unwrapped = await unwrapServerResponse(result);
              return unwrapped;
            }
          });
        });
      };
    } else {
      // If the lazy route does not have a client loader/action we want to call
      // the server loader/action in parallel with the module load so we add
      // loader/action as static props on the route
      if (!route.hasClientLoader) {
        dataRoute.loader = ({
          request
        }) => prefetchStylesAndCallHandler(() => {
          if (isSpaMode) return Promise.resolve(null);
          return fetchServerLoader(request);
        });
      }
      if (!route.hasClientAction) {
        dataRoute.action = ({
          request
        }) => prefetchStylesAndCallHandler(() => {
          if (isSpaMode) {
            throw noActionDefinedError("clientAction", route.id);
          }
          return fetchServerAction(request);
        });
      }

      // Load all other modules via route.lazy()
      dataRoute.lazy = async () => {
        let mod = await loadRouteModuleWithBlockingLinks(route, routeModulesCache);
        let lazyRoute = {
          ...mod
        };
        if (mod.clientLoader) {
          let clientLoader = mod.clientLoader;
          lazyRoute.loader = args => clientLoader({
            ...args,
            async serverLoader() {
              preventInvalidServerHandlerCall("loader", route, isSpaMode);
              let response = await fetchServerLoader(args.request);
              let result = await unwrapServerResponse(response);
              return result;
            }
          });
        }
        if (mod.clientAction) {
          let clientAction = mod.clientAction;
          lazyRoute.action = args => clientAction({
            ...args,
            async serverAction() {
              preventInvalidServerHandlerCall("action", route, isSpaMode);
              let response = await fetchServerAction(args.request);
              let result = await unwrapServerResponse(response);
              return result;
            }
          });
        }
        if (needsRevalidation) {
          lazyRoute.shouldRevalidate = wrapShouldRevalidateForHdr(route.id, mod.shouldRevalidate, needsRevalidation);
        }
        return {
          ...(lazyRoute.loader ? {
            loader: lazyRoute.loader
          } : {}),
          ...(lazyRoute.action ? {
            action: lazyRoute.action
          } : {}),
          hasErrorBoundary: lazyRoute.hasErrorBoundary,
          shouldRevalidate: lazyRoute.shouldRevalidate,
          handle: lazyRoute.handle,
          Component: lazyRoute.Component,
          ErrorBoundary: lazyRoute.ErrorBoundary
        };
      };
    }
    let children = createClientRoutes(manifest, routeModulesCache, initialState, future, isSpaMode, route.id, routesByParentId, needsRevalidation);
    if (children.length > 0) dataRoute.children = children;
    return dataRoute;
  });
}

// When an HMR / HDR update happens we opt out of all user-defined
// revalidation logic and force a revalidation on the first call
function wrapShouldRevalidateForHdr(routeId, routeShouldRevalidate, needsRevalidation) {
  let handledRevalidation = false;
  return arg => {
    if (!handledRevalidation) {
      handledRevalidation = true;
      return needsRevalidation.has(routeId);
    }
    return routeShouldRevalidate ? routeShouldRevalidate(arg) : arg.defaultShouldRevalidate;
  };
}
async function loadRouteModuleWithBlockingLinks(route, routeModules) {
  let routeModule = await loadRouteModule(route, routeModules);
  await prefetchStyleLinks(route, routeModule);

  // Include all `browserSafeRouteExports` fields, except `HydrateFallback`
  // since those aren't used on lazily loaded routes
  return {
    Component: getRouteModuleComponent(routeModule),
    ErrorBoundary: routeModule.ErrorBoundary,
    clientAction: routeModule.clientAction,
    clientLoader: routeModule.clientLoader,
    handle: routeModule.handle,
    links: routeModule.links,
    meta: routeModule.meta,
    shouldRevalidate: routeModule.shouldRevalidate
  };
}
async function fetchServerHandler(request, route) {
  let result = await fetchData(request, route.id);
  if (result instanceof Error) {
    throw result;
  }
  if (isRedirectResponse(result)) {
    throw getRedirect(result);
  }
  if (isCatchResponse(result)) {
    throw result;
  }
  if (isDeferredResponse(result) && result.body) {
    return await parseDeferredReadableStream(result.body);
  }
  return result;
}
function unwrapServerResponse(result) {
  if (isDeferredData(result)) {
    return result.data;
  }
  if (isResponse(result)) {
    let contentType = result.headers.get("Content-Type");
    // Check between word boundaries instead of startsWith() due to the last
    // paragraph of https://httpwg.org/specs/rfc9110.html#field.content-type
    if (contentType && /\bapplication\/json\b/.test(contentType)) {
      return result.json();
    } else {
      return result.text();
    }
  }
  return result;
}
function getRedirect(response) {
  let status = parseInt(response.headers.get("X-Remix-Status"), 10) || 302;
  let url = response.headers.get("X-Remix-Redirect");
  let headers = {};
  let revalidate = response.headers.get("X-Remix-Revalidate");
  if (revalidate) {
    headers["X-Remix-Revalidate"] = revalidate;
  }
  let reloadDocument = response.headers.get("X-Remix-Reload-Document");
  if (reloadDocument) {
    headers["X-Remix-Reload-Document"] = reloadDocument;
  }
  return redirect(url, {
    status,
    headers
  });
}

// Our compiler generates the default export as `{}` when no default is provided,
// which can lead us to trying to use that as a Component in RR and calling
// createElement on it.  Patching here as a quick fix and hoping it's no longer
// an issue in Vite.
function getRouteModuleComponent(routeModule) {
  if (routeModule.default == null) return undefined;
  let isEmptyObject = typeof routeModule.default === "object" && Object.keys(routeModule.default).length === 0;
  if (!isEmptyObject) {
    return routeModule.default;
  }
}
function shouldHydrateRouteLoader(route, routeModule, isSpaMode) {
  return isSpaMode && route.id !== "root" || routeModule.clientLoader != null && (routeModule.clientLoader.hydrate === true || route.hasLoader !== true);
}

export { createClientRoutes, createClientRoutesWithHMRRevalidationOptOut, createServerRoutes, shouldHydrateRouteLoader };
