type Ok<V> = {
    ok: true;
    value: V;
};
type Err<E = unknown> = {
    ok: false;
    error: E;
};
export type Result<V, E = unknown> = Ok<V> | Err<E>;
export declare let ok: <V>(value: V) => Ok<V>;
export declare let err: <E = unknown>(error: E) => Err<E>;
export {};
