import type { Plugin } from "esbuild";
import type { Context } from "../context";
export declare function vanillaExtractPlugin({ config, options }: Context, { outputCss }: {
    outputCss: boolean;
}): Plugin;
