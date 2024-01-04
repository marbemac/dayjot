import { editors$ } from '@libs/editor';
import type { EditorEvents } from '@tiptap/react';
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

const UPDATE_DEBOUNCE = 1000 * 3;

export class EntryEditor {
  #lastContent: string | undefined;
  #disposables: (() => void)[] = [];

  constructor(public readonly entry: EntryDoc) {
    const editor = this.editor;

    const onUpdate = debounce(this.onEditorUpdate, UPDATE_DEBOUNCE);
    editor.on('update', onUpdate);

    const watchContent = entry.get$('content').subscribe(newContent => {
      const isExternalChange = newContent !== this.#lastContent;
      if (isExternalChange && this.#lastContent) {
        console.debug('EntryEditor.handleExternalChange', entry.day);
        try {
          editor.commands.setContent(JSON.parse(newContent));
        } catch {
          // noop
        }
      }
    });

    // if we ever actually want to cleanup EntryEditor, make sure to call all disposables
    this.#disposables.push(() => editor.off('update', onUpdate));
    this.#disposables.push(watchContent.unsubscribe);
  }

  private onEditorUpdate = ({ editor }: EditorEvents['update']) => {
    this.#lastContent = JSON.stringify(editor.getJSON());
    void this.entry.updateContent(this.#lastContent);
  };

  get editor() {
    return editors$.findOrCreate(this.entry.day, {
      initialContent: this.entry.content,
      onCreate: () => {
        this.#lastContent = this.entry.content;
      },
    });
  }
}
