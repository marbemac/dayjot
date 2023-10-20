import { publicProcedure, router } from './trpc.ts';

export const themeRouter = router({
  /**
   * Queries
   */

  // --

  /**
   * Mutations
   */

  update: publicProcedure
    // .input(wrap(omit(insertArticleSchema, ['id', 'authorId'])))
    .mutation(async ({ input, ctx }) => {
      // @TODO
      return null;
    }),
});
