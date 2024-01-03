import type { Plugin } from "esbuild";
import type * as Channel from "../../../channel";
import { type Manifest } from "../../../manifest";
/**
 * Creates a virtual module called `@remix-run/dev/assets-manifest` that exports
 * the assets manifest. This is used in the server entry module to access the
 * assets manifest in the server build.
 */
export declare function serverAssetsManifestPlugin(refs: {
    manifestChannel: Channel.Type<Manifest>;
}): Plugin;
