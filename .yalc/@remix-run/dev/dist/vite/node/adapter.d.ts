import type { IncomingMessage, ServerResponse } from "node:http";
import { type ServerBuild } from "@remix-run/node";
export declare let createRequestHandler: (build: ServerBuild, { mode }: {
    mode?: string | undefined;
}) => (req: IncomingMessage, res: ServerResponse) => Promise<void>;
