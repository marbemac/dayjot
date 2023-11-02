import type { BuildQueriesOpts } from '@supastack/db-model';
import { dayjs } from '@supastack/utils-dates';
import { hash } from '@supastack/utils-ids';
import type { SetOptional } from '@supastack/utils-types';
import type { Kysely } from 'kysely';

import type { DbSchema } from '../../db.ts';
import { EntryId, type TEntryId } from '../../ids.ts';
import type { InsertQueryOpts } from '../../types.ts';
import type { Entry } from './schema.ts';
import { ENTRIES_KEY, type NewEntry } from './schema.ts';

export type EntryQueries = ReturnType<typeof entryQueries>;

export const entryQueries = <T extends DbSchema>(opts: BuildQueriesOpts<T>) => {
  const db = opts.db as unknown as Kysely<DbSchema>;

  return {
    bulkUpsert: bulkUpsertEntries({ db }),
  };
};

// Allow passing in any format for day and updated at - queries will make sure they are formatted correctly
type UpdateableEntry = Omit<NewEntry, 'day' | 'updatedAt' | 'contentHash'> & {
  day: dayjs.ConfigType;
  updatedAt: dayjs.ConfigType;
};

const formatEntryDay = (day: dayjs.ConfigType) => dayjs(day).format('YYYY-MM-DD');

const bulkUpsertEntries = ({ db }: InsertQueryOpts) => {
  return async (values: SetOptional<UpdateableEntry, 'id'>[]) => {
    if (!values.length) return [];

    return db
      .insertInto(ENTRIES_KEY)
      .values(
        values.map(({ day, updatedAt, ...v }) => ({
          id: EntryId.generate(),
          ...v,
          contentHash: hash(v.content),
          day: formatEntryDay(day),
          updatedAt: dayjs(updatedAt).toDate(),
        })),
      )
      .onConflict(oc =>
        oc
          .columns(['userId', 'day'])
          .doUpdateSet({
            content: eb => eb.ref('excluded.content'),
            contentHash: eb => eb.ref('excluded.contentHash'),
            updatedAt: eb => eb.ref('excluded.updatedAt'),
          })
          // extra protection, don't update the db if the local entry is older than the db entry
          .whereRef('excluded.updatedAt', '>', 'entries.updatedAt'),
      )
      .returning(['id', 'day', 'contentHash', 'updatedAt'])
      .execute();
  };
};
