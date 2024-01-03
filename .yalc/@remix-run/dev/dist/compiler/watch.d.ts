import type { RemixConfig } from "../config";
import type { Context } from "./context";
import type { Manifest } from "../manifest";
export type WatchOptions = {
    reloadConfig?(root: string): Promise<RemixConfig>;
    onBuildStart?(ctx: Context): void;
    onBuildManifest?(manifest: Manifest): void;
    onBuildFinish?(ctx: Context, durationMs: number, ok: boolean): void;
    onFileCreated?(file: string): void;
    onFileChanged?(file: string): void;
    onFileDeleted?(file: string): void;
};
export declare function watch(ctx: Context, { reloadConfig, onBuildStart, onBuildManifest, onBuildFinish, onFileCreated, onFileChanged, onFileDeleted, }?: WatchOptions): Promise<() => Promise<void>>;
