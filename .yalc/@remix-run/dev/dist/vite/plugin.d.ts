import type * as Vite from "vite";
import { type AppConfig as RemixUserConfig, type RemixConfig as ResolvedRemixConfig } from "../config";
declare const supportedRemixConfigKeys: readonly ["appDirectory", "assetsBuildDirectory", "future", "ignoredRouteFiles", "publicPath", "routes", "serverBuildPath", "serverModuleFormat", "ssr"];
type SupportedRemixConfigKey = typeof supportedRemixConfigKeys[number];
type SupportedRemixConfig = Pick<RemixUserConfig, SupportedRemixConfigKey>;
type RemixConfigJsdocOverrides = {
    /**
     * The path to the browser build, relative to the project root. Defaults to
     * `"build/client"`.
     */
    assetsBuildDirectory?: SupportedRemixConfig["assetsBuildDirectory"];
    /**
     * The URL prefix of the browser build with a trailing slash. Defaults to
     * `"/"`. This is the path the browser will use to find assets.
     */
    publicPath?: SupportedRemixConfig["publicPath"];
    /**
     * The path to the server build file, relative to the project. This file
     * should end in a `.js` extension and should be deployed to your server.
     * Defaults to `"build/server/index.js"`.
     */
    serverBuildPath?: SupportedRemixConfig["serverBuildPath"];
};
export type RemixVitePluginOptions = RemixConfigJsdocOverrides & Omit<SupportedRemixConfig, keyof RemixConfigJsdocOverrides>;
export type ResolvedRemixVitePluginConfig = Pick<ResolvedRemixConfig, "appDirectory" | "rootDirectory" | "assetsBuildDirectory" | "entryClientFilePath" | "entryServerFilePath" | "future" | "publicPath" | "relativeAssetsBuildDirectory" | "routes" | "serverBuildPath" | "serverModuleFormat" | "isSpaMode">;
export type RemixVitePlugin = (options?: RemixVitePluginOptions) => Vite.Plugin[];
export declare const remixVitePlugin: RemixVitePlugin;
export {};
