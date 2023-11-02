import { wrap } from '@decs/typeschema';
import { array, object, string } from 'valibot';

import { protectedProcedure, router } from './trpc.ts';

const syncFromLocalSchema = object({
  entries: array(
    object({
      day: string(),
      content: string(),
      localUpdatedAt: string(),
    }),
  ),
});

export const syncRouter = router({
  /**
   * Mutations
   */

  fromLocal: protectedProcedure.input(wrap(syncFromLocalSchema)).mutation(async ({ input, ctx }) => {
    const updated = await ctx.db.queries.entries.bulkUpsert(
      input.entries.map(entry => ({
        day: entry.day,
        content: entry.content,
        userId: ctx.user.id,
        updatedAt: entry.localUpdatedAt,
      })),
    );

    return { updated };
  }),
});
