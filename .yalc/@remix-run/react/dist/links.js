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

var reactRouterDom = require('react-router-dom');
var routeModules = require('./routeModules.js');

/**
 * Represents a `<link>` element.
 *
 * WHATWG Specification: https://html.spec.whatwg.org/multipage/semantics.html#the-link-element
 */

////////////////////////////////////////////////////////////////////////////////
/**
 * Gets all the links for a set of matches. The modules are assumed to have been
 * loaded already.
 */
function getKeyedLinksForMatches(matches, routeModules, manifest) {
  let descriptors = matches.map(match => {
    var _module$links;
    let module = routeModules[match.route.id];
    let route = manifest.routes[match.route.id];
    return [route.css ? route.css.map(href => ({
      rel: "stylesheet",
      href
    })) : [], (module === null || module === void 0 ? void 0 : (_module$links = module.links) === null || _module$links === void 0 ? void 0 : _module$links.call(module)) || []];
  }).flat(2);
  let preloads = getCurrentPageModulePreloadHrefs(matches, manifest);
  return dedupeLinkDescriptors(descriptors, preloads);
}
async function prefetchStyleLinks(route, routeModule) {
  var _route$css, _routeModule$links;
  if (!route.css && !routeModule.links || !isPreloadSupported()) return;
  let descriptors = [((_route$css = route.css) === null || _route$css === void 0 ? void 0 : _route$css.map(href => ({
    rel: "stylesheet",
    href
  }))) ?? [], ((_routeModule$links = routeModule.links) === null || _routeModule$links === void 0 ? void 0 : _routeModule$links.call(routeModule)) ?? []].flat(1);
  if (descriptors.length === 0) return;
  let styleLinks = [];
  for (let descriptor of descriptors) {
    if (!isPageLinkDescriptor(descriptor) && descriptor.rel === "stylesheet") {
      styleLinks.push({
        ...descriptor,
        rel: "preload",
        as: "style"
      });
    }
  }

  // don't block for non-matching media queries, or for stylesheets that are
  // already in the DOM (active route revalidations)
  let matchingLinks = styleLinks.filter(link => (!link.media || window.matchMedia(link.media).matches) && !document.querySelector(`link[rel="stylesheet"][href="${link.href}"]`));
  await Promise.all(matchingLinks.map(prefetchStyleLink));
}
async function prefetchStyleLink(descriptor) {
  return new Promise(resolve => {
    let link = document.createElement("link");
    Object.assign(link, descriptor);
    function removeLink() {
      // if a navigation interrupts this prefetch React will update the <head>
      // and remove the link we put in there manually, so we check if it's still
      // there before trying to remove it
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    }
    link.onload = () => {
      removeLink();
      resolve();
    };
    link.onerror = () => {
      removeLink();
      resolve();
    };
    document.head.appendChild(link);
  });
}

////////////////////////////////////////////////////////////////////////////////
function isPageLinkDescriptor(object) {
  return object != null && typeof object.page === "string";
}
function isHtmlLinkDescriptor(object) {
  if (object == null) {
    return false;
  }

  // <link> may not have an href if <link rel="preload"> is used with imageSrcSet + imageSizes
  // https://github.com/remix-run/remix/issues/184
  // https://html.spec.whatwg.org/commit-snapshots/cb4f5ff75de5f4cbd7013c4abad02f21c77d4d1c/#attr-link-imagesrcset
  if (object.href == null) {
    return object.rel === "preload" && typeof object.imageSrcSet === "string" && typeof object.imageSizes === "string";
  }
  return typeof object.rel === "string" && typeof object.href === "string";
}
async function getKeyedPrefetchLinks(matches, manifest, routeModules$1) {
  let links = await Promise.all(matches.map(async match => {
    let mod = await routeModules.loadRouteModule(manifest.routes[match.route.id], routeModules$1);
    return mod.links ? mod.links() : [];
  }));
  return dedupeLinkDescriptors(links.flat(1).filter(isHtmlLinkDescriptor).filter(link => link.rel === "stylesheet" || link.rel === "preload").map(link => link.rel === "stylesheet" ? {
    ...link,
    rel: "prefetch",
    as: "style"
  } : {
    ...link,
    rel: "prefetch"
  }));
}

// This is ridiculously identical to transition.ts `filterMatchesToLoad`
function getNewMatchesForLinks(page, nextMatches, currentMatches, manifest, location, mode) {
  let path = parsePathPatch(page);
  let isNew = (match, index) => {
    if (!currentMatches[index]) return true;
    return match.route.id !== currentMatches[index].route.id;
  };
  let matchPathChanged = (match, index) => {
    var _currentMatches$index;
    return (
      // param change, /users/123 -> /users/456
      currentMatches[index].pathname !== match.pathname ||
      // splat param changed, which is not present in match.path
      // e.g. /files/images/avatar.jpg -> files/finances.xls
      ((_currentMatches$index = currentMatches[index].route.path) === null || _currentMatches$index === void 0 ? void 0 : _currentMatches$index.endsWith("*")) && currentMatches[index].params["*"] !== match.params["*"]
    );
  };

  // NOTE: keep this mostly up-to-date w/ the transition data diff, but this
  // version doesn't care about submissions
  let newMatches = mode === "data" && location.search !== path.search ?
  // this is really similar to stuff in transition.ts, maybe somebody smarter
  // than me (or in less of a hurry) can share some of it. You're the best.
  nextMatches.filter((match, index) => {
    let manifestRoute = manifest.routes[match.route.id];
    if (!manifestRoute.hasLoader) {
      return false;
    }
    if (isNew(match, index) || matchPathChanged(match, index)) {
      return true;
    }
    if (match.route.shouldRevalidate) {
      var _currentMatches$;
      let routeChoice = match.route.shouldRevalidate({
        currentUrl: new URL(location.pathname + location.search + location.hash, window.origin),
        currentParams: ((_currentMatches$ = currentMatches[0]) === null || _currentMatches$ === void 0 ? void 0 : _currentMatches$.params) || {},
        nextUrl: new URL(page, window.origin),
        nextParams: match.params,
        defaultShouldRevalidate: true
      });
      if (typeof routeChoice === "boolean") {
        return routeChoice;
      }
    }
    return true;
  }) : nextMatches.filter((match, index) => {
    let manifestRoute = manifest.routes[match.route.id];
    return (mode === "assets" || manifestRoute.hasLoader) && (isNew(match, index) || matchPathChanged(match, index));
  });
  return newMatches;
}
function getDataLinkHrefs(page, matches, manifest) {
  let path = parsePathPatch(page);
  return dedupeHrefs(matches.filter(match => manifest.routes[match.route.id].hasLoader).map(match => {
    let {
      pathname,
      search
    } = path;
    let searchParams = new URLSearchParams(search);
    searchParams.set("_data", match.route.id);
    return `${pathname}?${searchParams}`;
  }));
}
function getModuleLinkHrefs(matches, manifestPatch) {
  return dedupeHrefs(matches.map(match => {
    let route = manifestPatch.routes[match.route.id];
    let hrefs = [route.module];
    if (route.imports) {
      hrefs = hrefs.concat(route.imports);
    }
    return hrefs;
  }).flat(1));
}

// The `<Script>` will render rel=modulepreload for the current page, we don't
// need to include them in a page prefetch, this gives us the list to remove
// while deduping.
function getCurrentPageModulePreloadHrefs(matches, manifest) {
  return dedupeHrefs(matches.map(match => {
    let route = manifest.routes[match.route.id];
    let hrefs = [route.module];
    if (route.imports) {
      hrefs = hrefs.concat(route.imports);
    }
    return hrefs;
  }).flat(1));
}
function dedupeHrefs(hrefs) {
  return [...new Set(hrefs)];
}
function sortKeys(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}
function dedupeLinkDescriptors(descriptors, preloads) {
  let set = new Set();
  let preloadsSet = new Set(preloads);
  return descriptors.reduce((deduped, descriptor) => {
    let alreadyModulePreload = preloads && !isPageLinkDescriptor(descriptor) && descriptor.as === "script" && descriptor.href && preloadsSet.has(descriptor.href);
    if (alreadyModulePreload) {
      return deduped;
    }
    let key = JSON.stringify(sortKeys(descriptor));
    if (!set.has(key)) {
      set.add(key);
      deduped.push({
        key,
        link: descriptor
      });
    }
    return deduped;
  }, []);
}

// https://github.com/remix-run/history/issues/897
function parsePathPatch(href) {
  let path = reactRouterDom.parsePath(href);
  if (path.search === undefined) path.search = "";
  return path;
}

// Detect if this browser supports <link rel="preload"> (or has it enabled).
// Originally added to handle the firefox `network.preload` config:
//   https://bugzilla.mozilla.org/show_bug.cgi?id=1847811
let _isPreloadSupported;
function isPreloadSupported() {
  if (_isPreloadSupported !== undefined) {
    return _isPreloadSupported;
  }
  let el = document.createElement("link");
  _isPreloadSupported = el.relList.supports("preload");
  el = null;
  return _isPreloadSupported;
}

exports.getDataLinkHrefs = getDataLinkHrefs;
exports.getKeyedLinksForMatches = getKeyedLinksForMatches;
exports.getKeyedPrefetchLinks = getKeyedPrefetchLinks;
exports.getModuleLinkHrefs = getModuleLinkHrefs;
exports.getNewMatchesForLinks = getNewMatchesForLinks;
exports.isPageLinkDescriptor = isPageLinkDescriptor;
exports.prefetchStyleLinks = prefetchStyleLinks;
