import type { AgnosticDataRouteMatch } from "@remix-run/router";
import type { Location } from "react-router-dom";
import type { AssetsManifest } from "./entry";
import type { RouteModules, RouteModule } from "./routeModules";
import type { EntryRoute } from "./routes";
type Primitive = null | undefined | string | number | boolean | symbol | bigint;
type LiteralUnion<LiteralType, BaseType extends Primitive> = LiteralType | (BaseType & Record<never, never>);
interface HtmlLinkProps {
    /**
     * Address of the hyperlink
     */
    href?: string;
    /**
     * How the element handles crossorigin requests
     */
    crossOrigin?: "anonymous" | "use-credentials";
    /**
     * Relationship between the document containing the hyperlink and the destination resource
     */
    rel: LiteralUnion<"alternate" | "dns-prefetch" | "icon" | "manifest" | "modulepreload" | "next" | "pingback" | "preconnect" | "prefetch" | "preload" | "prerender" | "search" | "stylesheet", string>;
    /**
     * Applicable media: "screen", "print", "(max-width: 764px)"
     */
    media?: string;
    /**
     * Integrity metadata used in Subresource Integrity checks
     */
    integrity?: string;
    /**
     * Language of the linked resource
     */
    hrefLang?: string;
    /**
     * Hint for the type of the referenced resource
     */
    type?: string;
    /**
     * Referrer policy for fetches initiated by the element
     */
    referrerPolicy?: "" | "no-referrer" | "no-referrer-when-downgrade" | "same-origin" | "origin" | "strict-origin" | "origin-when-cross-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
    /**
     * Sizes of the icons (for rel="icon")
     */
    sizes?: string;
    /**
     * Potential destination for a preload request (for rel="preload" and rel="modulepreload")
     */
    as?: LiteralUnion<"audio" | "audioworklet" | "document" | "embed" | "fetch" | "font" | "frame" | "iframe" | "image" | "manifest" | "object" | "paintworklet" | "report" | "script" | "serviceworker" | "sharedworker" | "style" | "track" | "video" | "worker" | "xslt", string>;
    /**
     * Color to use when customizing a site's icon (for rel="mask-icon")
     */
    color?: string;
    /**
     * Whether the link is disabled
     */
    disabled?: boolean;
    /**
     * The title attribute has special semantics on this element: Title of the link; CSS style sheet set name.
     */
    title?: string;
    /**
     * Images to use in different situations, e.g., high-resolution displays,
     * small monitors, etc. (for rel="preload")
     */
    imageSrcSet?: string;
    /**
     * Image sizes for different page layouts (for rel="preload")
     */
    imageSizes?: string;
}
interface HtmlLinkPreloadImage extends HtmlLinkProps {
    /**
     * Relationship between the document containing the hyperlink and the destination resource
     */
    rel: "preload";
    /**
     * Potential destination for a preload request (for rel="preload" and rel="modulepreload")
     */
    as: "image";
    /**
     * Address of the hyperlink
     */
    href?: string;
    /**
     * Images to use in different situations, e.g., high-resolution displays,
     * small monitors, etc. (for rel="preload")
     */
    imageSrcSet: string;
    /**
     * Image sizes for different page layouts (for rel="preload")
     */
    imageSizes?: string;
}
/**
 * Represents a `<link>` element.
 *
 * WHATWG Specification: https://html.spec.whatwg.org/multipage/semantics.html#the-link-element
 */
export type HtmlLinkDescriptor = (HtmlLinkProps & Pick<Required<HtmlLinkProps>, "href">) | (HtmlLinkPreloadImage & Pick<Required<HtmlLinkPreloadImage>, "imageSizes">) | (HtmlLinkPreloadImage & Pick<Required<HtmlLinkPreloadImage>, "href"> & {
    imageSizes?: never;
});
export interface PrefetchPageDescriptor extends Omit<HtmlLinkDescriptor, "href" | "rel" | "type" | "sizes" | "imageSrcSet" | "imageSizes" | "as" | "color" | "title"> {
    /**
     * The absolute path of the page to prefetch.
     */
    page: string;
}
export type LinkDescriptor = HtmlLinkDescriptor | PrefetchPageDescriptor;
/**
 * Gets all the links for a set of matches. The modules are assumed to have been
 * loaded already.
 */
export declare function getKeyedLinksForMatches(matches: AgnosticDataRouteMatch[], routeModules: RouteModules, manifest: AssetsManifest): KeyedLinkDescriptor[];
export declare function prefetchStyleLinks(route: EntryRoute, routeModule: RouteModule): Promise<void>;
export declare function isPageLinkDescriptor(object: any): object is PrefetchPageDescriptor;
export type KeyedHtmlLinkDescriptor = {
    key: string;
    link: HtmlLinkDescriptor;
};
export declare function getKeyedPrefetchLinks(matches: AgnosticDataRouteMatch[], manifest: AssetsManifest, routeModules: RouteModules): Promise<KeyedHtmlLinkDescriptor[]>;
export declare function getNewMatchesForLinks(page: string, nextMatches: AgnosticDataRouteMatch[], currentMatches: AgnosticDataRouteMatch[], manifest: AssetsManifest, location: Location, mode: "data" | "assets"): AgnosticDataRouteMatch[];
export declare function getDataLinkHrefs(page: string, matches: AgnosticDataRouteMatch[], manifest: AssetsManifest): string[];
export declare function getModuleLinkHrefs(matches: AgnosticDataRouteMatch[], manifestPatch: AssetsManifest): string[];
type KeyedLinkDescriptor<Descriptor extends LinkDescriptor = LinkDescriptor> = {
    key: string;
    link: Descriptor;
};
export {};
