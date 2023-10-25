import {
  baseVerificationTokenCols,
  baseVerificationTokenConfig,
  VERIFICATION_TOKENS_KEY,
  VERIFICATION_TOKENS_TABLE,
} from '@supastack/auth-model';
import type { DrizzleToKysely } from '@supastack/db-model';
import { pgTable } from 'drizzle-orm/pg-core';

export { VERIFICATION_TOKENS_KEY };

export const verificationTokens = pgTable(
  VERIFICATION_TOKENS_TABLE,
  {
    ...baseVerificationTokenCols,
    // extend as needed
  },
  table => ({
    ...baseVerificationTokenConfig(table),
    // extend as needed
  }),
);

export type VerificationTokensTableCols = DrizzleToKysely<typeof verificationTokens>;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type VerificationTokenColNames = NonNullable<keyof VerificationToken>;
