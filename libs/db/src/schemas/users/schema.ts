import type { DrizzleToKysely } from '@supastack/db-model';
import { baseUserCols, baseUserConfig, USERS_KEY, USERS_TABLE } from '@supastack/user-model';
import { pgTable } from 'drizzle-orm/pg-core';

export { USERS_KEY };

export const users = pgTable(
  USERS_TABLE,
  {
    ...baseUserCols,
    // extend as needed
  },
  table => ({
    ...baseUserConfig(table),
    // extend as needed
  }),
);

export type UsersTableCols = DrizzleToKysely<typeof users>;
export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserColNames = NonNullable<keyof User>;
