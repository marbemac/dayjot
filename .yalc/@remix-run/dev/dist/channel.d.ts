import type { Result } from "./result";
export type Type<V, E = unknown> = {
    ok: (value: V) => void;
    err: (reason?: any) => void;
    result: Promise<Result<V, E>>;
};
export declare const create: <V, E = unknown>() => Type<V, E>;
