import type { DrizzleToKysely } from '@supastack/db-model';
import { timestampCol } from '@supastack/db-model';
import { index, pgTable, text, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-valibot';
import { users } from '../users/schema.ts';

export const entries = pgTable(
  'entries',
  {
    id: text('id').primaryKey(),
    body: text('body').notNull(),
    createdAt: timestampCol('created_at').defaultNow().notNull(),
    updatedAt: timestampCol('updated_at'),

    userId: varchar('user_id', {
      length: 15,
    })
      .notNull()
      .references(() => users.id),
  },
  table => {
    return {
      userIdIdx: index('entries_user_id_idx').on(table.userId),
    };
  },
);

export const ENTRIES_KEY = 'entries' as const;
export type Entry = typeof entries.$inferSelect;
export type InsertEntry = typeof entries.$inferInsert;
export type EntriesTableCols = DrizzleToKysely<typeof entries>;
export type EntryColNames = NonNullable<keyof Entry>;

export const insertEntrieschema = createInsertSchema(entries);
export const selectEntrieschema = createSelectSchema(entries);

export interface EntriesDbSchema<T extends EntriesTableCols = EntriesTableCols> {
  [ENTRIES_KEY]: T;
}
