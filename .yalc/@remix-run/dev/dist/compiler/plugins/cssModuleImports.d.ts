import type { Plugin } from "esbuild";
import type { Context } from "../context";
export declare const cssModulesPlugin: ({ config, options, fileWatchCache }: Context, { outputCss }: {
    outputCss: boolean;
}) => Plugin;
