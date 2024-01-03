import type { BuildQueriesOpts } from '@supastack/db-model';
import { dayjs } from '@supastack/utils-dates';
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

const summarySelect = ['id', 'day', 'createdAt', 'updatedAt'] satisfies EntryColNames[];
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
          day: formatEntryDay(day),
          updatedAt: dayjs.utc().toDate(),
        })),
      )
      .onConflict(oc =>
        oc.columns(['userId', 'day']).doUpdateSet({
          content: eb => eb.ref('excluded.content'),
        }),
      )
      .returning(['id', 'day', 'updatedAt'])
      .execute();
  };
};

const listSinceCheckpoint = ({ db }: InsertQueryOpts) => {
  return async ({
    checkpoint,
    limit,
    userId,
  }: {
    userId: TUserId;
    limit: number;
    checkpoint?: {
      updatedAt: dayjs.ConfigType;
      day: string;
    };
  }) => {
    let q = db.selectFrom(ENTRIES_KEY).select(detailedSelect).where('userId', '=', userId);

    if (checkpoint) {
      const d = dayjs(checkpoint.updatedAt).toDate();
      q = q.where(eb =>
        eb.or([eb('updatedAt', '>', d), eb.and([eb('updatedAt', '=', d), eb('day', '>', checkpoint.day)])]),
      );
    }

    return q.orderBy(['updatedAt asc', 'day asc']).limit(limit).execute();
  };
};
