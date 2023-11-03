import { wrap } from '@decs/typeschema';
import { array, boolean, number, object, optional, string } from 'valibot';

import { protectedProcedure, router } from './trpc.ts';

const pushEntriesSchema = object({
  docs: array(
    object({
      assumedMasterState: optional(
        object({
          day: string(),
          content: string(),
          _deleted: boolean(),
        }),
      ),
      newDocumentState: object({
        day: string(),
        content: string(),
        _deleted: boolean(),
      }),
    }),
  ),
});

const pullSchema = object({
  limit: number(),
  checkpoint: optional(
    object({
      minUpdatedAt: string(),
    }),
  ),
});

export const syncRouter = router({
  pullEntries: protectedProcedure.input(wrap(pullSchema)).mutation(async ({ input, ctx }) => {
    const docs = await ctx.db.queries.entries.listSinceCheckpoint({
      updatedSince: input.checkpoint?.minUpdatedAt,
      limit: input.limit,
      userId: ctx.user.id,
    });

    return {
      docs: docs.map(({ updatedAt, ...rest }) => ({
        ...rest,
        updatedAt: updatedAt!.toISOString(),
        _deleted: false, // @TODO implement, if we ever want to handle deleting from the server
      })),
    };
  }),

  pushEntries: protectedProcedure.input(wrap(pushEntriesSchema)).mutation(async ({ input, ctx }) => {
    const upserts = [];
    const deletes = [];
    for (const update of input.docs) {
      const s = update.newDocumentState;
      if (s._deleted) {
        deletes.push(s.day);
      } else {
        upserts.push({
          day: s.day,
          content: s.content,
          userId: ctx.user.id,
        });
      }
    }

    await ctx.db.queries.entries.bulkUpsert(upserts);

    // @TODO bulkDelete()

    // @TODO investigate handling conflicts
    return [];
  }),
});
