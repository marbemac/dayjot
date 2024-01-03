import type * as esbuild from "esbuild";
export declare const loaders: {
    [ext: string]: esbuild.Loader;
};
export declare function getLoaderForFile(file: string): esbuild.Loader;
