import { baseUserKeyCols, baseUserKeyConfig, USER_KEYS_KEY, USER_KEYS_TABLE } from '@supastack/auth-model';
import type { DrizzleToKysely } from '@supastack/db-model';
import { pgTable } from 'drizzle-orm/pg-core';

export { USER_KEYS_KEY };

export const userKeys = pgTable(
  USER_KEYS_TABLE,
  {
    ...baseUserKeyCols,
    // extend as needed
  },
  table => ({
    ...baseUserKeyConfig(table),
    // extend as needed
  }),
);

export type UserKeysTableCols = DrizzleToKysely<typeof userKeys>;
export type NewUserKey = typeof userKeys.$inferInsert;
export type UserKey = typeof userKeys.$inferSelect;
export type UserKeyColNames = NonNullable<keyof UserKey>;
