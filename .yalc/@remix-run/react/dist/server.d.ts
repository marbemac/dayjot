import type { ReactElement } from "react";
import type { EntryContext } from "./entry";
export interface RemixServerProps {
    context: EntryContext;
    url: string | URL;
    abortDelay?: number;
}
/**
 * The entry point for a Remix app when it is rendered on the server (in
 * `app/entry.server.js`). This component is used to generate the HTML in the
 * response from the server.
 */
export declare function RemixServer({ context, url, abortDelay, }: RemixServerProps): ReactElement;
