import { createMiddleware } from 'hono/factory';
import type { CookieOptions } from 'hono/utils/cookie';

import { deleteCookie, getCookie, setCookie } from '~server/utils/cookies.ts';

/**
 * The properties available on `c.var` in hono, or `ctx` in trpc.
 */
export type ReqCtx = {
  getCookie: (key: string) => string | undefined;
  setCookie: (name: string, value: string, opt?: CookieOptions) => void;
  deleteCookie: (name: string, opt?: CookieOptions) => void;
};

export const reqCtxMiddleware = createMiddleware<{ Variables: ReqCtx }>(async (c, next) => {
  /**
   * Cookie helpers - these are particularly useful in the TRPC context
   */
  c.set('getCookie', key => getCookie(c.req.raw, key));
  c.set('setCookie', (name, value, opt) => setCookie(c.res.headers as Headers, name, value, opt));
  c.set('deleteCookie', (name, opt) => deleteCookie(c.res.headers as Headers, name, opt));

  await next();
});
