import type { Plugin } from "esbuild";
/**
 * This plugin treats absolute paths in 'url()' css rules as external to prevent
 * breaking changes
 */
export declare const absoluteCssUrlsPlugin: () => Plugin;
