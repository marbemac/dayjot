import type { Plugin } from "esbuild";
import type { Context } from "../context";
export declare function isCssSideEffectImportPath(path: string): boolean;
type Loader = "js" | "jsx" | "ts" | "tsx";
/**
 * This plugin detects side-effect imports of CSS files and adds a suffix
 * to the import path, e.g. `import "./styles.css"` is transformed to
 * `import "./styles.css?__remix_sideEffect__"`). This allows them to be
 * differentiated from non-side-effect imports so that they can be added
 * to the CSS bundle. This is primarily designed to support packages that
 * import plain CSS files directly within JS files.
 */
export declare const cssSideEffectImportsPlugin: (ctx: Context, { hmr }?: {
    hmr?: boolean | undefined;
}) => Plugin;
export declare function addSuffixToCssSideEffectImports(loader: Loader, code: string): string;
export {};
