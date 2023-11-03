import Placeholder from '@tiptap/extension-placeholder';
import type { EditorEvents, FocusPosition } from '@tiptap/react';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import debounce from 'lodash.debounce';

import type { EntryDoc } from '~/local-db/schemas.client.ts';

const EntryEditors = new Map<string, EntryEditor>();
export const useEntryEditor = (entry: EntryDoc): EntryEditor => {
  let entryDoc = EntryEditors.get(entry.day);
  if (!entryDoc) {
    entryDoc = new EntryEditor(entry);
    EntryEditors.set(entry.day, entryDoc);
  }

  return entryDoc;
};

export class EntryEditor {
  #lastContent: string | undefined;
  #disposables: (() => void)[] = [];

  constructor(public readonly entry: EntryDoc) {
    const watchContent = entry.get$('content').subscribe(newContent => {
      const isExternalChange = newContent !== this.#lastContent;
      if (isExternalChange && this.#lastContent) {
        console.debug('EntryEditor.handleExternalChange', entry.day);
        try {
          this.editor.commands.setContent(JSON.parse(newContent));
        } catch {
          // noop
        }
      }
    });

    // if we ever actually want to cleanup EntryEditor, make sure to call all disposables
    this.#disposables.push(watchContent.unsubscribe);
  }

  get editor() {
    return getEditor(this.entry.day, this.entry.content, {
      onInit: () => {
        this.#lastContent = this.entry.content;
      },
      onUpdate: ({ editor }) => {
        this.#lastContent = JSON.stringify(editor.getJSON());

        void this.entry.updateContent(this.#lastContent);
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
  initialContent: string,
  {
    onInit,
    onUpdate,
  }: {
    onInit?: () => void;
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
      onUpdate: onUpdate ? debounce(onUpdate, 1000) : undefined,
      content: jsonContent,
    });

    Editors.set(docId, editor);

    if (onInit) onInit();
  }

  return editor;
};
