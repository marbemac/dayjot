import type { BuildQueriesOpts } from '@supastack/db-model';
import { baseUserQueries } from '@supastack/user-model';

import type { DbSchema } from '../../db.ts';

export type UserQueries = ReturnType<typeof userQueries>;

export const userQueries = <T extends DbSchema>({ db }: BuildQueriesOpts<T>) => {
  return {
    ...baseUserQueries({ db }),
  };
};
