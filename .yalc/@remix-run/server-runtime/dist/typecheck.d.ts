export declare function expectType<T>(_expression: T): void;
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
export type Expect<T extends true> = T;
export type MutualExtends<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false;
