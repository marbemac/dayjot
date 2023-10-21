import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schemas/*',
  out: './migrations',
} satisfies Config;
