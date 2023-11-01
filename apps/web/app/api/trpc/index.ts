import { authRouter } from './auth.ts';
import { themeRouter } from './theme.ts';
import { router } from './trpc.ts';

export type AppRouter = typeof appRouter;

export const appRouter = router({
  auth: authRouter,
  theme: themeRouter,
});
