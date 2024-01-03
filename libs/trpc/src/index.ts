import { authRouter } from './routers/auth.ts';
import { syncRouter } from './routers/sync.ts';
import { themeRouter } from './routers/theme.ts';
import { router } from './trpc.ts';

export type AppRouter = typeof appRouter;

export type { SessionUser } from './auth/index.ts';
export { initAuth } from './auth/index.ts';
export type { ReqCtx } from './types.ts';

export const appRouter = router({
  auth: authRouter,
  theme: themeRouter,
  sync: syncRouter,
});
