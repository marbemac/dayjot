import { tx } from '@supastack/ui-styles';
import { Editor } from '@tiptap/react';

import { initExtensions } from './init-extensions.ts';

export type EditorId = string;

export type CreateEditorOpts = {
  editable?: boolean;
  initialContent?: string;
};

export const createEditor = (id: EditorId, { initialContent, ...rest }: CreateEditorOpts = {}) => {
  const extensions = initExtensions();

  let jsonContent;
  try {
    if (initialContent) {
      jsonContent = typeof initialContent === 'string' ? JSON.parse(initialContent) : initialContent;
    }
  } catch {
    console.warn('Error parsing initial content for editor', { id });
  }

  return new Editor({
    extensions,
    content: jsonContent,
    ...rest,
    editorProps: {
      attributes: {
        class: tx('ui-prose'),
      },
    },
  });
};
