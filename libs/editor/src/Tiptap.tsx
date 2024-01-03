import './styles.css';

import { observer } from '@legendapp/state/react';
import { EditorContent } from '@tiptap/react';
import { useEffect } from 'react';

import type { EditorId } from './create-editor.ts';
import type { FindOrCreateOpts } from './state.ts';
import { editors$ } from './state.ts';
import { useTipTapEditor } from './use-editor.ts';

export type RichTextEditorProps = Partial<FindOrCreateOpts> & {
  id: EditorId;
};

export const RichTextEditor = observer(({ id, ...findOrCreateOpts }: RichTextEditorProps) => {
  const editor = editors$.findOrCreate(id, findOrCreateOpts);
  const shouldFocus = editors$.shouldFocus(id).get();

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
});
