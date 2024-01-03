import type { ServerBuild } from "./build";
export declare function broadcastDevReady(build: ServerBuild, origin?: string): Promise<void>;
export declare function logDevReady(build: ServerBuild): void;
type DevServerHooks = {
    getCriticalCss?: (build: ServerBuild, pathname: string) => Promise<string | undefined>;
    processRequestError?: (error: unknown) => void;
};
export declare function setDevServerHooks(devServerHooks: DevServerHooks): void;
export declare function getDevServerHooks(): DevServerHooks | undefined;
export {};
