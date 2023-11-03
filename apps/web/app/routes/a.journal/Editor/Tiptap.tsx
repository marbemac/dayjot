import './styles.css';

import { EditorContent } from '@tiptap/react';
import { useEffect } from 'react';

import type { EntryEditor } from '../use-entry-editor.ts';
import { useIsEditorFocused } from './state.ts';

export const Tiptap = ({ entryEditor }: { entryEditor: EntryEditor }) => {
  const isFocused = useIsEditorFocused(entryEditor.entry.day);

  useEffect(() => {
    if (isFocused) {
      entryEditor.focus();
    }
  }, [entryEditor, isFocused]);

  return (
    <>
      <EditorContent editor={entryEditor.editor} />
      {/* {editor && <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>} */}
      {/* {editor && <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>} */}
    </>
  );
};
