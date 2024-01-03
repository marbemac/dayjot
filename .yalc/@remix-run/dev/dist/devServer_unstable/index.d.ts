import { type RemixConfig } from "../config";
export declare let serve: (initialConfig: RemixConfig, options: {
    command?: string;
    manual: boolean;
    port: number;
    tlsKey?: string;
    tlsCert?: string;
    REMIX_DEV_ORIGIN: URL;
}) => Promise<() => Promise<void>>;
