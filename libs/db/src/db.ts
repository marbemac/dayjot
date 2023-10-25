import type { ENTRIES_KEY, EntriesTableCols } from './schemas/entries/schema.ts';
import type { USER_KEYS_KEY, UserKeysTableCols } from './schemas/user-keys/schema.ts';
import type { USER_SESSIONS_KEY, UserSessionsTableCols } from './schemas/user-sessions/schema.ts';
import type { USERS_KEY, UsersTableCols } from './schemas/users/schema.ts';
import type { VERIFICATION_TOKENS_KEY, VerificationTokensTableCols } from './schemas/verification-tokens/schema.ts';

/**
 * Add all of the kysley table typings here.
 *
 * This is passed to kysley when creating a db client in sdk.ts.
 */
export interface DbSchema {
  [ENTRIES_KEY]: EntriesTableCols;
  [USER_KEYS_KEY]: UserKeysTableCols;
  [USER_SESSIONS_KEY]: UserSessionsTableCols;
  [USERS_KEY]: UsersTableCols;
  [VERIFICATION_TOKENS_KEY]: VerificationTokensTableCols;
}
