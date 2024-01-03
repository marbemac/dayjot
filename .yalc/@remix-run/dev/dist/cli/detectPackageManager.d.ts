type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
/**
 * Determine which package manager the user prefers.
 *
 * npm, pnpm and Yarn set the user agent environment variable
 * that can be used to determine which package manager ran
 * the command.
 */
export declare const detectPackageManager: () => PackageManager | undefined;
export {};
