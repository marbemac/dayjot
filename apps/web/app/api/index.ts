import { Hono } from 'hono';

import { reqCtxMiddleware } from '~/api/middleware/context.ts';
import { trpcServer } from '~/api/middleware/trpc.ts';
import { appRouter } from '~/api/trpc/index.ts';
import { deleteCookie, setCookie } from '~/api/utils/cookies.ts';
import { TRPC_ROOT } from '~/app.ts';

import type { HonoEnv } from './types.ts';
// import { getReqTheme } from './utils/theme.ts';

const server = new Hono<HonoEnv>()
  /**
   * TRPC
   */
  .use(
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

// /**
//  * The frontend app
//  */
// .get('*', reqCtxMiddleware, async c => {
//   try {
//     const theme = getReqTheme({ getCookie: c.var.getCookie });

//     const appStream = await serverHandler({
//       req: c.req.raw,
//       meta: {
//         // used by the @ssrx/plugin-trpc-react plugin
//         trpcCaller: appRouter.createCaller(c.var),

//         // used by the ssrx-theme plugin
//         theme,
//       },
//     });

//     return new Response(appStream);
//   } catch (err: any) {
//     /**
//      * Handle redirects
//      */
//     if (err instanceof Response && err.status >= 300 && err.status <= 399) {
//       return c.redirect(err.headers.get('Location') || '/', err.status);
//     }

//     /**
//      * In development, pass the error back to the vite dev server to display in the
//      * error overlay
//      */
//     if (import.meta.env.DEV) return err;

//     throw err;
//   }
// });

export { server };
