import { initDbSdk } from '@dayjot/db';
import { env, getRuntimeKey } from 'hono/adapter';
import { createMiddleware } from 'hono/factory';
import postgres from 'postgres';

import { initAuth } from '~server/auth/index.ts';
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

  const SQL_URI = env<HonoEnv['Bindings']>(c as any).JOT_SQL_URL;
  const sql = postgres(SQL_URI);
  const dbSdk = initDbSdk({ sql });
  c.set('db', dbSdk);

  /**
   * Auth/session info
   */
  const auth = initAuth({ sql });
  c.set('auth', auth);
  const authRequest = auth.handleRequest(c);
  const session = await authRequest.validate();

  c.set('isAuthed', !!session);
  c.set('sessionId', session?.sessionId);
  if (session?.user) {
    const { userId, ...rest } = session.user;
    c.set('user', { ...rest });
  }

  await next();

  /**
   * Cleanup
   *
   * https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/#contextwaituntil
   */
  if (getRuntimeKey() === 'workerd') {
    c.executionCtx.waitUntil(dbSdk.client.destroy());
  } else {
    void dbSdk.client.destroy();
  }
});
