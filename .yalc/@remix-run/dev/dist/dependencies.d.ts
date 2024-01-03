import type { RemixConfig } from "./config";
type PackageDependencies = {
    [packageName: string]: string;
};
export declare function getAppDependencies(config: RemixConfig, includeDev?: boolean): PackageDependencies;
export declare function getDependenciesToBundle(...pkg: string[]): string[];
export {};
