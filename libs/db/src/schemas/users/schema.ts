import type { DrizzleToKysely } from '@supastack/db-model';
import { bigint, pgTable, varchar } from 'drizzle-orm/pg-core';
import { baseUserColumns } from '@supastack/user-model';

export const USERS_KEY = 'users' as const;
export const USER_SESSIONS_KEY = 'user_sessions' as const;
export const USER_KEYS_KEY = 'user_keys' as const;

export const users = pgTable(USERS_KEY, {
  ...baseUserColumns,
});

export const userSessions = pgTable(USER_SESSIONS_KEY, {
  id: varchar('id', {
    length: 128,
  }).primaryKey(),

  userId: varchar('user_id', {
    length: 15,
  })
    .notNull()
    .references(() => users.id),

  activeExpires: bigint('active_expires', {
    mode: 'number',
  }).notNull(),

  idleExpires: bigint('idle_expires', {
    mode: 'number',
  }).notNull(),
});

export const userKeys = pgTable(USER_KEYS_KEY, {
  id: varchar('id', {
    length: 255,
  }).primaryKey(),

  userId: varchar('user_id', {
    length: 15,
  })
    .notNull()
    .references(() => users.id),

  hashedPassword: varchar('hashed_password', {
    length: 255,
  }),
});

export type UsersTableCols = DrizzleToKysely<typeof users>;
export type UserSessionsTableCols = DrizzleToKysely<typeof userSessions>;
export type UserKeysTableCols = DrizzleToKysely<typeof userKeys>;

export type User = typeof users.$inferSelect;
export type UserSession = typeof userSessions.$inferSelect;
export type UserKey = typeof userKeys.$inferSelect;

export interface UsersDbSchema {
  [USERS_KEY]: UsersTableCols;
  [USER_SESSIONS_KEY]: UsersTableCols;
  [USER_KEYS_KEY]: UsersTableCols;
}
