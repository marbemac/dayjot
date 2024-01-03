import { type HydrationState, type Router } from "@remix-run/router";
import type { ReactElement } from "react";
import type { EntryContext, FutureConfig } from "./entry";
import type { RouteModules } from "./routeModules";
declare global {
    var __remixContext: {
        url: string;
        state: HydrationState;
        criticalCss?: string;
        future: FutureConfig;
        isSpaMode: boolean;
        a?: number;
        dev?: {
            port?: number;
            hmrRuntime?: string;
        };
    };
    var __remixRouter: Router;
    var __remixRouteModules: RouteModules;
    var __remixManifest: EntryContext["manifest"];
    var __remixRevalidation: number | undefined;
    var __remixClearCriticalCss: () => void;
    var $RefreshRuntime$: {
        performReactRefresh: () => void;
    };
}
export interface RemixBrowserProps {
}
declare global {
    interface ImportMeta {
        hot: any;
    }
}
/**
 * The entry point for a Remix app when it is rendered in the browser (in
 * `app/entry.client.js`). This component is used by React to hydrate the HTML
 * that was received from the server.
 */
export declare function RemixBrowser(_props: RemixBrowserProps): ReactElement;
