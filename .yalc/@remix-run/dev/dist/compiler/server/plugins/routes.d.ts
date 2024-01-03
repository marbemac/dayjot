import type esbuild from "esbuild";
import type { Context } from "../../context";
/**
 * This plugin loads route modules for the server build and prevents errors
 * while adding new files in development mode.
 */
export declare function serverRouteModulesPlugin({ config }: Context): esbuild.Plugin;
