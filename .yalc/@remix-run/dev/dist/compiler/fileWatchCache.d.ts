type CacheValue<T> = {
    cacheValue: T;
} & ({
    fileDependencies?: Set<string>;
    globDependencies: Set<string>;
} | {
    fileDependencies: Set<string>;
    globDependencies?: Set<string>;
});
export interface FileWatchCache {
    get(key: string): Promise<CacheValue<unknown>> | undefined;
    set<T>(key: string, promise: Promise<CacheValue<T>>): Promise<CacheValue<T>>;
    /**
     * #description Get a cache value, or lazily set the value if it doesn't exist
     * and then return the new cache value. This lets you interact with the cache
     * in a single expression.
     */
    getOrSet<T>(key: string, lazySetter: () => Promise<CacheValue<T>>): Promise<CacheValue<T>>;
    invalidateFile(path: string): void;
}
export declare function createFileWatchCache(): FileWatchCache;
export {};
