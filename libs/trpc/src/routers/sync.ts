import { array, boolean, number, object, optional, parse, string } from 'valibot';

import { protectedProcedure, router } from '../trpc.ts';

const PushEntriesSchema = object({
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

const PullEntriesSchema = object({
  limit: number(),
  checkpoint: optional(
    object({
      // for entries, the determinstic fallback is the day (when updatedAt is the same on multiple entries)
      deterministicId: string(),
      minUpdatedAt: string(),
    }),
  ),
});

export const syncRouter = router({
  pullEntries: protectedProcedure
    .input(i => parse(PullEntriesSchema, i))
    .mutation(async ({ input, ctx }) => {
      const { checkpoint } = input;

      const docs = await ctx.db.queries.entries.listSinceCheckpoint({
        checkpoint: checkpoint ? { updatedAt: checkpoint.minUpdatedAt, day: checkpoint.deterministicId } : undefined,
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

  pushEntries: protectedProcedure
    .input(i => parse(PushEntriesSchema, i))
    .mutation(async ({ input, ctx }) => {
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
