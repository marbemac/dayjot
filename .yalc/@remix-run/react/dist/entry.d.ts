import type { StaticHandlerContext } from "@remix-run/router";
import type { RouteManifest, EntryRoute } from "./routes";
import type { RouteModules } from "./routeModules";
type SerializedError = {
    message: string;
    stack?: string;
};
export interface RemixContextObject {
    manifest: AssetsManifest;
    routeModules: RouteModules;
    criticalCss?: string;
    serverHandoffString?: string;
    future: FutureConfig;
    isSpaMode: boolean;
    abortDelay?: number;
    serializeError?(error: Error): SerializedError;
}
export interface EntryContext extends RemixContextObject {
    staticHandlerContext: StaticHandlerContext;
}
export interface FutureConfig {
    v3_fetcherPersist: boolean;
    v3_relativeSplatPath: boolean;
}
export interface AssetsManifest {
    entry: {
        imports: string[];
        module: string;
    };
    routes: RouteManifest<EntryRoute>;
    url: string;
    version: string;
    hmr?: {
        timestamp?: number;
        runtime: string;
    };
}
export {};
