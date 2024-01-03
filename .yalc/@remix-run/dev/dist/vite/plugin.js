/**
 * @remix-run/dev v2.4.0
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

var node_crypto = require('node:crypto');
var path = require('node:path');
var fse = require('fs-extra');
var babel = require('@babel/core');
var serverRuntime = require('@remix-run/server-runtime');
var esModuleLexer = require('es-module-lexer');
var jsesc = require('jsesc');
var pick = require('lodash/pick');
var pc = require('picocolors');
var config = require('../config.js');
var invariant = require('../invariant.js');
var adapter = require('./node/adapter.js');
var styles = require('./styles.js');
var vmod = require('./vmod.js');
var resolveFileUrl = require('./resolve-file-url.js');
var removeExports = require('./remove-exports.js');
var replaceImportSpecifier = require('./replace-import-specifier.js');
var importViteEsmSync = require('./import-vite-esm-sync.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

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

var path__namespace = /*#__PURE__*/_interopNamespace(path);
var fse__namespace = /*#__PURE__*/_interopNamespace(fse);
var babel__default = /*#__PURE__*/_interopDefaultLegacy(babel);
var jsesc__default = /*#__PURE__*/_interopDefaultLegacy(jsesc);
var pick__default = /*#__PURE__*/_interopDefaultLegacy(pick);
var pc__default = /*#__PURE__*/_interopDefaultLegacy(pc);

// We can only import types from Vite at the top level since we're in a CJS
const supportedRemixConfigKeys = ["appDirectory", "assetsBuildDirectory", "future", "ignoredRouteFiles", "publicPath", "routes", "serverBuildPath", "serverModuleFormat", "ssr"];
const ROUTE_EXPORTS = new Set(["ErrorBoundary", "HydrateFallback", "action", "clientAction", "clientLoader", "default",
// component
"handle", "headers", "links", "loader", "meta", "shouldRevalidate"]);
const SERVER_ONLY_EXPORTS = ["loader", "action", "headers"];

// We need to provide different JSDoc comments in some cases due to differences
// between the Remix config and the Vite plugin.
let serverBuildId = vmod.id("server-build");
let serverManifestId = vmod.id("server-manifest");
let browserManifestId = vmod.id("browser-manifest");
let remixReactProxyId = vmod.id("remix-react-proxy");
let hmrRuntimeId = vmod.id("hmr-runtime");
let injectHmrRuntimeId = vmod.id("inject-hmr-runtime");
const isJsFile = filePath => /\.[cm]?[jt]sx?$/i.test(filePath);
const resolveRelativeRouteFilePath = (route, pluginConfig) => {
  let vite = importViteEsmSync.importViteEsmSync();
  let file = route.file;
  let fullPath = path__namespace.resolve(pluginConfig.appDirectory, file);
  return vite.normalizePath(fullPath);
};
let vmods = [serverBuildId, serverManifestId, browserManifestId];
const getHash = (source, maxLength) => {
  let hash = node_crypto.createHash("sha256").update(source).digest("hex");
  return typeof maxLength === "number" ? hash.slice(0, maxLength) : hash;
};
const resolveChunk = (pluginConfig, viteManifest, absoluteFilePath) => {
  let vite = importViteEsmSync.importViteEsmSync();
  let rootRelativeFilePath = path__namespace.relative(pluginConfig.rootDirectory, absoluteFilePath);
  let manifestKey = vite.normalizePath(rootRelativeFilePath);
  let entryChunk = viteManifest[manifestKey];
  if (!entryChunk) {
    let knownManifestKeys = Object.keys(viteManifest).map(key => '"' + key + '"').join(", ");
    throw new Error(`No manifest entry found for "${manifestKey}". Known manifest keys: ${knownManifestKeys}`);
  }
  return entryChunk;
};
const resolveBuildAssetPaths = (pluginConfig, viteManifest, entryFilePath, prependedAssetFilePaths = []) => {
  let entryChunk = resolveChunk(pluginConfig, viteManifest, entryFilePath);

  // This is here to support prepending client entry assets to the root route
  let prependedAssetChunks = prependedAssetFilePaths.map(filePath => resolveChunk(pluginConfig, viteManifest, filePath));
  let chunks = resolveDependantChunks(viteManifest, [...prependedAssetChunks, entryChunk]);
  return {
    module: `${pluginConfig.publicPath}${entryChunk.file}`,
    imports: dedupe(chunks.flatMap(e => e.imports ?? [])).map(imported => {
      return `${pluginConfig.publicPath}${viteManifest[imported].file}`;
    }) ?? [],
    css: dedupe(chunks.flatMap(e => e.css ?? [])).map(href => {
      return `${pluginConfig.publicPath}${href}`;
    }) ?? []
  };
};
function resolveDependantChunks(viteManifest, entryChunks) {
  let chunks = new Set();
  function walk(chunk) {
    if (chunks.has(chunk)) {
      return;
    }
    if (chunk.imports) {
      for (let importKey of chunk.imports) {
        walk(viteManifest[importKey]);
      }
    }
    chunks.add(chunk);
  }
  for (let entryChunk of entryChunks) {
    walk(entryChunk);
  }
  return Array.from(chunks);
}
function dedupe(array) {
  return [...new Set(array)];
}
const writeFileSafe = async (file, contents) => {
  await fse__namespace.ensureDir(path__namespace.dirname(file));
  await fse__namespace.writeFile(file, contents);
};
const getRouteManifestModuleExports = async (viteChildCompiler, pluginConfig) => {
  let entries = await Promise.all(Object.entries(pluginConfig.routes).map(async ([key, route]) => {
    let sourceExports = await getRouteModuleExports(viteChildCompiler, pluginConfig, route.file);
    return [key, sourceExports];
  }));
  return Object.fromEntries(entries);
};
const getRouteModuleExports = async (viteChildCompiler, pluginConfig, routeFile) => {
  if (!viteChildCompiler) {
    throw new Error("Vite child compiler not found");
  }

  // We transform the route module code with the Vite child compiler so that we
  // can parse the exports from non-JS files like MDX. This ensures that we can
  // understand the exports from anything that Vite can compile to JS, not just
  // the route file formats that the Remix compiler historically supported.

  let ssr = true;
  let {
    pluginContainer,
    moduleGraph
  } = viteChildCompiler;
  let routePath = path__namespace.join(pluginConfig.appDirectory, routeFile);
  let url = resolveFileUrl.resolveFileUrl(pluginConfig, routePath);
  let resolveId = async () => {
    let result = await pluginContainer.resolveId(url, undefined, {
      ssr
    });
    if (!result) throw new Error(`Could not resolve module ID for ${url}`);
    return result.id;
  };
  let [id, code] = await Promise.all([resolveId(), fse__namespace.readFile(routePath, "utf-8"),
  // pluginContainer.transform(...) fails if we don't do this first:
  moduleGraph.ensureEntryFromUrl(url, ssr)]);
  let transformed = await pluginContainer.transform(code, id, {
    ssr
  });
  let [, exports] = esModuleLexer.parse(transformed.code);
  let exportNames = exports.map(e => e.n);
  return exportNames;
};
const getViteMajorVersion = () => {
  let vitePkg = require("vite/package.json");
  return parseInt(vitePkg.version.split(".")[0]);
};
const remixVitePlugin = (options = {}) => {
  let viteCommand;
  let viteUserConfig;
  let viteConfig;
  let isViteV4 = getViteMajorVersion() === 4;
  let cssModulesManifest = {};
  let ssrBuildContext;
  let viteChildCompiler = null;
  let cachedPluginConfig;
  let resolvePluginConfig = async () => {
    let defaults = {
      serverBuildPath: "build/server/index.js",
      assetsBuildDirectory: "build/client",
      publicPath: "/"
    };
    let config$1 = {
      ...defaults,
      ...pick__default["default"](options, supportedRemixConfigKeys) // Avoid leaking any config options that the Vite plugin doesn't support
    };

    let rootDirectory = viteUserConfig.root ?? process.env.REMIX_ROOT ?? process.cwd();

    // Only select the Remix config options that the Vite plugin uses
    let {
      appDirectory,
      assetsBuildDirectory,
      entryClientFilePath,
      publicPath,
      routes,
      entryServerFilePath,
      serverBuildPath,
      serverModuleFormat,
      isSpaMode,
      relativeAssetsBuildDirectory,
      future
    } = await config.resolveConfig(config$1, {
      rootDirectory
    });
    return {
      appDirectory,
      rootDirectory,
      assetsBuildDirectory,
      entryClientFilePath,
      publicPath,
      routes,
      entryServerFilePath,
      serverBuildPath,
      serverModuleFormat,
      isSpaMode,
      relativeAssetsBuildDirectory,
      future
    };
  };
  let getServerEntry = async () => {
    let pluginConfig = await resolvePluginConfig();
    return `
    import * as entryServer from ${JSON.stringify(resolveFileUrl.resolveFileUrl(pluginConfig, pluginConfig.entryServerFilePath))};
    ${Object.keys(pluginConfig.routes).map((key, index) => {
      let route = pluginConfig.routes[key];
      return `import * as route${index} from ${JSON.stringify(resolveFileUrl.resolveFileUrl(pluginConfig, resolveRelativeRouteFilePath(route, pluginConfig)))};`;
    }).join("\n")}
      export { default as assets } from ${JSON.stringify(serverManifestId)};
      export const assetsBuildDirectory = ${JSON.stringify(pluginConfig.relativeAssetsBuildDirectory)};
      export const future = ${JSON.stringify(pluginConfig.future)};
      export const isSpaMode = ${pluginConfig.isSpaMode === true};
      export const publicPath = ${JSON.stringify(pluginConfig.publicPath)};
      export const entry = { module: entryServer };
      export const routes = {
        ${Object.keys(pluginConfig.routes).map((key, index) => {
      let route = pluginConfig.routes[key];
      return `${JSON.stringify(key)}: {
          id: ${JSON.stringify(route.id)},
          parentId: ${JSON.stringify(route.parentId)},
          path: ${JSON.stringify(route.path)},
          index: ${JSON.stringify(route.index)},
          caseSensitive: ${JSON.stringify(route.caseSensitive)},
          module: route${index}
        }`;
    }).join(",\n  ")}
      };`;
  };
  let loadViteManifest = async directory => {
    let manifestPath = isViteV4 ? "manifest.json" : path__namespace.join(".vite", "manifest.json");
    let manifestContents = await fse__namespace.readFile(path__namespace.resolve(directory, manifestPath), "utf-8");
    return JSON.parse(manifestContents);
  };
  let createBuildManifest = async () => {
    let pluginConfig = await resolvePluginConfig();
    let viteManifest = await loadViteManifest(pluginConfig.assetsBuildDirectory);
    let entry = resolveBuildAssetPaths(pluginConfig, viteManifest, pluginConfig.entryClientFilePath);
    let routes = {};
    let routeManifestExports = await getRouteManifestModuleExports(viteChildCompiler, pluginConfig);
    for (let [key, route] of Object.entries(pluginConfig.routes)) {
      let routeFilePath = path__namespace.join(pluginConfig.appDirectory, route.file);
      let sourceExports = routeManifestExports[key];
      let isRootRoute = route.parentId === undefined;
      routes[key] = {
        id: route.id,
        parentId: route.parentId,
        path: route.path,
        index: route.index,
        caseSensitive: route.caseSensitive,
        hasAction: sourceExports.includes("action"),
        hasLoader: sourceExports.includes("loader"),
        hasClientAction: sourceExports.includes("clientAction"),
        hasClientLoader: sourceExports.includes("clientLoader"),
        hasErrorBoundary: sourceExports.includes("ErrorBoundary"),
        ...resolveBuildAssetPaths(pluginConfig, viteManifest, routeFilePath,
        // If this is the root route, we also need to include assets from the
        // client entry file as this is a common way for consumers to import
        // global reset styles, etc.
        isRootRoute ? [pluginConfig.entryClientFilePath] : [])
      };
    }
    let fingerprintedValues = {
      entry,
      routes
    };
    let version = getHash(JSON.stringify(fingerprintedValues), 8);
    let manifestPath = `assets/manifest-${version}.js`;
    let url = `${pluginConfig.publicPath}${manifestPath}`;
    let nonFingerprintedValues = {
      url,
      version
    };
    let manifest = {
      ...fingerprintedValues,
      ...nonFingerprintedValues
    };
    await writeFileSafe(path__namespace.join(pluginConfig.assetsBuildDirectory, manifestPath), `window.__remixManifest=${JSON.stringify(manifest)};`);
    return manifest;
  };
  let getDevManifest = async () => {
    let pluginConfig = await resolvePluginConfig();
    let routes = {};
    let routeManifestExports = await getRouteManifestModuleExports(viteChildCompiler, pluginConfig);
    for (let [key, route] of Object.entries(pluginConfig.routes)) {
      let sourceExports = routeManifestExports[key];
      routes[key] = {
        id: route.id,
        parentId: route.parentId,
        path: route.path,
        index: route.index,
        caseSensitive: route.caseSensitive,
        module: `${resolveFileUrl.resolveFileUrl(pluginConfig, resolveRelativeRouteFilePath(route, pluginConfig))}${isJsFile(route.file) ? "" : "?import" // Ensure the Vite dev server responds with a JS module
        }`,
        hasAction: sourceExports.includes("action"),
        hasLoader: sourceExports.includes("loader"),
        hasClientAction: sourceExports.includes("clientAction"),
        hasClientLoader: sourceExports.includes("clientLoader"),
        hasErrorBoundary: sourceExports.includes("ErrorBoundary"),
        imports: []
      };
    }
    return {
      version: String(Math.random()),
      url: vmod.url(browserManifestId),
      hmr: {
        runtime: vmod.url(injectHmrRuntimeId)
      },
      entry: {
        module: resolveFileUrl.resolveFileUrl(pluginConfig, pluginConfig.entryClientFilePath),
        imports: []
      },
      routes
    };
  };
  return [{
    name: "remix",
    config: async (_viteUserConfig, viteConfigEnv) => {
      var _viteUserConfig$build, _viteUserConfig$build2;
      // Preload Vite's ESM build up-front as soon as we're in an async context
      await importViteEsmSync.preloadViteEsm();

      // Ensure sync import of Vite works after async preload
      let vite = importViteEsmSync.importViteEsmSync();
      viteUserConfig = _viteUserConfig;
      viteCommand = viteConfigEnv.command;
      let pluginConfig = await resolvePluginConfig();
      cachedPluginConfig = pluginConfig;
      Object.assign(process.env, vite.loadEnv(viteConfigEnv.mode, pluginConfig.rootDirectory,
      // We override default prefix of "VITE_" with a blank string since
      // we're targeting the server, so we want to load all environment
      // variables, not just those explicitly marked for the client
      ""));
      let isSsrBuild = "ssrBuild" in viteConfigEnv && typeof viteConfigEnv.ssrBuild === "boolean" ? viteConfigEnv.ssrBuild // Vite v4 back compat
      : viteConfigEnv.isSsrBuild;
      return {
        __remixPluginResolvedConfig: pluginConfig,
        appType: "custom",
        experimental: {
          hmrPartialAccept: true
        },
        optimizeDeps: {
          include: [
          // Pre-bundle React dependencies to avoid React duplicates,
          // even if React dependencies are not direct dependencies.
          // https://react.dev/warnings/invalid-hook-call-warning#duplicate-react
          "react", "react/jsx-runtime", "react/jsx-dev-runtime", "react-dom/client",
          // Pre-bundle Remix dependencies to avoid Remix router duplicates.
          // Our remix-remix-react-proxy plugin does not process default client and
          // server entry files since those come from within `node_modules`.
          // That means that before Vite pre-bundles dependencies (e.g. first time dev server is run)
          // mismatching Remix routers cause `Error: You must render this element inside a <Remix> element`.
          "@remix-run/react",
          // For some reason, the `vite-dotenv` integration test consistently fails on webkit
          // with `504 (Outdated Optimize Dep)` from Vite  unless `@remix-run/node` is included
          // in `optimizeDeps.include`. 🤷
          // This could be caused by how we copy `node_modules/` into integration test fixtures,
          // so maybe this will be unnecessary once we switch to pnpm
          "@remix-run/node"]
        },
        esbuild: {
          jsx: "automatic",
          jsxDev: viteCommand !== "build"
        },
        resolve: {
          dedupe: [
          // https://react.dev/warnings/invalid-hook-call-warning#duplicate-react
          "react", "react-dom",
          // see description for `@remix-run/react` in `optimizeDeps.include`
          "@remix-run/react"]
        },
        ...(viteCommand === "build" && {
          base: pluginConfig.publicPath,
          build: {
            ...viteUserConfig.build,
            ...(!isSsrBuild ? {
              manifest: true,
              outDir: pluginConfig.assetsBuildDirectory,
              rollupOptions: {
                ...((_viteUserConfig$build = viteUserConfig.build) === null || _viteUserConfig$build === void 0 ? void 0 : _viteUserConfig$build.rollupOptions),
                preserveEntrySignatures: "exports-only",
                input: [pluginConfig.entryClientFilePath, ...Object.values(pluginConfig.routes).map(route => path__namespace.resolve(pluginConfig.appDirectory, route.file))]
              }
            } : {
              // We move SSR-only assets to client assets. Note that the
              // SSR build can also emit code-split JS files (e.g. by
              // dynamic import) under the same assets directory
              // regardless of "ssrEmitAssets" option, so we also need to
              // keep these JS files have to be kept as-is.
              ssrEmitAssets: true,
              copyPublicDir: false,
              // Assets in the public directory are only used by the client
              manifest: true,
              // We need the manifest to detect SSR-only assets
              outDir: path__namespace.dirname(pluginConfig.serverBuildPath),
              rollupOptions: {
                ...((_viteUserConfig$build2 = viteUserConfig.build) === null || _viteUserConfig$build2 === void 0 ? void 0 : _viteUserConfig$build2.rollupOptions),
                preserveEntrySignatures: "exports-only",
                input: serverBuildId,
                output: {
                  entryFileNames: path__namespace.basename(pluginConfig.serverBuildPath),
                  format: pluginConfig.serverModuleFormat
                }
              }
            })
          }
        })
      };
    },
    async configResolved(resolvedViteConfig) {
      await esModuleLexer.init;
      viteConfig = resolvedViteConfig;
      ssrBuildContext = viteConfig.build.ssr && viteCommand === "build" ? {
        isSsrBuild: true,
        getManifest: createBuildManifest
      } : {
        isSsrBuild: false
      };

      // We load the same Vite config file again for the child compiler so
      // that both parent and child compiler's plugins have independent state.
      // If we re-used the `viteUserConfig.plugins` array for the child
      // compiler, it could lead to mutating shared state between plugin
      // instances in unexpected ways, e.g. during `vite build` the
      // `configResolved` plugin hook would be called with `command = "build"`
      // by parent and then `command = "serve"` by child, which some plugins
      // may respond to by updating state referenced by the parent.
      if (!viteConfig.configFile) {
        throw new Error("The Remix Vite plugin requires the use of a Vite config file");
      }
      let vite = importViteEsmSync.importViteEsmSync();
      let childCompilerConfigFile = await vite.loadConfigFromFile({
        command: viteConfig.command,
        mode: viteConfig.mode,
        ...(isViteV4 ? {
          ssrBuild: ssrBuildContext.isSsrBuild
        } : {
          isSsrBuild: ssrBuildContext.isSsrBuild
        })
      }, viteConfig.configFile);
      invariant["default"](childCompilerConfigFile, "Vite config file was unable to be resolved for Remix child compiler");
      viteChildCompiler = await vite.createServer({
        ...viteUserConfig,
        mode: viteConfig.mode,
        server: {
          preTransformRequests: false,
          hmr: false
        },
        configFile: false,
        envFile: false,
        plugins: [...(childCompilerConfigFile.config.plugins ?? []).flat()
        // Exclude this plugin from the child compiler to prevent an
        // infinite loop (plugin creates a child compiler with the same
        // plugin that creates another child compiler, repeat ad
        // infinitum), and to prevent the manifest from being written to
        // disk from the child compiler. This is important in the
        // production build because the child compiler is a Vite dev
        // server and will generate incorrect manifests.
        .filter(plugin => typeof plugin === "object" && plugin !== null && "name" in plugin && plugin.name !== "remix" && plugin.name !== "remix-hmr-updates")]
      });
      await viteChildCompiler.pluginContainer.buildStart({});
    },
    transform(code, id) {
      if (styles.isCssModulesFile(id)) {
        cssModulesManifest[id] = code;
      }
    },
    buildStart() {
      invariant["default"](viteConfig);
      if (viteCommand === "build" && viteConfig.mode === "production" && !viteConfig.build.ssr && viteConfig.build.sourcemap) {
        viteConfig.logger.warn(pc__default["default"].yellow("\n" + pc__default["default"].bold("  ⚠️  Source maps are enabled in production\n") + ["This makes your server code publicly", "visible in the browser. This is highly", "discouraged! If you insist, ensure that", "you are using environment variables for", "secrets and not hard-coding them in", "your source code."].map(line => "     " + line).join("\n") + "\n"));
      }
    },
    configureServer(viteDevServer) {
      serverRuntime.unstable_setDevServerHooks({
        // Give the request handler access to the critical CSS in dev to avoid a
        // flash of unstyled content since Vite injects CSS file contents via JS
        getCriticalCss: async (build, url) => {
          invariant["default"](cachedPluginConfig);
          return styles.getStylesForUrl(viteDevServer, cachedPluginConfig, cssModulesManifest, build, url);
        },
        // If an error is caught within the request handler, let Vite fix the
        // stack trace so it maps back to the actual source code
        processRequestError: error => {
          if (error instanceof Error) {
            viteDevServer.ssrFixStacktrace(error);
          }
        }
      });

      // We cache the pluginConfig here to make sure we're only invalidating virtual modules when necessary.
      // This requires a separate cache from `cachedPluginConfig`, which is updated by remix-hmr-updates. If
      // we shared the cache, it would already be refreshed by remix-hmr-updates at this point, and we'd
      // have no way of comparing against the cache to know if the virtual modules need to be invalidated.
      let previousPluginConfig;
      return () => {
        viteDevServer.middlewares.use(async (_req, _res, next) => {
          try {
            let pluginConfig = await resolvePluginConfig();
            if (JSON.stringify(pluginConfig) !== JSON.stringify(previousPluginConfig)) {
              previousPluginConfig = pluginConfig;

              // Invalidate all virtual modules
              vmods.forEach(vmod$1 => {
                let mod = viteDevServer.moduleGraph.getModuleById(vmod.resolve(vmod$1));
                if (mod) {
                  viteDevServer.moduleGraph.invalidateModule(mod);
                }
              });
            }
            next();
          } catch (error) {
            next(error);
          }
        });

        // Let user servers handle SSR requests in middleware mode,
        // otherwise the Vite plugin will handle the request
        if (!viteDevServer.config.server.middlewareMode) {
          viteDevServer.middlewares.use(async (req, res, next) => {
            try {
              let build = await viteDevServer.ssrLoadModule(serverBuildId);
              let handle = adapter.createRequestHandler(build, {
                mode: "development"
              });
              await handle(req, res);
            } catch (error) {
              next(error);
            }
          });
        }
      };
    },
    writeBundle: {
      // After the SSR build is finished, we inspect the Vite manifest for
      // the SSR build and move server-only assets to client assets directory
      async handler() {
        if (!ssrBuildContext.isSsrBuild) {
          return;
        }
        invariant["default"](cachedPluginConfig);
        invariant["default"](viteConfig);
        let {
          assetsBuildDirectory,
          serverBuildPath,
          rootDirectory
        } = cachedPluginConfig;
        let serverBuildDir = path__namespace.dirname(serverBuildPath);
        let ssrViteManifest = await loadViteManifest(serverBuildDir);
        let clientViteManifest = await loadViteManifest(assetsBuildDirectory);
        let clientAssetPaths = new Set(Object.values(clientViteManifest).flatMap(chunk => chunk.assets ?? []));
        let ssrAssetPaths = new Set(Object.values(ssrViteManifest).flatMap(chunk => chunk.assets ?? []));

        // We only move assets that aren't in the client build, otherwise we
        // remove them. These assets only exist because we explicitly set
        // `ssrEmitAssets: true` in the SSR Vite config. These assets
        // typically wouldn't exist by default, which is why we assume it's
        // safe to remove them. We're aiming for a clean build output so that
        // unnecessary assets don't get deployed alongside the server code.
        let movedAssetPaths = [];
        for (let ssrAssetPath of ssrAssetPaths) {
          let src = path__namespace.join(serverBuildDir, ssrAssetPath);
          if (!clientAssetPaths.has(ssrAssetPath)) {
            let dest = path__namespace.join(assetsBuildDirectory, ssrAssetPath);
            await fse__namespace.move(src, dest);
            movedAssetPaths.push(dest);
          } else {
            await fse__namespace.remove(src);
          }
        }

        // We assume CSS files from the SSR build are unnecessary and remove
        // them for the same reasons as above.
        let ssrCssPaths = Object.values(ssrViteManifest).flatMap(chunk => chunk.css ?? []);
        await Promise.all(ssrCssPaths.map(cssPath => fse__namespace.remove(path__namespace.join(serverBuildDir, cssPath))));
        if (movedAssetPaths.length) {
          viteConfig.logger.info(["", `${pc__default["default"].green("✓")} ${movedAssetPaths.length} asset${movedAssetPaths.length > 1 ? "s" : ""} moved from Remix server build to client assets.`, ...movedAssetPaths.map(movedAssetPath => pc__default["default"].dim(path__namespace.relative(rootDirectory, movedAssetPath))), ""].join("\n"));
        }
        if (cachedPluginConfig.isSpaMode) {
          await handleSpaMode(serverBuildPath, assetsBuildDirectory, viteConfig.mode);
        }
      }
    },
    async buildEnd() {
      var _viteChildCompiler;
      await ((_viteChildCompiler = viteChildCompiler) === null || _viteChildCompiler === void 0 ? void 0 : _viteChildCompiler.close());
    }
  }, {
    name: "remix-virtual-modules",
    enforce: "pre",
    resolveId(id) {
      if (vmods.includes(id)) return vmod.resolve(id);
    },
    async load(id) {
      switch (id) {
        case vmod.resolve(serverBuildId):
          {
            return await getServerEntry();
          }
        case vmod.resolve(serverManifestId):
          {
            let manifest = ssrBuildContext.isSsrBuild ? await ssrBuildContext.getManifest() : await getDevManifest();
            return `export default ${jsesc__default["default"](manifest, {
              es6: true
            })};`;
          }
        case vmod.resolve(browserManifestId):
          {
            if (viteCommand === "build") {
              throw new Error("This module only exists in development");
            }
            let manifest = await getDevManifest();
            return `window.__remixManifest=${jsesc__default["default"](manifest, {
              es6: true
            })};`;
          }
      }
    }
  }, {
    name: "remix-dot-server",
    enforce: "pre",
    async resolveId(id, importer, options) {
      var _options$custom;
      if (options !== null && options !== void 0 && options.ssr) return;
      let isResolving = (options === null || options === void 0 ? void 0 : (_options$custom = options.custom) === null || _options$custom === void 0 ? void 0 : _options$custom["remix-dot-server"]) ?? false;
      if (isResolving) return;
      options.custom = {
        ...options.custom,
        "remix-dot-server": true
      };
      let resolved = await this.resolve(id, importer, options);
      if (!resolved) return;
      let serverFileRE = /\.server(\.[cm]?[jt]sx?)?$/;
      let serverDirRE = /\/\.server\//;
      let isDotServer = serverFileRE.test(resolved.id) || serverDirRE.test(resolved.id);
      if (!isDotServer) return;
      if (!importer) throw Error(`Importer not found: ${id}`);
      let vite = importViteEsmSync.importViteEsmSync();
      let pluginConfig = await resolvePluginConfig();
      let importerShort = vite.normalizePath(path__namespace.relative(pluginConfig.rootDirectory, importer));
      let isRoute = getRoute(pluginConfig, importer);
      if (isRoute) {
        let serverOnlyExports = SERVER_ONLY_EXPORTS.map(xport => `\`${xport}\``).join(", ");
        throw Error([pc__default["default"].red(`Server-only module referenced by client`), "", `    '${id}' imported by route '${importerShort}'`, "", `  The only route exports that can reference server-only modules are:`, `    ${serverOnlyExports}`, "", `  But other route exports in '${importerShort}' depend on '${id}'.`, "", "  For more see https://remix.run/docs/en/main/discussion/server-vs-client", ""].join("\n"));
      }
      let importedBy = path__namespace.parse(importerShort);
      let dotServerFile = vite.normalizePath(path__namespace.join(importedBy.dir, importedBy.name + ".server" + importedBy.ext));
      throw Error([pc__default["default"].red(`Server-only module referenced by client`), "", `    '${id}' imported by '${importerShort}'`, "", `  * If all code in '${importerShort}' is server-only:`, "", `    Rename it to '${dotServerFile}'`, "", `  * Otherwise:`, "", `    - Keep client-safe code in '${importerShort}'`, `    - And move server-only code to a \`.server\` file`, `      e.g. '${dotServerFile}'`, "", "  If you have lots of `.server` files, try using", "  a `.server` directory e.g. 'app/.server'", "", "  For more, see https://remix.run/docs/en/main/future/vite#server-code-not-tree-shaken-in-development", ""].join("\n"));
    }
  }, {
    name: "remix-dot-client",
    enforce: "post",
    async transform(code, id, options) {
      if (!(options !== null && options !== void 0 && options.ssr)) return;
      let clientFileRE = /\.client(\.[cm]?[jt]sx?)?$/;
      let clientDirRE = /\/\.client\//;
      if (clientFileRE.test(id) || clientDirRE.test(id)) {
        let exports = esModuleLexer.parse(code)[1];
        return {
          code: exports.map(({
            n: name
          }) => name === "default" ? "export default undefined;" : `export const ${name} = undefined;`).join("\n"),
          map: null
        };
      }
    }
  }, {
    name: "remix-route-exports",
    enforce: "post",
    // Ensure we're operating on the transformed code to support MDX etc.
    async transform(code, id, options) {
      if (options !== null && options !== void 0 && options.ssr) return;
      let pluginConfig = cachedPluginConfig || (await resolvePluginConfig());
      let route = getRoute(pluginConfig, id);
      if (!route) return;

      // check the exports, fail if unknown exists, unless id ends with .mdx
      let nonRemixExports = esModuleLexer.parse(code)[1].map(exp => exp.n).filter(exp => !ROUTE_EXPORTS.has(exp));
      if (nonRemixExports.length > 0 && !id.endsWith(".mdx")) {
        let message = [`${nonRemixExports.length} invalid route export${nonRemixExports.length > 1 ? "s" : ""} in \`${route.file}\`:`, ...nonRemixExports.map(exp => `  - \`${exp}\``), "", "See https://remix.run/docs/en/main/future/vite#strict-route-exports", ""].join("\n");
        throw Error(message);
      }
      if (pluginConfig.isSpaMode) {
        let serverOnlyExports = esModuleLexer.parse(code)[1].map(exp => exp.n).filter(exp => SERVER_ONLY_EXPORTS.includes(exp));
        if (serverOnlyExports.length > 0) {
          let message = [`SPA Mode: ${serverOnlyExports.length} invalid route export${serverOnlyExports.length > 1 ? "s" : ""} in \`${route.file}\`:`, ...serverOnlyExports.map(exp => `  - \`${exp}\``), "",
          // TODO: Docs!
          //"See https://remix.run/docs/en/main/future/vite#strict-route-exports",
          ""].join("\n");
          throw Error(message);
        }
      }
      return {
        code: removeExports.removeExports(code, SERVER_ONLY_EXPORTS),
        map: null
      };
    }
  }, {
    name: "remix-remix-react-proxy",
    enforce: "post",
    // Ensure we're operating on the transformed code to support MDX etc.
    resolveId(id) {
      if (id === remixReactProxyId) {
        return vmod.resolve(remixReactProxyId);
      }
    },
    transform(code, id) {
      // Don't transform the proxy itself, otherwise it will import itself
      if (id === vmod.resolve(remixReactProxyId)) {
        return;
      }
      let hasLiveReloadHints = code.includes("LiveReload") && code.includes("@remix-run/react");

      // Don't transform files that don't need the proxy
      if (!hasLiveReloadHints) {
        return;
      }

      // Rewrite imports to use the proxy
      return replaceImportSpecifier.replaceImportSpecifier({
        code,
        specifier: "@remix-run/react",
        replaceWith: remixReactProxyId
      });
    },
    load(id) {
      if (id === vmod.resolve(remixReactProxyId)) {
        // TODO: ensure react refresh is initialized before `<Scripts />`
        return ['import { createElement } from "react";', 'export * from "@remix-run/react";', `export const LiveReload = ${viteCommand !== "serve"} ? () => null : `, '({ nonce = undefined }) => createElement("script", {', "  nonce,", "  dangerouslySetInnerHTML: { ", "    __html: `window.__remixLiveReloadEnabled = true`", "  }", "});"].join("\n");
      }
    }
  }, {
    name: "remix-inject-hmr-runtime",
    enforce: "pre",
    resolveId(id) {
      if (id === injectHmrRuntimeId) return vmod.resolve(injectHmrRuntimeId);
    },
    async load(id) {
      if (id !== vmod.resolve(injectHmrRuntimeId)) return;
      return [`import RefreshRuntime from "${hmrRuntimeId}"`, "RefreshRuntime.injectIntoGlobalHook(window)", "window.$RefreshReg$ = () => {}", "window.$RefreshSig$ = () => (type) => type", "window.__vite_plugin_react_preamble_installed__ = true"].join("\n");
    }
  }, {
    name: "remix-hmr-runtime",
    enforce: "pre",
    resolveId(id) {
      if (id === hmrRuntimeId) return vmod.resolve(hmrRuntimeId);
    },
    async load(id) {
      if (id !== vmod.resolve(hmrRuntimeId)) return;
      let reactRefreshDir = path__namespace.dirname(require.resolve("react-refresh/package.json"));
      let reactRefreshRuntimePath = path__namespace.join(reactRefreshDir, "cjs/react-refresh-runtime.development.js");
      return ["const exports = {}", await fse__namespace.readFile(reactRefreshRuntimePath, "utf8"), await fse__namespace.readFile(require.resolve("./static/refresh-utils.cjs"), "utf8"), "export default exports"].join("\n");
    }
  }, {
    name: "remix-react-refresh-babel",
    enforce: "post",
    // jsx and typescript (in ts, jsx, tsx files) are already transpiled by vite
    async transform(code, id, options) {
      if (viteCommand !== "serve") return;
      if (id.includes("/node_modules/")) return;
      let [filepath] = id.split("?");
      if (!/.[tj]sx?$/.test(filepath)) return;
      let devRuntime = "react/jsx-dev-runtime";
      let ssr = (options === null || options === void 0 ? void 0 : options.ssr) === true;
      let isJSX = filepath.endsWith("x");
      let useFastRefresh = !ssr && (isJSX || code.includes(devRuntime));
      if (!useFastRefresh) return;
      let result = await babel__default["default"].transformAsync(code, {
        filename: id,
        sourceFileName: filepath,
        parserOpts: {
          sourceType: "module",
          allowAwaitOutsideFunction: true
        },
        plugins: [[require("react-refresh/babel"), {
          skipEnvCheck: true
        }]],
        sourceMaps: true
      });
      if (result === null) return;
      code = result.code;
      let refreshContentRE = /\$Refresh(?:Reg|Sig)\$\(/;
      if (refreshContentRE.test(code)) {
        let pluginConfig = cachedPluginConfig || (await resolvePluginConfig());
        code = addRefreshWrapper(pluginConfig, code, id);
      }
      return {
        code,
        map: result.map
      };
    }
  }, {
    name: "remix-hmr-updates",
    async handleHotUpdate({
      server,
      file,
      modules
    }) {
      let pluginConfig = await resolvePluginConfig();
      // Update the config cache any time there is a file change
      cachedPluginConfig = pluginConfig;
      let route = getRoute(pluginConfig, file);
      server.ws.send({
        type: "custom",
        event: "remix:hmr",
        data: {
          route: route ? await getRouteMetadata(pluginConfig, viteChildCompiler, route) : null
        }
      });
      return modules;
    }
  }];
};
function addRefreshWrapper(pluginConfig, code, id) {
  let isRoute = getRoute(pluginConfig, id);
  let acceptExports = isRoute ? ["clientAction", "clientLoader", "handle", "meta", "links", "shouldRevalidate"] : [];
  return REACT_REFRESH_HEADER.replace("__SOURCE__", JSON.stringify(id)) + code + REACT_REFRESH_FOOTER.replace("__SOURCE__", JSON.stringify(id)).replace("__ACCEPT_EXPORTS__", JSON.stringify(acceptExports));
}
const REACT_REFRESH_HEADER = `
import RefreshRuntime from "${hmrRuntimeId}";

const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;

if (import.meta.hot && !inWebWorker && window.__remixLiveReloadEnabled) {
  if (!window.__vite_plugin_react_preamble_installed__) {
    throw new Error(
      "Remix Vite plugin can't detect preamble. Something is wrong."
    );
  }

  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    RefreshRuntime.register(type, __SOURCE__ + " " + id)
  };
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}`.replace(/\n+/g, "");
const REACT_REFRESH_FOOTER = `
if (import.meta.hot && !inWebWorker && window.__remixLiveReloadEnabled) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh(__SOURCE__, currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate(currentExports, nextExports, __ACCEPT_EXPORTS__);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}`;
function getRoute(pluginConfig, file) {
  let vite = importViteEsmSync.importViteEsmSync();
  if (!file.startsWith(vite.normalizePath(pluginConfig.appDirectory))) return;
  let routePath = vite.normalizePath(path__namespace.relative(pluginConfig.appDirectory, file));
  let route = Object.values(pluginConfig.routes).find(r => r.file === routePath);
  return route;
}
async function getRouteMetadata(pluginConfig, viteChildCompiler, route) {
  let sourceExports = await getRouteModuleExports(viteChildCompiler, pluginConfig, route.file);
  let info = {
    id: route.id,
    parentId: route.parentId,
    path: route.path,
    index: route.index,
    caseSensitive: route.caseSensitive,
    url: "/" + path__namespace.relative(pluginConfig.rootDirectory, resolveRelativeRouteFilePath(route, pluginConfig)),
    module: `${resolveFileUrl.resolveFileUrl(pluginConfig, resolveRelativeRouteFilePath(route, pluginConfig))}?import`,
    // Ensure the Vite dev server responds with a JS module
    hasAction: sourceExports.includes("action"),
    hasClientAction: sourceExports.includes("clientAction"),
    hasLoader: sourceExports.includes("loader"),
    hasClientLoader: sourceExports.includes("clientLoader"),
    hasErrorBoundary: sourceExports.includes("ErrorBoundary"),
    imports: []
  };
  return info;
}
async function handleSpaMode(serverBuildPath, assetsBuildDirectory, mode) {
  // Create a handler and call it for the `/` path - rendering down to the
  // proper HydrateFallback ... or not!  Maybe they have a static landing page
  // generated from routes/_index.tsx.
  let build = await import(serverBuildPath);
  let {
    createRequestHandler: createNodeRequestHandler
  } = await import('@remix-run/node');
  let handler = createNodeRequestHandler(build, mode);
  let response = await handler(new Request("http://localhost/"));
  invariant["default"](response.status === 200, "Error generating the index.html file");

  // Write out the index.html file for the SPA
  await fse__namespace.writeFile(path__namespace.join(assetsBuildDirectory, "index.html"), await response.text());
  console.log(pc__default["default"].green("Remix SPA Mode: index.html has been written to your"), pc__default["default"].green(pc__default["default"].bold(path__namespace.relative(process.cwd(), assetsBuildDirectory))), pc__default["default"].green("directory"));

  // Cleanup - we no longer need the server build
  fse__namespace.removeSync(serverBuildPath);

  // TODO: Is it safe to remove the build/server/ directory here?
  // path.dirname(serverBuildPath) feels risky since who knows what else is in
  // there?  Maybe we only remove it if it's empty (barring the build/server/.vite/ cache
  // directory)?
}

exports.remixVitePlugin = remixVitePlugin;
