import type { Context } from "./context";
import type { Manifest } from "../manifest";
type Compiler = {
    compile: (options?: {
        onManifest?: (manifest: Manifest) => void;
    }) => Promise<Manifest>;
    cancel: () => Promise<void>;
    dispose: () => Promise<void>;
};
export declare let create: (ctx: Context) => Promise<Compiler>;
export {};
