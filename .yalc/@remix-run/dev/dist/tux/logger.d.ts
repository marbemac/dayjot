type Log = (message: string, options?: {
    details?: string[];
    key?: string;
}) => void;
export type Logger = {
    debug: Log;
    info: Log;
    warn: Log;
    error: Log;
};
export declare let logger: Logger;
export {};
