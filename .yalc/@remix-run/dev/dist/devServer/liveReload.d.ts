import type { RemixConfig } from "../config";
export declare function liveReload(config: RemixConfig, options: {
    port: number;
    mode: string;
}): Promise<() => Promise<void>>;
