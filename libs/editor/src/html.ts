import { generateJSON } from '@tiptap/core';

import { initExtensions } from './init-extensions.ts';

export const htmlToJSON = (html: string) => {
  return generateJSON(html, initExtensions());
};
