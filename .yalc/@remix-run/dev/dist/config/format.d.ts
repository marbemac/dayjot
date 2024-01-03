import type { RouteManifest } from "./routes";
export declare enum RoutesFormat {
    json = "json",
    jsx = "jsx"
}
export declare function isRoutesFormat(format: any): format is RoutesFormat;
export declare function formatRoutes(routeManifest: RouteManifest, format: RoutesFormat): string;
export declare function formatRoutesAsJson(routeManifest: RouteManifest): string;
export declare function formatRoutesAsJsx(routeManifest: RouteManifest): string;
