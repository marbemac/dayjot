import type * as Vite from "vite";
export interface ViteBuildOptions {
    assetsInlineLimit?: number;
    clearScreen?: boolean;
    config?: string;
    emptyOutDir?: boolean;
    force?: boolean;
    logLevel?: Vite.LogLevel;
    minify?: Vite.BuildOptions["minify"];
    mode?: string;
}
export declare function build(root: string, { assetsInlineLimit, clearScreen, config: configFile, emptyOutDir, force, logLevel, minify, mode, }: ViteBuildOptions): Promise<void>;
