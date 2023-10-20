import type { DrizzleToKysely } from '@supastack/db-model';
import { timestampCol } from '@supastack/db-model';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-valibot';

export const entries = pgTable('entries', {
  id: text('id').primaryKey(),
  body: text('body').notNull(),
  createdAt: timestampCol('created_at').defaultNow().notNull(),
  updatedAt: timestampCol('updated_at'),
});

export const ENTRIES_KEY = 'entries' as const;
export type Entry = typeof entries.$inferSelect;
export type InsertEntry = typeof entries.$inferInsert;
export type EntriesTableCols = DrizzleToKysely<typeof entries>;
export type EntryColNames = NonNullable<keyof Entry>;

export const insertEntrieschema = createInsertSchema(entries);
export const selectEntrieschema = createSelectSchema(entries);

export interface EntriesDb<T extends EntriesTableCols = EntriesTableCols> {
  [ENTRIES_KEY]: T;
}
