import { initDbSdk } from '@dayjot/db';
import { env, getRuntimeKey } from 'hono/adapter';
import { createMiddleware } from 'hono/factory';
import postgres from 'postgres';

import { initAuth } from '~/api/auth/index.ts';
import type { HonoEnv, ReqCtx } from '~/api/types.ts';
import { deleteCookie, getCookie, setCookie } from '~/api/utils/cookies.ts';

/**
 * Export a plain version of this fn, so that we can use it in other contexts such as
 * the remix server entrypoint.
 */
export const createReqCtx = async (
  req: Request,
  responseHeaders: Headers,
  vars: HonoEnv['Bindings'],
): Promise<ReqCtx> => {
  /**
   * Persistance
   *
   * We're accessing db from req ctx rather than managing a global singleton because
   * this pattern is compatible with edge runtimes (conn per request),
   */

  const sql = postgres(vars.JOT_SQL_URL);
  const db = initDbSdk({ sql });

  /**
   * Auth/session info
   */
  const auth = initAuth({ sql });
  const authRequest = auth.handleRequest(req);
  const session = await authRequest.validate();

  const isAuthed = !!session;
  const sessionId = session?.sessionId;
  let user;
  if (session?.user) {
    const { userId, ...rest } = session.user;
    user = { ...rest };
  }

  return {
    db,

    auth,
    isAuthed,
    sessionId,
    user,

    /**
     * Cookie helpers - these are particularly useful in the TRPC context
     */
    getCookie: key => getCookie(req, key),
    setCookie: (name, value, opt) => setCookie(responseHeaders, name, value, opt),
    deleteCookie: (name, opt) => deleteCookie(responseHeaders, name, opt),
  };
};

export const reqCtxMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const ctx = await createReqCtx(c.req.raw, c.res.headers, env<HonoEnv['Bindings']>(c as any));

  c.set('db', ctx.db);
  c.set('getCookie', ctx.getCookie);
  c.set('setCookie', ctx.setCookie);
  c.set('deleteCookie', ctx.deleteCookie);

  c.set('auth', ctx.auth);
  c.set('isAuthed', ctx.isAuthed);
  c.set('sessionId', ctx.sessionId);
  if (ctx.user) {
    c.set('user', ctx.user);
  }

  await next();

  /**
   * Cleanup
   *
   * https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/#contextwaituntil
   */
  if (getRuntimeKey() === 'workerd') {
    c.executionCtx.waitUntil(ctx.db.client.destroy());
  } else {
    void ctx.db.client.destroy();
  }
});
