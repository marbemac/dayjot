import Placeholder from '@tiptap/extension-placeholder';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { createStore } from '@udecode/zustood';

export type EditorId = string;

type EditorsStore = {
  focusedEditor: EditorId | null;
  editors: Record<EditorId, Editor>;
};

type FindOrCreateOpts = CreateEditorOpts & {
  onCreate?: (props: { editor: Editor }) => void;
};

export const editors = createStore('editors')<EditorsStore>({
  focusedEditor: null,
  editors: {},
})
  .extendSelectors((state, get, api) => ({
    editor: (id: EditorId) => get.editors()[id],
    shouldFocus: (id: EditorId) => get.focusedEditor() === id,
  }))
  .extendActions((set, get, api) => ({
    focusOnEditor: (id: EditorId) => {
      set.focusedEditor(id);
    },

    findOrCreate: (id: EditorId, { onCreate, ...opts }: FindOrCreateOpts = {}) => {
      const editors = get.editors();
      const existing = editors[id];
      if (existing) return existing;

      const newEditor = createEditor(id, opts);

      if (onCreate) onCreate({ editor: newEditor });

      set.editors({ ...editors, [id]: newEditor });

      return newEditor;
    },
  }));

type CreateEditorOpts = {
  editable?: boolean;
  initialContent?: string;
};

const createEditor = (id: EditorId, { initialContent, ...rest }: CreateEditorOpts = {}) => {
  const extensions = [
    StarterKit.configure(),

    Placeholder.configure({
      placeholder: 'Write here...',
    }),
  ];

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
  });
};
