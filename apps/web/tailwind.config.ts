import path from 'node:path';

import { preset } from '@supastack/ui-styles/tailwind';
import type { Config } from 'tailwindcss';

export default {
  presets: [preset()],
  content: [
    // simplify to this when https://github.com/remix-run/remix/pull/8338#issuecomment-1870588151 is resolved
    // 'app/**/*.{ts,tsx}',
    'app/components/**/*.{ts,tsx}',
    'app/forms/**/*.{ts,tsx}',
    'app/modals/**/*.{ts,tsx}',
    'app/routes/**/*.{ts,tsx}',
    'app/root.tsx',

    path.join(path.dirname(require.resolve('@supastack/ui-styles')), '**/*.ts'),
    path.join(path.dirname(require.resolve('@libs/editor')), '**/*.{ts,tsx}'),
  ],
} satisfies Config;
