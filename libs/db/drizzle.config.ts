import type { Config } from 'drizzle-kit';

export default {
  schema: 'src/schemas/*',
  out: 'migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env['JOT_SQL_URL']!,
  },
} satisfies Config;
