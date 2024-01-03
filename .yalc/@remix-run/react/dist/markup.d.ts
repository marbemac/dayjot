export declare function escapeHtml(html: string): string;
export interface SafeHtml {
    __html: string;
}
export declare function createHtml(html: string): SafeHtml;
