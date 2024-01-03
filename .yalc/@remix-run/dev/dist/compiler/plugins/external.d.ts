import type { Plugin } from "esbuild";
export declare const externalPlugin: (filter: RegExp, options?: {
    sideEffects?: boolean;
}) => Plugin;
