import path from 'node:path';

import { preset } from '@supastack/ui-styles/tailwind';
import type { Config } from 'tailwindcss';

export default {
  presets: [
    preset({
      // Handling it custom
      theme: false,
    }),
  ],

  content: [
    'app/**/*.{ts,tsx}',
    path.join(path.dirname(require.resolve('@supastack/ui-styles')), '**/*.ts'),
    path.join(path.dirname(require.resolve('@dayjot/editor')), '**/*.{ts,tsx}'),
  ],
} satisfies Config;
