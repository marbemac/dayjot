import type * as esbuild from "esbuild";
import type { RemixConfig } from "../../../config";
import type { Context } from "../../context";
export declare let hmrPlugin: ({ config }: Context) => esbuild.Plugin;
export declare function applyHMR(sourceCode: string, args: esbuild.OnLoadArgs, remixConfig: RemixConfig, sourcemap: boolean, lastModified?: number): Promise<string>;
