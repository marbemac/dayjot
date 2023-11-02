import { hash } from '@supastack/utils-ids';
import Placeholder from '@tiptap/extension-placeholder';
import type { EditorEvents, FocusPosition } from '@tiptap/react';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import debounce from 'lodash.debounce';

import { tinyStore } from './tinybase.client.tsx';

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

  get editor() {
    return getEditor(this.day, {
      onUpdate: ({ editor }) => {
        const content = JSON.stringify(editor.getJSON());
        const dataHash = hash(content);
        this.#hasContent = !!editor.isEmpty;
        tinyStore.setPartialRow('entries', this.day, {
          localHash: dataHash,
          content,
          localUpdatedAt: new Date().toISOString(),
        });
      },
    });
  }

  public focus(position?: FocusPosition) {
    this.editor.commands.focus(position);
  }
}

const Editors = new Map<string, Editor>();
const getEditor = (
  docId: string,
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
      StarterKit.configure(),

      Placeholder.configure({
        placeholder: 'Write here...',
      }),
    ];

    const initialContent = tinyStore.getCell('entries', docId, 'content');
    let jsonContent;
    try {
      if (initialContent) {
        jsonContent = JSON.parse(initialContent);
      }
    } catch {
      console.warn('Error parsing initial content for docId', docId);
    }

    editor = new Editor({
      extensions,
      onUpdate: onUpdate ? debounce(onUpdate, 1500) : undefined,
      content: jsonContent,
    });

    Editors.set(docId, editor);
  }

  return editor;
};
