import { migrateToLatest } from '@supastack/db-pg-migrations';

export const migrate = () => {
  return migrateToLatest({
    dbUrl: process.env['JOT_SQL_URL']!,
  });
};
