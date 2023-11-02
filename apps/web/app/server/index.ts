import { getViteReqCtx, unstable_createViteServer, unstable_loadViteServerBuild } from '@remix-run/dev';
import { createRequestHandler as createRemixRequestHandler } from '@remix-run/server-runtime';
import { createAdaptorServer } from '@supastack/server-hono-node';
import connect from 'connect';
import { Hono } from 'hono';

import { TRPC_ROOT } from '~/app.ts';
import type { AppLoadContext } from '~/remix-types.js';
import { reqCtxMiddleware } from '~/server/middleware/context.ts';
import { trpcServer } from '~/server/middleware/trpc.ts';
import { appRouter } from '~/server/trpc/index.ts';
import type { HonoEnv } from '~/server/types.ts';
import { deleteCookie, setCookie } from '~/server/utils/cookies.ts';

const server = new Hono<HonoEnv>();

/**
 * TRPC
 */

server.use(
  `/${TRPC_ROOT}/*`,
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

/**
 * The frontend app
 */

const vite = import.meta.env.DEV ? await unstable_createViteServer() : undefined;

const handleFrontendRequest = createRemixRequestHandler(
  vite
    ? () => unstable_loadViteServerBuild(vite)
    : // @ts-expect-error ignore, not always built
      await import('./build/index.js'),
);

const reqToDevReq = new WeakMap<Request, any>();

server.get('*', reqCtxMiddleware, async c => {
  try {
    const { criticalCss } = getViteReqCtx(reqToDevReq.get(c.req.raw));
    const loadContext: AppLoadContext = c.var;
    return handleFrontendRequest(c.req.raw, loadContext, { __criticalCss: criticalCss });
  } catch (err: any) {
    console.log('Rendering error', err);

    throw err;
  }
});

/**
 * Start the server
 */

// In development, we start up our own server, passing the Vite connect instance
if (import.meta.env.DEV) {
  const port = Number(process.env['PORT'] || 3000);
  const devServer = createAdaptorServer({
    connectApp: connect().use(vite.middlewares),
    fetch: (req, originalReq) => {
      reqToDevReq.set(req, originalReq);
      return server.fetch(req, process.env);
    },
  });

  devServer.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server started on port ${port}`);
  });
}

// For production, we export the Hono instance so that it can be used in a serverless env
export default server;
