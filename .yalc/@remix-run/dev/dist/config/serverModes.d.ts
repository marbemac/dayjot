/**
 * The mode to use when running the server.
 */
export declare enum ServerMode {
    Development = "development",
    Production = "production",
    Test = "test"
}
export declare function isValidServerMode(mode: string): mode is ServerMode;
