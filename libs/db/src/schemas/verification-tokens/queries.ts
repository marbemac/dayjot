import { baseVerificationTokenQueries } from '@supastack/auth-model';
import type { BuildQueriesOpts } from '@supastack/db-model';

import type { DbSchema } from '../../db.ts';

export type VerificationTokenQueries = ReturnType<typeof verificationTokenQueries>;

export const verificationTokenQueries = <T extends DbSchema>({ db }: BuildQueriesOpts<T>) => {
  return {
    ...baseVerificationTokenQueries({ db }),
  };
};
