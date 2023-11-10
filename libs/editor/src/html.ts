import { generateJSON } from '@tiptap/html';

import { initExtensions } from './init-extensions.ts';

export const htmlToJSON = (html: string) => {
  return generateJSON(html, initExtensions());
};
