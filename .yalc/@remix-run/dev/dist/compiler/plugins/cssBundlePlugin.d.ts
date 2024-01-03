import type { Plugin } from "esbuild";
import type { LazyValue } from "../lazyValue";
/**
 * This plugin lazily requests the CSS bundle href and then injects it into the
 * JS for `@remix-run/css-bundle`. This ensures we only run the CSS bundle build
 * if necessary and that changes to the CSS bundle result in an HMR update.
 */
export declare function cssBundlePlugin(refs: {
    lazyCssBundleHref: LazyValue<string | undefined>;
}): Plugin;
