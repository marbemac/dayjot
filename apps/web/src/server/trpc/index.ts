import { themeRouter } from './theme.ts';
import { router } from './trpc.ts';

export type AppRouter = typeof appRouter;

export const appRouter = router({
  theme: themeRouter,
});
