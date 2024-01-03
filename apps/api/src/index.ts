import { appRouter } from '@libs/trpc';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { reqCtxMiddleware } from '~/middleware/context.ts';
import { trpcServer } from '~/middleware/trpc.ts';
import type { HonoEnv } from '~/types.ts';
import { deleteCookie, setCookie } from '~/utils/cookies.ts';

const server = new Hono<HonoEnv>();

/**
 * TRPC
 */

const TRPC_ROOT = 'api/_rpc';

server.use(
  `/${TRPC_ROOT}/*`,
  cors({
    origin: ['http://localhost:5173'], // @TODO: add real origins, based on env variables
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    credentials: true,
  }),
  reqCtxMiddleware,
  trpcServer<HonoEnv>({
    endpoint: `/${TRPC_ROOT}`,
    router: appRouter,
    createContext: ({ c, resHeaders }) => ({
      ...c.var,
      // trpc manages it's own headers, so use those in the cookie helpers
      setCookie: (...args) => setCookie(resHeaders, ...args),
      deleteCookie: (...args) => deleteCookie(resHeaders, ...args),
    }),
  }),
);

export default server;
