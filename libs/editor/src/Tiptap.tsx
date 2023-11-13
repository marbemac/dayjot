import './styles.css';

import { EditorContent } from '@tiptap/react';
import { useEffect } from 'react';

import type { EditorId } from './create-editor.ts';
import type { FindOrCreateOpts } from './state.ts';
import { editors } from './state.ts';
import { useTipTapEditor } from './use-editor.ts';

export type RichTextEditorProps = Partial<FindOrCreateOpts> & {
  id: EditorId;
};

export const RichTextEditor = ({ id, ...findOrCreateOpts }: RichTextEditorProps) => {
  const editor = editors.set.findOrCreate(id, findOrCreateOpts);
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
