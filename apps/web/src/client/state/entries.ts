import { hashJson } from '@supastack/utils-ids';
import Collaboration from '@tiptap/extension-collaboration';
import Placeholder from '@tiptap/extension-placeholder';
import type { EditorEvents, FocusPosition } from '@tiptap/react';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import debounce from 'lodash.debounce';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';

import { tinyStore } from './tinybase.tsx';

const EntryDocs = new Map<string, EntryDoc>();
export const useEntryDoc = (day: string): EntryDoc => {
  let entryDoc = EntryDocs.get(day);
  if (!entryDoc) {
    entryDoc = new EntryDoc(day);
    EntryDocs.set(day, entryDoc);
  }

  return entryDoc;
};

export class EntryDoc {
  #hasContent = false;

  constructor(public readonly day: string) {}

  get ydoc() {
    return getYDoc(this.day);
  }

  get editor() {
    return getEditor(this.day, this.ydoc, {
      onUpdate: ({ editor }) => {
        const dataHash = hashJson(editor.getJSON());
        this.#hasContent = !!editor.isEmpty;
        tinyStore.setPartialRow('entries', this.day, { localHash: dataHash });
      },
    });
  }

  public focus(position?: FocusPosition) {
    this.editor.commands.focus(position);
  }
}

const YDocs = new Map<string, Y.Doc>();
const getYDoc = (docId: string) => {
  let ydoc = YDocs.get(docId);
  if (!ydoc) {
    ydoc = new Y.Doc();
    new IndexeddbPersistence(docId, ydoc);
    YDocs.set(docId, ydoc);
  }

  return ydoc;
};

const Editors = new Map<string, Editor>();
const getEditor = (
  docId: string,
  ydoc: Y.Doc,
  {
    onUpdate,
  }: {
    onUpdate?: (props: EditorEvents['update']) => void;
  } = {},
) => {
  let editor = Editors.get(docId);
  if (!editor) {
    const extensions = [
      // The Collaboration extension comes with its own history handling
      StarterKit.configure({ history: false }),

      Collaboration.configure({
        document: ydoc,
      }),

      Placeholder.configure({
        placeholder: 'Write here...',
      }),
    ];

    editor = new Editor({
      extensions,
      onUpdate: onUpdate ? debounce(onUpdate, 1500) : undefined,
    });

    Editors.set(docId, editor);
  }

  return editor;
};
