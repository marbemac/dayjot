import { initDbSdk } from '@dayjot/db';
import { env } from 'hono/adapter';
import { createMiddleware } from 'hono/factory';

import { auth } from '~server/auth/index.ts';
import type { HonoEnv } from '~server/types.ts';
import { deleteCookie, getCookie, setCookie } from '~server/utils/cookies.ts';

export const reqCtxMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  /**
   * Cookie helpers - these are particularly useful in the TRPC context
   */
  c.set('getCookie', key => getCookie(c.req.raw, key));
  c.set('setCookie', (name, value, opt) => setCookie(c.res.headers as Headers, name, value, opt));
  c.set('deleteCookie', (name, opt) => deleteCookie(c.res.headers as Headers, name, opt));

  /**
   * Persistance
   */

  c.set('db', initDbSdk({ uri: env<HonoEnv['Bindings']>(c as any).JOT_SQL_URL }));

  /**
   * Auth/session info
   */
  const authRequest = auth.handleRequest(c);
  const session = await authRequest.validate();

  c.set('isAuthed', !!session);
  c.set('sessionId', session?.sessionId);
  if (session?.user) {
    const { userId, ...rest } = session.user;
    c.set('user', { id: userId, ...rest });
  }

  await next();
});
