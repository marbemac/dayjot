import type { Server as HTTPServer } from "node:http";
import { type Manifest } from "../manifest";
import type * as HMR from "./hmr";
export declare let serve: (server: HTTPServer) => {
    log: (messageText: string) => void;
    reload: () => void;
    hmr: (assetsManifest: Manifest, updates: HMR.Update[]) => void;
    close: () => void;
};
