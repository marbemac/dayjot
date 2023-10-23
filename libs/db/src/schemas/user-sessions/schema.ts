import {
  baseUserSessionCols,
  baseUserSessionConfig,
  USER_SESSIONS_KEY,
  USER_SESSIONS_TABLE,
} from '@supastack/auth-model';
import type { DrizzleToKysely } from '@supastack/db-model';
import { pgTable } from 'drizzle-orm/pg-core';

export { USER_SESSIONS_KEY };

export const userSessions = pgTable(
  USER_SESSIONS_TABLE,
  {
    ...baseUserSessionCols,
    // extend as needed
  },
  table => ({
    ...baseUserSessionConfig(table),
    // extend as needed
  }),
);

export type UserSessionsTableCols = DrizzleToKysely<typeof userSessions>;
export type NewUserSession = typeof userSessions.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type UserSessionColNames = NonNullable<keyof UserSession>;
