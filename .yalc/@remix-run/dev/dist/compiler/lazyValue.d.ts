export type LazyValue<T> = {
    get: () => Promise<T>;
    cancel: () => void;
};
export declare const createLazyValue: <T>(args: {
    get: () => Promise<T>;
    onCancel?: ((args: {
        resolve: (value: T) => void;
        reject: (err?: any) => void;
    }) => void) | undefined;
}) => LazyValue<T>;
