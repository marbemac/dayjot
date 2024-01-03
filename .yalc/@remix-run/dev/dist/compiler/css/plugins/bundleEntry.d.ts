import type { Plugin } from "esbuild";
import type { Context } from "../../context";
export declare const cssBundleEntryModuleId = "__remix_cssBundleEntryModule__";
/**
 * Creates a virtual module that imports all browser build entry points so that
 * all reachable CSS can be included in a single file at the end of the build.
 */
export declare function cssBundleEntryModulePlugin({ config }: Context): Plugin;
