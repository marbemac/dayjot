import * as esbuild from "esbuild";
import type { Context } from "../context";
export declare let create: (ctx: Context) => Promise<{
    compile: () => Promise<{
        bundleOutputFile: esbuild.OutputFile | undefined;
        outputFiles: esbuild.OutputFile[];
    }>;
    cancel: () => Promise<void>;
    dispose: () => Promise<void>;
}>;
