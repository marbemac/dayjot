import { Extension } from '@tiptap/core';

import { MarkdownClipboard, type MarkdownClipboardOpts } from './clipboard.ts';
import { createMarkdownParser } from './parser.ts';

export const MARKDOWN_KEY = 'markdown' as const;

export type MarkdownOpts = MarkdownClipboardOpts & {
  //
};

export type MarkdownStorage = {
  parser: ReturnType<typeof createMarkdownParser>;
};

export const Markdown = Extension.create<MarkdownOpts, MarkdownStorage>({
  name: MARKDOWN_KEY,
  priority: 50,

  addOptions() {
    return {
      transformPastedText: true,
    };
  },

  addStorage() {
    return {
      parser: createMarkdownParser(),
    };
  },

  addExtensions() {
    return [
      MarkdownClipboard.configure({
        transformPastedText: this.options.transformPastedText,
      }),
    ];
  },
});
