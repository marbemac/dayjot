import type { Plugin } from "esbuild";
import type { Context } from "../../context";
/**
 * Creates a virtual module called `@remix-run/dev/server-build` that exports the
 * compiled server build for consumption in remix request handlers. This allows
 * for you to consume the build in a custom server entry that is also fed through
 * the compiler.
 */
export declare function serverEntryModulePlugin({ config, options }: Context): Plugin;
