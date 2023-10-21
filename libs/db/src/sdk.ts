import type { InitClientOpts } from '@supastack/db-pg-client';
import { initClient } from '@supastack/db-pg-client';

import type { DbSchema } from './db.ts';
import { USERS_KEY, userQueries } from './schemas/users/index.ts';

type InitDbSdkOpts = InitClientOpts;

export type DbSdk = ReturnType<typeof initDbSdk>;

export const initDbSdk = (opts: InitDbSdkOpts) => {
  const { db } = initClient<DbSchema>(opts);

  return {
    client: db,
    queries: {
      [USERS_KEY]: userQueries({ db }),
    },
  };
};
