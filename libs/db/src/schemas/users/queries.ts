import type { BuildQueriesOpts } from '@supastack/db-model';
import { baseUserQueries } from '@supastack/user-model';
import { UsersDbSchema } from './schema.ts';

export type UserQueries = ReturnType<typeof userQueries>;

export const userQueries = <T extends UsersDbSchema>(opts: BuildQueriesOpts<T>) => {
  return {
    ...baseUserQueries(opts),
  };
};
