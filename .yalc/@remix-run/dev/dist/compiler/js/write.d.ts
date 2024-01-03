import type { OutputFile } from "esbuild";
import type { RemixConfig } from "../../config";
export declare function write(config: RemixConfig, outputFiles: OutputFile[]): Promise<void>;
