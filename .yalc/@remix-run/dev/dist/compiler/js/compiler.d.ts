import * as esbuild from "esbuild";
import { type Manifest } from "../../manifest";
import type { LazyValue } from "../lazyValue";
import type { Context } from "../context";
type Compiler = {
    compile: () => Promise<{
        metafile: esbuild.Metafile;
        outputFiles: esbuild.OutputFile[];
        hmr?: Manifest["hmr"];
    }>;
    cancel: () => Promise<void>;
    dispose: () => Promise<void>;
};
export declare const create: (ctx: Context, refs: {
    lazyCssBundleHref: LazyValue<string | undefined>;
}) => Promise<Compiler>;
export {};
