import type { HydrationState } from "@remix-run/router";
import type { DataRouteObject } from "react-router-dom";
import type { RouteModule, RouteModules } from "./routeModules";
import type { FutureConfig } from "./entry";
export interface RouteManifest<Route> {
    [routeId: string]: Route;
}
interface Route {
    index?: boolean;
    caseSensitive?: boolean;
    id: string;
    parentId?: string;
    path?: string;
}
export interface EntryRoute extends Route {
    hasAction: boolean;
    hasLoader: boolean;
    hasClientAction: boolean;
    hasClientLoader: boolean;
    hasErrorBoundary: boolean;
    imports?: string[];
    css?: string[];
    module: string;
    parentId?: string;
}
export declare function createServerRoutes(manifest: RouteManifest<EntryRoute>, routeModules: RouteModules, future: FutureConfig, isSpaMode: boolean, parentId?: string, routesByParentId?: Record<string, Omit<EntryRoute, "children">[]>): DataRouteObject[];
export declare function createClientRoutesWithHMRRevalidationOptOut(needsRevalidation: Set<string>, manifest: RouteManifest<EntryRoute>, routeModulesCache: RouteModules, initialState: HydrationState, future: FutureConfig, isSpaMode: boolean): DataRouteObject[];
export declare function createClientRoutes(manifest: RouteManifest<EntryRoute>, routeModulesCache: RouteModules, initialState: HydrationState, future: FutureConfig, isSpaMode: boolean, parentId?: string, routesByParentId?: Record<string, Omit<EntryRoute, "children">[]>, needsRevalidation?: Set<string>): DataRouteObject[];
export declare function shouldHydrateRouteLoader(route: EntryRoute, routeModule: RouteModule, isSpaMode: boolean): boolean;
export {};
