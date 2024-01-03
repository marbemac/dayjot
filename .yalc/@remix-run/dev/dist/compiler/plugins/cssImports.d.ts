import esbuild from "esbuild";
import type { Context } from "../context";
/**
 * This plugin loads css files with the "css" loader (bundles and moves assets to assets directory)
 * and exports the url of the css file as its default export.
 */
export declare function cssFilePlugin(ctx: Context): esbuild.Plugin;
