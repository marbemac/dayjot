import type { RemixConfig } from "../config";
import { type Manifest } from "../manifest";
export type Update = {
    id: string;
    routeId: string;
    url: string;
    revalidate: boolean;
    reason: string;
};
export declare let updates: (config: RemixConfig, manifest: Manifest, prevManifest: Manifest, hdr: Record<string, string>, prevHdr?: Record<string, string>) => Update[];
