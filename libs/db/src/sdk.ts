import { initClient, type InitClientOpts } from '@supastack/db-pg-client';

import type { DbSchema } from './db.ts';
import { ENTRIES_KEY, entryQueries } from './schemas/entries/index.ts';
import { USER_KEYS_KEY, userKeyQueries } from './schemas/user-keys/index.ts';
import { USER_SESSIONS_KEY, userSessionQueries } from './schemas/user-sessions/index.ts';
import { userQueries, USERS_KEY } from './schemas/users/index.ts';
import { VERIFICATION_TOKENS_KEY, verificationTokenQueries } from './schemas/verification-tokens/index.ts';

type InitDbSdkOpts = InitClientOpts;

export type DbSdk = ReturnType<typeof initDbSdk>;

export const initDbSdk = (opts: InitDbSdkOpts) => {
  const { db } = initClient<DbSchema>(opts);

  return {
    client: db,
    queries: {
      [ENTRIES_KEY]: entryQueries({ db }),
      [USER_KEYS_KEY]: userKeyQueries({ db }),
      [USER_SESSIONS_KEY]: userSessionQueries({ db }),
      [USERS_KEY]: userQueries({ db }),
      [VERIFICATION_TOKENS_KEY]: verificationTokenQueries({ db }),
    },
  };
};
