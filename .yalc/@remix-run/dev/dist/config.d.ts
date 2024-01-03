import type { NodePolyfillsOptions as EsbuildPluginsNodeModulesPolyfillOptions } from "esbuild-plugins-node-modules-polyfill";
import type { RouteManifest, DefineRoutesFunction } from "./config/routes";
import { ServerMode } from "./config/serverModes";
export interface RemixMdxConfig {
    rehypePlugins?: any[];
    remarkPlugins?: any[];
}
export type RemixMdxConfigFunction = (filename: string) => Promise<RemixMdxConfig | undefined> | RemixMdxConfig | undefined;
export type ServerModuleFormat = "esm" | "cjs";
export type ServerPlatform = "node" | "neutral";
type Dev = {
    command?: string;
    manual?: boolean;
    port?: number;
    tlsKey?: string;
    tlsCert?: string;
};
interface FutureConfig {
    v3_fetcherPersist: boolean;
    v3_relativeSplatPath: boolean;
}
type NodeBuiltinsPolyfillOptions = Pick<EsbuildPluginsNodeModulesPolyfillOptions, "modules" | "globals">;
/**
 * The user-provided config in `remix.config.js`.
 */
export interface AppConfig {
    /**
     * The path to the `app` directory, relative to `remix.config.js`. Defaults
     * to `"app"`.
     */
    appDirectory?: string;
    /**
     * The path to a directory Remix can use for caching things in development,
     * relative to `remix.config.js`. Defaults to `".cache"`.
     */
    cacheDirectory?: string;
    /**
     * A function for defining custom routes, in addition to those already defined
     * using the filesystem convention in `app/routes`. Both sets of routes will
     * be merged.
     */
    routes?: (defineRoutes: DefineRoutesFunction) => Promise<ReturnType<DefineRoutesFunction>>;
    /**
     * The path to the browser build, relative to `remix.config.js`. Defaults to
     * "public/build".
     */
    assetsBuildDirectory?: string;
    /**
     * The URL prefix of the browser build with a trailing slash. Defaults to
     * `"/build/"`. This is the path the browser will use to find assets.
     */
    publicPath?: string;
    /**
     * Options for `remix dev`. See https://remix.run/other-api/dev#options-1
     */
    dev?: Dev;
    /**
     * Additional MDX remark / rehype plugins.
     */
    mdx?: RemixMdxConfig | RemixMdxConfigFunction;
    /**
     * Whether to process CSS using PostCSS if a PostCSS config file is present.
     * Defaults to `true`.
     */
    postcss?: boolean;
    /**
     * A server entrypoint, relative to the root directory that becomes your
     * server's main module. If specified, Remix will compile this file along with
     * your application into a single file to be deployed to your server. This
     * file can use either a `.ts` or `.js` file extension.
     */
    server?: string;
    /**
     * The path to the server build file, relative to `remix.config.js`. This file
     * should end in a `.js` extension and should be deployed to your server.
     */
    serverBuildPath?: string;
    /**
     * The order of conditions to use when resolving server dependencies'
     * `exports` field in `package.json`.
     *
     * For more information, see: https://esbuild.github.io/api/#conditions
     */
    serverConditions?: string[];
    /**
     * A list of patterns that determined if a module is transpiled and included
     * in the server bundle. This can be useful when consuming ESM only packages
     * in a CJS build.
     */
    serverDependenciesToBundle?: "all" | Array<string | RegExp>;
    /**
     * The order of main fields to use when resolving server dependencies.
     * Defaults to `["main", "module"]`.
     *
     * For more information, see: https://esbuild.github.io/api/#main-fields
     */
    serverMainFields?: string[];
    /**
     * Whether to minify the server build in production or not.
     * Defaults to `false`.
     */
    serverMinify?: boolean;
    /**
     * The output format of the server build. Defaults to "esm".
     */
    serverModuleFormat?: ServerModuleFormat;
    /**
     * The Node.js polyfills to include in the server build when targeting
     * non-Node.js server platforms.
     */
    serverNodeBuiltinsPolyfill?: NodeBuiltinsPolyfillOptions;
    /**
     * The Node.js polyfills to include in the browser build.
     */
    browserNodeBuiltinsPolyfill?: NodeBuiltinsPolyfillOptions;
    /**
     * The platform the server build is targeting. Defaults to "node".
     */
    serverPlatform?: ServerPlatform;
    /**
     * Enable server-side rendering for your application. Disable to use Remix in
     * "SPA Mode", which will request the `/` path at build-time and save it as
     * an `index.html` file with your assets so your application can be deployed
     * as a SPA without server-rendering. Default's to `true`.
     */
    ssr?: boolean;
    /**
     * Whether to support Tailwind functions and directives in CSS files if
     * `tailwindcss` is installed. Defaults to `true`.
     */
    tailwind?: boolean;
    /**
     * A list of filenames or a glob patterns to match files in the `app/routes`
     * directory that Remix will ignore. Matching files will not be recognized as
     * routes.
     */
    ignoredRouteFiles?: string[];
    /**
     * A function for defining custom directories to watch while running `remix dev`,
     * in addition to `appDirectory`.
     */
    watchPaths?: string | string[] | (() => Promise<string | string[]> | string | string[]);
    /**
     * Enabled future flags
     */
    future?: [keyof FutureConfig] extends [never] ? {
        [key: string]: never;
    } : Partial<FutureConfig>;
}
/**
 * Fully resolved configuration object we use throughout Remix.
 */
export interface RemixConfig {
    /**
     * The absolute path to the root of the Remix project.
     */
    rootDirectory: string;
    /**
     * The absolute path to the application source directory.
     */
    appDirectory: string;
    /**
     * The absolute path to the cache directory.
     */
    cacheDirectory: string;
    /**
     * The path to the entry.client file, relative to `config.appDirectory`.
     */
    entryClientFile: string;
    /**
     * The absolute path to the entry.client file.
     */
    entryClientFilePath: string;
    /**
     * The path to the entry.server file, relative to `config.appDirectory`.
     */
    entryServerFile: string;
    /**
     * The absolute path to the entry.server file.
     */
    entryServerFilePath: string;
    /**
     * An object of all available routes, keyed by route id.
     */
    routes: RouteManifest;
    /**
     * The absolute path to the assets build directory.
     */
    assetsBuildDirectory: string;
    /**
     * the original relative path to the assets build directory
     */
    relativeAssetsBuildDirectory: string;
    /**
     * The URL prefix of the public build with a trailing slash.
     */
    publicPath: string;
    /**
     * Options for `remix dev`. See https://remix.run/other-api/dev#options-1
     */
    dev: Dev;
    /**
     * Additional MDX remark / rehype plugins.
     */
    mdx?: RemixMdxConfig | RemixMdxConfigFunction;
    /**
     * Whether to process CSS using PostCSS if a PostCSS config file is present.
     * Defaults to `true`.
     */
    postcss: boolean;
    /**
     * The path to the server build file. This file should end in a `.js`.
     */
    serverBuildPath: string;
    /**
     * The default entry module for the server build if a {@see AppConfig.server}
     * is not provided.
     */
    serverBuildTargetEntryModule: string;
    /**
     * The order of conditions to use when resolving server dependencies'
     * `exports` field in `package.json`.
     *
     * For more information, see: https://esbuild.github.io/api/#conditions
     */
    serverConditions?: string[];
    /**
     * A list of patterns that determined if a module is transpiled and included
     * in the server bundle. This can be useful when consuming ESM only packages
     * in a CJS build.
     */
    serverDependenciesToBundle: "all" | Array<string | RegExp>;
    /**
     * A server entrypoint relative to the root directory that becomes your
     * server's main module.
     */
    serverEntryPoint?: string;
    /**
     * The order of main fields to use when resolving server dependencies.
     * Defaults to `["main", "module"]`.
     *
     * For more information, see: https://esbuild.github.io/api/#main-fields
     */
    serverMainFields: string[];
    /**
     * Whether to minify the server build in production or not.
     * Defaults to `false`.
     */
    serverMinify: boolean;
    /**
     * The mode to use to run the server.
     */
    serverMode: ServerMode;
    /**
     * The output format of the server build. Defaults to "esm".
     */
    serverModuleFormat: ServerModuleFormat;
    /**
     * The Node.js polyfills to include in the server build when targeting
     * non-Node.js server platforms.
     */
    serverNodeBuiltinsPolyfill?: NodeBuiltinsPolyfillOptions;
    /**
     * The Node.js polyfills to include in the browser build.
     */
    browserNodeBuiltinsPolyfill?: NodeBuiltinsPolyfillOptions;
    /**
     * The platform the server build is targeting. Defaults to "node".
     */
    serverPlatform: ServerPlatform;
    /**
     * Enable SPA Mode.  Default's to `false`.
     *
     * This is the inverse of the user-level `ssr` config and used throughout
     * the codebase to avoid confusion with Vite's `ssr` config
     */
    isSpaMode: boolean;
    /**
     * Whether to support Tailwind functions and directives in CSS files if `tailwindcss` is installed.
     * Defaults to `true`.
     */
    tailwind: boolean;
    /**
     * A list of directories to watch.
     */
    watchPaths: string[];
    /**
     * The path for the tsconfig file, if present on the root directory.
     */
    tsconfigPath: string | undefined;
    future: FutureConfig;
}
/**
 * Returns a fully resolved config object from the remix.config.js in the given
 * root directory.
 */
export declare function readConfig(remixRoot?: string, serverMode?: ServerMode): Promise<RemixConfig>;
export declare function resolveConfig(appConfig: AppConfig, { rootDirectory, serverMode, }: {
    rootDirectory: string;
    serverMode?: ServerMode;
}): Promise<RemixConfig>;
export declare function findConfig(dir: string, basename: string, extensions: string[]): string | undefined;
export {};
