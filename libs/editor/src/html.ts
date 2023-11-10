import { generateJSON } from '@tiptap/html';

import { initExtensions } from './init-extensions.ts';
import { normalizeExternalHtml } from './utils/normalize-external-html.ts';

export const htmlToJSON = (html: string) => {
  return generateJSON(normalizeExternalHtml(html), initExtensions());
};
