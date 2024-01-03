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
import { extends as _extends } from './_virtual/_rollupPluginBabelHelpers.js';
import * as React from 'react';
import { useHref, NavLink as NavLink$1, Link as Link$1, matchRoutes, useLocation, Await as Await$1, useNavigation, useAsyncError, useMatches as useMatches$1, useLoaderData as useLoaderData$1, useRouteLoaderData as useRouteLoaderData$1, useActionData as useActionData$1, useFetcher as useFetcher$1, UNSAFE_DataRouterContext, UNSAFE_DataRouterStateContext } from 'react-router-dom';
import invariant from './invariant.js';
import { getKeyedLinksForMatches, isPageLinkDescriptor, getNewMatchesForLinks, getDataLinkHrefs, getModuleLinkHrefs, getKeyedPrefetchLinks } from './links.js';
import { escapeHtml, createHtml } from './markup.js';

function useDataRouterContext() {
  let context = React.useContext(UNSAFE_DataRouterContext);
  invariant(context, "You must render this element inside a <DataRouterContext.Provider> element");
  return context;
}
function useDataRouterStateContext() {
  let context = React.useContext(UNSAFE_DataRouterStateContext);
  invariant(context, "You must render this element inside a <DataRouterStateContext.Provider> element");
  return context;
}

////////////////////////////////////////////////////////////////////////////////
// RemixContext

const RemixContext = /*#__PURE__*/React.createContext(undefined);
RemixContext.displayName = "Remix";
function useRemixContext() {
  let context = React.useContext(RemixContext);
  invariant(context, "You must render this element inside a <Remix> element");
  return context;
}

////////////////////////////////////////////////////////////////////////////////
// Public API

/**
 * Defines the prefetching behavior of the link:
 *
 * - "none": Never fetched
 * - "intent": Fetched when the user focuses or hovers the link
 * - "render": Fetched when the link is rendered
 * - "viewport": Fetched when the link is in the viewport
 */
function usePrefetchBehavior(prefetch, theirElementProps) {
  let [maybePrefetch, setMaybePrefetch] = React.useState(false);
  let [shouldPrefetch, setShouldPrefetch] = React.useState(false);
  let {
    onFocus,
    onBlur,
    onMouseEnter,
    onMouseLeave,
    onTouchStart
  } = theirElementProps;
  let ref = React.useRef(null);
  React.useEffect(() => {
    if (prefetch === "render") {
      setShouldPrefetch(true);
    }
    if (prefetch === "viewport") {
      let callback = entries => {
        entries.forEach(entry => {
          setShouldPrefetch(entry.isIntersecting);
        });
      };
      let observer = new IntersectionObserver(callback, {
        threshold: 0.5
      });
      if (ref.current) observer.observe(ref.current);
      return () => {
        observer.disconnect();
      };
    }
  }, [prefetch]);
  let setIntent = () => {
    if (prefetch === "intent") {
      setMaybePrefetch(true);
    }
  };
  let cancelIntent = () => {
    if (prefetch === "intent") {
      setMaybePrefetch(false);
      setShouldPrefetch(false);
    }
  };
  React.useEffect(() => {
    if (maybePrefetch) {
      let id = setTimeout(() => {
        setShouldPrefetch(true);
      }, 100);
      return () => {
        clearTimeout(id);
      };
    }
  }, [maybePrefetch]);
  return [shouldPrefetch, ref, {
    onFocus: composeEventHandlers(onFocus, setIntent),
    onBlur: composeEventHandlers(onBlur, cancelIntent),
    onMouseEnter: composeEventHandlers(onMouseEnter, setIntent),
    onMouseLeave: composeEventHandlers(onMouseLeave, cancelIntent),
    onTouchStart: composeEventHandlers(onTouchStart, setIntent)
  }];
}
const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/**
 * A special kind of `<Link>` that knows whether it is "active".
 *
 * @see https://remix.run/components/nav-link
 */
let NavLink = /*#__PURE__*/React.forwardRef(({
  to,
  prefetch = "none",
  ...props
}, forwardedRef) => {
  let isAbsolute = typeof to === "string" && ABSOLUTE_URL_REGEX.test(to);
  let href = useHref(to);
  let [shouldPrefetch, ref, prefetchHandlers] = usePrefetchBehavior(prefetch, props);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(NavLink$1, _extends({}, props, prefetchHandlers, {
    ref: mergeRefs(forwardedRef, ref),
    to: to
  })), shouldPrefetch && !isAbsolute ? /*#__PURE__*/React.createElement(PrefetchPageLinks, {
    page: href
  }) : null);
});
NavLink.displayName = "NavLink";

/**
 * This component renders an anchor tag and is the primary way the user will
 * navigate around your website.
 *
 * @see https://remix.run/components/link
 */
let Link = /*#__PURE__*/React.forwardRef(({
  to,
  prefetch = "none",
  ...props
}, forwardedRef) => {
  let isAbsolute = typeof to === "string" && ABSOLUTE_URL_REGEX.test(to);
  let href = useHref(to);
  let [shouldPrefetch, ref, prefetchHandlers] = usePrefetchBehavior(prefetch, props);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Link$1, _extends({}, props, prefetchHandlers, {
    ref: mergeRefs(forwardedRef, ref),
    to: to
  })), shouldPrefetch && !isAbsolute ? /*#__PURE__*/React.createElement(PrefetchPageLinks, {
    page: href
  }) : null);
});
Link.displayName = "Link";
function composeEventHandlers(theirHandler, ourHandler) {
  return event => {
    theirHandler && theirHandler(event);
    if (!event.defaultPrevented) {
      ourHandler(event);
    }
  };
}

/**
 * Renders the `<link>` tags for the current routes.
 *
 * @see https://remix.run/components/links
 */
function Links() {
  let {
    manifest,
    routeModules,
    criticalCss
  } = useRemixContext();
  let {
    errors,
    matches: routerMatches
  } = useDataRouterStateContext();
  let matches = errors ? routerMatches.slice(0, routerMatches.findIndex(m => errors[m.route.id]) + 1) : routerMatches;
  let keyedLinks = React.useMemo(() => getKeyedLinksForMatches(matches, routeModules, manifest), [matches, routeModules, manifest]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, criticalCss ? /*#__PURE__*/React.createElement("style", {
    dangerouslySetInnerHTML: {
      __html: criticalCss
    }
  }) : null, keyedLinks.map(({
    key,
    link
  }) => isPageLinkDescriptor(link) ? /*#__PURE__*/React.createElement(PrefetchPageLinks, _extends({
    key: key
  }, link)) : /*#__PURE__*/React.createElement("link", _extends({
    key: key
  }, link))));
}

/**
 * This component renders all the `<link rel="prefetch">` and
 * `<link rel="modulepreload"/>` tags for all the assets (data, modules, css) of
 * a given page.
 *
 * @param props
 * @param props.page
 * @see https://remix.run/components/prefetch-page-links
 */
function PrefetchPageLinks({
  page,
  ...dataLinkProps
}) {
  let {
    router
  } = useDataRouterContext();
  let matches = React.useMemo(() => matchRoutes(router.routes, page), [router.routes, page]);
  if (!matches) {
    console.warn(`Tried to prefetch ${page} but no routes matched.`);
    return null;
  }
  return /*#__PURE__*/React.createElement(PrefetchPageLinksImpl, _extends({
    page: page,
    matches: matches
  }, dataLinkProps));
}
function useKeyedPrefetchLinks(matches) {
  let {
    manifest,
    routeModules
  } = useRemixContext();
  let [keyedPrefetchLinks, setKeyedPrefetchLinks] = React.useState([]);
  React.useEffect(() => {
    let interrupted = false;
    void getKeyedPrefetchLinks(matches, manifest, routeModules).then(links => {
      if (!interrupted) {
        setKeyedPrefetchLinks(links);
      }
    });
    return () => {
      interrupted = true;
    };
  }, [matches, manifest, routeModules]);
  return keyedPrefetchLinks;
}
function PrefetchPageLinksImpl({
  page,
  matches: nextMatches,
  ...linkProps
}) {
  let location = useLocation();
  let {
    manifest
  } = useRemixContext();
  let {
    matches
  } = useDataRouterStateContext();
  let newMatchesForData = React.useMemo(() => getNewMatchesForLinks(page, nextMatches, matches, manifest, location, "data"), [page, nextMatches, matches, manifest, location]);
  let newMatchesForAssets = React.useMemo(() => getNewMatchesForLinks(page, nextMatches, matches, manifest, location, "assets"), [page, nextMatches, matches, manifest, location]);
  let dataHrefs = React.useMemo(() => getDataLinkHrefs(page, newMatchesForData, manifest), [newMatchesForData, page, manifest]);
  let moduleHrefs = React.useMemo(() => getModuleLinkHrefs(newMatchesForAssets, manifest), [newMatchesForAssets, manifest]);

  // needs to be a hook with async behavior because we need the modules, not
  // just the manifest like the other links in here.
  let keyedPrefetchLinks = useKeyedPrefetchLinks(newMatchesForAssets);
  return /*#__PURE__*/React.createElement(React.Fragment, null, dataHrefs.map(href => /*#__PURE__*/React.createElement("link", _extends({
    key: href,
    rel: "prefetch",
    as: "fetch",
    href: href
  }, linkProps))), moduleHrefs.map(href => /*#__PURE__*/React.createElement("link", _extends({
    key: href,
    rel: "modulepreload",
    href: href
  }, linkProps))), keyedPrefetchLinks.map(({
    key,
    link
  }) =>
  /*#__PURE__*/
  // these don't spread `linkProps` because they are full link descriptors
  // already with their own props
  React.createElement("link", _extends({
    key: key
  }, link))));
}

/**
 * Renders HTML tags related to metadata for the current route.
 *
 * @see https://remix.run/components/meta
 */
function Meta() {
  let {
    routeModules
  } = useRemixContext();
  let {
    errors,
    matches: routerMatches,
    loaderData
  } = useDataRouterStateContext();
  let location = useLocation();
  let _matches = routerMatches;
  let error = null;
  if (errors) {
    let errorIdx = routerMatches.findIndex(m => errors[m.route.id]);
    _matches = routerMatches.slice(0, errorIdx + 1);
    error = errors[routerMatches[errorIdx].route.id];
  }
  let meta = [];
  let leafMeta = null;
  let matches = [];
  for (let i = 0; i < _matches.length; i++) {
    let _match = _matches[i];
    let routeId = _match.route.id;
    let data = loaderData[routeId];
    let params = _match.params;
    let routeModule = routeModules[routeId];
    let routeMeta = [];
    let match = {
      id: routeId,
      data,
      meta: [],
      params: _match.params,
      pathname: _match.pathname,
      handle: _match.route.handle,
      error
    };
    matches[i] = match;
    if (routeModule !== null && routeModule !== void 0 && routeModule.meta) {
      routeMeta = typeof routeModule.meta === "function" ? routeModule.meta({
        data,
        params,
        location,
        matches,
        error
      }) : Array.isArray(routeModule.meta) ? [...routeModule.meta] : routeModule.meta;
    } else if (leafMeta) {
      // We only assign the route's meta to the nearest leaf if there is no meta
      // export in the route. The meta function may return a falsy value which
      // is effectively the same as an empty array.
      routeMeta = [...leafMeta];
    }
    routeMeta = routeMeta || [];
    if (!Array.isArray(routeMeta)) {
      throw new Error("The route at " + _match.route.path + " returns an invalid value. All route meta functions must " + "return an array of meta objects." + "\n\nTo reference the meta function API, see https://remix.run/route/meta");
    }
    match.meta = routeMeta;
    matches[i] = match;
    meta = [...routeMeta];
    leafMeta = meta;
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, meta.flat().map(metaProps => {
    if (!metaProps) {
      return null;
    }
    if ("tagName" in metaProps) {
      let {
        tagName,
        ...rest
      } = metaProps;
      if (!isValidMetaTag(tagName)) {
        console.warn(`A meta object uses an invalid tagName: ${tagName}. Expected either 'link' or 'meta'`);
        return null;
      }
      let Comp = tagName;
      return /*#__PURE__*/React.createElement(Comp, _extends({
        key: JSON.stringify(rest)
      }, rest));
    }
    if ("title" in metaProps) {
      return /*#__PURE__*/React.createElement("title", {
        key: "title"
      }, String(metaProps.title));
    }
    if ("charset" in metaProps) {
      metaProps.charSet ??= metaProps.charset;
      delete metaProps.charset;
    }
    if ("charSet" in metaProps && metaProps.charSet != null) {
      return typeof metaProps.charSet === "string" ? /*#__PURE__*/React.createElement("meta", {
        key: "charSet",
        charSet: metaProps.charSet
      }) : null;
    }
    if ("script:ld+json" in metaProps) {
      try {
        let json = JSON.stringify(metaProps["script:ld+json"]);
        return /*#__PURE__*/React.createElement("script", {
          key: `script:ld+json:${json}`,
          type: "application/ld+json",
          dangerouslySetInnerHTML: {
            __html: json
          }
        });
      } catch (err) {
        return null;
      }
    }
    return /*#__PURE__*/React.createElement("meta", _extends({
      key: JSON.stringify(metaProps)
    }, metaProps));
  }));
}
function isValidMetaTag(tagName) {
  return typeof tagName === "string" && /^(meta|link)$/.test(tagName);
}
function Await(props) {
  return /*#__PURE__*/React.createElement(Await$1, props);
}

/**
 * Tracks whether Remix has finished hydrating or not, so scripts can be skipped
 * during client-side updates.
 */
let isHydrated = false;
/**
 * Renders the `<script>` tags needed for the initial render. Bundles for
 * additional routes are loaded later as needed.
 *
 * @param props Additional properties to add to each script tag that is rendered.
 * In addition to scripts, \<link rel="modulepreload"> tags receive the crossOrigin
 * property if provided.
 *
 * @see https://remix.run/components/scripts
 */
function Scripts(props) {
  let {
    manifest,
    serverHandoffString,
    abortDelay,
    serializeError,
    isSpaMode
  } = useRemixContext();
  let {
    router,
    static: isStatic,
    staticContext
  } = useDataRouterContext();
  let {
    matches: dontUseTheseMatches
  } = useDataRouterStateContext();
  let navigation = useNavigation();

  // Use these `matches` instead :)
  // In SPA Mode we only want to import root on the critical path, since we
  // want the generated HTML file to be able to be loaded at non-/ paths as
  // well.  This lets the router handle initial match loads via lazy().
  //
  // TODO: If users only ever intend to serve the `/` path from index.html and
  // thus they want to include all initial matches here...should we give them
  // a config to do so?
  let matches = isSpaMode ? [dontUseTheseMatches[0]] : dontUseTheseMatches;
  React.useEffect(() => {
    isHydrated = true;
  }, []);
  let serializePreResolvedErrorImp = (key, error) => {
    let toSerialize;
    if (serializeError && error instanceof Error) {
      toSerialize = serializeError(error);
    } else {
      toSerialize = error;
    }
    return `${JSON.stringify(key)}:__remixContext.p(!1, ${escapeHtml(JSON.stringify(toSerialize))})`;
  };
  let serializePreresolvedDataImp = (routeId, key, data) => {
    let serializedData;
    try {
      serializedData = JSON.stringify(data);
    } catch (error) {
      return serializePreResolvedErrorImp(key, error);
    }
    return `${JSON.stringify(key)}:__remixContext.p(${escapeHtml(serializedData)})`;
  };
  let serializeErrorImp = (routeId, key, error) => {
    let toSerialize;
    if (serializeError && error instanceof Error) {
      toSerialize = serializeError(error);
    } else {
      toSerialize = error;
    }
    return `__remixContext.r(${JSON.stringify(routeId)}, ${JSON.stringify(key)}, !1, ${escapeHtml(JSON.stringify(toSerialize))})`;
  };
  let serializeDataImp = (routeId, key, data) => {
    let serializedData;
    try {
      serializedData = JSON.stringify(data);
    } catch (error) {
      return serializeErrorImp(routeId, key, error);
    }
    return `__remixContext.r(${JSON.stringify(routeId)}, ${JSON.stringify(key)}, ${escapeHtml(serializedData)})`;
  };
  let deferredScripts = [];
  let initialScripts = React.useMemo(() => {
    var _manifest$hmr;
    let contextScript = staticContext ? `window.__remixContext = ${serverHandoffString};` : " ";
    let activeDeferreds = staticContext === null || staticContext === void 0 ? void 0 : staticContext.activeDeferreds;
    // This sets up the __remixContext with utility functions used by the
    // deferred scripts.
    // - __remixContext.p is a function that takes a resolved value or error and returns a promise.
    //   This is used for transmitting pre-resolved promises from the server to the client.
    // - __remixContext.n is a function that takes a routeID and key to returns a promise for later
    //   resolution by the subsequently streamed chunks.
    // - __remixContext.r is a function that takes a routeID, key and value or error and resolves
    //   the promise created by __remixContext.n.
    // - __remixContext.t is a map or routeId to keys to an object containing `e` and `r` methods
    //   to resolve or reject the promise created by __remixContext.n.
    // - __remixContext.a is the active number of deferred scripts that should be rendered to match
    //   the SSR tree for hydration on the client.
    contextScript += !activeDeferreds ? "" : ["__remixContext.p = function(v,e,p,x) {", "  if (typeof e !== 'undefined') {", process.env.NODE_ENV === "development" ? "    x=new Error(e.message);\n    x.stack=e.stack;" : '    x=new Error("Unexpected Server Error");\n    x.stack=undefined;', "    p=Promise.reject(x);", "  } else {", "    p=Promise.resolve(v);", "  }", "  return p;", "};", "__remixContext.n = function(i,k) {", "  __remixContext.t = __remixContext.t || {};", "  __remixContext.t[i] = __remixContext.t[i] || {};", "  let p = new Promise((r, e) => {__remixContext.t[i][k] = {r:(v)=>{r(v);},e:(v)=>{e(v);}};});", typeof abortDelay === "number" ? `setTimeout(() => {if(typeof p._error !== "undefined" || typeof p._data !== "undefined"){return;} __remixContext.t[i][k].e(new Error("Server timeout."))}, ${abortDelay});` : "", "  return p;", "};", "__remixContext.r = function(i,k,v,e,p,x) {", "  p = __remixContext.t[i][k];", "  if (typeof e !== 'undefined') {", process.env.NODE_ENV === "development" ? "    x=new Error(e.message);\n    x.stack=e.stack;" : '    x=new Error("Unexpected Server Error");\n    x.stack=undefined;', "    p.e(x);", "  } else {", "    p.r(v);", "  }", "};"].join("\n") + Object.entries(activeDeferreds).map(([routeId, deferredData]) => {
      let pendingKeys = new Set(deferredData.pendingKeys);
      let promiseKeyValues = deferredData.deferredKeys.map(key => {
        if (pendingKeys.has(key)) {
          deferredScripts.push( /*#__PURE__*/React.createElement(DeferredHydrationScript, {
            key: `${routeId} | ${key}`,
            deferredData: deferredData,
            routeId: routeId,
            dataKey: key,
            scriptProps: props,
            serializeData: serializeDataImp,
            serializeError: serializeErrorImp
          }));
          return `${JSON.stringify(key)}:__remixContext.n(${JSON.stringify(routeId)}, ${JSON.stringify(key)})`;
        } else {
          let trackedPromise = deferredData.data[key];
          if (typeof trackedPromise._error !== "undefined") {
            return serializePreResolvedErrorImp(key, trackedPromise._error);
          } else {
            return serializePreresolvedDataImp(routeId, key, trackedPromise._data);
          }
        }
      }).join(",\n");
      return `Object.assign(__remixContext.state.loaderData[${JSON.stringify(routeId)}], {${promiseKeyValues}});`;
    }).join("\n") + (deferredScripts.length > 0 ? `__remixContext.a=${deferredScripts.length};` : "");
    let routeModulesScript = !isStatic ? " " : `${(_manifest$hmr = manifest.hmr) !== null && _manifest$hmr !== void 0 && _manifest$hmr.runtime ? `import ${JSON.stringify(manifest.hmr.runtime)};` : ""}import ${JSON.stringify(manifest.url)};
${matches.map((match, index) => `import * as route${index} from ${JSON.stringify(manifest.routes[match.route.id].module)};`).join("\n")}
window.__remixRouteModules = {${matches.map((match, index) => `${JSON.stringify(match.route.id)}:route${index}`).join(",")}};

import(${JSON.stringify(manifest.entry.module)});`;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("script", _extends({}, props, {
      suppressHydrationWarning: true,
      dangerouslySetInnerHTML: createHtml(contextScript),
      type: undefined
    })), /*#__PURE__*/React.createElement("script", _extends({}, props, {
      suppressHydrationWarning: true,
      dangerouslySetInnerHTML: createHtml(routeModulesScript),
      type: "module",
      async: true
    })));
    // disabled deps array because we are purposefully only rendering this once
    // for hydration, after that we want to just continue rendering the initial
    // scripts as they were when the page first loaded
    // eslint-disable-next-line
  }, []);
  if (!isStatic && typeof __remixContext === "object" && __remixContext.a) {
    for (let i = 0; i < __remixContext.a; i++) {
      deferredScripts.push( /*#__PURE__*/React.createElement(DeferredHydrationScript, {
        key: i,
        scriptProps: props,
        serializeData: serializeDataImp,
        serializeError: serializeErrorImp
      }));
    }
  }

  // avoid waterfall when importing the next route module
  let nextMatches = React.useMemo(() => {
    if (navigation.location) {
      // FIXME: can probably use transitionManager `nextMatches`
      let matches = matchRoutes(router.routes, navigation.location);
      invariant(matches, `No routes match path "${navigation.location.pathname}"`);
      return matches;
    }
    return [];
  }, [navigation.location, router.routes]);
  let routePreloads = matches.concat(nextMatches).map(match => {
    let route = manifest.routes[match.route.id];
    return (route.imports || []).concat([route.module]);
  }).flat(1);
  let preloads = isHydrated ? [] : manifest.entry.imports.concat(routePreloads);
  return isHydrated ? null : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("link", {
    rel: "modulepreload",
    href: manifest.url,
    crossOrigin: props.crossOrigin
  }), /*#__PURE__*/React.createElement("link", {
    rel: "modulepreload",
    href: manifest.entry.module,
    crossOrigin: props.crossOrigin
  }), dedupe(preloads).map(path => /*#__PURE__*/React.createElement("link", {
    key: path,
    rel: "modulepreload",
    href: path,
    crossOrigin: props.crossOrigin
  })), initialScripts, deferredScripts);
}
function DeferredHydrationScript({
  dataKey,
  deferredData,
  routeId,
  scriptProps,
  serializeData,
  serializeError
}) {
  if (typeof document === "undefined" && deferredData && dataKey && routeId) {
    invariant(deferredData.pendingKeys.includes(dataKey), `Deferred data for route ${routeId} with key ${dataKey} was not pending but tried to render a script for it.`);
  }
  return /*#__PURE__*/React.createElement(React.Suspense, {
    fallback:
    // This makes absolutely no sense. The server renders null as a fallback,
    // but when hydrating, we need to render a script tag to avoid a hydration issue.
    // To reproduce a hydration mismatch, just render null as a fallback.
    typeof document === "undefined" && deferredData && dataKey && routeId ? null : /*#__PURE__*/React.createElement("script", _extends({}, scriptProps, {
      async: true,
      suppressHydrationWarning: true,
      dangerouslySetInnerHTML: {
        __html: " "
      }
    }))
  }, typeof document === "undefined" && deferredData && dataKey && routeId ? /*#__PURE__*/React.createElement(Await, {
    resolve: deferredData.data[dataKey],
    errorElement: /*#__PURE__*/React.createElement(ErrorDeferredHydrationScript, {
      dataKey: dataKey,
      routeId: routeId,
      scriptProps: scriptProps,
      serializeError: serializeError
    }),
    children: data => {
      return /*#__PURE__*/React.createElement("script", _extends({}, scriptProps, {
        async: true,
        suppressHydrationWarning: true,
        dangerouslySetInnerHTML: {
          __html: serializeData(routeId, dataKey, data)
        }
      }));
    }
  }) : /*#__PURE__*/React.createElement("script", _extends({}, scriptProps, {
    async: true,
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: {
      __html: " "
    }
  })));
}
function ErrorDeferredHydrationScript({
  dataKey,
  routeId,
  scriptProps,
  serializeError
}) {
  let error = useAsyncError();
  return /*#__PURE__*/React.createElement("script", _extends({}, scriptProps, {
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: {
      __html: serializeError(routeId, dataKey, error)
    }
  }));
}
function dedupe(array) {
  return [...new Set(array)];
}
/**
 * Returns the active route matches, useful for accessing loaderData for
 * parent/child routes or the route "handle" property
 *
 * @see https://remix.run/hooks/use-matches
 */
function useMatches() {
  return useMatches$1();
}

/**
 * Returns the JSON parsed data from the current route's `loader`.
 *
 * @see https://remix.run/hooks/use-loader-data
 */
function useLoaderData() {
  return useLoaderData$1();
}

/**
 * Returns the loaderData for the given routeId.
 *
 * @see https://remix.run/hooks/use-route-loader-data
 */
function useRouteLoaderData(routeId) {
  return useRouteLoaderData$1(routeId);
}

/**
 * Returns the JSON parsed data from the current route's `action`.
 *
 * @see https://remix.run/hooks/use-action-data
 */
function useActionData() {
  return useActionData$1();
}

/**
 * Interacts with route loaders and actions without causing a navigation. Great
 * for any interaction that stays on the same page.
 *
 * @see https://remix.run/hooks/use-fetcher
 */
function useFetcher(opts = {}) {
  return useFetcher$1(opts);
}

/**
 * This component connects your app to the Remix asset server and
 * automatically reloads the page when files change in development.
 * In production, it renders null, so you can safely render it always in your root route.
 *
 * @see https://remix.run/docs/components/live-reload
 */
const LiveReload =
// Dead Code Elimination magic for production builds.
// This way devs don't have to worry about doing the NODE_ENV check themselves.
process.env.NODE_ENV !== "development" ? () => null : function LiveReload({
  origin = process.env.REMIX_DEV_ORIGIN,
  port,
  timeoutMs = 1000,
  nonce = undefined
}) {
  let js = String.raw;
  return /*#__PURE__*/React.createElement("script", {
    nonce: nonce,
    suppressHydrationWarning: true,
    dangerouslySetInnerHTML: {
      __html: js`
                function remixLiveReloadConnect(config) {
                  let LIVE_RELOAD_ORIGIN = ${JSON.stringify(origin)};
                  let protocol =
                    LIVE_RELOAD_ORIGIN ? new URL(LIVE_RELOAD_ORIGIN).protocol.replace(/^http/, "ws") :
                    location.protocol === "https:" ? "wss:" : "ws:"; // remove in v2?
                  let hostname = LIVE_RELOAD_ORIGIN ? new URL(LIVE_RELOAD_ORIGIN).hostname : location.hostname;
                  let url = new URL(protocol + "//" + hostname + "/socket");

                  url.port =
                    ${port} ||
                    (LIVE_RELOAD_ORIGIN ? new URL(LIVE_RELOAD_ORIGIN).port : 8002);

                  let ws = new WebSocket(url.href);
                  ws.onmessage = async (message) => {
                    let event = JSON.parse(message.data);
                    if (event.type === "LOG") {
                      console.log(event.message);
                    }
                    if (event.type === "RELOAD") {
                      console.log("💿 Reloading window ...");
                      window.location.reload();
                    }
                    if (event.type === "HMR") {
                      if (!window.__hmr__ || !window.__hmr__.contexts) {
                        console.log("💿 [HMR] No HMR context, reloading window ...");
                        window.location.reload();
                        return;
                      }
                      if (!event.updates || !event.updates.length) return;
                      let updateAccepted = false;
                      let needsRevalidation = new Set();
                      for (let update of event.updates) {
                        console.log("[HMR] " + update.reason + " [" + update.id +"]")
                        if (update.revalidate) {
                          needsRevalidation.add(update.routeId);
                          console.log("[HMR] Revalidating [" + update.routeId + "]");
                        }
                        let imported = await import(update.url +  '?t=' + event.assetsManifest.hmr.timestamp);
                        if (window.__hmr__.contexts[update.id]) {
                          let accepted = window.__hmr__.contexts[update.id].emit(
                            imported
                          );
                          if (accepted) {
                            console.log("[HMR] Update accepted by", update.id);
                            updateAccepted = true;
                          }
                        }
                      }
                      if (event.assetsManifest && window.__hmr__.contexts["remix:manifest"]) {
                        let accepted = window.__hmr__.contexts["remix:manifest"].emit(
                          { needsRevalidation, assetsManifest: event.assetsManifest }
                        );
                        if (accepted) {
                          console.log("[HMR] Update accepted by", "remix:manifest");
                          updateAccepted = true;
                        }
                      }
                      if (!updateAccepted) {
                        console.log("[HMR] Update rejected, reloading...");
                        window.location.reload();
                      }
                    }
                  };
                  ws.onopen = () => {
                    if (config && typeof config.onOpen === "function") {
                      config.onOpen();
                    }
                  };
                  ws.onclose = (event) => {
                    if (event.code === 1006) {
                      console.log("Remix dev asset server web socket closed. Reconnecting...");
                      setTimeout(
                        () =>
                          remixLiveReloadConnect({
                            onOpen: () => window.location.reload(),
                          }),
                      ${String(timeoutMs)}
                      );
                    }
                  };
                  ws.onerror = (error) => {
                    console.log("Remix dev asset server web socket error:");
                    console.error(error);
                  };
                }
                remixLiveReloadConnect();
              `
    }
  });
};
function mergeRefs(...refs) {
  return value => {
    refs.forEach(ref => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        ref.current = value;
      }
    });
  };
}

export { Await, Link, Links, LiveReload, Meta, NavLink, PrefetchPageLinks, RemixContext, Scripts, composeEventHandlers, useActionData, useFetcher, useLoaderData, useMatches, useRouteLoaderData };
