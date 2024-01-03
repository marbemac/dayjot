import type esbuild from "esbuild";
import type { Context } from "../context";
/**
 * This plugin substitutes an empty module for any modules in the `app`
 * directory that match the given `filter`.
 */
export declare function emptyModulesPlugin({ config }: Context, filter: RegExp, { includeNodeModules }?: {
    includeNodeModules?: boolean | undefined;
}): esbuild.Plugin;
