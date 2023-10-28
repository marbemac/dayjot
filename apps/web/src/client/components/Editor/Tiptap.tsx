import './styles.css';

import { EditorContent } from '@tiptap/react';
import { useEffect } from 'react';

import { useIsEditorFocused } from '~client/state/editor.ts';
import type { EntryDoc } from '~client/state/entries.ts';

export const Tiptap = ({ entryDoc }: { entryDoc: EntryDoc }) => {
  const isFocused = useIsEditorFocused(entryDoc.day);

  useEffect(() => {
    console.debug('Editor.mount', entryDoc.day);
    return () => {
      console.debug('Editor.unmount', entryDoc.day);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFocused) {
      console.debug(`Editor.focus`, entryDoc.day);
      entryDoc.focus();
    }
  }, [entryDoc, isFocused]);

  return (
    <>
      <EditorContent editor={entryDoc.editor} />
      {/* {editor && <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>} */}
      {/* {editor && <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>} */}
    </>
  );
};
