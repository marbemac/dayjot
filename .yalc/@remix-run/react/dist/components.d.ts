import * as React from "react";
import type { UIMatch as UIMatchRR } from "@remix-run/router";
import type { FetcherWithComponents, LinkProps, NavLinkProps } from "react-router-dom";
import { useFetcher as useFetcherRR } from "react-router-dom";
import type { SerializeFrom } from "@remix-run/server-runtime";
import type { AppData } from "./data";
import type { RemixContextObject } from "./entry";
import type { PrefetchPageDescriptor } from "./links";
import type { RouteHandle } from "./routeModules";
export declare const RemixContext: React.Context<RemixContextObject | undefined>;
/**
 * Defines the prefetching behavior of the link:
 *
 * - "none": Never fetched
 * - "intent": Fetched when the user focuses or hovers the link
 * - "render": Fetched when the link is rendered
 * - "viewport": Fetched when the link is in the viewport
 */
type PrefetchBehavior = "intent" | "render" | "none" | "viewport";
export interface RemixLinkProps extends LinkProps {
    prefetch?: PrefetchBehavior;
}
export interface RemixNavLinkProps extends NavLinkProps {
    prefetch?: PrefetchBehavior;
}
/**
 * A special kind of `<Link>` that knows whether it is "active".
 *
 * @see https://remix.run/components/nav-link
 */
declare let NavLink: React.ForwardRefExoticComponent<RemixNavLinkProps & React.RefAttributes<HTMLAnchorElement>>;
export { NavLink };
/**
 * This component renders an anchor tag and is the primary way the user will
 * navigate around your website.
 *
 * @see https://remix.run/components/link
 */
declare let Link: React.ForwardRefExoticComponent<RemixLinkProps & React.RefAttributes<HTMLAnchorElement>>;
export { Link };
export declare function composeEventHandlers<EventType extends React.SyntheticEvent | Event>(theirHandler: ((event: EventType) => any) | undefined, ourHandler: (event: EventType) => any): (event: EventType) => any;
/**
 * Renders the `<link>` tags for the current routes.
 *
 * @see https://remix.run/components/links
 */
export declare function Links(): React.JSX.Element;
/**
 * This component renders all the `<link rel="prefetch">` and
 * `<link rel="modulepreload"/>` tags for all the assets (data, modules, css) of
 * a given page.
 *
 * @param props
 * @param props.page
 * @see https://remix.run/components/prefetch-page-links
 */
export declare function PrefetchPageLinks({ page, ...dataLinkProps }: PrefetchPageDescriptor): React.JSX.Element | null;
/**
 * Renders HTML tags related to metadata for the current route.
 *
 * @see https://remix.run/components/meta
 */
export declare function Meta(): React.JSX.Element;
export interface AwaitProps<Resolve> {
    children: React.ReactNode | ((value: Awaited<Resolve>) => React.ReactNode);
    errorElement?: React.ReactNode;
    resolve: Resolve;
}
export declare function Await<Resolve>(props: AwaitProps<Resolve>): React.JSX.Element;
export type ScriptProps = Omit<React.HTMLProps<HTMLScriptElement>, "children" | "async" | "defer" | "src" | "type" | "noModule" | "dangerouslySetInnerHTML" | "suppressHydrationWarning">;
/**
 * Renders the `<script>` tags needed for the initial render. Bundles for
 * additional routes are loaded later as needed.
 *
 * @param props Additional properties to add to each script tag that is rendered.
 * In addition to scripts, \<link rel="modulepreload"> tags receive the crossOrigin
 * property if provided.
 *
 * @see https://remix.run/components/scripts
 */
export declare function Scripts(props: ScriptProps): React.JSX.Element | null;
export type UIMatch<D = AppData, H = RouteHandle> = UIMatchRR<SerializeFrom<D>, H>;
/**
 * Returns the active route matches, useful for accessing loaderData for
 * parent/child routes or the route "handle" property
 *
 * @see https://remix.run/hooks/use-matches
 */
export declare function useMatches(): UIMatch[];
/**
 * Returns the JSON parsed data from the current route's `loader`.
 *
 * @see https://remix.run/hooks/use-loader-data
 */
export declare function useLoaderData<T = AppData>(): SerializeFrom<T>;
/**
 * Returns the loaderData for the given routeId.
 *
 * @see https://remix.run/hooks/use-route-loader-data
 */
export declare function useRouteLoaderData<T = AppData>(routeId: string): SerializeFrom<T> | undefined;
/**
 * Returns the JSON parsed data from the current route's `action`.
 *
 * @see https://remix.run/hooks/use-action-data
 */
export declare function useActionData<T = AppData>(): SerializeFrom<T> | undefined;
/**
 * Interacts with route loaders and actions without causing a navigation. Great
 * for any interaction that stays on the same page.
 *
 * @see https://remix.run/hooks/use-fetcher
 */
export declare function useFetcher<TData = AppData>(opts?: Parameters<typeof useFetcherRR>[0]): FetcherWithComponents<SerializeFrom<TData>>;
/**
 * This component connects your app to the Remix asset server and
 * automatically reloads the page when files change in development.
 * In production, it renders null, so you can safely render it always in your root route.
 *
 * @see https://remix.run/docs/components/live-reload
 */
export declare const LiveReload: (() => null) | (({ origin, port, timeoutMs, nonce, }: {
    origin?: string | undefined;
    port?: number | undefined;
    timeoutMs?: number | undefined;
    nonce?: string | undefined;
}) => React.JSX.Element);
