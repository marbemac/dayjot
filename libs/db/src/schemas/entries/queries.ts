import type { BuildQueriesOpts } from '@supastack/db-model';
import { dayjs } from '@supastack/utils-dates';
import { hash } from '@supastack/utils-ids';
import type { SetOptional } from '@supastack/utils-types';
import type { Kysely } from 'kysely';

import type { DbSchema } from '../../db.ts';
import type { TUserId } from '../../ids.ts';
import { EntryId } from '../../ids.ts';
import type { InsertQueryOpts } from '../../types.ts';
import type { EntryColNames } from './schema.ts';
import { ENTRIES_KEY, type NewEntry } from './schema.ts';

export type EntryQueries = ReturnType<typeof entryQueries>;

export const entryQueries = <T extends DbSchema>(opts: BuildQueriesOpts<T>) => {
  const db = opts.db as unknown as Kysely<DbSchema>;

  return {
    bulkUpsert: bulkUpsertEntries({ db }),
    listSinceCheckpoint: listSinceCheckpoint({ db }),
  };
};

const summarySelect = ['id', 'day', 'contentHash', 'createdAt', 'updatedAt'] satisfies EntryColNames[];
const detailedSelect = [...summarySelect, 'content'] satisfies EntryColNames[];

// Allow passing in any format for day and updated at - queries will make sure they are formatted correctly
type UpdateableEntry = Omit<NewEntry, 'day' | 'updatedAt' | 'contentHash'> & {
  day: dayjs.ConfigType;
};

const formatEntryDay = (day: dayjs.ConfigType) => dayjs(day).format('YYYY-MM-DD');

const bulkUpsertEntries = ({ db }: InsertQueryOpts) => {
  return async (values: SetOptional<UpdateableEntry, 'id'>[]) => {
    if (!values.length) return [];

    return db
      .insertInto(ENTRIES_KEY)
      .values(
        values.map(({ day, ...v }) => ({
          id: EntryId.generate(),
          ...v,
          contentHash: hash(v.content),
          day: formatEntryDay(day),
          updatedAt: dayjs.utc().toDate(),
        })),
      )
      .onConflict(oc =>
        oc.columns(['userId', 'day']).doUpdateSet({
          content: eb => eb.ref('excluded.content'),
          contentHash: eb => eb.ref('excluded.contentHash'),
        }),
      )
      .returning(['id', 'day', 'contentHash', 'updatedAt'])
      .execute();
  };
};

const listSinceCheckpoint = ({ db }: InsertQueryOpts) => {
  return async ({
    updatedSince,
    limit,
    userId,
  }: {
    userId: TUserId;
    limit: number;
    updatedSince?: dayjs.ConfigType;
  }) => {
    let q = db.selectFrom(ENTRIES_KEY).select(detailedSelect).where('userId', '=', userId);

    if (updatedSince) {
      q = q.where('updatedAt', '>', dayjs(updatedSince).toDate());
    }

    return q.orderBy(['updatedAt asc', 'day asc']).limit(limit).execute();
  };
};
