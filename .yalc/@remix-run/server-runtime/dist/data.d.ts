import type { ActionFunction, ActionFunctionArgs, LoaderFunction, LoaderFunctionArgs } from "./routeModules";
/**
 * An object of unknown type for route loaders and actions provided by the
 * server's `getLoadContext()` function.  This is defined as an empty interface
 * specifically so apps can leverage declaration merging to augment this type
 * globally: https://www.typescriptlang.org/docs/handbook/declaration-merging.html
 */
export interface AppLoadContext {
    [key: string]: unknown;
}
/**
 * Data for a route that was returned from a `loader()`.
 */
export type AppData = unknown;
export declare function callRouteActionRR({ loadContext, action, params, request, routeId, }: {
    request: Request;
    action: ActionFunction;
    params: ActionFunctionArgs["params"];
    loadContext: AppLoadContext;
    routeId: string;
}): Promise<Response>;
export declare function callRouteLoaderRR({ loadContext, loader, params, request, routeId, }: {
    request: Request;
    loader: LoaderFunction;
    params: LoaderFunctionArgs["params"];
    loadContext: AppLoadContext;
    routeId: string;
}): Promise<import("@remix-run/router").UNSAFE_DeferredData | Response>;
