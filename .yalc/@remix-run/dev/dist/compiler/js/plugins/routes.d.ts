import type esbuild from "esbuild";
import type { Context } from "../../context";
/**
 * This plugin loads route modules for the browser build, using module shims
 * that re-export only the route module exports that are safe for the browser.
 */
export declare function browserRouteModulesPlugin({ config, fileWatchCache }: Context, suffixMatcher: RegExp): esbuild.Plugin;
