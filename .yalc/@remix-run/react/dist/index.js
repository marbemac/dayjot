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

var browser = require('./browser.js');
var reactRouterDom = require('react-router-dom');
var components = require('./components.js');
var scrollRestoration = require('./scroll-restoration.js');
var server = require('./server.js');



exports.RemixBrowser = browser.RemixBrowser;
Object.defineProperty(exports, 'Form', {
  enumerable: true,
  get: function () { return reactRouterDom.Form; }
});
Object.defineProperty(exports, 'Outlet', {
  enumerable: true,
  get: function () { return reactRouterDom.Outlet; }
});
Object.defineProperty(exports, 'createPath', {
  enumerable: true,
  get: function () { return reactRouterDom.createPath; }
});
Object.defineProperty(exports, 'generatePath', {
  enumerable: true,
  get: function () { return reactRouterDom.generatePath; }
});
Object.defineProperty(exports, 'isRouteErrorResponse', {
  enumerable: true,
  get: function () { return reactRouterDom.isRouteErrorResponse; }
});
Object.defineProperty(exports, 'matchPath', {
  enumerable: true,
  get: function () { return reactRouterDom.matchPath; }
});
Object.defineProperty(exports, 'matchRoutes', {
  enumerable: true,
  get: function () { return reactRouterDom.matchRoutes; }
});
Object.defineProperty(exports, 'parsePath', {
  enumerable: true,
  get: function () { return reactRouterDom.parsePath; }
});
Object.defineProperty(exports, 'resolvePath', {
  enumerable: true,
  get: function () { return reactRouterDom.resolvePath; }
});
Object.defineProperty(exports, 'unstable_usePrompt', {
  enumerable: true,
  get: function () { return reactRouterDom.unstable_usePrompt; }
});
Object.defineProperty(exports, 'unstable_useViewTransitionState', {
  enumerable: true,
  get: function () { return reactRouterDom.unstable_useViewTransitionState; }
});
Object.defineProperty(exports, 'useAsyncError', {
  enumerable: true,
  get: function () { return reactRouterDom.useAsyncError; }
});
Object.defineProperty(exports, 'useAsyncValue', {
  enumerable: true,
  get: function () { return reactRouterDom.useAsyncValue; }
});
Object.defineProperty(exports, 'useBeforeUnload', {
  enumerable: true,
  get: function () { return reactRouterDom.useBeforeUnload; }
});
Object.defineProperty(exports, 'useBlocker', {
  enumerable: true,
  get: function () { return reactRouterDom.useBlocker; }
});
Object.defineProperty(exports, 'useFetchers', {
  enumerable: true,
  get: function () { return reactRouterDom.useFetchers; }
});
Object.defineProperty(exports, 'useFormAction', {
  enumerable: true,
  get: function () { return reactRouterDom.useFormAction; }
});
Object.defineProperty(exports, 'useHref', {
  enumerable: true,
  get: function () { return reactRouterDom.useHref; }
});
Object.defineProperty(exports, 'useLocation', {
  enumerable: true,
  get: function () { return reactRouterDom.useLocation; }
});
Object.defineProperty(exports, 'useMatch', {
  enumerable: true,
  get: function () { return reactRouterDom.useMatch; }
});
Object.defineProperty(exports, 'useNavigate', {
  enumerable: true,
  get: function () { return reactRouterDom.useNavigate; }
});
Object.defineProperty(exports, 'useNavigation', {
  enumerable: true,
  get: function () { return reactRouterDom.useNavigation; }
});
Object.defineProperty(exports, 'useNavigationType', {
  enumerable: true,
  get: function () { return reactRouterDom.useNavigationType; }
});
Object.defineProperty(exports, 'useOutlet', {
  enumerable: true,
  get: function () { return reactRouterDom.useOutlet; }
});
Object.defineProperty(exports, 'useOutletContext', {
  enumerable: true,
  get: function () { return reactRouterDom.useOutletContext; }
});
Object.defineProperty(exports, 'useParams', {
  enumerable: true,
  get: function () { return reactRouterDom.useParams; }
});
Object.defineProperty(exports, 'useResolvedPath', {
  enumerable: true,
  get: function () { return reactRouterDom.useResolvedPath; }
});
Object.defineProperty(exports, 'useRevalidator', {
  enumerable: true,
  get: function () { return reactRouterDom.useRevalidator; }
});
Object.defineProperty(exports, 'useRouteError', {
  enumerable: true,
  get: function () { return reactRouterDom.useRouteError; }
});
Object.defineProperty(exports, 'useSearchParams', {
  enumerable: true,
  get: function () { return reactRouterDom.useSearchParams; }
});
Object.defineProperty(exports, 'useSubmit', {
  enumerable: true,
  get: function () { return reactRouterDom.useSubmit; }
});
exports.Await = components.Await;
exports.Link = components.Link;
exports.Links = components.Links;
exports.LiveReload = components.LiveReload;
exports.Meta = components.Meta;
exports.NavLink = components.NavLink;
exports.PrefetchPageLinks = components.PrefetchPageLinks;
exports.Scripts = components.Scripts;
exports.UNSAFE_RemixContext = components.RemixContext;
exports.useActionData = components.useActionData;
exports.useFetcher = components.useFetcher;
exports.useLoaderData = components.useLoaderData;
exports.useMatches = components.useMatches;
exports.useRouteLoaderData = components.useRouteLoaderData;
exports.ScrollRestoration = scrollRestoration.ScrollRestoration;
exports.RemixServer = server.RemixServer;
