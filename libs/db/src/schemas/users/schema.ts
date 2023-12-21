import type { DrizzleToKysely } from '@supastack/db-model';
import { baseUserCols, baseUserConfig, USERS_KEY, USERS_TABLE } from '@supastack/user-model';
import { boolean, jsonb, pgTable, text } from 'drizzle-orm/pg-core';

export { USERS_KEY };

export type EmailTimesSetting = {
  su: string;
  mo: string;
  tu: string;
  we: string;
  th: string;
  fr: string;
  sa: string;
};

const defaultEmailTimes: EmailTimesSetting = { su: '7', mo: '7', tu: '7', we: '7', th: '7', fr: '7', sa: 'none' };

export const users = pgTable(
  USERS_TABLE,
  {
    ...baseUserCols,

    // extend as needed

    emailTimes: jsonb('email_times').$type<EmailTimesSetting>().notNull().default(defaultEmailTimes),
    emailIncludeMemory: boolean('email_include_memory').notNull().default(true),
    timeZone: text('time_zone').notNull().default('US/Eastern'),
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
