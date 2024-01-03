import * as esbuild from "esbuild";
import { type Manifest } from "../../manifest";
import type * as Channel from "../../channel";
import type { Context } from "../context";
import type { LazyValue } from "../lazyValue";
type Compiler = {
    compile: () => Promise<esbuild.OutputFile[]>;
    cancel: () => Promise<void>;
    dispose: () => Promise<void>;
};
export declare const create: (ctx: Context, refs: {
    manifestChannel: Channel.Type<Manifest>;
    lazyCssBundleHref: LazyValue<string | undefined>;
}) => Promise<Compiler>;
export {};
