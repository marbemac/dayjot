import type * as Vite from "vite";
export interface ViteDevOptions {
    clearScreen?: boolean;
    config?: string;
    cors?: boolean;
    force?: boolean;
    host?: boolean | string;
    logLevel?: Vite.LogLevel;
    mode?: string;
    open?: boolean | string;
    port?: number;
    strictPort?: boolean;
}
export declare function dev(root: string, { clearScreen, config: configFile, cors, force, host, logLevel, mode, open, port, strictPort, }: ViteDevOptions): Promise<void>;
