import { Extension } from '@tiptap/core';
import type { Slice } from '@tiptap/pm/model';
import { DOMParser } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import { elementFromString } from '../../utils/dom.ts';
import isMarkdown from '../../utils/is-markdown.ts';
import { normalizeExternalHtml } from '../../utils/normalize-external-html.ts';
import type { MarkdownStorage } from './extension.ts';
import { MARKDOWN_KEY } from './extension.ts';

export const MARKDOWN_CLIPBOARD_KEY = 'markdownClipboard' as const;

export type MarkdownClipboardOpts = {
  transformPastedText?: boolean;
};

export const MarkdownClipboard = Extension.create<MarkdownClipboardOpts>({
  name: MARKDOWN_CLIPBOARD_KEY,

  addOptions() {
    return {
      transformPastedText: true,
    };
  },

  addProseMirrorPlugins() {
    /** Tracks whether the Shift key is currently held down */
    let shiftKey = false;

    return [
      new Plugin({
        key: new PluginKey(MARKDOWN_CLIPBOARD_KEY),

        props: {
          /**
           * Portions of this implementation are inspired by
           * https://github.com/outline/outline/blob/main/shared/editor/extensions/PasteHandler.ts
           */

          handleDOMEvents: {
            keydown: (_, event) => {
              if (event.key === 'Shift') {
                shiftKey = true;
              }
              return false;
            },
            keyup: (_, event) => {
              if (event.key === 'Shift') {
                shiftKey = false;
              }
              return false;
            },
          },

          handlePaste: (view, event) => {
            // Do nothing if the document isn't currently editable
            if (view.props.editable && !view.props.editable(view.state)) {
              return false;
            }

            // Default behavior if there is nothing on the clipboard or were
            // special pasting with no formatting (Shift held)
            if (!event.clipboardData || shiftKey) {
              return false;
            }

            const text = event.clipboardData.getData('text/plain');
            const html = event.clipboardData.getData('text/html');
            const vscode = event.clipboardData.getData('vscode-editor-data');
            const { state, dispatch } = view;

            // If the users selection is currently in a code block then paste
            // as plain text, ignore all formatting and HTML content.
            if (this.editor.isActive('codeBlock')) {
              event.preventDefault();

              dispatch(state.tr.insertText(text));
              return true;
            }

            // Because VSCode is an especially popular editor that places metadata
            // on the clipboard, we can parse it to find out what kind of content
            // was pasted.
            const vscodeMeta = vscode ? JSON.parse(vscode) : undefined;
            const pasteCodeLanguage = vscodeMeta?.mode;
            // const supportsCodeBlock = !!state.schema.nodes['codeBlock'];
            // const supportsCodeMark = !!state.schema.marks['code'];

            // if (pasteCodeLanguage && pasteCodeLanguage !== "markdown") {
            //   if (text.includes("\n") && supportsCodeBlock) {
            //     event.preventDefault();
            //     dispatch(
            //       state.tr
            //         .replaceSelectionWith(
            //           state.schema.nodes.code_block.create({
            //             language: Object.keys(LANGUAGES).includes(
            //               vscodeMeta.mode
            //             )
            //               ? vscodeMeta.mode
            //               : null,
            //           })
            //         )
            //         .insertText(text)
            //     );
            //     return true;
            //   }

            //   if (supportsCodeMark) {
            //     event.preventDefault();
            //     dispatch(
            //       state.tr
            //         .insertText(text, state.selection.from, state.selection.to)
            //         .addMark(
            //           state.selection.from,
            //           state.selection.to + text.length,
            //           state.schema.marks.code_inline.create()
            //         )
            //     );
            //     return true;
            //   }
            // }

            // If the HTML on the clipboard is from Prosemirror then the best
            // compatability is to just use the HTML parser, regardless of
            // whether it "looks" like Markdown
            if (html?.includes('data-pm-slice')) {
              return false;
            }

            // If the text on the clipboard looks like Markdown OR there is no
            // html on the clipboard then try to parse content as Markdown
            if (isMarkdown(text) || pasteCodeLanguage === 'markdown') {
              event.preventDefault();

              // get pasted content as slice
              const parsed = (this.editor.storage[MARKDOWN_KEY] as MarkdownStorage).parser.render(text);
              if (!parsed) {
                return false;
              }

              console.debug('Editor.paste markdown', parsed);

              const slice = DOMParser.fromSchema(this.editor.schema).parseSlice(
                elementFromString(normalizeExternalHtml(parsed)),
                {
                  preserveWhitespace: true,
                  context: view.state.selection.$from,
                },
              );

              const tr = view.state.tr;
              let currentPos = view.state.selection.from;

              // If the pasted content is a single paragraph then we loop over
              // it's content and insert each node one at a time to allow it to
              // be pasted inline with surrounding content.
              const singleNode = sliceSingleNode(slice);
              if (singleNode && singleNode.type === this.editor.schema.nodes['paragraph']) {
                singleNode.forEach(node => {
                  tr.insert(currentPos, node);
                  currentPos += node.nodeSize;
                });
              } else {
                singleNode ? tr.replaceSelectionWith(singleNode, shiftKey) : tr.replaceSelection(slice);
              }

              dispatch(tr.setMeta('paste', true));

              return true;
            }

            // otherwise use the default HTML parser which will handle all paste
            // "from the web" events
            return false;
          },
        },
      }),
    ];
  },
});

function sliceSingleNode(slice: Slice) {
  return slice.openStart === 0 && slice.openEnd === 0 && slice.content.childCount === 1
    ? slice.content.firstChild
    : null;
}
