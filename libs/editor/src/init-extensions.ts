import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Typography from '@tiptap/extension-typography';
import StarterKit from '@tiptap/starter-kit';

import { Markdown } from './extensions/markdown/extension.ts';

export const initExtensions = () => [
  StarterKit.configure(),

  Placeholder.configure({
    placeholder: 'Write here...',
  }),

  Image.configure(),
  Typography.configure(),
  Link.configure(),
  Highlight.configure(),

  TaskList.configure(),
  TaskItem.configure(),

  Table.configure(),
  TableRow.configure(),
  TableHeader.configure(),
  TableCell.configure(),

  Markdown.configure({
    transformPastedText: true,
  }),
];
