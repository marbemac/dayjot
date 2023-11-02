import type {
  BaseDeleteQueryOpts,
  BaseInsertQueryOpts,
  BaseSelectQueryOpts,
  BaseUpdateQueryOpts,
} from '@supastack/db-model';

import type { DbSchema } from './db.ts';

export type InsertQueryOpts = BaseInsertQueryOpts<DbSchema>;
export type SelectQueryOpts = BaseSelectQueryOpts<DbSchema>;
export type UpdateQueryOpts = BaseUpdateQueryOpts<DbSchema>;
export type DeleteQueryOpts = BaseDeleteQueryOpts<DbSchema>;
