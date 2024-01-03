import type * as esbuild from "esbuild";
import type { Context } from "../context";
export declare let write: (ctx: Context, outputFiles: esbuild.OutputFile[]) => Promise<void>;
export declare let isBundle: (ctx: Context, outputFile: esbuild.OutputFile, extension: ".css" | ".css.map") => boolean;
