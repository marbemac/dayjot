import { UNSAFE_DeferredData as DeferredData } from "@remix-run/router";
/**
 * Data for a route that was returned from a `loader()`.
 */
export type AppData = unknown;
export declare function isCatchResponse(response: Response): boolean;
export declare function isErrorResponse(response: any): response is Response;
export declare function isNetworkErrorResponse(response: any): response is Response;
export declare function isRedirectResponse(response: Response): boolean;
export declare function isDeferredResponse(response: Response): boolean;
export declare function isResponse(value: any): value is Response;
export declare function isDeferredData(value: any): value is DeferredData;
export declare function fetchData(request: Request, routeId: string, retry?: number): Promise<Response | Error>;
export declare function parseDeferredReadableStream(stream: ReadableStream<Uint8Array>): Promise<DeferredData>;
