import type { Editor } from '@tiptap/react';
import { createStore } from '@udecode/zustood';

import { createEditor, type CreateEditorOpts, type EditorId } from './create-editor.ts';

type EditorsStore = {
  focusedEditor: EditorId | null;
  editors: Record<EditorId, Editor>;
};

export type FindOrCreateOpts = CreateEditorOpts & {
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
