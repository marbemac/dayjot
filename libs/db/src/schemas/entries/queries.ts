import type { BuildQueriesOpts } from '@supastack/db-model';

import type { DbSchema } from '../../db.ts';

export type EntryQueries = ReturnType<typeof entryQueries>;

export const entryQueries = <T extends DbSchema>(opts: BuildQueriesOpts<T>) => {
  return {};
};
