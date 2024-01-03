import type { StaticHandlerContext } from "@remix-run/router";
import type { SerializedError } from "./errors";
import type { RouteManifest, ServerRouteManifest, EntryRoute } from "./routes";
import type { RouteModules, EntryRouteModule } from "./routeModules";
export interface EntryContext {
    manifest: AssetsManifest;
    routeModules: RouteModules<EntryRouteModule>;
    criticalCss?: string;
    serverHandoffString?: string;
    staticHandlerContext: StaticHandlerContext;
    future: FutureConfig;
    isSpaMode: boolean;
    serializeError(error: Error): SerializedError;
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
    hmrRuntime?: string;
}
export declare function createEntryRouteModules(manifest: ServerRouteManifest): RouteModules<EntryRouteModule>;
