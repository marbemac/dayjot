import type * as esbuild from "esbuild";
import type { RemixConfig } from "../config";
import { type Manifest } from "../manifest";
import { type FileWatchCache } from "./fileWatchCache";
export declare function create({ config, metafile, hmr, fileWatchCache, }: {
    config: RemixConfig;
    metafile: esbuild.Metafile;
    hmr?: Manifest["hmr"];
    fileWatchCache: FileWatchCache;
}): Promise<Manifest>;
export declare const write: (config: RemixConfig, assetsManifest: Manifest) => Promise<void>;
