import { dropSchemaTables } from '@supastack/db-pg-migrations';

import { migrate } from '../src/migrate.js';

const reset = async () => {
  await dropSchemaTables({
    dbUrl: process.env['JOT_SQL_URL']!,
  });

  await migrate();
};

await reset();

process.exit();
