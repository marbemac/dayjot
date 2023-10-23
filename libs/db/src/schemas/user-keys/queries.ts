import { baseUserKeyQueries } from '@supastack/auth-model';
import type { BuildQueriesOpts } from '@supastack/db-model';

import type { DbSchema } from '../../db.ts';

export type UserKeyQueries = ReturnType<typeof userKeyQueries>;

export const userKeyQueries = <T extends DbSchema>({ db }: BuildQueriesOpts<T>) => {
  return {
    ...baseUserKeyQueries({ db }),
  };
};
