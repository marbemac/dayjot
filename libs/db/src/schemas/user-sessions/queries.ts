import { baseUserSessionQueries } from '@supastack/auth-model';
import type { BuildQueriesOpts } from '@supastack/db-model';

import type { DbSchema } from '../../db.ts';

export type UserSessionQueries = ReturnType<typeof userSessionQueries>;

export const userSessionQueries = <T extends DbSchema>({ db }: BuildQueriesOpts<T>) => {
  return {
    ...baseUserSessionQueries({ db }),
  };
};
