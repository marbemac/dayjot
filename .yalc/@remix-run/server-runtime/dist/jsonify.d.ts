export type Jsonify<T> = IsAny<T> extends true ? any : T extends {
    toJSON(): infer U;
} ? (U extends JsonValue ? U : unknown) : T extends JsonPrimitive ? T : T extends String ? string : T extends Number ? number : T extends Boolean ? boolean : T extends Promise<unknown> ? EmptyObject : T extends Map<unknown, unknown> ? EmptyObject : T extends Set<unknown> ? EmptyObject : T extends TypedArray ? Record<string, number> : T extends NotJson ? never : T extends [] ? [] : T extends readonly [infer F, ...infer R] ? [NeverToNull<Jsonify<F>>, ...Jsonify<R>] : T extends readonly unknown[] ? Array<NeverToNull<Jsonify<T[number]>>> : T extends Record<keyof unknown, unknown> ? JsonifyObject<T> : unknown extends T ? unknown : never;
type ValueIsNotJson<T> = T extends NotJson ? true : false;
type IsNotJson<T> = {
    [K in keyof T]-?: ValueIsNotJson<T[K]>;
};
type JsonifyValues<T> = {
    [K in keyof T]: Jsonify<T[K]>;
};
type JsonifyObject<T extends Record<keyof unknown, unknown>> = {
    [K in keyof T as unknown extends T[K] ? never : IsNotJson<T>[K] extends false ? K : never]: JsonifyValues<T>[K];
} & {
    [K in keyof T as unknown extends T[K] ? K : IsNotJson<T>[K] extends false ? never : IsNotJson<T>[K] extends true ? never : K]?: JsonifyValues<T>[K];
};
type JsonPrimitive = string | number | boolean | null;
type JsonArray = JsonValue[] | readonly JsonValue[];
type JsonObject = {
    [K in string]: JsonValue;
} & {
    [K in string]?: JsonValue;
};
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type NotJson = undefined | symbol | AnyFunction;
type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array;
type AnyFunction = (...args: any[]) => unknown;
type NeverToNull<T> = [T] extends [never] ? null : T;
declare const emptyObjectSymbol: unique symbol;
export type EmptyObject = {
    [emptyObjectSymbol]?: never;
};
type IsAny<T> = 0 extends 1 & T ? true : false;
export {};
