import { Hono } from 'hono';

import { serverHandler } from '~app';

type HonoEnv = {};

const server = new Hono<HonoEnv>()
  /**
   * The frontend app
   */
  .get('*', async c => {
    try {
      const appStream = await serverHandler({
        req: c.req.raw,
        // @TODO
        // meta: {
        //   // used by @ssrx/plugin-trpc-react
        //   trpcCaller: appRouter.createCaller(c.var),
        // },
      });

      return new Response(appStream);
    } catch (err: any) {
      /**
       * Handle react-router redirects
       */
      if (err instanceof Response && err.status >= 300 && err.status <= 399) {
        return c.redirect(err.headers.get('Location') || '/', err.status);
      }

      /**
       * In development, pass the error back to the vite dev server to display in the
       * error overlay
       */
      if (import.meta.env.DEV) return err;

      throw err;
    }
  });

export default server;
