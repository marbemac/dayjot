import './styles.css';

import { EditorContent } from '@tiptap/react';
import { useEffect } from 'react';

import type { EditorId } from './create-editor.ts';
import { editors } from './state.ts';
import { useTipTapEditor } from './use-editor.ts';

export type RichTextEditorProps = {
  id: EditorId;
};

export const RichTextEditor = ({ id }: RichTextEditorProps) => {
  const editor = editors.set.findOrCreate(id);
  const shouldFocus = editors.use.shouldFocus(id);

  useTipTapEditor({}, [], editor);

  useEffect(() => {
    if (shouldFocus) {
      editor.commands.focus();
    }
  }, [editor, shouldFocus]);

  return (
    <>
      <EditorContent editor={editor} />
      {/* {editor && <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>} */}
      {/* {editor && <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>} */}
    </>
  );
};
