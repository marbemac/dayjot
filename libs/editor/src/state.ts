import type { OpaqueObject } from '@legendapp/state';
import { computed, observable, opaqueObject } from '@legendapp/state';
import type { Editor } from '@tiptap/react';

import { createEditor, type CreateEditorOpts, type EditorId } from './create-editor.ts';

export type FindOrCreateOpts = CreateEditorOpts & {
  onCreate?: (props: { editor: Editor }) => void;
};

export const editors$ = observable({
  focusedEditor: null as EditorId | null,
  editors: {} as Record<EditorId, OpaqueObject<Editor>>,

  shouldFocus: (id: EditorId) => computed(() => editors$.focusedEditor.get() === id),

  focusOnEditor: (id: EditorId) => {
    editors$.focusedEditor.set(id);
  },

  findOrCreate: (id: EditorId, { onCreate, ...opts }: FindOrCreateOpts = {}) => {
    const existing = editors$.editors[id]!.get();
    if (existing) return existing;

    const newEditor = opaqueObject(createEditor(id, opts));

    if (onCreate) onCreate({ editor: newEditor });

    editors$.editors[id]!.set(newEditor);

    return newEditor;
  },
});
