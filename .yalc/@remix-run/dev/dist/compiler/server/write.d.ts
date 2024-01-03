import type * as esbuild from "esbuild";
import type { RemixConfig } from "../../config";
export declare function write(config: RemixConfig, outputFiles: esbuild.OutputFile[]): Promise<void>;
