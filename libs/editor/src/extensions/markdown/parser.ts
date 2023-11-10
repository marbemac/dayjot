import md from 'markdown-it';
// @ts-expect-error no types
import mark from 'markdown-it-mark';

export const createMarkdownParser = () => {
  return md().use(mark);
};
