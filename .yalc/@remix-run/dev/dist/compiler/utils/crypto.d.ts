/// <reference types="node" />
import type { BinaryLike } from "node:crypto";
export declare function getHash(source: BinaryLike): string;
export declare function getFileHash(file: string): Promise<string>;
