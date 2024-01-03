import { type DrizzleToKysely, idCol, timestampCol } from '@supastack/db-model';
import type { TUserId } from '@supastack/user-model/ids';
import { pgTable, text, unique } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-valibot';

import type { TEntryId } from '../../ids.ts';
import { users } from '../users/schema.ts';

export const ENTRIES_KEY = 'entries' as const;
export const ENTRIES_TABLE = 'entries' as const;

export const entries = pgTable(
  ENTRIES_TABLE,

  {
    id: idCol<TEntryId>()('id').primaryKey(),

    /**
     * The day of the entry in YYYY-MM-DD format.
     */
    day: text('day').notNull(),

    /**
     * The stringified JSON AST of the entry.
     */
    content: text('content').notNull(),

    createdAt: timestampCol('created_at').defaultNow().notNull(),
    updatedAt: timestampCol('updated_at'),

    userId: idCol<TUserId>()('user_id')
      .notNull()
      .references(() => users.id),
  },

  table => {
    return {
      userIdDayIdx: unique('entries_user_id_day_idx').on(table.userId, table.day),
    };
  },
);

export type EntriesTableCols = DrizzleToKysely<typeof entries>;
export type NewEntry = typeof entries.$inferInsert;
export type Entry = typeof entries.$inferSelect;
export type EntryColNames = NonNullable<keyof Entry>;

export const insertEntrieschema = createInsertSchema(entries);
export const selectEntrieschema = createSelectSchema(entries);
