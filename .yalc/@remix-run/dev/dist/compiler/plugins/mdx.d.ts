import type * as esbuild from "esbuild";
import type { Context } from "../context";
export declare function mdxPlugin({ config }: Pick<Context, "config">): esbuild.Plugin;
export declare function processMDX(mdx: typeof import("@mdx-js/mdx"), remarkFrontmatter: typeof import("remark-frontmatter")["default"], config: Pick<Context, "config">["config"], argsPath: string, absolutePath: string): Promise<{
    errors: esbuild.PartialMessage[] | undefined;
    warnings: esbuild.PartialMessage[] | undefined;
    contents: string;
    resolveDir: string;
    loader: esbuild.Loader;
} | {
    errors: {
        text: any;
    }[];
    warnings?: undefined;
    contents?: undefined;
    resolveDir?: undefined;
    loader?: undefined;
}>;
