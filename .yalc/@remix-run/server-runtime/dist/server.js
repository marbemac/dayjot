/**
 * @remix-run/server-runtime v2.4.0
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

var router = require('@remix-run/router');
var entry = require('./entry.js');
var errors = require('./errors.js');
var headers = require('./headers.js');
var invariant = require('./invariant.js');
var mode = require('./mode.js');
var routeMatching = require('./routeMatching.js');
var routes = require('./routes.js');
var responses = require('./responses.js');
var serverHandoff = require('./serverHandoff.js');
var dev = require('./dev.js');

function derive(build, mode$1) {
  var _build$future;
  let routes$1 = routes.createRoutes(build.routes);
  let dataRoutes = routes.createStaticHandlerDataRoutes(build.routes, build.future);
  let serverMode = mode.isServerMode(mode$1) ? mode$1 : mode.ServerMode.Production;
  let staticHandler = router.createStaticHandler(dataRoutes, {
    future: {
      v7_relativeSplatPath: (_build$future = build.future) === null || _build$future === void 0 ? void 0 : _build$future.v3_relativeSplatPath
    }
  });
  let errorHandler = build.entry.module.handleError || ((error, {
    request
  }) => {
    if (serverMode !== mode.ServerMode.Test && !request.signal.aborted) {
      console.error(
      // @ts-expect-error This is "private" from users but intended for internal use
      router.isRouteErrorResponse(error) && error.error ? error.error : error);
    }
  });
  return {
    routes: routes$1,
    dataRoutes,
    serverMode,
    staticHandler,
    errorHandler
  };
}
const createRequestHandler = (build, mode$1) => {
  let _build;
  let routes;
  let serverMode;
  let staticHandler;
  let errorHandler;
  return async function requestHandler(request, loadContext = {}) {
    _build = typeof build === "function" ? await build() : build;
    if (typeof build === "function") {
      let derived = derive(_build, mode$1);
      routes = derived.routes;
      serverMode = derived.serverMode;
      staticHandler = derived.staticHandler;
      errorHandler = derived.errorHandler;
    } else if (!routes || !serverMode || !staticHandler || !errorHandler) {
      let derived = derive(_build, mode$1);
      routes = derived.routes;
      serverMode = derived.serverMode;
      staticHandler = derived.staticHandler;
      errorHandler = derived.errorHandler;
    }
    let url = new URL(request.url);
    let matches = routeMatching.matchServerRoutes(routes, url.pathname);
    let handleError = error => {
      if (mode$1 === mode.ServerMode.Development) {
        var _getDevServerHooks, _getDevServerHooks$pr;
        (_getDevServerHooks = dev.getDevServerHooks()) === null || _getDevServerHooks === void 0 ? void 0 : (_getDevServerHooks$pr = _getDevServerHooks.processRequestError) === null || _getDevServerHooks$pr === void 0 ? void 0 : _getDevServerHooks$pr.call(_getDevServerHooks, error);
      }
      errorHandler(error, {
        context: loadContext,
        params: matches && matches.length > 0 ? matches[0].params : {},
        request
      });
    };
    let response;
    if (url.searchParams.has("_data")) {
      let routeId = url.searchParams.get("_data");
      response = await handleDataRequestRR(serverMode, staticHandler, routeId, request, loadContext, handleError);
      if (_build.entry.module.handleDataRequest) {
        var _matches$find;
        response = await _build.entry.module.handleDataRequest(response, {
          context: loadContext,
          params: (matches === null || matches === void 0 ? void 0 : (_matches$find = matches.find(m => m.route.id == routeId)) === null || _matches$find === void 0 ? void 0 : _matches$find.params) || {},
          request
        });
      }
    } else if (matches && matches[matches.length - 1].route.module.default == null && matches[matches.length - 1].route.module.ErrorBoundary == null) {
      response = await handleResourceRequestRR(serverMode, staticHandler, matches.slice(-1)[0].route.id, request, loadContext, handleError);
    } else {
      var _getDevServerHooks2, _getDevServerHooks2$g;
      let criticalCss = mode$1 === mode.ServerMode.Development ? await ((_getDevServerHooks2 = dev.getDevServerHooks()) === null || _getDevServerHooks2 === void 0 ? void 0 : (_getDevServerHooks2$g = _getDevServerHooks2.getCriticalCss) === null || _getDevServerHooks2$g === void 0 ? void 0 : _getDevServerHooks2$g.call(_getDevServerHooks2, _build, url.pathname)) : undefined;
      response = await handleDocumentRequestRR(serverMode, _build, staticHandler, request, loadContext, handleError, criticalCss);
    }
    if (request.method === "HEAD") {
      return new Response(null, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText
      });
    }
    return response;
  };
};
async function handleDataRequestRR(serverMode, staticHandler, routeId, request, loadContext, handleError) {
  try {
    let response = await staticHandler.queryRoute(request, {
      routeId,
      requestContext: loadContext
    });
    if (responses.isRedirectResponse(response)) {
      // We don't have any way to prevent a fetch request from following
      // redirects. So we use the `X-Remix-Redirect` header to indicate the
      // next URL, and then "follow" the redirect manually on the client.
      let headers = new Headers(response.headers);
      headers.set("X-Remix-Redirect", headers.get("Location"));
      headers.set("X-Remix-Status", response.status);
      headers.delete("Location");
      if (response.headers.get("Set-Cookie") !== null) {
        headers.set("X-Remix-Revalidate", "yes");
      }
      return new Response(null, {
        status: 204,
        headers
      });
    }
    if (router.UNSAFE_DEFERRED_SYMBOL in response) {
      let deferredData = response[router.UNSAFE_DEFERRED_SYMBOL];
      let body = responses.createDeferredReadableStream(deferredData, request.signal, serverMode);
      let init = deferredData.init || {};
      let headers = new Headers(init.headers);
      headers.set("Content-Type", "text/remix-deferred");
      // Mark successful responses with a header so we can identify in-flight
      // network errors that are missing this header
      headers.set("X-Remix-Response", "yes");
      init.headers = headers;
      return new Response(body, init);
    }

    // Mark all successful responses with a header so we can identify in-flight
    // network errors that are missing this header
    response.headers.set("X-Remix-Response", "yes");
    return response;
  } catch (error) {
    if (responses.isResponse(error)) {
      error.headers.set("X-Remix-Catch", "yes");
      return error;
    }
    if (router.isRouteErrorResponse(error)) {
      if (error) {
        handleError(error);
      }
      return errorResponseToJson(error, serverMode);
    }
    let errorInstance = error instanceof Error ? error : new Error("Unexpected Server Error");
    handleError(errorInstance);
    return router.json(errors.serializeError(errorInstance, serverMode), {
      status: 500,
      headers: {
        "X-Remix-Error": "yes"
      }
    });
  }
}
async function handleDocumentRequestRR(serverMode, build, staticHandler, request, loadContext, handleError, criticalCss) {
  let context;
  try {
    context = await staticHandler.query(request, {
      requestContext: loadContext
    });
  } catch (error) {
    handleError(error);
    return new Response(null, {
      status: 500
    });
  }
  if (responses.isResponse(context)) {
    return context;
  }

  // Sanitize errors outside of development environments
  if (context.errors) {
    Object.values(context.errors).forEach(err => {
      // @ts-expect-error This is "private" from users but intended for internal use
      if (!router.isRouteErrorResponse(err) || err.error) {
        handleError(err);
      }
    });
    context.errors = errors.sanitizeErrors(context.errors, serverMode);
  }
  let headers$1 = headers.getDocumentHeadersRR(build, context);
  let entryContext = {
    manifest: build.assets,
    routeModules: entry.createEntryRouteModules(build.routes),
    staticHandlerContext: context,
    criticalCss,
    serverHandoffString: serverHandoff.createServerHandoffString({
      url: context.location.pathname,
      criticalCss,
      state: {
        loaderData: context.loaderData,
        actionData: context.actionData,
        errors: errors.serializeErrors(context.errors, serverMode)
      },
      future: build.future,
      isSpaMode: build.isSpaMode
    }),
    future: build.future,
    isSpaMode: build.isSpaMode,
    serializeError: err => errors.serializeError(err, serverMode)
  };
  let handleDocumentRequestFunction = build.entry.module.default;
  try {
    return await handleDocumentRequestFunction(request, context.statusCode, headers$1, entryContext, loadContext);
  } catch (error) {
    handleError(error);

    // Get a new StaticHandlerContext that contains the error at the right boundary
    context = router.getStaticContextFromError(staticHandler.dataRoutes, context, error);

    // Sanitize errors outside of development environments
    if (context.errors) {
      context.errors = errors.sanitizeErrors(context.errors, serverMode);
    }

    // Update entryContext for the second render pass
    entryContext = {
      ...entryContext,
      staticHandlerContext: context,
      serverHandoffString: serverHandoff.createServerHandoffString({
        url: context.location.pathname,
        state: {
          loaderData: context.loaderData,
          actionData: context.actionData,
          errors: errors.serializeErrors(context.errors, serverMode)
        },
        future: build.future,
        isSpaMode: build.isSpaMode
      })
    };
    try {
      return await handleDocumentRequestFunction(request, context.statusCode, headers$1, entryContext, loadContext);
    } catch (error) {
      handleError(error);
      return returnLastResortErrorResponse(error, serverMode);
    }
  }
}
async function handleResourceRequestRR(serverMode, staticHandler, routeId, request, loadContext, handleError) {
  try {
    // Note we keep the routeId here to align with the Remix handling of
    // resource routes which doesn't take ?index into account and just takes
    // the leaf match
    let response = await staticHandler.queryRoute(request, {
      routeId,
      requestContext: loadContext
    });
    // callRouteLoader/callRouteAction always return responses
    invariant["default"](responses.isResponse(response), "Expected a Response to be returned from queryRoute");
    return response;
  } catch (error) {
    if (responses.isResponse(error)) {
      // Note: Not functionally required but ensures that our response headers
      // match identically to what Remix returns
      error.headers.set("X-Remix-Catch", "yes");
      return error;
    }
    if (router.isRouteErrorResponse(error)) {
      if (error) {
        handleError(error);
      }
      return errorResponseToJson(error, serverMode);
    }
    handleError(error);
    return returnLastResortErrorResponse(error, serverMode);
  }
}
function errorResponseToJson(errorResponse, serverMode) {
  return router.json(errors.serializeError(
  // @ts-expect-error This is "private" from users but intended for internal use
  errorResponse.error || new Error("Unexpected Server Error"), serverMode), {
    status: errorResponse.status,
    statusText: errorResponse.statusText,
    headers: {
      "X-Remix-Error": "yes"
    }
  });
}
function returnLastResortErrorResponse(error, serverMode) {
  let message = "Unexpected Server Error";
  if (serverMode !== mode.ServerMode.Production) {
    message += `\n\n${String(error)}`;
  }

  // Good grief folks, get your act together 😂!
  return new Response(message, {
    status: 500,
    headers: {
      "Content-Type": "text/plain"
    }
  });
}

exports.createRequestHandler = createRequestHandler;
