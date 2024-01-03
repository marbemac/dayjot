import type { AppLoadContext } from "./data";
import type { ServerBuild } from "./build";
export type RequestHandler = (request: Request, loadContext?: AppLoadContext) => Promise<Response>;
export type CreateRequestHandlerFunction = (build: ServerBuild | (() => Promise<ServerBuild>), mode?: string) => RequestHandler;
export declare const createRequestHandler: CreateRequestHandlerFunction;
