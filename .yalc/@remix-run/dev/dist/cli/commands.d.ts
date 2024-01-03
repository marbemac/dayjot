import type { RemixConfig } from "../config";
import type { ViteDevOptions } from "../vite/dev";
import type { ViteBuildOptions } from "../vite/build";
type InitFlags = {
    deleteScript?: boolean;
};
export declare function init(projectDir: string, { deleteScript }?: InitFlags): Promise<void>;
/**
 * Keep the function around in v2 so that users with `remix setup` in a script
 * or postinstall hook can still run a build, but inform them that it's no
 * longer necessary, and we can remove it in v3.
 * @deprecated
 */
export declare function setup(): void;
export declare function routes(remixRoot?: string, formatArg?: string): Promise<void>;
export declare function build(remixRoot: string, mode?: string, sourcemap?: boolean): Promise<void>;
export declare function viteBuild(root: string, options?: ViteBuildOptions): Promise<void>;
export declare function watch(remixRootOrConfig: string | RemixConfig, mode?: string): Promise<void>;
export declare function dev(remixRoot: string, flags?: {
    command?: string;
    manual?: boolean;
    port?: number;
    tlsKey?: string;
    tlsCert?: string;
}): Promise<void>;
export declare function viteDev(root: string, options?: ViteDevOptions): Promise<void>;
export declare function generateEntry(entry: string, remixRoot: string, useTypeScript?: boolean): Promise<void>;
export {};
