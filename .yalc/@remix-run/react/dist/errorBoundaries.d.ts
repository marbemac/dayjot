import * as React from "react";
import type { Location } from "@remix-run/router";
type RemixErrorBoundaryProps = React.PropsWithChildren<{
    location: Location;
    error?: Error;
}>;
type RemixErrorBoundaryState = {
    error: null | Error;
    location: Location;
};
export declare class RemixErrorBoundary extends React.Component<RemixErrorBoundaryProps, RemixErrorBoundaryState> {
    constructor(props: RemixErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): {
        error: Error;
    };
    static getDerivedStateFromProps(props: RemixErrorBoundaryProps, state: RemixErrorBoundaryState): {
        error: Error | null;
        location: Location<any>;
    };
    render(): string | number | boolean | Iterable<React.ReactNode> | React.JSX.Element | null | undefined;
}
/**
 * When app's don't provide a root level ErrorBoundary, we default to this.
 */
export declare function RemixRootDefaultErrorBoundary({ error }: {
    error: unknown;
}): React.JSX.Element;
export {};
