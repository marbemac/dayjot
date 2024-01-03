import type { Formatter } from "picocolors/types";
type FormatArgs = {
    label: string;
    color: Formatter;
};
export declare let format: ({ label, color }: FormatArgs) => (message: string, details?: string[]) => string;
export {};
