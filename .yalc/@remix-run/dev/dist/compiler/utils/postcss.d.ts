import path from "node:path";
import type { AcceptedPlugin, Message, Processor } from "postcss";
import type { RemixConfig } from "../../config";
import type { Options } from "../options";
import type { FileWatchCache } from "../fileWatchCache";
interface PostcssContext {
    vanillaExtract: boolean;
}
export declare function loadPostcssPlugins({ config, postcssContext, }: {
    config: RemixConfig;
    postcssContext?: PostcssContext;
}): Promise<Array<AcceptedPlugin>>;
export declare function getPostcssProcessor({ config, postcssContext, }: {
    config: RemixConfig;
    postcssContext?: PostcssContext;
}): Promise<Processor | null>;
export declare function populateDependenciesFromMessages({ messages, fileDependencies, globDependencies, }: {
    messages: Array<Message>;
    fileDependencies: Set<string>;
    globDependencies: Set<string>;
}): void;
export declare function getCachedPostcssProcessor({ config, options, fileWatchCache, }: {
    config: RemixConfig;
    options: Options;
    fileWatchCache: FileWatchCache;
}): Promise<((args: {
    path: string;
}) => Promise<string>) | null>;
export {};
