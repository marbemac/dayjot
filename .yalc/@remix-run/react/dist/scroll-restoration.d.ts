import * as React from "react";
import type { ScrollRestorationProps as ScrollRestorationPropsRR } from "react-router-dom";
import type { ScriptProps } from "./components";
/**
 * This component will emulate the browser's scroll restoration on location
 * changes.
 *
 * @see https://remix.run/components/scroll-restoration
 */
export declare function ScrollRestoration({ getKey, ...props }: ScriptProps & {
    getKey?: ScrollRestorationPropsRR["getKey"];
}): React.JSX.Element;
