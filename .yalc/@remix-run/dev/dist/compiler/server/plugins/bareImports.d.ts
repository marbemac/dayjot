import type { Plugin } from "esbuild";
import type { Context } from "../../context";
/**
 * A plugin responsible for resolving bare module ids based on server target.
 * This includes externalizing for node based platforms, and bundling for single file
 * environments such as cloudflare.
 */
export declare function serverBareModulesPlugin(ctx: Context): Plugin;
